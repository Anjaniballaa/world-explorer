const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });
  try {
    const response = await axios.get(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=500&limit=10&orderby=time`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Earthquake fetch failed" });
  }
});

module.exports = router;