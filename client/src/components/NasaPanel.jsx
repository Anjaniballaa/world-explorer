import API from "../config";
import { useState, useEffect } from "react";

export default function NasaPanel({ location }) {
  const [apod, setApod] = useState(null);
  const [iss, setIss] = useState(null);
  const [issHistory, setIssHistory] = useState([]);

  useEffect(() => {
    fetch(`${API}/nasa`)
      .then(r => r.json())
      .then(d => setApod(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchISS = () => {
      fetch(`${API}/iss`)
        .then(r => r.json())
        .then(d => {
          setIss(d);
          setIssHistory(prev => [...prev.slice(-19), { lat: parseFloat(d.latitude), lon: parseFloat(d.longitude), time: new Date().toLocaleTimeString() }]);
        })
        .catch(() => {});
    };
    fetchISS();
    const interval = setInterval(fetchISS, 5000);
    return () => clearInterval(interval);
  }, []);

  const distanceFromMe = iss && location
    ? Math.round(Math.sqrt(
        Math.pow((parseFloat(iss.latitude) - location.lat) * 111, 2) +
        Math.pow((parseFloat(iss.longitude) - location.lon) * 111, 2)
      ))
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* NASA APOD */}
      <div className="card">
        <div className="card-title purple">🔭 NASA — Astronomy Picture of the Day</div>
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "12px" }}>
          🌐 Global — same picture worldwide each day
        </div>
        {apod ? (
          <>
            {apod.media_type === "image" ? (
              <img src={apod.url} alt={apod.title} className="nasa-img" />
            ) : (
              <iframe src={apod.url} title={apod.title} style={{ width: "100%", height: "300px", border: "none", borderRadius: "8px", marginBottom: "12px" }} />
            )}
            <div className="nasa-title">{apod.title}</div>
            <div className="nasa-desc">{apod.explanation?.slice(0, 400)}...</div>
            <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--muted)" }}>📅 {apod.date} · Credit: {apod.copyright || "NASA"}</div>
          </>
        ) : (
          <p className="no-data">Loading NASA data...</p>
        )}
      </div>

      {/* ISS TRACKER */}
      <div className="card">
        <div className="card-title purple">🛸 ISS — Live Position Tracker (updates every 5s)</div>
        {iss ? (
          <>
            <div className="iss-coords">
              <div className="iss-coord">
                <div className="val">{parseFloat(iss.latitude).toFixed(3)}°</div>
                <div className="lbl">Latitude</div>
              </div>
              <div className="iss-coord">
                <div className="val">{parseFloat(iss.longitude).toFixed(3)}°</div>
                <div className="lbl">Longitude</div>
              </div>
              <div className="iss-coord">
                <div className="val">{parseFloat(iss.altitude).toFixed(0)} km</div>
                <div className="lbl">Altitude</div>
              </div>
              <div className="iss-coord">
                <div className="val">{parseFloat(iss.velocity).toFixed(0)}</div>
                <div className="lbl">km/h</div>
              </div>
            </div>

            {distanceFromMe !== null && (
              <div style={{ marginTop: 16, padding: "12px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", color: "var(--purple)", fontFamily: "var(--font-head)" }}>~{distanceFromMe.toLocaleString()} km</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>ISS distance from {location?.city}</div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 8 }}>Recent ISS positions:</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {issHistory.slice(-5).map((h, i) => (
                  <div key={i} style={{ fontSize: "0.7rem", background: "rgba(168,85,247,0.1)", padding: "4px 8px", borderRadius: "4px", color: "var(--purple)" }}>
                    {h.lat.toFixed(1)}°, {h.lon.toFixed(1)}°
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="no-data">Loading ISS data...</p>
        )}
      </div>
    </div>
  );
}
