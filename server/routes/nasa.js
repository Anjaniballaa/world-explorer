const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "NASA fetch failed" });
  }
});

module.exports = router;