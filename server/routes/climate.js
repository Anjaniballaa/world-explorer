const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  const { lat, lon, city } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

  // Get last 12 months of daily data then aggregate to monthly
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);

  const fmt = d => d.toISOString().split("T")[0];

  try {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${fmt(start)}&end_date=${fmt(end)}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,windspeed_10m_max,sunshine_duration&timezone=auto`;

    const res2 = await axios.get(url, { timeout: 10000 });
    const data = res2.data;

    if (!data.daily) return res.status(500).json({ error: "No climate data returned" });

    // Aggregate daily → monthly
    const monthly = {};
    const dates = data.daily.time;
    dates.forEach((date, i) => {
      const month = date.slice(0, 7); // YYYY-MM
      if (!monthly[month]) monthly[month] = { tempMax: [], tempMin: [], tempMean: [], precip: [], wind: [], sunshine: [] };
      if (data.daily.temperature_2m_max[i] !== null) monthly[month].tempMax.push(data.daily.temperature_2m_max[i]);
      if (data.daily.temperature_2m_min[i] !== null) monthly[month].tempMin.push(data.daily.temperature_2m_min[i]);
      if (data.daily.temperature_2m_mean[i] !== null) monthly[month].tempMean.push(data.daily.temperature_2m_mean[i]);
      if (data.daily.precipitation_sum[i] !== null) monthly[month].precip.push(data.daily.precipitation_sum[i]);
      if (data.daily.windspeed_10m_max[i] !== null) monthly[month].wind.push(data.daily.windspeed_10m_max[i]);
      if (data.daily.sunshine_duration[i] !== null) monthly[month].sunshine.push(data.daily.sunshine_duration[i]);
    });

    const avg = arr => arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : null;
    const sum = arr => arr.length ? parseFloat(arr.reduce((a, b) => a + b, 0).toFixed(1)) : null;

    const months = Object.keys(monthly).sort();
    const result = months.map(m => ({
      month: m,
      label: new Date(m + "-01").toLocaleString("default", { month: "short", year: "numeric" }),
      avgTempMax: avg(monthly[m].tempMax),
      avgTempMin: avg(monthly[m].tempMin),
      avgTemp: avg(monthly[m].tempMean),
      totalPrecip: sum(monthly[m].precip),
      avgWind: avg(monthly[m].wind),
      sunshineHours: sum(monthly[m].sunshine) ? parseFloat((sum(monthly[m].sunshine) / 3600).toFixed(1)) : null,
    }));

    res.json({ city, lat, lon, monthly: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
