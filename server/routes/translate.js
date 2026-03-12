const express = require("express");
const axios   = require("axios");
const router  = express.Router();

router.get("/languages", (req, res) => {
  // MyMemory supports these — curated list of most useful ones
  res.json([
    { code: "en", name: "English" },       { code: "hi", name: "Hindi" },
    { code: "te", name: "Telugu" },        { code: "ta", name: "Tamil" },
    { code: "kn", name: "Kannada" },       { code: "ml", name: "Malayalam" },
    { code: "bn", name: "Bengali" },       { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },      { code: "pa", name: "Punjabi" },
    { code: "ur", name: "Urdu" },          { code: "or", name: "Odia" },
    { code: "ar", name: "Arabic" },        { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },      { code: "ko", name: "Korean" },
    { code: "fr", name: "French" },        { code: "de", name: "German" },
    { code: "es", name: "Spanish" },       { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },       { code: "it", name: "Italian" },
    { code: "nl", name: "Dutch" },         { code: "tr", name: "Turkish" },
    { code: "pl", name: "Polish" },        { code: "sv", name: "Swedish" },
    { code: "no", name: "Norwegian" },     { code: "da", name: "Danish" },
    { code: "fi", name: "Finnish" },       { code: "el", name: "Greek" },
    { code: "he", name: "Hebrew" },        { code: "th", name: "Thai" },
    { code: "vi", name: "Vietnamese" },    { code: "id", name: "Indonesian" },
    { code: "ms", name: "Malay" },         { code: "sw", name: "Swahili" },
    { code: "af", name: "Afrikaans" },     { code: "uk", name: "Ukrainian" },
    { code: "ro", name: "Romanian" },      { code: "hu", name: "Hungarian" },
    { code: "cs", name: "Czech" },         { code: "sk", name: "Slovak" },
    { code: "hr", name: "Croatian" },      { code: "sr", name: "Serbian" },
    { code: "bg", name: "Bulgarian" },     { code: "lt", name: "Lithuanian" },
    { code: "lv", name: "Latvian" },       { code: "et", name: "Estonian" },
    { code: "fa", name: "Persian" },       { code: "ca", name: "Catalan" },
  ]);
});

router.post("/", async (req, res) => {
  const { text, from = "en", to } = req.body;
  if (!text || !to) return res.status(400).json({ error: "text and to are required" });
  if (text.length > 500) return res.status(400).json({ error: "Max 500 characters" });

  try {
    const langPair = `${from}|${to}`;
    const r = await axios.get("https://api.mymemory.translated.net/get", {
      params: { q: text, langpair: langPair },
      timeout: 8000,
    });

    const data = r.data;
    if (data.responseStatus !== 200) {
      return res.status(500).json({ error: data.responseDetails || "Translation failed" });
    }

    res.json({
      original:    text,
      translated:  data.responseData.translatedText,
      from,
      to,
      confidence:  data.responseData.match,
      alternatives: (data.matches || [])
        .filter(m => m.translation !== data.responseData.translatedText)
        .slice(0, 3)
        .map(m => ({ text: m.translation, quality: m.quality })),
    });
  } catch (err) {
    console.error("[translate]", err.message);
    res.status(500).json({ error: "Translation service unavailable" });
  }
});

module.exports = router;