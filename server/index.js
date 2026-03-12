const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// CRITICAL: trust proxy headers from Render/Vercel/Cloudflare
// This makes req.headers["x-forwarded-for"] work correctly
app.set("trust proxy", true);

app.use(cors());
app.use(express.json());

app.use("/api/location",    require("./routes/location"));
app.use("/api/weather",     require("./routes/weather"));
app.use("/api/airquality",  require("./routes/airquality"));
app.use("/api/marine",      require("./routes/marine"));
app.use("/api/earthquake",  require("./routes/earthquake"));
app.use("/api/news",        require("./routes/news"));
app.use("/api/currency",    require("./routes/currency"));
app.use("/api/wiki",        require("./routes/wiki"));
app.use("/api/nasa",        require("./routes/nasa"));
app.use("/api/iss",         require("./routes/iss"));
app.use("/api/language",    require("./routes/language"));
app.use("/api/economy",     require("./routes/economy"));
app.use("/api/holidays",    require("./routes/holidays"));
app.use("/api/climate",     require("./routes/climate"));
app.use("/api/attractions", require("./routes/attractions"));
app.use("/api/translate",   require("./routes/translate"));
app.use("/api/time",        require("./routes/time"));

app.get("/", (req, res) => res.json({ status: "World Explorer API running 🌍" }));
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
