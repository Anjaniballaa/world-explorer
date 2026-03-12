import { useState, useEffect } from "react";

const fmt = (val, type) => {
  if (val === null || val === undefined) return "N/A";
  if (type === "gdp") {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9)  return `$${(val / 1e9).toFixed(1)}B`;
    return `$${(val / 1e6).toFixed(0)}M`;
  }
  if (type === "pct") return `${val.toFixed(1)}%`;
  if (type === "usd") return `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (type === "years") return `${val.toFixed(1)} yrs`;
  return val.toFixed(1);
};

const MiniChart = ({ data, color, type, label }) => {
  if (!data || data.length < 2) return <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>No chart data</div>;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const W = 300, H = 70;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((d.value - min) / range) * (H - 10) - 5;
    return `${x},${y}`;
  });
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const trend = latest && prev ? (latest.value > prev.value ? "↑" : latest.value < prev.value ? "↓" : "→") : "";
  const trendColor = trend === "↑" ? "var(--green)" : trend === "↓" ? "var(--red)" : "var(--muted)";

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-head)", letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: "1.1rem", fontWeight: 700, color }}>
          {fmt(latest?.value, type)}
          <span style={{ fontSize: "0.85rem", marginLeft: 4, color: trendColor }}>{trend}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 60 }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        <polygon points={`0,${H} ${pts.join(" ")} ${W},${H}`} fill={`url(#grad-${label})`} />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * W;
          const y = H - ((d.value - min) / range) * (H - 10) - 5;
          return <circle key={i} cx={x} cy={y} r="2.5" fill={color} opacity="0.8" />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--muted)" }}>
        <span>{data[0]?.year}</span>
        <span>{latest?.year}</span>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, type, color, icon }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "14px 16px", textAlign: "center"
  }}>
    <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: color || "var(--text)" }}>{fmt(value, type)}</div>
    <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>{label}</div>
  </div>
);

export default function EconomyPanel({ location, country }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("overview");

  const cc = country?.cca2 || location?.countryCode?.toUpperCase();

  useEffect(() => {
    if (!cc) return;
    setLoading(true); setError(false); setData(null);
    fetch(`http://localhost:5000/api/economy?countryCode=${cc}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [cc]);

  if (loading) return <div className="card"><div className="card-title" style={{ color: "var(--green)" }}>📊 Economy</div><p className="no-data">⏳ Fetching World Bank data...</p></div>;
  if (error || !data) return <div className="card"><div className="card-title" style={{ color: "var(--green)" }}>📊 Economy</div><p className="no-data">❌ Economy data unavailable</p></div>;

  const latest = (arr) => arr?.[arr.length - 1]?.value ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header KPIs */}
      <div className="card">
        <div className="card-title" style={{ color: "var(--green)" }}>
          📊 Economy — {country?.name?.common || location?.country}
          <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: 8 }}>Source: World Bank</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
          <StatCard icon="💰" label="Total GDP" value={latest(data.gdp)} type="gdp" color="var(--green)" />
          <StatCard icon="👤" label="GDP per Capita" value={latest(data.gdpPerCap)} type="usd" color="var(--teal)" />
          <StatCard icon="📈" label="GDP Growth" value={latest(data.gdpGrowth)} type="pct" color={latest(data.gdpGrowth) >= 0 ? "var(--green)" : "var(--red)"} />
          <StatCard icon="💸" label="Inflation" value={latest(data.inflation)} type="pct" color="var(--gold)" />
          <StatCard icon="👷" label="Unemployment" value={latest(data.unemployment)} type="pct" color="var(--red)" />
          <StatCard icon="❤️" label="Life Expectancy" value={latest(data.lifeExp)} type="years" color="var(--purple)" />
          <StatCard icon="📚" label="Literacy Rate" value={latest(data.literacy)} type="pct" color="var(--teal)" />
          <StatCard icon="🌐" label="Internet Users" value={latest(data.internet)} type="pct" color="var(--purple)" />
        </div>
      </div>

      {/* Charts */}
      <div className="card">
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["overview", "economy", "social"].map(t => (
            <button key={t} className={`news-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "overview" ? "📊 Overview" : t === "economy" ? "💹 Economy" : "👥 Social"}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <>
            <MiniChart data={data.gdp} color="var(--green)" type="gdp" label="GDP (Total)" />
            <MiniChart data={data.gdpPerCap} color="var(--teal)" type="usd" label="GDP per Capita (USD)" />
          </>
        )}
        {tab === "economy" && (
          <>
            <MiniChart data={data.gdpGrowth} color="var(--gold)" type="pct" label="GDP Growth Rate (%)" />
            <MiniChart data={data.inflation} color="var(--red)" type="pct" label="Inflation Rate (%)" />
            <MiniChart data={data.unemployment} color="var(--purple)" type="pct" label="Unemployment Rate (%)" />
            <MiniChart data={data.exports} color="var(--teal)" type="pct" label="Exports (% of GDP)" />
          </>
        )}
        {tab === "social" && (
          <>
            <MiniChart data={data.lifeExp} color="var(--purple)" type="years" label="Life Expectancy (years)" />
            <MiniChart data={data.literacy} color="var(--teal)" type="pct" label="Literacy Rate (%)" />
            <MiniChart data={data.internet} color="var(--gold)" type="pct" label="Internet Users (%)" />
            <MiniChart data={data.gini} color="var(--red)" type="pct" label="GINI Inequality Index" />
          </>
        )}
      </div>
    </div>
  );
}