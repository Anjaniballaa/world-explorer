export default function CountryCard({ country, location }) {
  if (!country) return <div className="card"><p className="no-data">No country data</p></div>;

  const pop = country.population?.toLocaleString() || "N/A";
  const area = country.area?.toLocaleString() || "N/A";
  const capital = country.capital?.[0] || "N/A";
  const languages = Object.values(country.languages || {}).join(", ") || "N/A";
  const currencies = Object.values(country.currencies || {}).map(c => `${c.name} (${c.symbol})`).join(", ") || "N/A";
  const region = country.region || "N/A";
  const subregion = country.subregion || "N/A";
  const timezones = country.timezones?.[0] || "N/A";
  const flagUrl = country.flags?.svg || country.flags?.png;
  const callingCode = country.idd?.root + (country.idd?.suffixes?.[0] || "") || "N/A";
  const borders = country.borders?.join(", ") || "None";

  return (
    <div className="card">
      <div className="card-title gold">🌍 Country Overview</div>
      {flagUrl && <img src={flagUrl} alt="flag" style={{ width: "100%", borderRadius: "8px", marginBottom: "12px", maxHeight: "140px", objectFit: "cover" }} />}
      <div className="country-name">{country.name?.common}</div>
      <div className="country-sub">{country.name?.official}</div>

      <div className="stat-row"><span className="stat-label">🏙️ Capital</span><span className="stat-value gold">{capital}</span></div>
      <div className="stat-row"><span className="stat-label">📍 City</span><span className="stat-value teal">{location?.city}</span></div>
      <div className="stat-row"><span className="stat-label">🌐 Region</span><span className="stat-value">{region} — {subregion}</span></div>
      <div className="stat-row"><span className="stat-label">👥 Population</span><span className="stat-value">{pop}</span></div>
      <div className="stat-row"><span className="stat-label">📐 Area</span><span className="stat-value">{area} km²</span></div>
      <div className="stat-row"><span className="stat-label">🗣️ Languages</span><span className="stat-value">{languages}</span></div>
      <div className="stat-row"><span className="stat-label">💰 Currency</span><span className="stat-value">{currencies}</span></div>
      <div className="stat-row"><span className="stat-label">📞 Calling Code</span><span className="stat-value">{callingCode}</span></div>
      <div className="stat-row"><span className="stat-label">🕐 Timezone</span><span className="stat-value">{timezones}</span></div>
      <div className="stat-row"><span className="stat-label">🏳️ Borders</span><span className="stat-value">{borders}</span></div>
    </div>
  );
}