// Client-side location detection — runs in BROWSER, always gets user's real IP

export async function detectLocation() {

  // Option 1: ip-api.com via HTTPS proxy (most accurate, city-level)
  try {
    const res  = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    console.log("ipapi.co response:", data);
    if (data?.country_name && data?.latitude && !data?.error) {
      return {
        city:        data.city        || data.country_name,
        country:     data.country_name,
        countryCode: data.country_code?.toLowerCase(),
        regionName:  data.region,
        lat:         data.latitude,
        lon:         data.longitude,
        timezone:    data.timezone,
        currency:    data.currency,
      };
    }
  } catch (e) { console.warn("ipapi.co failed:", e.message); }

  // Option 2: ipwho.is
  try {
    const res  = await fetch("https://ipwho.is/");
    const data = await res.json();
    console.log("ipwho.is response:", data);
    if (data?.success && data?.country && data?.latitude) {
      return {
        city:        data.city     || data.country,
        country:     data.country,
        countryCode: data.country_code?.toLowerCase(),
        regionName:  data.region,
        lat:         data.latitude,
        lon:         data.longitude,
        timezone:    data.timezone?.id,
        currency:    data.currency?.code,
      };
    }
  } catch (e) { console.warn("ipwho.is failed:", e.message); }

  // Option 3: ipinfo.io (reliable, HTTPS, city-level)
  try {
    const res  = await fetch("https://ipinfo.io/json");
    const data = await res.json();
    console.log("ipinfo.io response:", data);
    if (data?.country && data?.loc) {
      const [lat, lon] = data.loc.split(",").map(Number);
      return {
        city:        data.city    || data.country,
        country:     data.country, // returns country code like "IN"
        countryCode: data.country?.toLowerCase(),
        regionName:  data.region,
        lat,
        lon,
        timezone:    data.timezone,
        currency:    null, // ipinfo doesn't return currency
      };
    }
  } catch (e) { console.warn("ipinfo.io failed:", e.message); }

  // Option 4: freeipapi.com
  try {
    const res  = await fetch("https://freeipapi.com/api/json");
    const data = await res.json();
    console.log("freeipapi response:", data);
    if (data?.countryName && data?.latitude) {
      return {
        city:        data.cityName  || data.countryName,
        country:     data.countryName,
        countryCode: data.countryCode?.toLowerCase(),
        regionName:  data.regionName,
        lat:         data.latitude,
        lon:         data.longitude,
        timezone:    data.timeZone,
        currency:    data.currency?.code || "USD",
      };
    }
  } catch (e) { console.warn("freeipapi failed:", e.message); }

  // Final fallback
  console.warn("All location APIs failed — using fallback");
  return {
    city:        "New Delhi",
    country:     "India",
    countryCode: "in",
    regionName:  "Delhi",
    lat:         28.6139,
    lon:         77.2090,
    timezone:    "Asia/Kolkata",
    currency:    "INR",
  };
}
