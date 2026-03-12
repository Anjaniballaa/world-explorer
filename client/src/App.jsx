import { useState, useEffect, useCallback } from "react";
import Header            from "./components/Header";
import InteractiveMap    from "./components/InteractiveMap";
import CountryCard       from "./components/CountryCard";
import WeatherPanel      from "./components/WeatherPanel";
import AirQualityPanel   from "./components/AirQualityPanel";
import MarinePanel       from "./components/MarinePanel";
import EarthquakePanel   from "./components/EarthquakePanel";
import NewsPanel         from "./components/NewsPanel";
import CurrencyConverter from "./components/CurrencyConverter";
import WikiPanel         from "./components/WikiPanel";
import NasaPanel         from "./components/NasaPanel";
import LanguagePanel     from "./components/LanguagePanel";
import QuizGame          from "./components/QuizGame";
import EconomyPanel      from "./components/EconomyPanel";
import HolidaysPanel     from "./components/HolidaysPanel";
import ClimatePanel      from "./components/ClimatePanel";
import AttractionsPanel  from "./components/AttractionsPanel";
import TranslatorPanel   from "./components/TranslatorPanel";
import "./App.css";

const API = "https://world-explorer-api.onrender.com/api";

export default function App() {
  const [location,   setLocation]  = useState(null);
  const [country,    setCountry]   = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [activeTab,  setActiveTab] = useState("overview");

  const fetchCountry = useCallback(async (name) => {
    try {
      const res  = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`);
      const data = await res.json();
      if (data?.[0]) setCountry(data[0]);
    } catch (err) { console.error("Country error:", err); }
  }, []);
useEffect(() => {
  const detect = async () => {
    try {

      navigator.geolocation.getCurrentPosition(
        async (pos) => {

          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          const res = await fetch(`${API}/location?lat=${lat}&lon=${lon}`);
          const data = await res.json();

          setLocation({
            city: data.city,
            country: data.country,
            countryCode: data.countryCode?.toLowerCase(),
            lat: lat,
            lon: lon,
            timezone: data.timezone,
            currency: data.currency,
            region: data.regionName,
          });

          await fetchCountry(data.country);
          setLoading(false);
        },

        async () => {
          // fallback if user blocks location
          const res = await fetch(`${API}/location`);
          const data = await res.json();

          setLocation({
            city: data.city,
            country: data.country,
            countryCode: data.countryCode?.toLowerCase(),
            lat: data.lat,
            lon: data.lon,
            timezone: data.timezone,
            currency: data.currency,
            region: data.regionName,
          });

          await fetchCountry(data.country);
          setLoading(false);
        }

      );

    } catch (err) {
      console.error("Location error:", err);
      setLoading(false);
    }
  };

  detect();
}, [fetchCountry]);

  const handleCountrySelect = useCallback(async (countryName, lat, lon, overrides = {}) => {
    setLoading(true);
    try {
      const res  = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
      const data = await res.json();
      const c    = data[0];
      if (!c) return;
      setCountry(c);
      setLocation({
        city:        overrides.overrideCity || c.capital?.[0] || countryName,
        country:     c.name.common,
        countryCode: overrides.countryCode  || c.cca2?.toLowerCase() || "us",
        lat:         lat  || c.latlng?.[0]  || 0,
        lon:         lon  || c.latlng?.[1]  || 0,
        timezone:    overrides.timezone     || c.timezones?.[0] || "UTC",
        currency:    overrides.currency     || Object.keys(c.currencies || {})[0] || "USD",
        region:      c.region,
      });
    } catch (err) { console.error("Country select error:", err); }
    finally { setLoading(false); }
  }, []);

  if (loading) return (
    <div className="loader-screen">
      <div className="globe-spinner">🌍</div>
      <p>Detecting your location...</p>
    </div>
  );

  const tabs = [
    { id: "overview",    label: "🌍 Overview"      },
    { id: "weather",     label: "🌤️ Weather & Air"  },
    { id: "earth",       label: "🌋 Earth Activity" },
    { id: "climate",     label: "🌡️ Climate"        },
    { id: "attractions", label: "🗺️ Places & Food"  },
    { id: "economy",     label: "📊 Economy"        },
    { id: "holidays",    label: "🎉 Holidays"       },
    { id: "language",    label: "🗣️ Languages"      },
    { id: "translator",  label: "🌐 Translator"     },
    { id: "news",        label: "📰 News"           },
    { id: "currency",    label: "💱 Currency"       },
    { id: "space",       label: "🚀 Space"          },
    { id: "quiz",        label: "🏆 Quiz"           },
  ];

  return (
    <div className="app">
      <Header location={location} onSearch={handleCountrySelect} />

      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t.id}
            className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <main className="main-content">

        {activeTab === "overview" && (
          <div className="grid-layout">
            <div className="col-left">
              <CountryCard country={country} location={location} />
              <WikiPanel key={`wiki-${location?.country}`} query={country?.name?.common} cityQuery={location?.city} />
            </div>
            <div className="col-right">
              <InteractiveMap key={`map-${location?.lat}-${location?.lon}`} location={location} onCountrySelect={handleCountrySelect} />
            </div>
          </div>
        )}

        {activeTab === "weather" && (
          <div className="grid-2">
            <WeatherPanel    key={`w-${location?.lat}`} lat={location?.lat} lon={location?.lon} city={location?.city} />
            <AirQualityPanel key={`a-${location?.lat}`} lat={location?.lat} lon={location?.lon} city={location?.city} />
          </div>
        )}

        {activeTab === "earth" && (
          <div className="grid-2">
            <EarthquakePanel key={`e-${location?.lat}`} lat={location?.lat} lon={location?.lon} />
            <MarinePanel     key={`m-${location?.lat}`} lat={location?.lat} lon={location?.lon} />
          </div>
        )}

        {activeTab === "climate" && (
          <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
            <ClimatePanel key={`cl-${location?.lat}`} location={location} />
          </div>
        )}

        {activeTab === "attractions" && (
          <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
            <AttractionsPanel key={`attr-${location?.lat}`} location={location} />
          </div>
        )}

        {activeTab === "economy" && (
          <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
            <EconomyPanel key={`ec-${location?.countryCode}`} location={location} country={country} />
          </div>
        )}

        {activeTab === "holidays" && (
          <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
            <HolidaysPanel key={`hol-${location?.countryCode}`} location={location} country={country} />
          </div>
        )}

        {activeTab === "language" && (
          <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
            <LanguagePanel key={`lang-${location?.city}-${location?.country}`} location={location} country={country} />
          </div>
        )}

        {activeTab === "translator" && (
          <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
            <TranslatorPanel key={`trans-${location?.country}`} location={location} country={country} />
          </div>
        )}

        {activeTab === "news" && (
          <div style={{ width: "100%" }}>
            <NewsPanel key={`news-${location?.countryCode}`} countryCode={location?.countryCode} country={location?.country} />
          </div>
        )}

        {activeTab === "currency" && (
          <div style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
            <CurrencyConverter key={`cur-${location?.currency}`} baseCurrency={location?.currency} />
          </div>
        )}

        {activeTab === "space" && (
          <div style={{ maxWidth: 960, margin: "0 auto", width: "100%" }}>
            <NasaPanel location={location} />
          </div>
        )}

        {activeTab === "quiz" && (
          <div style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
            <QuizGame key={`quiz-${country?.region}`} region={country?.region} country={country} />
          </div>
        )}

      </main>
    </div>
  );
}
