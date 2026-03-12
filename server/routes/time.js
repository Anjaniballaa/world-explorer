const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
  const { timezone } = req.query;
  if (!timezone) return res.status(400).json({ error: "timezone required" });
  try {
    const response = await axios.get(
      `https://worldtimeapi.org/api/timezone/${timezone}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Time fetch failed" });
  }
});

module.exports = router;