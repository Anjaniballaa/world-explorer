const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {

  const { lat, lon, city } = req.query;

  if (!lat || !lon)
    return res.status(400).json({ error: "lat and lon required" });

  const KEY = process.env.GEOAPIFY_KEY;

  try {

    const categories = [
      "tourism.attraction",
      "tourism.sights",
      "tourism.sights.fort",
      "tourism.sights.castle",
      "tourism.sights.archaeological_site",
      "tourism.sights.memorial.monument",
      "tourism.sights.bridge",

      "religion.place_of_worship.hinduism",

      "beach",
      "natural.water.sea",

      "catering.restaurant",
      "catering.cafe",
      "catering.fast_food"
    ];

    const r = await axios.get(
      "https://api.geoapify.com/v2/places",
      {
        params: {
          categories: categories.join(","),
          filter: `circle:${lon},${lat},25000`,
          bias: `proximity:${lon},${lat}`,
          limit: 60,
          lang: "en",
          apiKey: KEY
        }
      }
    );

    const features = r.data.features || [];

    const monuments = [];
    const temples = [];
    const beaches = [];
    const food = [];

    features.forEach(f => {

      const p = f.properties;

      const place = {
        name: p.name || "Unknown",
        address: p.formatted || "",
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        categories: p.categories || []
      };

      if (p.categories?.some(c => c.includes("hinduism")))
        temples.push(place);

      else if (p.categories?.some(c => c.includes("beach") || c.includes("sea")))
        beaches.push(place);

      else if (p.categories?.some(c => c.includes("restaurant") || c.includes("catering")))
        food.push(place);

      else
        monuments.push(place);

    });

    res.json({
      city,
      monuments,
      temples,
      beaches,
      food
    });

  } catch (err) {

    console.error("Attractions error:", err.message);

    res.status(500).json({ error: err.message });

  }

});

module.exports = router;
