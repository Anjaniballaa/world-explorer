import { useState, useEffect } from "react";

export default function EarthquakePanel({ lat, lon }) {
  const [quakes, setQuakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lon) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/earthquake?lat=${lat}&lon=${lon}`)
      .then(r => r.json())
      .then(d => { setQuakes(d.features || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lat, lon]);

  if (loading) return <div className="card"><p className="no-data">Loading earthquake data...</p></div>;

  return (
    <div className="card">
      <div className="card-title red">🌋 Recent Earthquakes (500km radius)</div>
      {quakes.length === 0 ? (
        <p className="no-data">✅ No recent earthquakes nearby</p>
      ) : (
        quakes.slice(0, 6).map((q, i) => {
          const mag = q.properties.mag?.toFixed(1);
          const place = q.properties.place;
          const time = new Date(q.properties.time).toLocaleDateString();
          const magColor = mag >= 6 ? "var(--red)" : mag >= 4 ? "var(--orange)" : "var(--gold)";
          return (
            <div className="quake-item" key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="quake-mag" style={{ color: magColor }}>M{mag}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{time}</div>
              </div>
              <div className="quake-place">{place}</div>
            </div>
          );
        })
      )}
    </div>
  );
}