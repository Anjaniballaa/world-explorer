const express = require("express");
const axios   = require("axios");
const router  = express.Router();

// State lookup by city for India — covers major cities
const INDIA_CITY_TO_STATE = {
  // Andhra Pradesh
  "Bhimavaram": "Andhra Pradesh", "Visakhapatnam": "Andhra Pradesh", "Vijayawada": "Andhra Pradesh",
  "Guntur": "Andhra Pradesh", "Nellore": "Andhra Pradesh", "Kurnool": "Andhra Pradesh",
  "Rajahmundry": "Andhra Pradesh", "Tirupati": "Andhra Pradesh", "Kakinada": "Andhra Pradesh",
  "Eluru": "Andhra Pradesh", "Ongole": "Andhra Pradesh", "Anantapur": "Andhra Pradesh",
  "Vizianagaram": "Andhra Pradesh", "Chittoor": "Andhra Pradesh", "Amaravati": "Andhra Pradesh",
  // Telangana
  "Hyderabad": "Telangana", "Warangal": "Telangana", "Nizamabad": "Telangana",
  "Karimnagar": "Telangana", "Khammam": "Telangana", "Secunderabad": "Telangana",
  // Karnataka
  "Bangalore": "Karnataka", "Bengaluru": "Karnataka", "Mysore": "Karnataka", "Mysuru": "Karnataka",
  "Hubli": "Karnataka", "Mangalore": "Karnataka", "Belgaum": "Karnataka", "Tumkur": "Karnataka",
  // Tamil Nadu
  "Chennai": "Tamil Nadu", "Coimbatore": "Tamil Nadu", "Madurai": "Tamil Nadu",
  "Salem": "Tamil Nadu", "Tiruchirappalli": "Tamil Nadu", "Tirunelveli": "Tamil Nadu",
  // Kerala
  "Thiruvananthapuram": "Kerala", "Kochi": "Kerala", "Kozhikode": "Kerala",
  "Thrissur": "Kerala", "Kollam": "Kerala", "Kannur": "Kerala",
  // Maharashtra
  "Mumbai": "Maharashtra", "Pune": "Maharashtra", "Nagpur": "Maharashtra",
  "Nashik": "Maharashtra", "Aurangabad": "Maharashtra", "Solapur": "Maharashtra",
  // Gujarat
  "Ahmedabad": "Gujarat", "Surat": "Gujarat", "Vadodara": "Gujarat",
  "Rajkot": "Gujarat", "Bhavnagar": "Gujarat", "Jamnagar": "Gujarat",
  // West Bengal
  "Kolkata": "West Bengal", "Howrah": "West Bengal", "Durgapur": "West Bengal",
  "Asansol": "West Bengal", "Siliguri": "West Bengal",
  // Delhi
  "New Delhi": "Delhi", "Delhi": "Delhi",
  // Uttar Pradesh
  "Lucknow": "Uttar Pradesh", "Kanpur": "Uttar Pradesh", "Agra": "Uttar Pradesh",
  "Varanasi": "Uttar Pradesh", "Allahabad": "Uttar Pradesh", "Prayagraj": "Uttar Pradesh",
  // Rajasthan
  "Jaipur": "Rajasthan", "Jodhpur": "Rajasthan", "Udaipur": "Rajasthan", "Kota": "Rajasthan",
  // Punjab
  "Chandigarh": "Punjab", "Ludhiana": "Punjab", "Amritsar": "Punjab", "Jalandhar": "Punjab",
  // Bihar
  "Patna": "Bihar", "Gaya": "Bihar", "Muzaffarpur": "Bihar",
  // Odisha
  "Bhubaneswar": "Odisha", "Cuttack": "Odisha", "Rourkela": "Odisha",
  // Assam
  "Guwahati": "Assam", "Dibrugarh": "Assam", "Jorhat": "Assam",
  // Madhya Pradesh
  "Bhopal": "Madhya Pradesh", "Indore": "Madhya Pradesh", "Gwalior": "Madhya Pradesh", "Jabalpur": "Madhya Pradesh",
};

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
    // Step 1: Nominatim reverse geocode
    const nominatimRes = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=en`,
      { headers: { "User-Agent": "WorldExplorerApp/1.0" }, timeout: 8000 }
    );
    const address     = nominatimRes.data?.address || {};
    const countryCode = address.country_code?.toUpperCase() || "";
    const detectedCity = address.city || address.town || address.village ||
                         address.suburb || address.municipality || city || "";

    // Step 2: Get state — try Nominatim first, then city lookup, then Wikipedia scan
    let state = address.state || address.state_district || address.region || address.county || "";

    // For India: use city→state lookup map if Nominatim missed the state
    if ((countryCode === "IN" || country === "India") && !state) {
      const cityKey = Object.keys(INDIA_CITY_TO_STATE).find(k =>
        (detectedCity || city || "").toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes((detectedCity || city || "").toLowerCase())
      );
      if (cityKey) state = INDIA_CITY_TO_STATE[cityKey];
    }

    // Step 3: Official languages from RestCountries
    let officialLanguages = [];
    try {
      const countryRes = await axios.get(
        `https://restcountries.com/v3.1/alpha/${countryCode}?fields=languages`,
        { timeout: 5000 }
      );
      officialLanguages = Object.entries(countryRes.data?.languages || {}).map(([code, name]) => ({ code, name }));
    } catch {}

    // Step 4: Primary language — for India use state map
    let primaryLang = null;
    if (countryCode === "IN" && state) {
      primaryLang = INDIA_REGIONAL[state] || null;
    }

    // Step 5: City Wikipedia
    let cityWiki    = null;
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

        // If state still missing — scan Wikipedia text for state names
        if (!state && countryCode === "IN") {
          for (const s of Object.keys(INDIA_REGIONAL)) {
            if (extract.includes(s)) { state = s; break; }
          }
          // Also update primaryLang after finding state from Wikipedia
          if (state && !primaryLang) primaryLang = INDIA_REGIONAL[state];
        }

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

    // Final fallback
    if (!primaryLang) primaryLang = officialLanguages[0]?.name || "Unknown";

    // Step 7: Native script
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
