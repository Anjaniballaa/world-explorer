const express = require("express");
const axios = require("axios");
const router = express.Router();

const INDICATORS = {
  gdp:        "NY.GDP.MKTP.CD",       // GDP current USD
  gdpPerCap:  "NY.GDP.PCAP.CD",       // GDP per capita
  gdpGrowth:  "NY.GDP.MKTP.KD.ZG",    // GDP growth %
  inflation:  "FP.CPI.TOTL.ZG",       // Inflation %
  unemployment:"SL.UEM.TOTL.ZS",      // Unemployment %
  literacy:   "SE.ADT.LITR.ZS",       // Literacy rate
  lifeExp:    "SP.DYN.LE00.IN",        // Life expectancy
  internet:   "IT.NET.USER.ZS",        // Internet users %
  gini:       "SI.POV.GINI",           // GINI inequality
  exports:    "NE.EXP.GNFS.ZS",        // Exports % of GDP
};

async function fetchIndicator(countryCode, indicatorCode, years = 10) {
  try {
    const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?format=json&mrv=${years}&per_page=${years}`;
    const res = await axios.get(url, { timeout: 7000 });
    const raw = res.data?.[1] || [];
    return raw
      .filter(d => d.value !== null)
      .map(d => ({ year: parseInt(d.date), value: d.value }))
      .sort((a, b) => a.year - b.year);
  } catch {
    return [];
  }
}

router.get("/", async (req, res) => {
  const { countryCode } = req.query;
  if (!countryCode) return res.status(400).json({ error: "countryCode required" });
  const cc = countryCode.toUpperCase();

  try {
    const [gdp, gdpPerCap, gdpGrowth, inflation, unemployment, literacy, lifeExp, internet, gini, exports] =
      await Promise.all([
        fetchIndicator(cc, INDICATORS.gdp, 15),
        fetchIndicator(cc, INDICATORS.gdpPerCap, 15),
        fetchIndicator(cc, INDICATORS.gdpGrowth, 15),
        fetchIndicator(cc, INDICATORS.inflation, 15),
        fetchIndicator(cc, INDICATORS.unemployment, 15),
        fetchIndicator(cc, INDICATORS.literacy, 10),
        fetchIndicator(cc, INDICATORS.lifeExp, 15),
        fetchIndicator(cc, INDICATORS.internet, 10),
        fetchIndicator(cc, INDICATORS.gini, 10),
        fetchIndicator(cc, INDICATORS.exports, 15),
      ]);

    res.json({ countryCode: cc, gdp, gdpPerCap, gdpGrowth, inflation, unemployment, literacy, lifeExp, internet, gini, exports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
