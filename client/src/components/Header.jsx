import { useState } from "react";

export default function Header({ location, onSearch }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError("");

    try {
      // Step 1: Try as a country name first
      const countryRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query.trim())}`);
      const countryData = await countryRes.json();

      if (countryData && countryData[0] && !countryData.status) {
        const c = countryData[0];
        await onSearch(c.name.common, c.latlng?.[0] || 0, c.latlng?.[1] || 0);
        setQuery("");
        setSearching(false);
        return;
      }
    } catch {}

    try {
      // Step 2: Try as city/state using OpenStreetMap Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&limit=1&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const geoData = await geoRes.json();

      if (geoData && geoData[0]) {
        const place = geoData[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        const countryName = place.address?.country || query;
        const cityName = place.address?.city || place.address?.town ||
                        place.address?.state || place.display_name?.split(",")[0];

        // Now get full country data for that location
        const countryRes2 = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
        const countryData2 = await countryRes2.json();

        if (countryData2 && countryData2[0]) {
          const c = countryData2[0];
          const currencies = Object.keys(c.currencies || {})[0] || "USD";
          const ccCode = c.cca2?.toLowerCase() || "us";

          // Pass city-level lat/lon but country info
          await onSearch(c.name.common, lat, lon, {
            city: cityName,
            countryCode: ccCode,
            currency: currencies,
            timezone: c.timezones?.[0] || "UTC",
            overrideCity: cityName, // force city name to searched city
          });
          setQuery("");
          setSearching(false);
          return;
        }
      }
    } catch {}

    setError(`"${query}" not found. Try a country name like "Japan" or "Brazil"`);
    setSearching(false);
  };

  return (
    <header className="header">
      <div className="header-brand">
        <span style={{ fontSize: "1.8rem" }}>🌍</span>
        <h1>WORLD EXPLORER</h1>
      </div>

      {location && (
        <div className="location-badge">
          📍 {location.city}, {location.country}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, maxWidth: "420px" }}>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search country or city (e.g. Vijayawada, Japan)..."
            value={query}
            onChange={e => { setQuery(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            disabled={searching}
          />
          <button onClick={handleSearch} disabled={searching}>
            {searching ? "..." : "SEARCH"}
          </button>
        </div>
        {error && <span style={{ fontSize: "0.75rem", color: "var(--red)", paddingLeft: "4px" }}>{error}</span>}
      </div>
    </header>
  );
}