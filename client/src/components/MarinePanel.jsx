import API from "../config";
import { useState, useEffect } from "react";

export default function MarinePanel({ lat, lon }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!lat || !lon) return;
    setLoading(true);
    setError(false);
    fetch(`${API}/marine?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(d => {
        if (d.error || d.reason) { setError(true); setLoading(false); return; }
        setData(d); setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [lat, lon]);

  if (loading) return <div className="card"><p className="no-data">Loading marine data...</p></div>;
  if (error || !data?.current) return (
    <div className="card">
      <div className="card-title">🌊 Marine Data</div>
      <p className="no-data">🏔️ No ocean data — this location is inland</p>
    </div>
  );

  const c = data.current;
  return (
    <div className="card">
      <div className="card-title">🌊 Marine / Ocean Data</div>
      <div className="marine-wave">{c.wave_height?.toFixed(1)}m</div>
      <div style={{ textAlign: "center", color: "var(--muted)", marginBottom: 16, fontSize: "0.8rem" }}>Wave Height</div>

      <div className="stat-row"><span className="stat-label">Wave Direction</span><span className="stat-value teal">{c.wave_direction}°</span></div>
      <div className="stat-row"><span className="stat-label">Wave Period</span><span className="stat-value">{c.wave_period?.toFixed(1)} s</span></div>
      <div className="stat-row"><span className="stat-label">Wind Wave Height</span><span className="stat-value">{c.wind_wave_height?.toFixed(1)} m</span></div>
      <div className="stat-row"><span className="stat-label">Swell Height</span><span className="stat-value">{c.swell_wave_height?.toFixed(1)} m</span></div>
      <div className="stat-row"><span className="stat-label">Ocean Current</span><span className="stat-value">{c.ocean_current_velocity?.toFixed(1)} km/h</span></div>
    </div>
  );
}
