const SUPABASE_URL = "https://wnjxtjeospeblvqdqsdj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Induanh0amVvc3BlYmx2cWRxc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTI2MjQsImV4cCI6MjA4OTI4ODYyNH0.l3OHQ9_v5__lkX_AryEkmg2uYGgxnTR4KqViV8foNls";
const SITE_URL = "https://www.tripcopycat.com";

export default async function handler(req, res) {
  let trips = [];

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/trips?status=eq.published&select=id,created_at&order=created_at.desc`,
      {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        signal: AbortSignal.timeout(5000)
      }
    );
    if (r.ok) {
      trips = await r.json();
    }
  } catch (_) {}

  const today = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: SITE_URL, lastmod: today, changefreq: "daily", priority: "1.0" },
  ];

  const tripUrls = trips.map(trip => ({
    loc: `${SITE_URL}/trip/${trip.id}`,
    lastmod: trip.created_at ? trip.created_at.split("T")[0] : today,
    changefreq: "weekly",
    priority: "0.8"
  }));

  const allUrls = [...staticUrls, ...tripUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
