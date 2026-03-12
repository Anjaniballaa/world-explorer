import { useState, useEffect } from "react";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TYPE_STYLE = {
  "National": { bg: "rgba(0,212,255,0.10)",  border: "rgba(0,212,255,0.35)",  color: "var(--teal)"   },
  "Public":   { bg: "rgba(0,212,255,0.10)",  border: "rgba(0,212,255,0.35)",  color: "var(--teal)"   },
  "Religious":{ bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.35)", color: "var(--purple)" },
  "Observance":{ bg:"rgba(100,100,100,0.08)",border:"rgba(100,100,100,0.25)", color:"var(--muted)"   },
  "Optional": { bg: "rgba(100,100,100,0.08)",border: "rgba(100,100,100,0.25)",color: "var(--muted)"  },
  "Bank":     { bg: "rgba(255,215,0,0.08)",  border: "rgba(255,215,0,0.30)",  color: "var(--gold)"   },
  "School":   { bg: "rgba(255,215,0,0.08)",  border: "rgba(255,215,0,0.30)",  color: "var(--gold)"   },
};

const getTypeStyle = (type) => TYPE_STYLE[type] || TYPE_STYLE["Public"];

const fmtDate = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

const getDayName = (dateStr) => {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });
};

const daysUntil = (dateStr) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.ceil((d - today) / 86400000);
};

const HolidayRow = ({ h, highlight }) => {
  const days = daysUntil(h.date);
  const s = getTypeStyle(h.types?.[0] || h.type);
  return (
    <div style={{
      background: highlight ? "rgba(255,215,0,0.07)" : s.bg,
      border: `1px solid ${highlight ? "rgba(255,215,0,0.4)" : s.border}`,
      borderRadius: 10, padding: "12px 16px", marginBottom: 8,
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.9rem" }}>{h.name}</div>
        {h.localName && h.localName !== h.name && (
          <div style={{ fontSize: "0.78rem", color: "var(--purple)", marginTop: 2 }}>{h.localName}</div>
        )}
        {h.description && (
          <div style={{ fontSize: "0.73rem", color: "var(--muted)", marginTop: 2 }}>{h.description}</div>
        )}
        <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
          {getDayName(h.date)}, {fmtDate(h.date)}
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
          {(h.types || [h.type]).filter(Boolean).map((t, i) => {
            const ts = getTypeStyle(t);
            return (
              <span key={i} style={{
                fontSize: "0.63rem", padding: "2px 8px", borderRadius: 10,
                background: ts.bg, border: `1px solid ${ts.border}`, color: ts.color
              }}>{t}</span>
            );
          })}
          {h.location && (
            <span style={{ fontSize: "0.63rem", padding: "2px 8px", borderRadius: 10, background: "rgba(100,100,100,0.1)", color: "var(--muted)" }}>
              📍 {h.location}
            </span>
          )}
        </div>
      </div>
      <div style={{ textAlign: "right", minWidth: 56 }}>
        {days === 0 ? (
          <div style={{ color: "var(--green)", fontWeight: 700, fontSize: "0.9rem" }}>🎉 Today!</div>
        ) : days > 0 ? (
          <>
            <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: "1.2rem", lineHeight: 1 }}>{days}</div>
            <div style={{ fontSize: "0.62rem", color: "var(--muted)" }}>days away</div>
          </>
        ) : (
          <div style={{ color: "var(--muted)", fontSize: "0.72rem" }}>{Math.abs(days)}d ago</div>
        )}
      </div>
    </div>
  );
};

