const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.wheretheiss.at/v1/satellites/25544"
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "ISS fetch failed" });
  }
});

module.exports = router;