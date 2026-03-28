const SUPABASE_URL = "https://wnjxtjeospeblvqdqsdj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Induanh0amVvc3BlYmx2cWRxc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTI2MjQsImV4cCI6MjA4OTI4ODYyNH0.l3OHQ9_v5__lkX_AryEkmg2uYGgxnTR4KqViV8foNls";
const SITE_URL = "https://www.tripcopycat.com";

const DEFAULT_TITLE = "TripCopycat — Real Itineraries from Real Travelers";
const DEFAULT_DESC  = "Copy real trips planned by real travelers. Browse free travel itineraries and submit your own.";
const DEFAULT_IMAGE = `${SITE_URL}/TripCopycat_OG.png`;

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

function buildDescription(trip) {
  if (trip.loves) return trip.loves.slice(0, 160);
  const parts = [trip.destination, trip.duration, trip.travelers].filter(Boolean);
  return parts.join(" · ") + " — Real traveler itinerary on TripCopycat";
}

function buildJsonLd(trip, canonicalUrl, ogImage) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": trip.title,
    "description": buildDescription(trip),
    "url": canonicalUrl,
    "image": ogImage,
    "provider": {
      "@type": "Organization",
      "name": "TripCopycat",
      "url": SITE_URL
    }
  };

  if (trip.author_name) {
    ld.author = { "@type": "Person", "name": trip.author_name };
  }

  if (trip.travelers) {
    ld.touristType = trip.travelers;
  }

  if (trip.destination) {
    ld.touristType = ld.touristType || trip.travelers;
    ld.itinerary = ld.itinerary || {};
  }

  // Day-by-day itinerary as ItemList — Google loves this
  if (Array.isArray(trip.days) && trip.days.length > 0) {
    ld.itinerary = {
      "@type": "ItemList",
      "itemListElement": trip.days.map((day, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": day.title || `Day ${day.day}`,
        "description": Array.isArray(day.items)
          ? day.items.map(item => item.label).join(", ")
          : ""
      }))
    };
  }

  return JSON.stringify(ld, null, 0);
}

function buildServerContent(trip, canonicalUrl) {
  // Visually hidden, Google-readable content block.
  // Not cloaking — identical content to what React renders, just pre-rendered.
  // Standard SSR pattern used by Next.js, Nuxt, etc.
  const days = Array.isArray(trip.days) ? trip.days : [];
  const tags = Array.isArray(trip.tags) ? trip.tags.join(", ") : "";

  const daysHtml = days.map(day => {
    const items = Array.isArray(day.items) ? day.items : [];
    const itemsHtml = items.map(item => {
      const note = item.note ? ` — ${escapeHtml(item.note)}` : "";
      return `<li>${escapeHtml(item.label)}${note}</li>`;
    }).join("");
    return `<h3>${escapeHtml(day.title || `Day ${day.day}`)}</h3><ul>${itemsHtml}</ul>`;
  }).join("");

  return `
<div style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
  <article>
    <h1>${escapeHtml(trip.title)}</h1>
    <p>
      ${escapeHtml(trip.destination)}
      ${trip.duration ? ` · ${escapeHtml(trip.duration)}` : ""}
      ${trip.travelers ? ` · ${escapeHtml(trip.travelers)}` : ""}
      ${trip.date ? ` · ${escapeHtml(trip.date)}` : ""}
    </p>
    ${trip.author_name ? `<p>Shared by ${escapeHtml(trip.author_name)}</p>` : ""}
    ${tags ? `<p>Tags: ${escapeHtml(tags)}</p>` : ""}
    ${trip.loves ? `<h2>What We Loved</h2><p>${escapeHtml(trip.loves)}</p>` : ""}
    ${trip.do_next ? `<h2>What We'd Do Next Time</h2><p>${escapeHtml(trip.do_next)}</p>` : ""}
    ${daysHtml ? `<h2>Day-by-Day Itinerary</h2>${daysHtml}` : ""}
    <p><a href="${canonicalUrl}">View full itinerary on TripCopycat</a></p>
  </article>
</div>`;
}

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) { res.status(400).send("Missing id"); return; }

  let title       = DEFAULT_TITLE;
  let description = DEFAULT_DESC;
  let ogImage     = DEFAULT_IMAGE;
  let tripData    = null;
  const canonicalUrl = `${SITE_URL}/trip/${id}`;

  // Fetch from Supabase — expanded select to include all SEO-useful fields
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/trips?id=eq.${encodeURIComponent(id)}&status=eq.published` +
      `&select=title,destination,image,duration,region,loves,do_next,author_name,tags,travelers,date,days` +
      `&limit=1`,
      {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        signal: AbortSignal.timeout(4000)
      }
    );
    if (r.ok) {
      const rows = await r.json();
      const trip = rows?.[0];
      if (trip) {
        tripData    = trip;
        title       = `${trip.title} — TripCopycat`;
        description = buildDescription(trip);
        ogImage     = proxyImage(trip.image);
      }
    }
  } catch (_) {}

  // Fetch the real built index.html (has correct Vite asset hashes)
  let html = "";
  try {
    const r = await fetch(`${SITE_URL}/`, { signal: AbortSignal.timeout(4000) });
    html = await r.text();
  } catch (_) {
    res.status(500).send("Failed to load app"); return;
  }

  // Replace OG placeholder tokens
  html = html
    .replace(/__OG_TITLE__/g,       escapeHtml(title))
    .replace(/__OG_DESCRIPTION__/g, escapeHtml(description))
    .replace(/__OG_URL__/g,         canonicalUrl)
    .replace(/__OG_IMAGE__/g,       escapeHtml(ogImage));

  // Inject into <head>: canonical + JSON-LD + initial trip script
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
  const jsonLdTag    = tripData
    ? `<script type="application/ld+json">${buildJsonLd(tripData, canonicalUrl, ogImage)}</script>`
    : "";
  const tripScript   = `<script>window.__INITIAL_TRIP_ID__ = ${JSON.stringify(String(id))};</script>`;

  html = html.replace(
    "</head>",
    `  ${canonicalTag}\n  ${jsonLdTag}\n  ${tripScript}\n</head>`
  );

  // Inject server-rendered content into <body> for Google
  if (tripData) {
    html = html.replace("</body>", `${buildServerContent(tripData, canonicalUrl)}\n</body>`);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=3600");
  res.status(200).send(html);
}
