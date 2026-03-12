import API from "../config";
import { useState, useEffect } from "react";

const CATEGORIES = ["general", "technology", "sports", "health", "business", "entertainment", "science"];

export default function NewsPanel({ countryCode, country }) {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(true);

  const cc = (countryCode || "us").toLowerCase();

  useEffect(() => {
    setLoading(true);
    setArticles([]);
    fetch(`${API}/news?country=${cc}&category=${category}&countryName=${encodeURIComponent(country || "World")}`)
      .then(r => r.json())
      .then(d => { setArticles(d.articles || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cc, category, country]);

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="card">
      <div className="card-title gold">📰 Live News — {country}</div>
      <div className="news-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`news-tab ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="no-data">⏳ Loading live news...</p>
      ) : articles.length === 0 ? (
        <p className="no-data">No news available for this region</p>
      ) : (
        <div style={{ maxHeight: "650px", overflowY: "auto" }}>
          {articles.map((a, i) => (
            <div
              className="news-item"
              key={i}
              onClick={() => a.url && window.open(a.url, "_blank")}
            >
              {a.image && (
                <img
                  src={a.image}
                  alt=""
                  style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px" }}
                  onError={e => e.target.style.display = "none"}
                />
              )}
              <h4>{a.title}</h4>
              {a.description && <p>{a.description.slice(0, 150)}...</p>}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <div className="news-source">📡 {a.source?.name}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{timeAgo(a.publishedAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
