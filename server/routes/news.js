const express = require("express");
const axios = require("axios");
const router = express.Router();

const NEWS_KEY = process.env.NEWS_API_KEY || "";

// TheNewsAPI - free tier, instant signup, truly live news
router.get("/", async (req, res) => {
  const { country = "in", category = "general", countryName = "India" } = req.query;

  const categoryMap = {
    general: "general",
    technology: "tech",
    sports: "sports",
    health: "health",
    business: "business",
    entertainment: "entertainment",
    science: "science",
  };

  const cat = categoryMap[category] || "general";

  try {
    const response = await axios.get("https://api.thenewsapi.com/v1/news/top", {
      params: {
        api_token: NEWS_KEY,
        locale: country.toLowerCase(),
        language: "en",
        categories: cat,
        limit: 15,
      },
      timeout: 8000,
    });

    if (response.data?.data?.length > 0) {
      const articles = response.data.data.map(a => ({
        title: a.title,
        description: a.description || a.snippet || "",
        url: a.url,
        publishedAt: a.published_at,
        image: a.image_url || null,
        source: { name: a.source || "News" },
      }));
      return res.json({ articles });
    }
  } catch (err) {
    console.error("TheNewsAPI error:", err.message);
  }

  // Fallback: search by country name
  try {
    const response = await axios.get("https://api.thenewsapi.com/v1/news/all", {
      params: {
        api_token: NEWS_KEY,
        search: countryName,
        language: "en",
        sort: "published_at",
        limit: 15,
      },
      timeout: 8000,
    });

    if (response.data?.data?.length > 0) {
      const articles = response.data.data.map(a => ({
        title: a.title,
        description: a.description || a.snippet || "",
        url: a.url,
        publishedAt: a.published_at,
        image: a.image_url || null,
        source: { name: a.source || "News" },
      }));
      return res.json({ articles });
    }
  } catch (err) {
    console.error("TheNewsAPI fallback error:", err.message);
  }

  res.status(500).json({ error: "News unavailable", articles: [] });
});

module.exports = router;