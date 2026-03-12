import API from "../config";
import { useState, useEffect, useRef } from "react";

const QUICK_PHRASES = [
  "Hello, how are you?",
  "Thank you very much",
  "Where is the nearest restaurant?",
  "How much does this cost?",
  "Please help me",
  "Good morning",
  "I don't understand",
  "Can you speak slowly?",
  "Where is the hotel?",
  "Call the police",
];

export default function TranslatorPanel({ location, country }) {
  const [languages, setLanguages]   = useState([]);
  const [from,      setFrom]        = useState("en");
  const [to,        setTo]          = useState("te");
  const [text,      setText]        = useState("");
  const [result,    setResult]      = useState(null);
  const [loading,   setLoading]     = useState(false);
  const [error,     setError]       = useState(null);
  const [history,   setHistory]     = useState([]);
  const [charCount, setCharCount]   = useState(0);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/translate/languages`)
      .then(r => r.json())
      .then(setLanguages)
      .catch(() => {});
  }, []);

  // Auto-set target language based on country
  useEffect(() => {
    if (!country) return;
    const langMap = {
      "India": "hi", "Japan": "ja", "China": "zh", "South Korea": "ko",
      "France": "fr", "Germany": "de", "Spain": "es", "Portugal": "pt",
      "Brazil": "pt", "Russia": "ru", "Saudi Arabia": "ar", "Egypt": "ar",
      "Turkey": "tr", "Thailand": "th", "Vietnam": "vi", "Indonesia": "id",
    };
    const detected = langMap[country.name?.common];
    if (detected) setTo(detected);
  }, [country]);

  const translate = async (inputText = text, fromLang = from, toLang = to) => {
    if (!inputText.trim() || inputText.length > 500) return;
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${API}/translate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: inputText, from: fromLang, to: toLang }),
      });
      const d = await r.json();
      if (d.error) { setError(d.error); setLoading(false); return; }
      setResult(d);
      setHistory(prev => [{ ...d, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } catch {
      setError("Translation failed");
    }
    setLoading(false);
  };

  const handleTextChange = (e) => {
    const val = e.target.value.slice(0, 500);
    setText(val);
    setCharCount(val.length);
    // debounce auto-translate
    clearTimeout(debounceRef.current);
    if (val.trim().length > 2) {
      debounceRef.current = setTimeout(() => translate(val), 900);
    }
  };

  const swap = () => {
    setFrom(to); setTo(from);
    if (result) { setText(result.translated); setResult(null); }
  };

  const getLangName = code => languages.find(l => l.code === code)?.name || code;

  const speak = (txt, langCode) => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = langCode;
    window.speechSynthesis.speak(u);
  };

  const copy = (txt) => navigator.clipboard?.writeText(txt);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Main translator */}
      <div className="card">
        <div className="card-title" style={{ color: "var(--purple)" }}>
          🌐 Language Translator
          <span style={{ fontSize: "0.68rem", color: "var(--muted)", marginLeft: 8 }}>MyMemory API · 50+ languages · No key needed</span>
        </div>

        {/* Language selectors */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <select value={from} onChange={e => setFrom(e.target.value)}
            style={{ flex: 1, minWidth: 140, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "8px 12px", fontSize: "0.85rem" }}>
            {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>

          <button onClick={swap}
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "var(--purple)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: "1.1rem" }}>
            ⇄
          </button>

          <select value={to} onChange={e => setTo(e.target.value)}
            style={{ flex: 1, minWidth: 140, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "8px 12px", fontSize: "0.85rem" }}>
            {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>

        {/* Input */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder={`Type in ${getLangName(from)}... (auto-translates)`}
            rows={4}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
              color: "var(--text)", borderRadius: 10, padding: "12px 14px",
              fontSize: "0.9rem", resize: "vertical", outline: "none", lineHeight: 1.6,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <span style={{ fontSize: "0.7rem", color: charCount > 450 ? "var(--red)" : "var(--muted)" }}>
              {charCount}/500
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {text && <button onClick={() => speak(text, from)}
                style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: "0.75rem" }}>
                🔊 Listen
              </button>}
              <button onClick={() => translate()}
                disabled={!text.trim() || loading}
                style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.4)", color: "var(--purple)", borderRadius: 6, padding: "3px 12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                {loading ? "..." : "Translate →"}
              </button>
            </div>
          </div>
        </div>

        {/* Output */}
        {result && (
          <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: 8, fontFamily: "var(--font-head)", letterSpacing: 1 }}>
              {getLangName(to).toUpperCase()} TRANSLATION
            </div>
            <div style={{ fontSize: "1.05rem", color: "var(--text)", lineHeight: 1.7, marginBottom: 10 }}>
              {result.translated}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => speak(result.translated, to)}
                style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: "0.75rem" }}>
                🔊 Listen
              </button>
              <button onClick={() => copy(result.translated)}
                style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: "0.75rem" }}>
                📋 Copy
              </button>
              {result.confidence > 0 && (
                <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: "auto" }}>
                  Match: {(result.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: "var(--red)", fontSize: "0.82rem", marginBottom: 8 }}>❌ {error}</div>
        )}
      </div>

      {/* Quick phrases */}
      <div className="card">
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-head)", letterSpacing: 1, marginBottom: 12 }}>
          ⚡ QUICK TRAVEL PHRASES — click to translate to {getLangName(to)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {QUICK_PHRASES.map((phrase, i) => (
            <button key={i}
              onClick={() => { setText(phrase); setCharCount(phrase.length); translate(phrase, "en", to); }}
              style={{
                background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)",
                color: "var(--teal)", borderRadius: 20, padding: "6px 14px",
                fontSize: "0.78rem", cursor: "pointer",
              }}>
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-head)", letterSpacing: 1 }}>
              🕐 RECENT TRANSLATIONS
            </div>
            <button onClick={() => setHistory([])}
              style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "0.72rem", cursor: "pointer" }}>
              Clear
            </button>
          </div>
          {history.map((h, i) => (
            <div key={i} style={{
              borderBottom: i < history.length - 1 ? "1px solid var(--border)" : "none",
              padding: "8px 0", display: "flex", gap: 12, alignItems: "flex-start"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{h.original}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--purple)", marginTop: 2 }}>{h.translated}</div>
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                {getLangName(h.from)} → {getLangName(h.to)}<br/>{h.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
