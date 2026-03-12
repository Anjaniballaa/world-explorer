import API from "../config";
import { useState, useEffect } from "react";

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
};

export default function LanguagePanel({ location, country }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    if (!location?.lat || !location?.lon) return;
    setLoading(true);
    setError(false);
    setData(null);

    fetch(`${API}/language?lat=${location.lat}&lon=${location.lon}&city=${encodeURIComponent(location.city || "")}&country=${encodeURIComponent(location.country || "")}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [location?.lat, location?.lon]);

  if (loading) return (
    <div className="card">
      <div className="card-title" style={{ color: "var(--purple)" }}>🗣️ Languages</div>
      <p className="no-data">⏳ Fetching live language data...</p>
    </div>
  );

  if (error || !data) return (
    <div className="card">
      <div className="card-title" style={{ color: "var(--purple)" }}>🗣️ Languages</div>
      <p className="no-data">Language data unavailable</p>
    </div>
  );

  const primary      = data.primaryLanguage;
  const regional     = data.regionalLanguage;
  const langWiki     = data.languageWiki;
  const nativeScript = data.nativeScript;
  const cityWiki     = data.cityWiki;
  const stateWiki    = data.stateWiki;

  const stateRegionalLang = INDIA_REGIONAL[data.state] || primary;
  const displayPrimary    = data.country === "India" ? stateRegionalLang : primary;

  let officialToShow = data.officialLanguages || [];
  let scheduledNote  = null;
  if (data.country === "India" && officialToShow.length > 3) {
    officialToShow = [{ code: "hin", name: "Hindi" }, { code: "eng", name: "English" }];
    scheduledNote  = "India has 22 constitutionally scheduled languages";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* CITY */}
      <div className="card">
        <div className="card-title" style={{ color: "var(--purple)" }}>
          🏙️ City — {data.city}
        </div>
        {cityWiki?.extract && (
          <div style={{ marginBottom: 16 }}>
            {cityWiki.thumbnail && (
              <img src={cityWiki.thumbnail} alt={data.city}
                style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />
            )}
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>
              {cityWiki.extract}
            </p>
            {cityWiki.url && (
              <a href={cityWiki.url} target="_blank" rel="noreferrer"
                style={{ fontSize: "0.75rem", color: "var(--teal)", marginTop: 6, display: "inline-block" }}>
                Read more about {data.city} →
              </a>
            )}
          </div>
        )}
        {nativeScript?.nativeCityName && (
          <div style={{
            background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: 8, padding: "12px 16px", marginTop: 8,
          }}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 4 }}>
              {data.city} written in {displayPrimary}:
            </div>
            <div style={{ fontSize: "1.8rem", color: "var(--purple)", letterSpacing: 2 }}>
              {nativeScript.nativeCityName}
            </div>
            {nativeScript.extract && (
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
                {nativeScript.extract.slice(0, 120)}...
              </div>
            )}
          </div>
        )}
      </div>

      {/* STATE */}
      <div className="card">
        <div className="card-title" style={{ color: "var(--teal)" }}>
          🗺️ State / Region — {data.state}
        </div>
        <div style={{
          background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: 10, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 6, fontFamily: "var(--font-head)", letterSpacing: 1 }}>
            PRIMARY LANGUAGE OF {data.state?.toUpperCase()}
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--teal)", marginBottom: 6 }}>
            {displayPrimary}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            📡 Detected from: {regional?.source === "wikipedia-city"
              ? `${data.city} Wikipedia page`
              : regional?.source === "wikipedia-state"
              ? `${data.state} Wikipedia page`
              : "RestCountries API"}
          </div>
          {regional?.allMentioned?.length > 1 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 6 }}>
                Also mentioned in {data.state}:
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {regional.allMentioned.filter(l => l !== displayPrimary).map((l, i) => (
                  <span key={i} style={{
                    background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)",
                    borderRadius: 12, padding: "3px 10px", fontSize: "0.75rem", color: "var(--teal)",
                  }}>{l}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        {stateWiki?.extract && (
          <div>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>
              {stateWiki.extract}
            </p>
            {stateWiki.url && (
              <a href={stateWiki.url} target="_blank" rel="noreferrer"
                style={{ fontSize: "0.75rem", color: "var(--teal)", marginTop: 6, display: "inline-block" }}>
                Read more about {data.state} →
              </a>
            )}
          </div>
        )}
      </div>

      {/* COUNTRY */}
      <div className="card">
        <div className="card-title" style={{ color: "var(--gold)" }}>
          🌍 Country Languages — {data.country}
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 8, fontFamily: "var(--font-head)", letterSpacing: 1 }}>
            OFFICIAL / LINK LANGUAGES
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {officialToShow.map((lang, i) => (
              <div key={i} style={{
                background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.25)",
                borderRadius: 20, padding: "6px 14px",
                fontSize: "0.8rem", color: "var(--gold)",
              }}>
                {lang.name} <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>({lang.code})</span>
              </div>
            ))}
          </div>
          {scheduledNote && (
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 8 }}>
              ℹ️ {scheduledNote} — regional language for this area is{" "}
              <strong style={{ color: "var(--teal)" }}>{displayPrimary}</strong>
            </div>
          )}
        </div>
        {langWiki?.extract && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 8, fontFamily: "var(--font-head)", letterSpacing: 1 }}>
              📖 ABOUT {displayPrimary?.toUpperCase()} LANGUAGE
            </div>
            {langWiki.thumbnail && (
              <img src={langWiki.thumbnail} alt={displayPrimary}
                style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 6, marginBottom: 8 }} />
            )}
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>
              {langWiki.extract}
            </p>
            {langWiki.url && (
              <a href={langWiki.url} target="_blank" rel="noreferrer"
                style={{ fontSize: "0.75rem", color: "var(--gold)", marginTop: 8, display: "inline-block" }}>
                Read more on Wikipedia →
              </a>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
