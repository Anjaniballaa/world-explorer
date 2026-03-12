const express = require("express");
const axios   = require("axios");
const router  = express.Router();

const INDIA_REGIONAL = {
  "Andhra Pradesh": "Telugu", "Telangana": "Telugu",
  "Tamil Nadu": "Tamil", "Karnataka": "Kannada",
  "Kerala": "Malayalam", "West Bengal": "Bengali",
  "Maharashtra": "Marathi", "Gujarat": "Gujarati",
  "Punjab": "Punjabi", "Odisha": "Odia",
  "Rajasthan": "Hindi", "Uttar Pradesh": "Hindi",
  "Bihar": "Hindi", "Madhya Pradesh": "Hindi",
  "Delhi": "Hindi", "Haryana": "Hindi",
  "Assam": "Assamese", "Manipur": "Meitei",
  "Goa": "Konkani", "Jammu and Kashmir": "Kashmiri",
  "Uttarakhand": "Hindi", "Himachal Pradesh": "Hindi",
  "Jharkhand": "Hindi", "Chhattisgarh": "Hindi",
};

router.get("/", async (req, res) => {
  const { lat, lon, city, country } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

  try {
    // Step 1: Nominatim reverse geocode with zoom levels
    // zoom=10 gives district/city level, zoom=5 gives state level
    const [reverseRes, stateRes] = await Promise.all([
      axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=en&zoom=10`,
        { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 8000 }
      ),
      axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=en&zoom=5`,
        { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 8000 }
      )
    ]);

    const address      = reverseRes.data?.address || {};
    const stateAddress = stateRes.data?.address   || {};
    const countryCode  = address.country_code?.toUpperCase() || "";
    const detectedCity = address.city || address.town || address.village ||
                         address.suburb || address.municipality || city || "";

    // zoom=5 gives cleaner state name
    let state = stateAddress.state || stateAddress.region ||
                address.state      || address.state_district ||
                address.region     || address.county || "";

    // Step 2: If state still missing — use Nominatim search with city name
    if (!state && (detectedCity || city)) {
      try {
        const searchRes = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent((detectedCity || city) + ", " + (address.country || country || ""))}&format=json&addressdetails=1&limit=1`,
          { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 6000 }
        );
        const a = searchRes.data?.[0]?.address || {};
        state = a.state || a.state_district || a.region || a.county || "";
      } catch {}
    }

    // Step 3: Official languages from RestCountries
    let officialLanguages = [];
    try {
      const countryRes = await axios.get(
        `https://restcountries.com/v3.1/alpha/${countryCode}?fields=languages`,
        { timeout: 5000 }
      );
      officialLanguages = Object.entries(countryRes.data?.languages || {})
        .map(([code, name]) => ({ code, name }));
    } catch {}

    // Step 4: Primary language
    // For India use state→language map (this is still a lookup but based on LIVE detected state)
    let primaryLang = null;
    if (countryCode === "IN" && state) {
      primaryLang = INDIA_REGIONAL[state] || null;
    }

    // Step 5: City Wikipedia — extract language mentions and also state if missing
    let cityWiki     = null;
    let regionalLang = null;
    const citySearchTerm = detectedCity || city;

    if (citySearchTerm) {
      try {
        const cityWikiRes = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(citySearchTerm)}`,
          { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 6000 }
        );
        const extract = cityWikiRes.data.extract || "";
        cityWiki = {
          title:     cityWikiRes.data.title,
          extract:   extract.slice(0, 500),
          url:       cityWikiRes.data.content_urls?.desktop?.page,
          thumbnail: cityWikiRes.data.thumbnail?.source,
        };

        // Extract state from Wikipedia text if still missing
        if (!state && countryCode === "IN") {
          for (const s of Object.keys(INDIA_REGIONAL)) {
            if (extract.includes(s)) { state = s; break; }
          }
          if (state && !primaryLang) primaryLang = INDIA_REGIONAL[state];
        }

        // Extract language mentions from Wikipedia
        const langPattern = /(Telugu|Hindi|Tamil|Kannada|Malayalam|Bengali|Marathi|Gujarati|Punjabi|Urdu|Odia|Assamese|Konkani|Arabic|French|German|Spanish|Portuguese|Russian|Chinese|Japanese|Korean|Italian|Dutch|Turkish|Swahili|English)/gi;
        const matches = [...new Set(extract.match(langPattern) || [])];
        if (matches.length > 0) {
          regionalLang = { name: matches[0], allMentioned: matches.slice(0, 4), source: "wikipedia-city" };
          if (!primaryLang) primaryLang = matches[0];
        }
      } catch {}
    }

    // Step 6: State Wikipedia
    let stateWiki = null;
    if (state) {
      try {
        const stateWikiRes = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(state)}`,
          { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 6000 }
        );
        const extract = stateWikiRes.data.extract || "";
        stateWiki = {
          title:   stateWikiRes.data.title,
          extract: extract.slice(0, 300),
          url:     stateWikiRes.data.content_urls?.desktop?.page,
        };
        if (!regionalLang) {
          const langPattern = /(Telugu|Hindi|Tamil|Kannada|Malayalam|Bengali|Marathi|Gujarati|Punjabi|Urdu|Odia|Assamese|Konkani|Arabic|French|German|Spanish|Portuguese|Russian|Chinese|Japanese|Korean|Italian|Dutch|Turkish|Swahili|English)/gi;
          const matches = [...new Set(extract.match(langPattern) || [])];
          if (matches.length > 0) {
            regionalLang = { name: matches[0], allMentioned: matches.slice(0, 4), source: "wikipedia-state" };
            if (!primaryLang) primaryLang = matches[0];
          }
        }
      } catch {}
    }

    // Final fallback for primary language
    if (!primaryLang) primaryLang = officialLanguages[0]?.name || "Unknown";

    // Step 7: Native script for city name
    let nativeScript = null;
    const nativeLangCodes = {
      "Telugu": "te", "Hindi": "hi", "Tamil": "ta", "Kannada": "kn",
      "Malayalam": "ml", "Bengali": "bn", "Marathi": "mr", "Gujarati": "gu",
      "Punjabi": "pa", "Arabic": "ar", "Chinese": "zh", "Japanese": "ja",
      "Korean": "ko", "Russian": "ru", "French": "fr", "German": "de",
      "Spanish": "es", "Portuguese": "pt", "Turkish": "tr", "Urdu": "ur",
    };
    const langCode = nativeLangCodes[primaryLang];
    if (langCode && citySearchTerm) {
      try {
        const nativeRes = await axios.get(
          `https://${langCode}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(citySearchTerm)}`,
          { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 5000 }
        );
        nativeScript = {
          nativeCityName: nativeRes.data.title,
          langCode,
          extract: nativeRes.data.extract?.slice(0, 150),
        };
      } catch {}
    }

    // Step 8: Language Wikipedia
    let langWiki = null;
    if (primaryLang && primaryLang !== "Unknown") {
      try {
        const langWikiRes = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(primaryLang + " language")}`,
          { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 5000 }
        );
        langWiki = {
          title:     langWikiRes.data.title,
          extract:   langWikiRes.data.extract?.slice(0, 500),
          url:       langWikiRes.data.content_urls?.desktop?.page,
          thumbnail: langWikiRes.data.thumbnail?.source,
        };
      } catch {}
    }

    res.json({
      city:             detectedCity || city,
      state,
      country:          address.country || country,
      countryCode,
      officialLanguages,
      regionalLanguage: regionalLang,
      primaryLanguage:  primaryLang,
      languageWiki:     langWiki,
      nativeScript,
      cityWiki,
      stateWiki,
    });

  } catch (err) {
    console.error("Language API error:", err.message);
    res.status(500).json({ error: "Language data fetch failed" });
  }
});

module.exports = router;
