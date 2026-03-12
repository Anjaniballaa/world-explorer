import { useState, useEffect } from "react";

function getAQILabel(aqi) {
  if (aqi <= 20) return { label: "Good", color: "var(--green)" };
  if (aqi <= 40) return { label: "Fair", color: "#a3e635" };
  if (aqi <= 60) return { label: "Moderate", color: "var(--gold)" };
  if (aqi <= 80) return { label: "Poor", color: "var(--orange)" };
  if (aqi <= 100) return { label: "Very Poor", color: "var(--red)" };
  return { label: "Hazardous", color: "#9b1c1c" };
}

export default function AirQualityPanel({ lat, lon, city }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lon) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/airquality?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lat, lon]);

  if (loading) return <div className="card"><p className="no-data">Loading air quality...</p></div>;
  if (!data?.current) return <div className="card"><p className="no-data">Air quality unavailable</p></div>;

  const c = data.current;
  const aqi = c.european_aqi;
  const { label, color } = getAQILabel(aqi);

  return (
    <div className="card">
      <div className="card-title green">💨 Air Quality — {city}</div>
      <div className="aqi-score" style={{ color }}>{aqi}</div>
      <div className="aqi-label" style={{ color }}>{label}</div>

      <div className="stat-row"><span className="stat-label">PM2.5</span><span className="stat-value">{c.pm2_5?.toFixed(1)} μg/m³</span></div>
      <div className="stat-row"><span className="stat-label">PM10</span><span className="stat-value">{c.pm10?.toFixed(1)} μg/m³</span></div>
      <div className="stat-row"><span className="stat-label">CO (Carbon Monoxide)</span><span className="stat-value">{c.carbon_monoxide?.toFixed(1)} μg/m³</span></div>
      <div className="stat-row"><span className="stat-label">NO₂</span><span className="stat-value">{c.nitrogen_dioxide?.toFixed(1)} μg/m³</span></div>
      <div className="stat-row"><span className="stat-label">Ozone</span><span className="stat-value">{c.ozone?.toFixed(1)} μg/m³</span></div>
    </div>
  );
}