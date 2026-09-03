export default async function handler(req, res) {
  const { path = 'all', fields } = req.query;
  const query = fields ? `?fields=${fields}` : '';
  const upstream = `https://restcountries.com/v3.1/${path}${query}`;

  try {
    const upstreamRes = await fetch(upstream);
    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: `Upstream returned ${upstreamRes.status}` });
    }
    const data = await upstreamRes.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach restcountries.com' });
  }
}
