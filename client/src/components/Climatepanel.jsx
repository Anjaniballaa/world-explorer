import { useState, useEffect } from "react";

const BAR_COLORS = {
  temp: "var(--gold)",
  precip: "var(--teal)",
  wind: "var(--purple)",
  sunshine: "var(--green)",
};

const MiniBarChart = ({ data, valueKey, color, label, unit, maxOverride }) => {
  if (!data || data.length === 0) return null;
  const vals = data.map(d => d[valueKey]).filter(v => v !== null);
  if (vals.length === 0) return null;
  const max = maxOverride || Math.max(...vals);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-head)", letterSpacing: 1, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
        {data.map((d, i) => {
          const val = d[valueKey];
          const pct = val !== null ? (val / max) * 100 : 0;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "0.55rem", color: "var(--muted)", marginBottom: 2 }}>
                {val !== null ? (unit === "°C" ? val.toFixed(0) : val.toFixed(0)) : "-"}
              </div>
              <div style={{
                width: "100%", height: `${Math.max(pct, 4)}%`, minHeight: 3,
                background: color, borderRadius: "3px 3px 0 0", opacity: 0.8,
                transition: "height 0.3s"
              }} title={`${d.label}: ${val}${unit}`} />
              <div style={{ fontSize: "0.5rem", color: "var(--muted)", marginTop: 2, transform: "rotate(-30deg)", transformOrigin: "top center" }}>
                {d.label?.split(" ")[0]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatBadge = ({ icon, label, value, color }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "12px 14px", textAlign: "center"
  }}>
    <div style={{ fontSize: "1.3rem" }}>{icon}</div>
    <div style={{ fontSize: "1rem", fontWeight: 700, color: color || "var(--text)", marginTop: 2 }}>{value}</div>
    <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{label}</div>
  </div>
);

export default function ClimatePanel({ location }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [view, setView] = useState("temperature");

  useEffect(() => {
    if (!location?.lat || !location?.lon) return;
    setLoading(true); setError(false); setData(null);
    fetch(`http://localhost:5000/api/climate?lat=${location.lat}&lon=${location.lon}&city=${encodeURIComponent(location.city || "")}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [location?.lat, location?.lon]);

  if (loading) return <div className="card"><div className="card-title" style={{ color: "var(--gold)" }}>🌡️ Climate</div><p className="no-data">⏳ Fetching 12-month climate data...</p></div>;
  if (error || !data?.monthly?.length) return <div className="card"><div className="card-title" style={{ color: "var(--gold)" }}>🌡️ Climate</div><p className="no-data">❌ Climate data unavailable</p></div>;

  const months = data.monthly;
  const avgTemps = months.map(m => m.avgTemp).filter(v => v !== null);
  const totalPrecips = months.map(m => m.totalPrecip).filter(v => v !== null);
  const sunshineHrs = months.map(m => m.sunshineHours).filter(v => v !== null);
  const winds = months.map(m => m.avgWind).filter(v => v !== null);

  const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "N/A";
  const sum = arr => arr.length ? arr.reduce((a, b) => a + b, 0).toFixed(0) : "N/A";
  const hottest = months.reduce((a, b) => (b.avgTemp > (a.avgTemp || -999) ? b : a), {});
  const wettest = months.reduce((a, b) => (b.totalPrecip > (a.totalPrecip || -999) ? b : a), {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div className="card">
        <div className="card-title" style={{ color: "var(--gold)" }}>
          🌡️ Climate — {location?.city}
          <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: 8 }}>Last 12 months · Open-Meteo Archive</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 6 }}>
          <StatBadge icon="🌡️" label="Avg Temperature" value={`${avg(avgTemps)}°C`} color="var(--gold)" />
          <StatBadge icon="🌧️" label="Total Rainfall" value={`${sum(totalPrecips)}mm`} color="var(--teal)" />
          <StatBadge icon="💨" label="Avg Wind Speed" value={`${avg(winds)} km/h`} color="var(--purple)" />
          <StatBadge icon="☀️" label="Sunshine Hours" value={`${sum(sunshineHrs)}h`} color="var(--green)" />
          <StatBadge icon="🔥" label="Hottest Month" value={hottest.label?.split(" ")[0] || "N/A"} color="var(--red)" />
          <StatBadge icon="🌊" label="Wettest Month" value={wettest.label?.split(" ")[0] || "N/A"} color="var(--teal)" />
        </div>
      </div>

      {/* Charts */}
      <div className="card">
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["temperature", "rainfall", "wind", "sunshine"].map(t => (
            <button key={t} className={`news-tab ${view === t ? "active" : ""}`} onClick={() => setView(t)}>
              {t === "temperature" ? "🌡️ Temp" : t === "rainfall" ? "🌧️ Rain" : t === "wind" ? "💨 Wind" : "☀️ Sun"}
            </button>
          ))}
        </div>

        {view === "temperature" && (
          <>
            <MiniBarChart data={months} valueKey="avgTemp" color="var(--gold)" label="AVERAGE TEMPERATURE (°C)" unit="°C" />
            <MiniBarChart data={months} valueKey="avgTempMax" color="var(--red)" label="MAX TEMPERATURE (°C)" unit="°C" />
            <MiniBarChart data={months} valueKey="avgTempMin" color="var(--teal)" label="MIN TEMPERATURE (°C)" unit="°C" />
          </>
        )}
        {view === "rainfall" && (
          <MiniBarChart data={months} valueKey="totalPrecip" color="var(--teal)" label="MONTHLY RAINFALL (mm)" unit="mm" />
        )}
        {view === "wind" && (
          <MiniBarChart data={months} valueKey="avgWind" color="var(--purple)" label="AVERAGE WIND SPEED (km/h)" unit=" km/h" />
        )}
        {view === "sunshine" && (
          <MiniBarChart data={months} valueKey="sunshineHours" color="var(--green)" label="SUNSHINE HOURS" unit="h" />
        )}

        {/* Monthly breakdown table */}
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
            <thead>
              <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "6px 8px", textAlign: "left" }}>Month</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Avg °C</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Max °C</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Rain mm</th>
                <th style={{ padding: "6px 8px", textAlign: "right" }}>Wind km/h</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "6px 8px", color: "var(--text)" }}>{m.label}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", color: "var(--gold)" }}>{m.avgTemp ?? "—"}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", color: "var(--red)" }}>{m.avgTempMax ?? "—"}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", color: "var(--teal)" }}>{m.totalPrecip ?? "—"}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", color: "var(--purple)" }}>{m.avgWind ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}