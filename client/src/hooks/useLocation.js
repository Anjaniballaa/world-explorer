// Location detection — GPS first, IP fallback

export async function detectLocation() {

  // Step 1: Try browser GPS (most accurate — exact city level)
  const gpsLocation = await getGPSLocation();
  if (gpsLocation) {
    console.log("✅ Got GPS location:", gpsLocation);
    return gpsLocation;
  }

  // Step 2: Fallback to IP-based detection
  console.warn("GPS unavailable, falling back to IP detection");
  return await getIPLocation();
}

// ── GPS via browser navigator.geolocation ─────────────────────
function getGPSLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        try {
          // Reverse geocode with Nominatim to get city/country from GPS coords
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=en`,
            { headers: { "User-Agent": "WorldExplorerApp/1.0" } }
          );
          const data = await res.json();
          const addr = data.address || {};

          const city    = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || "";
          const country = addr.country || "";
          const cc      = addr.country_code?.toLowerCase() || "";
          const state   = addr.state || addr.state_district || addr.region || "";

          // Get currency from RestCountries
          let currency = "USD";
          let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          try {
            const cr   = await fetch(`https://restcountries.com/v3.1/alpha/${cc.toUpperCase()}?fields=currencies,timezones`);
            const crData = await cr.json();
            currency   = Object.keys(crData.currencies || {})[0] || "USD";
            timezone   = crData.timezones?.[0] || timezone;
          } catch {}

          resolve({
            city,
            country,
            countryCode: cc,
            regionName:  state,
            lat,
            lon,
            timezone,
            currency,
            source: "gps",
          });
        } catch (err) {
          console.warn("Nominatim reverse failed:", err.message);
          // Still return GPS coords even without city name
          resolve({
            city:        "",
            country:     "",
            countryCode: "",
            regionName:  "",
            lat,
            lon,
            timezone:    Intl.DateTimeFormat().resolvedOptions().timeZone,
            currency:    "USD",
            source:      "gps-coords-only",
          });
        }
      },
      (err) => {
        console.warn("GPS denied/failed:", err.message);
        resolve(null); // user denied — fall back to IP
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// ── IP-based fallback ──────────────────────────────────────────
async function getIPLocation() {

  // Try ipapi.co
  try {
    const res  = await fetch("https://ipapi.co/json/");
    const data = await res.json();
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
        source:      "ip-ipapi",
      };
    }
  } catch {}

  // Try ipwho.is
  try {
    const res  = await fetch("https://ipwho.is/");
    const data = await res.json();
    if (data?.success && data?.latitude) {
      return {
        city:        data.city     || data.country,
        country:     data.country,
        countryCode: data.country_code?.toLowerCase(),
        regionName:  data.region,
        lat:         data.latitude,
        lon:         data.longitude,
        timezone:    data.timezone?.id,
        currency:    data.currency?.code,
        source:      "ip-ipwho",
      };
    }
  } catch {}

  // Try freeipapi
  try {
    const res  = await fetch("https://freeipapi.com/api/json");
    const data = await res.json();
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
        source:      "ip-freeipapi",
      };
    }
  } catch {}

  // Final hardcoded fallback
  return {
    city:        "New Delhi",
    country:     "India",
    countryCode: "in",
    regionName:  "Delhi",
    lat:         28.6139,
    lon:         77.2090,
    timezone:    "Asia/Kolkata",
    currency:    "INR",
    source:      "fallback",
  };
}
