import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function InteractiveMap({ location, onCountrySelect }) {
  const [coords, setCoords] = useState(null);
  const [label, setLabel] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!location?.lat || !location?.lon) return;

    setCoords([location.lat, location.lon]);
    setLabel(`${location.city}, ${location.country}`);
  }, [location]);

  const handleSearch = async () => {
    const q = search.trim();
    if (!q) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
      );

      const data = await res.json();
      if (!data?.[0]) return;

      const { lat, lon, display_name } = data[0];

      const parts = display_name.split(",");
      const country = parts[parts.length - 1].trim();

      const newCoords = [parseFloat(lat), parseFloat(lon)];

      setCoords(newCoords);
      setLabel(q);
      setSearch("");

      onCountrySelect(country, newCoords[0], newCoords[1]);
    } catch {}
  };

  if (!coords)
    return (
      <div className="card">
        <p className="no-data">📍 Detecting location...</p>
      </div>
    );

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", borderRadius: 12 }}>
      {/* Search bar */}
      <div
        style={{
          padding: "12px 14px",
          background: "var(--bg2)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search any city or country..."
          style={{
            flex: 1,
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 12px",
            color: "var(--text)",
            fontSize: "0.85rem",
            outline: "none",
          }}
        />

        <button
          onClick={handleSearch}
          style={{
            background: "var(--teal)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            cursor: "pointer",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          GO
        </button>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={coords}
        zoom={6}
        style={{ height: "480px", width: "100%" }}
        key={coords.join("-")}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={coords} icon={markerIcon}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>

      {/* Footer */}
      <div
        style={{
          padding: "8px 16px",
          fontSize: "0.72rem",
          color: "var(--muted)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          📍 <strong style={{ color: "var(--teal)" }}>{label}</strong>
        </span>

        <a
          href={`https://www.openstreetmap.org/?mlat=${coords[0]}&mlon=${coords[1]}#map=6/${coords[0]}/${coords[1]}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--muted)", fontSize: "0.7rem", textDecoration: "none" }}
        >
          Open full map ↗
        </a>
      </div>
    </div>
  );
}