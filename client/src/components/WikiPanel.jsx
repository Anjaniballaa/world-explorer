import { useState, useEffect } from "react";

export default function WikiPanel({ query, cityQuery }) {
  const [countryData, setCountryData] = useState(null);
  const [cityData, setCityData] = useState(null);

  useEffect(() => {
    if (!query) return;
    fetch(`http://localhost:5000/api/wiki?query=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(d => setCountryData(d))
      .catch(() => {});
  }, [query]);

  useEffect(() => {
    if (!cityQuery) return;
    fetch(`http://localhost:5000/api/wiki?query=${encodeURIComponent(cityQuery)}`)
      .then(r => r.json())
      .then(d => setCityData(d))
      .catch(() => {});
  }, [cityQuery]);

  return (
    <>
      {countryData?.extract && (
        <div className="card">
          <div className="card-title">📖 About {query}</div>
          {countryData.thumbnail?.source && (
            <img src={countryData.thumbnail.source} alt={query} className="wiki-img" />
          )}
          <p className="wiki-text">{countryData.extract?.slice(0, 400)}...</p>
          <a href={countryData.content_urls?.desktop?.page} target="_blank" rel="noreferrer" className="wiki-link">
            Read full article on Wikipedia →
          </a>
        </div>
      )}

      {cityData?.extract && cityQuery && (
        <div className="card">
          <div className="card-title teal" style={{ color: "var(--teal)" }}>📖 About {cityQuery}</div>
          {cityData.thumbnail?.source && (
            <img src={cityData.thumbnail.source} alt={cityQuery} className="wiki-img" />
          )}
          <p className="wiki-text">{cityData.extract?.slice(0, 300)}...</p>
          <a href={cityData.content_urls?.desktop?.page} target="_blank" rel="noreferrer" className="wiki-link">
            Read full article on Wikipedia →
          </a>
        </div>
      )}
    </>
  );
}