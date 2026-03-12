const express = require("express");
const axios   = require("axios");
const router  = express.Router();

router.get("/", async (req, res) => {
  try {
    // Get real user IP — works on Render, Vercel, any proxy
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "";

    // Strip IPv6 prefix if present
    const cleanIp = ip.replace("::ffff:", "");

    // Use ip-api.com with the real user IP
    // If cleanIp is empty or localhost, it auto-detects (works for local dev)
    const url = cleanIp && cleanIp !== "127.0.0.1" && cleanIp !== "::1"
      ? `http://ip-api.com/json/${cleanIp}?fields=status,message,country,countryCode,regionName,city,lat,lon,timezone,currency`
      : `http://ip-api.com/json/?fields=status,message,country,countryCode,regionName,city,lat,lon,timezone,currency`;

    const { data } = await axios.get(url);

    if (data.status !== "success") {
      return res.status(400).json({ error: "Location detection failed", detail: data.message });
    }

    res.json({
      city:        data.city,
      country:     data.country,
      countryCode: data.countryCode,
      regionName:  data.regionName,
      lat:         data.lat,
      lon:         data.lon,
      timezone:    data.timezone,
      currency:    data.currency,
    });

  } catch (err) {
    console.error("Location error:", err.message);
    res.status(500).json({ error: "Location detection failed" });
  }
});

module.exports = router;
