import API from "../config";
import { useState, useEffect } from "react";

const CATEGORY_LABELS = {
  "tourism.sights":            { label: "Landmark",      icon: "🏛️", color: "var(--gold)"   },
  "tourism.attraction":        { label: "Attraction",    icon: "⭐", color: "var(--gold)"   },
  "entertainment.museum":      { label: "Museum",        icon: "🏛️", color: "var(--purple)" },
  "entertainment.culture":     { label: "Culture",       icon: "🎭", color: "var(--purple)" },
  "natural.national_park":     { label: "National Park", icon: "🌿", color: "var(--green)"  },
  "natural.protected_area":    { label: "Nature",        icon: "🌳", color: "var(--green)"  },
  "heritage":                  { label: "Heritage",      icon: "🏯", color: "var(--teal)"   },
};

const getCat = (cats = []) => {
  for (const c of cats) {
    if (CATEGORY_LABELS[c]) return CATEGORY_LABELS[c];
  }
  return { label: "Attraction", icon: "📍", color: "var(--teal)" };
};

const fmtDist = (m) => {
  if (!m) return "";
  return m < 1000 ? `${Math.round(m)}m away` : `${(m / 1000).toFixed(1)}km away`;
};

export default function AttractionsPanel({ location }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [filter,  setFilter]  = useState("all");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!location?.lat || !location?.lon) return;
    setLoading(true); setError(false); setData(null); setExpanded(null);
    fetch(`${API}/attractions?lat=${location.lat}&lon=${location.lon}&city=${encodeURIComponent(location.city || "")}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [location?.lat, location?.lon]);

  if (loading) return (
    <div className="card">
      <div className="card-title" style={{ color: "var(--gold)" }}>🗺️ Attractions</div>
      <p className="no-data">⏳ Finding attractions near {location?.city}...</p>
    </div>
  );
  if (error || !data) return (
    <div className="card">
      <div className="card-title" style={{ color: "var(--gold)" }}>🗺️ Attractions</div>
      <p className="no-data">❌ Could not load attractions. Check GEOAPIFY_KEY in .env</p>
    </div>
  );

  const places = data.places || [];

  // Filter tabs
  const filters = [
    { id: "all",     label: `All (${places.length})` },
    { id: "museum",  label: "🏛️ Museums"    },
    { id: "nature",  label: "🌿 Nature"      },
    { id: "heritage",label: "🏯 Heritage"    },
    { id: "wiki",    label: "📖 With Info"   },
  ];

  const filtered = places.filter(p => {
    if (filter === "all")     return true;
    if (filter === "museum")  return p.categories.some(c => c.includes("museum") || c.includes("culture"));
    if (filter === "nature")  return p.categories.some(c => c.includes("natural") || c.includes("park"));
    if (filter === "heritage")return p.categories.some(c => c.includes("heritage"));
    if (filter === "wiki")    return !!p.wikiSummary;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div className="card">
        <div className="card-title" style={{ color: "var(--gold)" }}>
          🗺️ Attractions near {location?.city}
          <span style={{ fontSize: "0.68rem", color: "var(--muted)", marginLeft: 8 }}>Geoapify + Wikipedia</span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 4 }}>
          {[
            { icon: "📍", val: places.length,                                          label: "Places found"  },
            { icon: "🏛️", val: places.filter(p => p.categories.some(c => c.includes("museum"))).length,  label: "Museums"       },
            { icon: "🌿", val: places.filter(p => p.categories.some(c => c.includes("natural"))).length, label: "Nature spots"  },
            { icon: "📖", val: places.filter(p => p.wikiSummary).length,               label: "With Wiki info"},
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--gold)" }}>{s.val}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs + list */}
      <div className="card">
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f.id} className={`news-tab ${filter === f.id ? "active" : ""}`}
              onClick={() => { setFilter(f.id); setExpanded(null); }}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && <p className="no-data">No places in this category nearby</p>}

        {filtered.map((place, i) => {
          const cat = getCat(place.categories);
          const isOpen = expanded === i;
          return (
            <div key={i}
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{
                background:    isOpen ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.02)",
                border:        `1px solid ${isOpen ? "rgba(255,215,0,0.3)" : "var(--border)"}`,
                borderRadius:  10,
                padding:       "12px 14px",
                marginBottom:  8,
                cursor:        "pointer",
                transition:    "all 0.2s",
              }}>
              {/* Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: "1.1rem" }}>{cat.icon}</span>
                    <span style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.9rem" }}>{place.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "0.63rem", padding: "2px 8px", borderRadius: 10,
                      background: `${cat.color}18`, border: `1px solid ${cat.color}44`, color: cat.color
                    }}>{cat.label}</span>
                    {place.distance && (
                      <span style={{ fontSize: "0.63rem", padding: "2px 8px", borderRadius: 10, background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--teal)" }}>
                        📍 {fmtDist(place.distance)}
                      </span>
                    )}
                    {place.wikiSummary && (
                      <span style={{ fontSize: "0.63rem", padding: "2px 8px", borderRadius: 10, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", color: "var(--purple)" }}>
                        📖 Wiki
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 2 }}>{isOpen ? "▲" : "▼"}</span>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  {place.wikiThumbnail && (
                    <img src={place.wikiThumbnail} alt={place.name}
                      style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />
                  )}
                  {place.wikiSummary && (
                    <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 10 }}>
                      {place.wikiSummary}
                    </p>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {place.address && (
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>📍 {place.address}</div>
                    )}
                    {place.opening && (
                      <div style={{ fontSize: "0.75rem", color: "var(--green)" }}>🕐 {place.opening}</div>
                    )}
                    {place.fee && (
                      <div style={{ fontSize: "0.75rem", color: "var(--gold)" }}>💰 Entry: {place.fee}</div>
                    )}
                    {place.phone && (
                      <div style={{ fontSize: "0.75rem", color: "var(--teal)" }}>📞 {place.phone}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {place.wikiUrl && (
                      <a href={place.wikiUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: "0.75rem", color: "var(--purple)", textDecoration: "none" }}>
                        📖 Wikipedia →
                      </a>
                    )}
                    {place.website && (
                      <a href={place.website} target="_blank" rel="noreferrer"
                        style={{ fontSize: "0.75rem", color: "var(--teal)", textDecoration: "none" }}>
                        🌐 Website →
                      </a>
                    )}
                    <a href={`https://www.google.com/maps?q=${place.lat},${place.lon}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: "0.75rem", color: "var(--gold)", textDecoration: "none" }}>
                      🗺️ Google Maps →
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
