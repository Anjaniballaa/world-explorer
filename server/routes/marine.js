const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });
  try {
    const response = await axios.get(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity&timezone=auto`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Marine fetch failed" });
  }
});

module.exports = router;