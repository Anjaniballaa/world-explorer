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
      // Step 1: Try as a country name first
      const countryRes = await fetch(`/api/countries?path=name&q=${encodeURIComponent(query.trim())}&limit=1`);
      const j = await countryRes.json();
      const countryData = j?.data?.objects || [];

      if (countryData[0]) {
        const c = countryData[0];
        await onSearch(c.names.common, c.coordinates?.lat || 0, c.coordinates?.lng || 0);
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
        // Now get full country data for that location
const countryRes2 = await fetch(`/api/countries?path=names.common/${encodeURIComponent(countryName)}`);
const j2 = await countryRes2.json();
const countryData2 = j2?.data?.objects || [];

if (countryData2[0]) {
  const c = countryData2[0];
  const currencies = Object.keys(c.currencies || {})[0] || "USD";
  const ccCode = c.codes?.alpha_2?.toLowerCase() || "us";

  await onSearch(c.names.common, lat, lon, {
    city: cityName,
    countryCode: ccCode,
    currency: currencies,
    timezone: c.timezones?.[0] || "UTC",
    overrideCity: cityName,
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
