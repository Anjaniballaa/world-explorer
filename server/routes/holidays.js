const express = require("express");
const axios   = require("axios");
const router  = express.Router();

router.get("/", async (req, res) => {
  const { countryCode } = req.query;
  if (!countryCode) return res.status(400).json({ error: "countryCode required" });

  const cc   = countryCode.toUpperCase();
  const year = new Date().getFullYear();
  const CALENDARIFIC_KEY = process.env.CALENDARIFIC_KEY;

  console.log(`[holidays] country=${cc} year=${year} hasKey=${!!CALENDARIFIC_KEY}`);

  // ── Strategy 1: Calendarific — 1 request, full year, 230+ countries ──────
  if (CALENDARIFIC_KEY) {
    try {
      const url = `https://calendarific.com/api/v2/holidays`;
      const r = await axios.get(url, {
        params: { api_key: CALENDARIFIC_KEY, country: cc, year },
        timeout: 8000,
      });

      console.log(`[holidays] Calendarific status: ${r.data?.meta?.code}`);

      const raw = r.data?.response?.holidays || [];
      if (raw.length > 0) {
        const holidays = raw.map(h => ({
          date:        h.date?.iso?.slice(0, 10) || "",   // YYYY-MM-DD
          name:        h.name || "Holiday",
          localName:   h.name,
          description: h.description || "",
          types:       Array.isArray(h.type) ? h.type : [h.type || "Public"],
          type:        Array.isArray(h.type) ? h.type[0] : (h.type || "Public"),
          locations:   h.locations || "All",
          states:      h.states    || "All",
          global:      h.locations === "All" || !h.locations,
          source:      "calendarific",
        })).filter(h => h.date).sort((a, b) => a.date.localeCompare(b.date));

        console.log(`[holidays] Calendarific returned ${holidays.length} holidays for ${cc}`);
        return res.json({ countryCode: cc, year, holidays, nextYearHolidays: [], longWeekends: [], source: "Calendarific" });
      }
    } catch (err) {
      console.error(`[holidays] Calendarific error: ${err.response?.status} ${err.message}`);
    }
  }

  // ── Strategy 2: Nager.Date — free, no key, good for Europe/Americas ──────
  try {
    console.log(`[holidays] Trying Nager.Date for ${cc}`);
    const [curr, next, lw] = await Promise.allSettled([
      axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/${cc}`,   { timeout: 7000 }),
      axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year+1}/${cc}`, { timeout: 7000 }),
      axios.get(`https://date.nager.at/api/v3/LongWeekend/${year}/${cc}`,      { timeout: 7000 }),
    ]);

    if (curr.status === "fulfilled" && Array.isArray(curr.value.data) && curr.value.data.length > 0) {
      const holidays = curr.value.data.map(h => ({
        ...h,
        type:   h.types?.[0] || "Public",
        source: "nager",
      }));
      console.log(`[holidays] Nager returned ${holidays.length} holidays for ${cc}`);
      return res.json({
        countryCode: cc, year,
        holidays,
        nextYearHolidays: next.status === "fulfilled" ? next.value.data || [] : [],
        longWeekends:     lw.status   === "fulfilled" ? lw.value.data   || [] : [],
        source: "Nager.Date",
      });
    }
  } catch (err) {
    console.error(`[holidays] Nager.Date error: ${err.message}`);
  }

  // ── Nothing worked ────────────────────────────────────────────────────────
  return res.status(404).json({
    error: `No holiday data for ${cc}`,
    needsKey: !CALENDARIFIC_KEY,
    hint: !CALENDARIFIC_KEY
      ? "Add CALENDARIFIC_KEY to server/.env — free at https://calendarific.com"
      : `Calendarific returned no data for country code "${cc}"`,
  });
});

module.exports = router;
