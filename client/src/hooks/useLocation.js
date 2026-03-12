// Client-side location detection
// Called directly from browser = always gets USER's real IP, never server IP

export async function detectLocation() {

  // Option 1: ipapi.co (HTTPS, free, reliable)
  try {
    const res  = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    if (data?.country_name && data?.latitude) {
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
  } catch {}

  // Option 2: ipwho.is (HTTPS, no key needed)
  try {
    const res  = await fetch("https://ipwho.is/");
    const data = await res.json();
    if (data?.success && data?.country) {
      return {
        city:        data.city        || data.country,
        country:     data.country,
        countryCode: data.country_code?.toLowerCase(),
        regionName:  data.region,
        lat:         data.latitude,
        lon:         data.longitude,
        timezone:    data.timezone?.id,
        currency:    data.currency?.code,
      };
    }
  } catch {}

  // Option 3: freeipapi.com (HTTPS)
  try {
    const res  = await fetch("https://freeipapi.com/api/json");
    const data = await res.json();
    if (data?.countryName) {
      return {
        city:        data.cityName     || data.countryName,
        country:     data.countryName,
        countryCode: data.countryCode?.toLowerCase(),
        regionName:  data.regionName,
        lat:         data.latitude,
        lon:         data.longitude,
        timezone:    data.timeZone,
        currency:    data.currency?.code || "USD",
      };
    }
  } catch {}

  // Final fallback — default to India
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
