const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  const { lat, lon, city, country } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

  try {
    // Step 1: Nominatim reverse geocode - get region/state
    const nominatimRes = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&namedetails=1&accept-language=en`,
      { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 6000 }
    );
    const nominatim = nominatimRes.data;
    const address = nominatim.address || {};
    const countryCode = address.country_code?.toUpperCase() || "";
    const detectedCity = address.city || address.town || address.village || address.suburb || city || "";

    // Get state — try ALL possible Nominatim fields
    let state = address.state || address.state_district || address.region || address.county || "";

    // If state still missing — do a second Nominatim call at zoom=5 (state boundary level)
    if (!state) {
      try {
        const zoomRes = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=en&zoom=5`,
          { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 6000 }
        );
        const a = zoomRes.data?.address || {};
        state = a.state || a.state_district || a.region || a.county || "";
      } catch {}
    }

    // Step 2: Get country languages from RestCountries
    const countryRes = await axios.get(
      `https://restcountries.com/v3.1/alpha/${countryCode}?fields=languages,name`,
      { timeout: 5000 }
    );
    const officialLanguages = Object.entries(countryRes.data?.languages || {}).map(([code, name]) => ({
      code, name,
    }));

    // Step 3: Get Wikipedia page for the CITY specifically
    let cityWiki = null;
    let regionalLang = null;
    const citySearchTerm = detectedCity || city;

    if (citySearchTerm) {
      try {
        const cityWikiRes = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(citySearchTerm)}`,
          { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 5000 }
        );
        const extract = cityWikiRes.data.extract || "";

        cityWiki = {
          title: cityWikiRes.data.title,
          extract: extract.slice(0, 500),
          url: cityWikiRes.data.content_urls?.desktop?.page,
          thumbnail: cityWikiRes.data.thumbnail?.source,
        };

        // Extract state from Wikipedia text if still missing
        const INDIA_STATES = [
          "Andhra Pradesh","Telangana","Tamil Nadu","Karnataka","Kerala","West Bengal",
          "Maharashtra","Gujarat","Punjab","Odisha","Rajasthan","Uttar Pradesh","Bihar",
          "Madhya Pradesh","Delhi","Haryana","Assam","Manipur","Goa","Jammu and Kashmir",
          "Uttarakhand","Himachal Pradesh","Jharkhand","Chhattisgarh","Meghalaya","Mizoram",
          "Nagaland","Arunachal Pradesh","Tripura","Sikkim","Goa"
        ];
        if (!state) {
          for (const s of INDIA_STATES) {
            if (extract.includes(s)) { state = s; break; }
          }
        }

        const langPattern = /(Telugu|Hindi|Tamil|Kannada|Malayalam|Bengali|Marathi|Gujarati|Punjabi|Urdu|Odia|Arabic|French|German|Spanish|Portuguese|Russian|Chinese|Japanese|Korean|Italian|Dutch|Turkish|Swahili|English)/gi;
        const matches = [...new Set(extract.match(langPattern) || [])];
        if (matches.length > 0) {
          regionalLang = { name: matches[0], allMentioned: matches.slice(0, 4), source: "wikipedia-city" };
        }
      } catch {}
    }

    // Step 4: If city search failed to find language, try state Wikipedia
    let stateWiki = null;
    if (!regionalLang && state) {
      try {
        const stateWikiRes = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(state)}`,
          { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 5000 }
        );
        const extract = stateWikiRes.data.extract || "";
        stateWiki = {
          title: stateWikiRes.data.title,
          extract: extract.slice(0, 300),
          url: stateWikiRes.data.content_urls?.desktop?.page,
        };
        const langPattern = /(Telugu|Hindi|Tamil|Kannada|Malayalam|Bengali|Marathi|Gujarati|Punjabi|Urdu|Odia|Arabic|French|German|Spanish|Portuguese|Russian|Chinese|Japanese|Korean|Italian|Dutch|Turkish|Swahili|English)/gi;
        const matches = [...new Set(extract.match(langPattern) || [])];
        if (matches.length > 0) {
          regionalLang = { name: matches[0], allMentioned: matches.slice(0, 4), source: "wikipedia-state" };
        }
      } catch {}
    }

    // Also fetch state wiki even if we already have language
    if (state && !stateWiki) {
      try {
        const stateWikiRes = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(state)}`,
          { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 5000 }
        );
        const extract = stateWikiRes.data.extract || "";
        stateWiki = {
          title: stateWikiRes.data.title,
          extract: extract.slice(0, 300),
          url: stateWikiRes.data.content_urls?.desktop?.page,
        };
      } catch {}
    }

    // Step 5: Get primary language name in its own script (native name of CITY)
    const primaryLang = regionalLang?.name || officialLanguages[0]?.name;
    let nativeScript = null;

    if (primaryLang && citySearchTerm) {
      const nativeLangCodes = {
        "Telugu": "te", "Hindi": "hi", "Tamil": "ta", "Kannada": "kn",
        "Malayalam": "ml", "Bengali": "bn", "Marathi": "mr", "Gujarati": "gu",
        "Punjabi": "pa", "Arabic": "ar", "Chinese": "zh", "Japanese": "ja",
        "Korean": "ko", "Russian": "ru", "French": "fr", "German": "de",
        "Spanish": "es", "Portuguese": "pt", "Turkish": "tr", "Urdu": "ur",
      };
      const langCode = nativeLangCodes[primaryLang];
      if (langCode) {
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
    }

    // Step 6: Get language Wikipedia info
    let langWiki = null;
    if (primaryLang) {
      try {
        const langWikiRes = await axios.get(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(primaryLang + " language")}`,
          { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 5000 }
        );
        langWiki = {
          title: langWikiRes.data.title,
          extract: langWikiRes.data.extract?.slice(0, 500),
          url: langWikiRes.data.content_urls?.desktop?.page,
          thumbnail: langWikiRes.data.thumbnail?.source,
        };
      } catch {}
    }

    res.json({
      city: detectedCity || city,
      state,
      country: address.country || country,
      countryCode,
      officialLanguages,
      regionalLanguage: regionalLang,
      primaryLanguage: primaryLang,
      languageWiki: langWiki,
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
