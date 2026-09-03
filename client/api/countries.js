export default async function handler(req, res) {
  const { path = '', ...rest } = req.query;
  const params = new URLSearchParams(rest).toString();
  const upstream = `https://api.restcountries.com/countries/v5${path ? `/${path}` : ''}${params ? `?${params}` : ''}`;

  try {
    const upstreamRes = await fetch(upstream, {
      headers: { Authorization: `Bearer ${process.env.RESTCOUNTRIES_API_KEY}` },
    });
    const data = await upstreamRes.json();
    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: data?.errors?.[0]?.message || `Upstream returned ${upstreamRes.status}` });
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach restcountries.com' });
  }
}
