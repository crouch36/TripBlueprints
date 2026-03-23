const SUPABASE_URL = "https://wnjxtjeospeblvqdqsdj.supabase.co";
const SITE_URL = "https://tripcopycat.com";

const CRAWLERS = [
  "Twitterbot",
  "facebookexternalhit",
  "WhatsApp",
  "Slackbot",
  "TelegramBot",
  "LinkedInBot",
  "iMessage",
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const config = {
  matcher: "/trips/:id+",
};

export default async function middleware(req) {
  const ua = req.headers.get("user-agent") || "";
  if (!CRAWLERS.some((bot) => ua.includes(bot))) {
    return; // pass through — human users hit the SPA rewrite normally
  }

  const url = new URL(req.url);
  const id = url.pathname.replace(/^\/trips\//, "");

  const key = process.env.SUPABASE_ANON_KEY;
  let title = "TripCopycat";
  let description = "Real itineraries from real travelers.";

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/trips?id=eq.${encodeURIComponent(id)}&status=eq.published&select=title,destination&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );
    const rows = await res.json();
    const trip = rows?.[0];
    if (trip) {
      if (trip.title) title = trip.title;
      const dest = trip.destination ?? "";
      description = dest
        ? `A travel itinerary for ${dest} — real trip, real days, real costs.`
        : "A real travel itinerary shared on TripCopycat.";
    }
  } catch (_) {
    // Serve branded fallback on Supabase error
  }

  const pageTitle =
    title === "TripCopycat" ? title : `${title} | TripCopycat`;
  const ogImage = `${SITE_URL}/api/og?id=${encodeURIComponent(id)}`;
  const ogUrl = `${SITE_URL}/trips/${encodeURIComponent(id)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(pageTitle)}</title>
<meta property="og:type" content="article" />
<meta property="og:site_name" content="TripCopycat" />
<meta property="og:title" content="${escapeHtml(pageTitle)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${ogUrl}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:secure_url" content="${ogImage}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${ogImage}" />
<meta http-equiv="refresh" content="0; url=${ogUrl}" />
</head>
<body></body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
