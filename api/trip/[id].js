const SUPABASE_URL = "https://wnjxtjeospeblvqdqsdj.supabase.co";

// Hardcoded local trips (not in Supabase)
const LOCAL_TRIPS = {
  "1": {
    title: "Scotland with Kids — Edinburgh & Perthshire — TripCopycat",
    description: "The Perthshire farm stay at Pitmeadow Farm is the undisputed highlight — collecting eggs, walking ponies, feeding pigs. Our kids call this their favourite trip ever.",
    image: "/victoria-street.jpg",
  },
  "2": {
    title: "Ireland Guys Trip — Galway & Dublin — TripCopycat",
    description: "Sean's Bar is a mandatory stop — opens at 10:30am and there is no better way to start an Ireland trip. Bowe's consistently pours the best pint in Dublin.",
    image: "/bowes.webp",
  },
};
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Induanh0amVvc3BlYmx2cWRxc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTI2MjQsImV4cCI6MjA4OTI4ODYyNH0.l3OHQ9_v5__lkX_AryEkmg2uYGgxnTR4KqViV8foNls";
const SITE_URL = "https://www.tripcopycat.com";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function handler(req, res) {
  const { id } = req.query;

  let title = "TripCopycat — Real Itineraries from Real Travelers";
  let description = "Copy real trips planned by real travelers. Browse free travel itineraries and submit your own.";
  let ogImage = `${SITE_URL}/api/og?id=${id}`;
  const canonicalUrl = `${SITE_URL}/trip/${id}`;

  // Check local trips first
  const local = LOCAL_TRIPS[String(id)];
  if (local) {
    title = local.title;
    description = local.description;
    ogImage = local.image.startsWith("http")
      ? `${SITE_URL}/api/image?url=${encodeURIComponent(local.image)}`
      : `${SITE_URL}${local.image}`;
  }

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/trips?id=eq.${id}&status=eq.published&select=title,destination,image,duration,region,loves&limit=1`,
      {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (r.ok) {
      const rows = await r.json();
      const trip = rows?.[0];
      if (trip) {
        title = `${trip.title} — TripCopycat`;
        description = trip.loves
          ? trip.loves.slice(0, 160)
          : `${trip.destination} · ${trip.duration} · Real traveler itinerary on TripCopycat`;
        // Proxy Supabase URLs through our domain so iMessage/social platforms accept them
        if (trip.image) {
          if (trip.image.startsWith("http")) {
            ogImage = `${SITE_URL}/api/image?url=${encodeURIComponent(trip.image)}`;
          } else {
            ogImage = `${SITE_URL}${trip.image}`;
          }
        }
      }
    }
  } catch (_) {
    // Fall through to defaults
  }

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/copycat.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(html);
}
