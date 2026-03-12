const express = require("express");
const axios = require("axios");
const router = express.Router();

const WEATHER_KEY = process.env.WEATHER_API_KEY || "";

router.get("/", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

  try {
    // Current weather
    const current = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`
    );

    // 5-day forecast
    const forecast = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric&cnt=5`
    );

    res.json({
      current: {
        temperature_2m: current.data.main.temp,
        apparent_temperature: current.data.main.feels_like,
        relative_humidity_2m: current.data.main.humidity,
        wind_speed_10m: current.data.wind.speed * 3.6, // m/s to km/h
        wind_direction_10m: current.data.wind.deg,
        precipitation: current.data.rain?.["1h"] || 0,
        cloudcover: current.data.clouds.all,
        weathercode: current.data.weather[0].id,
        description: current.data.weather[0].description,
        icon: current.data.weather[0].icon,
        visibility: current.data.visibility,
        pressure: current.data.main.pressure,
        sunrise: current.data.sys.sunrise,
        sunset: current.data.sys.sunset,
        uv_index: null,
      },
      forecast: forecast.data.list.map(f => ({
        time: f.dt_txt,
        temp: f.main.temp,
        description: f.weather[0].description,
        icon: f.weather[0].icon,
        humidity: f.main.humidity,
        wind: f.wind.speed * 3.6,
      })),
      city: current.data.name,
    });
  } catch (err) {
    console.error("Weather error:", err.message);
    // Fallback to Open-Meteo (no key needed)
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,weathercode,cloudcover&timezone=auto`
      );
      res.json({ current: response.data.current, forecast: [] });
    } catch (err2) {
      res.status(500).json({ error: "Weather fetch failed" });
    }
  }
});

module.exports = router;