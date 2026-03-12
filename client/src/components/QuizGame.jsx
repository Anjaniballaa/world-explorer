import { useState, useEffect, useCallback } from "react";

export default function QuizGame({ region, country }) {
  const [allCountries, setAllCountries] = useState([]);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState("region");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("https://restcountries.com/v3.1/all?fields=name,capital,flags,population,region,area")
      .then(r => r.json())
      .then(d => {
        const filtered = d.filter(c => c.capital?.length > 0 && c.name?.common && c.flags?.svg);
        setAllCountries(filtered);
        setLoading(false);
      })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, []);

  const generateQuestion = useCallback(() => {
    if (allCountries.length < 4) return;
    setSelected(null);

    let pool = allCountries;
    if (mode === "region" && region) {
      const regional = allCountries.filter(c => c.region === region);
      if (regional.length >= 4) pool = regional;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
    const correct = shuffled[0];
    const wrong = shuffled.slice(1, 4);
    const type = Math.floor(Math.random() * 3);

    if (type === 0) {
      // Flag question
      const opts = [correct, ...wrong].sort(() => Math.random() - 0.5).map(c => c.name.common);
      setQuestion({ text: "🏳️ Which country does this flag belong to?", flag: correct.flags.svg, answer: correct.name.common });
      setOptions(opts);
    } else if (type === 1) {
      // Capital question - make sure all have capitals
      const validWrong = wrong.filter(c => c.capital?.[0]);
      if (validWrong.length < 3) { generateQuestion(); return; }
      const opts = [correct.capital[0], ...validWrong.map(c => c.capital[0])].sort(() => Math.random() - 0.5);
      setQuestion({ text: `🏙️ What is the capital of ${correct.name.common}?`, flag: null, countryFlag: correct.flags.svg, answer: correct.capital[0] });
      setOptions(opts);
    } else {
      // Population question
      const opts = [correct, ...wrong].sort(() => Math.random() - 0.5).map(c => c.name.common);
      setQuestion({ text: `🌍 Which country has ~${(correct.population / 1e6).toFixed(1)}M people?`, flag: null, answer: correct.name.common });
      setOptions(opts);
    }
  }, [allCountries, mode, region]);

  useEffect(() => {
    if (allCountries.length >= 4) generateQuestion();
  }, [allCountries, mode]);

  const handleAnswer = (opt) => {
    if (selected || !question) return;
    setSelected(opt);
    setTotal(t => t + 1);
    if (opt === question.answer) setScore(s => s + 1);
  };

  if (loading) return <div className="card"><p className="no-data">⏳ Loading quiz data...</p></div>;
  if (fetchError) return <div className="card"><p className="no-data">❌ Failed to load quiz. Check your internet connection.</p></div>;
  if (!question) return <div className="card"><p className="no-data">⏳ Preparing question...</p></div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="card">
        <div className="card-title gold">🏆 World Explorer Quiz</div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <button
            className={`news-tab ${mode === "region" ? "active" : ""}`}
            onClick={() => { setMode("region"); setScore(0); setTotal(0); setQuestion(null); }}
          >
            🌏 {region || "Regional"} Focus
          </button>
          <button
            className={`news-tab ${mode === "world" ? "active" : ""}`}
            onClick={() => { setMode("world"); setScore(0); setTotal(0); setQuestion(null); }}
          >
            🌍 World Mode
          </button>
        </div>

        <div className="quiz-score">
          Score: {score} / {total} {total > 0 && `(${Math.round(score / total * 100)}%)`}
        </div>

        {question.flag && (
          <img src={question.flag} alt="flag" style={{ width: "100%", maxHeight: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }} />
        )}
        {question.countryFlag && !question.flag && (
          <img src={question.countryFlag} alt="hint" style={{ width: "70px", height: "45px", objectFit: "cover", borderRadius: "4px", marginBottom: "12px" }} />
        )}

        <div className="quiz-question">{question.text}</div>

        <div className="quiz-options">
          {options.map((opt, i) => {
            let cls = "quiz-option";
            if (selected) {
              if (opt === question.answer) cls += " correct";
              else if (opt === selected) cls += " wrong";
            }
            return (
              <button key={i} className={cls} onClick={() => handleAnswer(opt)} disabled={!!selected}>
                {opt}
              </button>
            );
          })}
        </div>

        {selected && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: "0.9rem", color: selected === question.answer ? "var(--green)" : "var(--red)", marginBottom: 8 }}>
              {selected === question.answer ? "✅ Correct!" : `❌ Wrong! Correct answer: ${question.answer}`}
            </div>
            <button className="quiz-next" onClick={generateQuestion}>Next Question →</button>
          </div>
        )}
      </div>
    </div>
  );
}