import { useState, useEffect } from "react";

export default function CurrencyConverter({ baseCurrency }) {
  const [currencies, setCurrencies] = useState({});
  const [from, setFrom] = useState(baseCurrency || "USD");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/currency/currencies")
      .then(r => r.json())
      .then(d => setCurrencies(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (baseCurrency) setFrom(baseCurrency);
  }, [baseCurrency]);

  const convert = () => {
    if (!from || !to || !amount) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/currency?from=${from}&to=${to}&amount=${amount}`)
      .then(r => r.json())
      .then(d => { setResult(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const keys = Object.keys(currencies);

  return (
    <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="card-title green">💱 Live Currency Converter</div>
      <div className="currency-inputs">
        <div className="currency-group">
          <label>Amount</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" />
        </div>
        <div className="currency-group">
          <label>From</label>
          <select value={from} onChange={e => setFrom(e.target.value)}>
            {keys.map(k => <option key={k} value={k}>{k} — {currencies[k]}</option>)}
          </select>
        </div>
        <div className="currency-group">
          <label>To</label>
          <select value={to} onChange={e => setTo(e.target.value)}>
            {keys.map(k => <option key={k} value={k}>{k} — {currencies[k]}</option>)}
          </select>
        </div>
        <button className="quiz-next" style={{ width: "100%" }} onClick={convert}>
          {loading ? "Converting..." : "CONVERT"}
        </button>
      </div>

      {result && (
        <div className="currency-result">
          <div className="amount">{result.result?.toFixed(4)} {to}</div>
          <div className="rate">1 {from} = {result.rate?.toFixed(6)} {to}</div>
          <div className="rate">{amount} {from} → {result.result?.toFixed(2)} {to}</div>
        </div>
      )}
    </div>
  );
}