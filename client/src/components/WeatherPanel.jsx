import API from "../config";
import { useState, useEffect } from "react";

export default function WeatherPanel({ lat, lon, city }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lon) return;
    setLoading(true);
    fetch(`${API}/weather?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lat, lon]);

  if (loading) return <div className="card"><p className="no-data">⏳ Loading weather...</p></div>;
  if (!data?.current) return <div className="card"><p className="no-data">Weather unavailable</p></div>;

  const c = data.current;
  const iconUrl = c.icon ? `https://openweathermap.org/img/wn/${c.icon}@2x.png` : null;
  const sunrise = c.sunrise ? new Date(c.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A";
  const sunset = c.sunset ? new Date(c.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A";

  return (
    <div className="card">
      <div className="card-title">🌤️ Live Weather — {data.city || city}</div>

      <div className="weather-big">
        {iconUrl && <img src={iconUrl} alt="weather" style={{ width: 80, height: 80 }} />}
        <div className="weather-temp">{Math.round(c.temperature_2m)}°C</div>
        <div className="weather-desc" style={{ textTransform: "capitalize" }}>{c.description || "—"}</div>
        <div className="weather-desc">Feels like {Math.round(c.apparent_temperature)}°C</div>
      </div>

      <div className="weather-grid">
        <div className="weather-item">
          <div className="val">{c.relative_humidity_2m}%</div>
          <div className="lbl">Humidity</div>
        </div>
        <div className="weather-item">
          <div className="val">{Math.round(c.wind_speed_10m)} km/h</div>
          <div className="lbl">Wind</div>
        </div>
        <div className="weather-item">
          <div className="val">{c.precipitation} mm</div>
          <div className="lbl">Precipitation</div>
        </div>
        <div className="weather-item">
          <div className="val">{c.cloudcover}%</div>
          <div className="lbl">Cloud Cover</div>
        </div>
        <div className="weather-item">
          <div className="val">{c.pressure} hPa</div>
          <div className="lbl">Pressure</div>
        </div>
        <div className="weather-item">
          <div className="val">{c.visibility ? (c.visibility / 1000).toFixed(1) + " km" : "N/A"}</div>
          <div className="lbl">Visibility</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <div className="weather-item" style={{ flex: 1 }}>
          <div className="val" style={{ fontSize: "1rem" }}>🌅 {sunrise}</div>
          <div className="lbl">Sunrise</div>
        </div>
        <div className="weather-item" style={{ flex: 1 }}>
          <div className="val" style={{ fontSize: "1rem" }}>🌇 {sunset}</div>
          <div className="lbl">Sunset</div>
        </div>
      </div>

      {data.forecast?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 8, fontFamily: "var(--font-head)", letterSpacing: 1 }}>5-STEP FORECAST</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {data.forecast.map((f, i) => (
              <div key={i} style={{ flex: "0 0 auto", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 8, padding: "10px 12px", textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{f.time?.slice(11, 16)}</div>
                <img src={`https://openweathermap.org/img/wn/${f.icon}.png`} alt="" style={{ width: 36, height: 36 }} />
                <div style={{ fontSize: "0.9rem", color: "var(--teal)", fontWeight: 600 }}>{Math.round(f.temp)}°</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