export default function HolidaysPanel({ location, country }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [view, setView]       = useState("upcoming");

  const cc = country?.cca2 || location?.countryCode?.toUpperCase();

  useEffect(() => {
    if (!cc) return;
    setLoading(true); setError(null); setData(null);
    fetch(`http://localhost:5000/api/holidays?countryCode=${cc}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.hint || d.error); setLoading(false); return; }
        setData(d); setLoading(false);
      })
      .catch(() => { setError("Network error fetching holidays"); setLoading(false); });
  }, [cc]);

  if (loading) return (
    <div className="card">
      <div className="card-title" style={{ color: "var(--gold)" }}>🎉 Holidays</div>
      <p className="no-data">⏳ Fetching live holiday data for {cc}...</p>
    </div>
  );

  if (error) return (
    <div className="card">
      <div className="card-title" style={{ color: "var(--gold)" }}>🎉 Holidays</div>
      <div style={{ padding: "16px", background: "rgba(255,100,100,0.07)", borderRadius: 10, border: "1px solid rgba(255,100,100,0.2)" }}>
        <div style={{ color: "var(--red)", fontWeight: 600, marginBottom: 8 }}>⚠️ Setup required</div>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>
          To get holidays for India and 200+ countries, add your <strong style={{ color: "var(--gold)" }}>AbstractAPI key</strong> to <code>server/.env</code>:
        </p>
        <code style={{ display: "block", background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: 8, marginTop: 10, fontSize: "0.8rem", color: "var(--teal)" }}>
          ABSTRACT_HOLIDAYS_KEY=your_key_here
        </code>
        <a href="https://www.abstractapi.com/api/holidays-api" target="_blank" rel="noreferrer"
          style={{ display: "inline-block", marginTop: 12, fontSize: "0.8rem", color: "var(--purple)" }}>
          → Get free key at abstractapi.com (instant, no credit card)
        </a>
      </div>
    </div>
  );

  const today = new Date(); today.setHours(0,0,0,0);
  const all = (data?.holidays || []);
  const upcoming = all.filter(h => daysUntil(h.date) >= 0).slice(0, 10);
  const past     = all.filter(h => daysUntil(h.date) < 0).reverse().slice(0, 8);
  const nextHol  = upcoming[0];

  // Stats
  const publicCount    = all.filter(h => (h.types?.[0] || h.type) === "Public" || (h.types?.[0] || h.type) === "National").length;
  const religiousCount = all.filter(h => (h.types?.[0] || h.type) === "Religious").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Countdown hero */}
      <div className="card" style={{ textAlign: "center" }}>
        <div className="card-title" style={{ color: "var(--gold)" }}>
          🎉 Public Holidays — {country?.name?.common || location?.country}
          <span style={{ fontSize: "0.68rem", color: "var(--muted)", marginLeft: 8 }}>via {data.source}</span>
        </div>

        {nextHol ? (
          <>
            <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 6 }}>Next holiday</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gold)" }}>{nextHol.name}</div>
            {nextHol.localName && nextHol.localName !== nextHol.name && (
              <div style={{ fontSize: "1rem", color: "var(--purple)", margin: "4px 0" }}>{nextHol.localName}</div>
            )}
            <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 16 }}>
              {getDayName(nextHol.date)}, {fmtDate(nextHol.date)}
            </div>
            <div style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center",
              background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.3)",
              borderRadius: 14, padding: "14px 36px", marginBottom: 20
            }}>
              <div style={{ fontSize: "3.2rem", fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>
                {daysUntil(nextHol.date) === 0 ? "🎉" : daysUntil(nextHol.date)}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>
                {daysUntil(nextHol.date) === 0 ? "Today!" : "days to go"}
              </div>
            </div>
          </>
        ) : (
          <p className="no-data">No upcoming holidays found</p>
        )}

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
          {[
            { val: all.length,       label: "Total holidays",    color: "var(--teal)"   },
            { val: publicCount,      label: "National/Public",   color: "var(--gold)"   },
            { val: religiousCount,   label: "Religious",         color: "var(--purple)" },
            { val: upcoming.length,  label: "Still upcoming",    color: "var(--green)"  },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Holiday list */}
      <div className="card">
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["upcoming", "past", "all"].map(t => (
            <button key={t} className={`news-tab ${view === t ? "active" : ""}`} onClick={() => setView(t)}>
              {t === "upcoming" ? `📅 Upcoming (${upcoming.length})` : t === "past" ? `📜 Past (${past.length})` : `🗓️ All (${all.length})`}
            </button>
          ))}
        </div>

        {view === "upcoming" && (
          upcoming.length > 0
            ? upcoming.map((h, i) => <HolidayRow key={i} h={h} highlight={i === 0} />)
            : <p className="no-data">No more holidays this year</p>
        )}
        {view === "past" && (
          past.length > 0
            ? past.map((h, i) => <HolidayRow key={i} h={h} />)
            : <p className="no-data">No past holidays found</p>
        )}
        {view === "all" && (
          all.length > 0
            ? all.map((h, i) => <HolidayRow key={i} h={h} highlight={daysUntil(h.date) === 0} />)
            : <p className="no-data">No holidays found</p>
        )}
      </div>

    </div>
  );
}
