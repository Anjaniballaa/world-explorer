const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  const { from = "USD", to = "INR", amount = 1 } = req.query;
  try {
    const response = await axios.get(
      `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`
    );
    const rate = response.data.rates[to];
    res.json({ from, to, amount: parseFloat(amount), rate, result: parseFloat(amount) * rate });
  } catch (err) {
    res.status(500).json({ error: "Currency fetch failed" });
  }
});

router.get("/currencies", async (req, res) => {
  try {
    const response = await axios.get("https://api.frankfurter.dev/v1/currencies");
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Currencies fetch failed" });
  }
});

module.exports = router;