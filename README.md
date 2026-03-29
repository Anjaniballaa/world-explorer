<div align="center">

# 🌍 WORLD EXPLORER
### *Your Planet. Live. Unfiltered.*

[![Live Demo](https://img.shields.io/badge/🚀%20LIVE%20DEMO-world--explorer--eta.vercel.app-00d4ff?style=for-the-badge)](https://world-explorer-eta.vercel.app/)
[![Built With](https://img.shields.io/badge/Built%20With-React%20%2B%20Node.js-ffd700?style=for-the-badge)](https://reactjs.org/)
[![APIs](https://img.shields.io/badge/APIs%20Integrated-15%2B-00ff88?style=for-the-badge)](#-apis--endpoints)
[![Deployed On](https://img.shields.io/badge/Frontend-Vercel-white?style=for-the-badge)](https://vercel.com/)
[![Backend On](https://img.shields.io/badge/Backend-Render-46e3b7?style=for-the-badge)](https://render.com/)

---

> **"I built this to understand how APIs and endpoints work in the real world —**
> **and ended up building a full-stack live data dashboard in the process."**

---

</div>

## ⚡ What Is This?

**World Explorer** is a full-stack real-time dashboard that pulls live data from **15+ external APIs** and displays everything about any location on Earth — weather, earthquakes, languages, economy, news, space, currency, holidays and more.

Point it at any country or city. Watch the data pour in.

---

## 🗂️ The 13 Tabs

| Tab | What It Shows | APIs Used |
|-----|--------------|-----------|
| 🌍 **Overview** | Country info, flag, Wikipedia summary, interactive map | RestCountries, Wikipedia, OpenStreetMap |
| 🌤️ **Weather & Air** | Live temperature, humidity, wind, UV + air quality index | OpenWeatherMap, Open-Meteo |
| 🌋 **Earth Activity** | Nearby earthquakes + live marine wave data | USGS Earthquake, Open-Meteo Marine |
| 🌡️ **Climate** | Historical climate chart for any location | Open-Meteo Archive |
| 🗺️ **Places & Food** | Nearby monuments, temples, beaches, restaurants | Geoapify Places |
| 📊 **Economy** | GDP, inflation, population growth charts | World Bank API |
| 🎉 **Holidays** | Upcoming public holidays for any country | Calendarific, Nager.Date |
| 🗣️ **Languages** | Regional language, native script, state/city Wikipedia | Nominatim, Wikipedia REST, RestCountries |
| 🌐 **Translator** | Translate any text into local language | LibreTranslate |
| 📰 **News** | Live top news by country and category | TheNewsAPI |
| 💱 **Currency** | Real-time currency converter | Frankfurter |
| 🚀 **Space** | NASA Photo of the Day + live ISS tracker | NASA APOD, wheretheiss.at |
| 🏆 **Quiz** | Geography quiz based on your region | RestCountries |

---

## 🔌 APIs & Endpoints

> This project was built **primarily to learn how APIs work** — how to call them, handle their responses, chain them together, and build real products with them.

```
## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           VERCEL (Frontend)              │
│   React + Vite                           │
│   13 Panels → each calls Render API      │
│   GPS → exact location detection         │
└──────────────┬──────────────────────────┘
               │ HTTPS API calls
               ▼
┌─────────────────────────────────────────┐
│           RENDER (Backend)               │
│   Express.js API Server                  │
│   17 routes → each calls external APIs  │
│   Hides API keys from frontend           │
└──────────────┬──────────────────────────┘
               │ calls 15+ external APIs
               ▼
┌─────────────────────────────────────────┐
│         EXTERNAL APIs                    │
│  OpenWeatherMap · NASA · USGS            │
│  World Bank · Geoapify · Calendarific    │
│  Wikipedia · Nominatim · Frankfurter     │
│  Open-Meteo · TheNewsAPI · ipapi.co      │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with hooks (useState, useEffect, useCallback, useRef)
- **Vite** — lightning fast dev server and builds
- **CSS Variables** — custom dark theme design system
- **OpenStreetMap iframe** — zero-dependency map rendering
- **Browser GPS API** — `navigator.geolocation` for exact location

### Backend
- **Node.js + Express** — REST API server
- **Axios** — HTTP client for external API calls
- **dotenv** — secure API key management
- **CORS** — cross-origin requests from Vercel frontend

### Deployment
- **Vercel** — frontend (auto-deploy from GitHub)
- **Render** — backend (free tier, Node.js)

---

## 🚀 Run Locally

### Prerequisites
- Node.js 18+
- API keys (see `.env` setup below)

### 1. Clone
```bash
git clone https://github.com/yourusername/world-explorer.git
cd world-explorer
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
NEWS_API_KEY=your_thenewsapi_key
WEATHER_API_KEY=your_openweathermap_key
CALENDARIFIC_KEY=your_calendarific_key
GEOAPIFY_KEY=your_geoapify_key
```

```bash
node index.js
# Server running on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
# App running on http://localhost:5173
```

---

## 🔑 API Keys — Where to Get Them

| API | Free Tier | Get Key |
|-----|-----------|---------|
| OpenWeatherMap | 1M calls/month | [openweathermap.org](https://openweathermap.org/api) |
| TheNewsAPI | 100 calls/day | [thenewsapi.com](https://www.thenewsapi.com/) |
| Calendarific | 1000 calls/month | [calendarific.com](https://calendarific.com/) |
| Geoapify | 3000 calls/day | [geoapify.com](https://www.geoapify.com/) |
| NASA APOD | Unlimited | [api.nasa.gov](https://api.nasa.gov/) |
| Open-Meteo | Unlimited | No key needed ✅ |
| USGS Earthquakes | Unlimited | No key needed ✅ |
| Frankfurter | Unlimited | No key needed ✅ |
| Wikipedia REST | Unlimited | No key needed ✅ |
| RestCountries | Unlimited | No key needed ✅ |
| World Bank | Unlimited | No key needed ✅ |

---

## 💡 What I Learned

This project was built specifically to understand **how APIs and endpoints work**. Here's what it taught me:

- **REST API fundamentals** — GET requests, query params, response parsing
- **Backend as a proxy** — hiding API keys, avoiding CORS issues
- **Chaining APIs** — using output of one API as input to another (e.g. coords → weather → air quality)
- **Error handling** — graceful fallbacks when APIs fail or rate limit
- **Environment variables** — keeping secrets out of frontend code
- **Async/await patterns** — handling multiple concurrent API calls
- **IP geolocation vs GPS** — understanding accuracy tradeoffs
- **Deployment** — connecting Vercel frontend to Render backend in production

---

## 🌐 Live Demo

**[https://world-explorer-eta.vercel.app/](https://world-explorer-eta.vercel.app/)**

> Allow location access when prompted for the most accurate results.
> Try searching any city in the world — Tokyo, New York, Cairo, São Paulo.

---

<div align="center">

Built with curiosity, APIs, and a lot of `console.log()` 🛠️

**⭐ Star this repo if it helped you understand APIs!**

</div>
