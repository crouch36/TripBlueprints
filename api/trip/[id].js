const SUPABASE_URL = "https://wnjxtjeospeblvqdqsdj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Induanh0amVvc3BlYmx2cWRxc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTI2MjQsImV4cCI6MjA4OTI4ODYyNH0.l3OHQ9_v5__lkX_AryEkmg2uYGgxnTR4KqViV8foNls";
const SITE_URL = "https://www.tripcopycat.com";

const DEFAULT_TITLE = "TripCopycat — Real Itineraries from Real Travelers";
const DEFAULT_DESC  = "Copy real trips planned by real travelers. Browse free travel itineraries and submit your own.";
const DEFAULT_IMAGE = `${SITE_URL}/TripCopycat_OG.png`;

const LOCAL_TRIPS = {
  "1": {
    title: "Scotland with Kids — Edinburgh & Perthshire — TripCopycat",
    description: "The Perthshire farm stay at Pitmeadow Farm is the undisputed highlight — collecting eggs, walking ponies, feeding pigs. Our kids call this their favourite trip ever.",
    image: `${SITE_URL}/victoria-street.jpg`,
  },
  "2": {
    title: "Ireland Guys Trip — Galway & Dublin — TripCopycat",
    description: "Sean's Bar is a mandatory stop — opens at 10:30am and there is no better way to start an Ireland trip. Bowe's consistently pours the best pint in Dublin.",
    image: `${SITE_URL}/bowes.webp`,
  },
};

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function proxyImage(imageUrl) {
  if (!imageUrl) return DEFAULT_IMAGE;
  if (imageUrl.startsWith(SITE_URL)) return imageUrl;
  if (imageUrl.startsWith("http")) return `${SITE_URL}/api/image?url=${encodeURIComponent(imageUrl)}`;
  return `${SITE_URL}${imageUrl}`;
}

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) { res.status(400).send("Missing id"); return; }

  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESC;
  let ogImage = DEFAULT_IMAGE;
  const canonicalUrl = `${SITE_URL}/trip/${id}`;

  // 1. Check local hardcoded trips first
  const local = LOCAL_TRIPS[String(id)];
  if (local) {
    title = local.title;
    description = local.description;
    ogImage = proxyImage(local.image);
  }

  // 2. Try Supabase
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/trips?id=eq.${encodeURIComponent(id)}&status=eq.published&select=title,destination,image,duration,region,loves&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, signal: AbortSignal.timeout(4000) }
    );
    if (r.ok) {
      const rows = await r.json();
      const trip = rows?.[0];
      if (trip) {
        title = `${trip.title} — TripCopycat`;
        description = trip.loves ? trip.loves.slice(0, 160) : `${trip.destination} · ${trip.duration} · Real traveler itinerary on TripCopycat`;
        ogImage = proxyImage(trip.image);
      }
    }
  } catch (_) {}

  // 3. Fetch the real built index.html — it has correct Vite asset hashes
  let html = "";
  try {
    const r = await fetch(`${SITE_URL}/`, { signal: AbortSignal.timeout(4000) });
    html = await r.text();
  } catch (_) {
    res.status(500).send("Failed to load app"); return;
  }

  // 4. Replace placeholder tokens (set in index.html)
  html = html
    .replace(/__OG_TITLE__/g,       escapeHtml(title))
    .replace(/__OG_DESCRIPTION__/g, escapeHtml(description))
    .replace(/__OG_URL__/g,         canonicalUrl)
    .replace(/__OG_IMAGE__/g,       escapeHtml(ogImage));

  // 5. Inject a small script so React knows which trip to open on mount
  const tripScript = `<script>window.__INITIAL_TRIP_ID__ = ${JSON.stringify(String(id))};</script>`;
  html = html.replace("</head>", `${tripScript}\n  </head>`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=3600");
  res.status(200).send(html);
}
