// api/sample-blueprint.js
// Serves the Sample Blueprint page with VITE_GOOGLE_MAPS_KEY injected server-side.
// The key never appears in the GitHub repo — it lives only in Vercel Environment Variables.

export default function handler(req, res) {
  const mapsKey = process.env.VITE_GOOGLE_MAPS_KEY || "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Amalfi Coast Itinerary: Positano &amp; Beyond — Sample Blueprint | TripCopycat</title>
  <meta name="description" content="A free sample Trip Blueprint from TripCopycat — AI alternatives, day-by-day itinerary, venue pins, and PDF export for a couples' Amalfi Coast trip." />
  <meta property="og:title" content="Amalfi Coast Sample Blueprint | TripCopycat" />
  <meta property="og:description" content="See what a Trip Blueprint looks like — real itinerary, AI alternatives, and Google Maps pins for $1.99." />
  <meta name="robots" content="noindex" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #FAF7F2; color: #1C2B3A; -webkit-font-smoothing: antialiased; }
    button { font-family: 'DM Sans', sans-serif; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    button:active { transform: scale(0.97); opacity: 0.85; }

    #banner { background: linear-gradient(135deg,#1D6A3A,#2D9A57); padding:10px 24px; text-align:center; color:#fff; font-size:13px; font-weight:600; }
    #banner a { color:#fff; text-decoration:underline; }

    #header { background:#1C2B3A; padding:32px 40px; position:relative; overflow:hidden; }
    #header::before { content:''; position:absolute; inset:0; background-image:radial-gradient(rgba(196,168,130,0.08) 1px,transparent 1px); background-size:20px 20px; }
    #header-inner { position:relative; max-width:800px; margin:0 auto; }
    #back-btn { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:rgba(255,255,255,0.7); border-radius:8px; padding:6px 14px; font-size:12px; margin-bottom:20px; display:inline-block; }
    #back-btn:hover { background:rgba(255,255,255,0.14); }
    .eyebrow { font-size:11px; font-weight:700; color:#C1692A; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:10px; }
    #trip-title { font-family:'Playfair Display',Georgia,serif; font-size:clamp(26px,5vw,34px); font-weight:900; color:#fff; margin-bottom:8px; line-height:1.1; }
    #trip-dest { font-size:15px; color:rgba(255,255,255,0.8); margin-bottom:6px; }
    #trip-meta { font-size:13px; color:#C1692A; margin-bottom:24px; }
    #header-btns { display:flex; gap:10px; flex-wrap:wrap; }
    .hbtn-primary { padding:10px 20px; border-radius:8px; border:none; background:#C4A882; color:#1C2B3A; font-size:12px; font-weight:700; }
    .hbtn-primary:hover { filter:brightness(1.06); }
    .hbtn-outline-gold { padding:10px 20px; border-radius:8px; border:1px solid rgba(196,168,130,0.5); background:transparent; color:#C4A882; font-size:12px; font-weight:700; }
    .hbtn-outline-gold:hover { background:rgba(196,168,130,0.1); }
    .hbtn-outline-white { padding:10px 20px; border-radius:8px; border:1px solid rgba(255,255,255,0.2); background:transparent; color:rgba(255,255,255,0.8); font-size:12px; font-weight:700; }
    .hbtn-outline-white:hover { background:rgba(255,255,255,0.07); }

    #body { max-width:800px; margin:0 auto; padding:32px 24px; }
    .card { background:#fff; border-radius:16px; padding:24px 28px; margin-bottom:20px; border:1px solid #E8DDD0; }
    .card-label { font-size:11px; font-weight:700; color:#C1692A; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px; }
    .card-label-wide { margin-bottom:14px; }
    .card-label-xl { margin-bottom:20px; }
    .card p { font-size:15px; color:#1C2B3A; line-height:1.75; }

    .day-block { margin-bottom:24px; }
    .day-heading { font-size:14px; font-weight:800; color:#1C2B3A; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid #E8DDD0; }
    .day-timeline { position:relative; padding-left:20px; }
    .day-timeline::before { content:''; position:absolute; left:6px; top:0; bottom:0; width:2px; background:#E8DDD0; }
    .day-item { position:relative; margin-bottom:12px; }
    .day-dot { position:absolute; left:-17px; top:4px; width:10px; height:10px; border-radius:50%; background:#C1692A; border:2px solid #fff; }
    .day-time { font-size:10px; font-weight:700; color:#A89080; margin-bottom:2px; }
    .day-label { font-size:13px; font-weight:600; color:#1C2B3A; }
    .day-note { font-size:12px; color:#6B4F3A; margin-top:2px; }

    .venue-row { padding:10px 0; border-bottom:1px solid #FAF7F2; }
    .venue-row:last-child { border-bottom:none; }
    .venue-name { font-size:13px; font-weight:700; color:#1C2B3A; }
    .venue-detail { font-size:12px; color:#6B4F3A; margin-top:2px; }
    .venue-tip { font-size:12px; color:#C1692A; margin-top:4px; }

    .alt-cat-heading { font-size:12px; font-weight:700; color:#1C2B3A; margin-bottom:6px; }
    .alt-block { margin-bottom:14px; }
    .alt-pill { padding:8px 12px; background:#FAF7F2; border-radius:8px; margin-bottom:6px; }
    .alt-name { font-size:13px; font-weight:600; color:#1C2B3A; }
    .alt-reason { font-size:12px; color:#6B4F3A; margin-top:2px; }

    #gmap { width:100%; height:380px; border-radius:10px; border:1px solid #E8DDD0; }
    #map-loading { width:100%; height:380px; border-radius:10px; background:#FAF7F2; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; color:#A89080; font-size:13px; border:1px solid #E8DDD0; }
    .map-spinner { width:24px; height:24px; border:3px solid #E8DDD0; border-top-color:#C1692A; border-radius:50%; animation:spin .8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .map-legend { margin-top:10px; font-size:11px; color:#A89080; display:flex; gap:12px; flex-wrap:wrap; }
    .legend-item { display:flex; align-items:center; gap:4px; }
    .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .kml-btn { margin-top:14px; padding:8px 16px; border-radius:8px; border:1px solid #E8DDD0; background:#FAF7F2; color:#1C2B3A; font-size:12px; font-weight:600; }
    .kml-btn:hover { border-color:#C4A882; }

    /* Google Maps info window */
    .gm-iw-name { font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; color:#1C2B3A; margin-bottom:3px; }
    .gm-iw-cat  { font-family:'DM Sans',sans-serif; font-size:11px; color:#A89080; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px; }
    .gm-iw-link { font-family:'DM Sans',sans-serif; font-size:12px; color:#4285F4; text-decoration:none; font-weight:600; }
    .gm-iw-link:hover { text-decoration:underline; }

    #cta { background:#1C2B3A; background-image:radial-gradient(rgba(196,168,130,0.1) 1px,transparent 1px); background-size:10px 10px; border-radius:16px; padding:28px; text-align:center; margin-bottom:20px; }
    #cta h2 { font-size:20px; font-weight:900; color:#fff; font-family:'Playfair Display',Georgia,serif; margin-bottom:8px; }
    #cta p { font-size:13px; color:rgba(196,168,130,0.85); margin-bottom:20px; line-height:1.6; }
    #cta-btn { background:#FAF7F2; color:#1C2B3A; border:2px solid #C4A882; border-radius:8px; padding:12px 28px; font-size:13px; font-weight:700; display:inline-flex; align-items:center; gap:8px; }
    #cta-btn:hover { filter:brightness(0.96); }

    #footer { text-align:center; padding:20px 0; }
    #footer p { font-size:12px; color:#A89080; margin-bottom:4px; }
    #footer small { font-size:11px; color:#A89080; }

    @media print {
      button, #banner, #gmap, #map-loading { display:none !important; }
      body { background:white !important; }
      .card { break-inside:avoid; }
    }
    @media (max-width:600px) {
      #header { padding:24px 20px; }
      #body { padding:20px 16px; }
      .card { padding:18px 16px; }
      #gmap, #map-loading { height:280px; }
    }
  </style>
</head>
<body>

<div id="banner">
  ✦ Free sample Blueprint — <a href="/">browse all trips on TripCopycat</a> and get your own for $1.99
</div>

<div id="header">
  <div id="header-inner">
    <button id="back-btn" onclick="window.location.href='/'">← Back to TripCopycat</button>
    <div class="eyebrow">Europe · 6 nights (Oct 15–21) · October 2025</div>
    <h1 id="trip-title">Amalfi Coast Itinerary: Positano &amp; Beyond</h1>
    <div id="trip-dest">Positano, Amalfi Coast, Italy</div>
    <div id="trip-meta">by Andrew C. · Couple</div>
    <div id="header-btns">
      <button class="hbtn-primary" onclick="window.print()">⬇ Download PDF</button>
      <button class="hbtn-outline-gold" id="kml-btn-header" onclick="generateKML()">🗺 Open in Google Maps</button>
      <button class="hbtn-outline-white" onclick="copyLink()">🔗 Share Sample</button>
    </div>
  </div>
</div>

<div id="body">

  <div class="card">
    <div class="card-label">❤️ What the traveler loved</div>
    <p>Positano lived up to its post-card reputation. The cooking class at Amalfi Heaven Gardens was amazing — even my wife who was initially skeptical called it her highlight. Posides café was a gem where we lingered and connected with the owner and staff over excellent fresh food and housemade pasta. Dinner at Il Tridente delivered incredible atmosphere — a candlelit balcony overlooking the twinkling lights of Positano at night. The Amalfi Coast ferry system made day-tripping to Amalfi and Capri effortless and scenic.</p>
  </div>

  <div class="card">
    <div class="card-label">🔄 What they'd do differently</div>
    <p>We would likely skip Naples next time — it was overcrowded with cruise tourists and the food didn't justify the detour. Use it only as a logistical overnight if your flight requires it.</p>
  </div>

  <div class="card">
    <div class="card-label card-label-xl">📅 Day-by-Day Itinerary</div>
    <div class="day-block">
      <div class="day-heading">Day 1 — Arrival in Positano · Oct 15</div>
      <div class="day-timeline">
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Afternoon</div><div class="day-label">Hotel Miramare</div><div class="day-note">Check in and settle</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Morning</div><div class="day-label">Posides Café</div><div class="day-note">Fresh food, friendly staff</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Evening</div><div class="day-label">Don't Worry Bar</div><div class="day-note">Speakeasy jazz vibes</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Dinner</div><div class="day-label">Saraceno D'Oro</div><div class="day-note">Best pizza of the trip</div></div>
      </div>
    </div>
    <div class="day-block">
      <div class="day-heading">Day 2 — Exploring Positano · Oct 16</div>
      <div class="day-timeline">
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Morning</div><div class="day-label">Breakfast at hotel</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Midday</div><div class="day-label">Hotel Palazzo Murat patio</div><div class="day-note">Stunning setting</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Lunch</div><div class="day-label">Posides Café</div><div class="day-note">Housemade pasta</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Afternoon</div><div class="day-label">Il Capitano</div><div class="day-note">Coastal views</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Dinner</div><div class="day-label">Il Tridente</div><div class="day-note">Unforgettable balcony</div></div>
      </div>
    </div>
    <div class="day-block">
      <div class="day-heading">Day 3 — Day Trip to Amalfi · Oct 17</div>
      <div class="day-timeline">
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Morning</div><div class="day-label">Ferry to Amalfi</div><div class="day-note">Scenic coastal ride</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Midday</div><div class="day-label">Cathedral of Sant'Andrea</div><div class="day-note">Go early</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Evening</div><div class="day-label">Amalfi Gardens Cooking Class</div><div class="day-note">Made gnocchi — trip highlight</div></div>
      </div>
    </div>
    <div class="day-block">
      <div class="day-heading">Day 4 — Day Trip to Capri · Oct 18</div>
      <div class="day-timeline">
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Morning</div><div class="day-label">Ferry to Capri</div><div class="day-note">Buy tickets night before</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Lunch</div><div class="day-label">Villa Verde</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Dinner</div><div class="day-label">Casa Mele</div><div class="day-note">Try the Taurasi</div></div>
      </div>
    </div>
    <div class="day-block">
      <div class="day-heading">Day 5 — Travel to Naples · Oct 19</div>
      <div class="day-timeline">
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Midday</div><div class="day-label">Ferry to Naples</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Evening</div><div class="day-label">Al Ruotolo</div><div class="day-note">Second best pizza</div></div>
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Dinner</div><div class="day-label">Bechamel di Giorgio Di Fusco</div><div class="day-note">Great value trattoria</div></div>
      </div>
    </div>
    <div class="day-block" style="margin-bottom:0">
      <div class="day-heading">Day 6 — Departure · Oct 20</div>
      <div class="day-timeline">
        <div class="day-item"><div class="day-dot"></div><div class="day-time">Morning</div><div class="day-label">Departed Naples via Dublin</div></div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-label card-label-wide">🏨 Hotels</div>
    <div class="venue-row"><div class="venue-name">Hotel Miramare</div><div class="venue-detail">Positano</div><div class="venue-tip">💡 Book well in advance — fills up fast</div></div>
    <div class="venue-row"><div class="venue-name">Hotel Santa Lucia</div><div class="venue-detail">Naples</div><div class="venue-tip">💡 Good location for early flights</div></div>
  </div>

  <div class="card">
    <div class="card-label card-label-wide">🍽 Restaurants</div>
    <div class="venue-row"><div class="venue-name">Posides Café</div><div class="venue-detail">Positano — fresh food, housemade pasta</div><div class="venue-tip">💡 Linger and connect with the owners</div></div>
    <div class="venue-row"><div class="venue-name">Il Tridente</div><div class="venue-detail">Positano — candlelit balcony</div><div class="venue-tip">💡 Reserve the balcony table</div></div>
    <div class="venue-row"><div class="venue-name">Saraceno D'Oro</div><div class="venue-detail">Positano — streetside pizza patio</div><div class="venue-tip">💡 Best pizza of the trip</div></div>
    <div class="venue-row"><div class="venue-name">Villa Verde</div><div class="venue-detail">Capri</div><div class="venue-tip">💡 Great lunch spot</div></div>
    <div class="venue-row"><div class="venue-name">Casa Mele</div><div class="venue-detail">Capri — modern Italian</div><div class="venue-tip">💡 Try the Taurasi wine</div></div>
    <div class="venue-row"><div class="venue-name">Al Ruotolo</div><div class="venue-detail">Naples</div><div class="venue-tip">💡 Very affordable</div></div>
  </div>

  <div class="card">
    <div class="card-label card-label-wide">🍸 Bars</div>
    <div class="venue-row"><div class="venue-name">Don't Worry Bar</div><div class="venue-detail">Positano — speakeasy jazz vibes</div><div class="venue-tip">💡 Go after dinner</div></div>
    <div class="venue-row"><div class="venue-name">Hotel Palazzo Murat</div><div class="venue-detail">Positano patio drinks</div><div class="venue-tip">💡 Stunning setting</div></div>
    <div class="venue-row"><div class="venue-name">Il Capitano</div><div class="venue-detail">Positano — coastal views</div><div class="venue-tip">💡 Perfect for sunset</div></div>
  </div>

  <div class="card">
    <div class="card-label card-label-wide">🎯 Activities</div>
    <div class="venue-row"><div class="venue-name">Amalfi Heaven Gardens Cooking Class</div><div class="venue-detail">Made gnocchi with excellent hosts</div><div class="venue-tip">💡 Book ahead — trip highlight</div></div>
    <div class="venue-row"><div class="venue-name">Cathedral of Sant'Andrea</div><div class="venue-detail">Amalfi</div><div class="venue-tip">💡 Go early to avoid crowds</div></div>
    <div class="venue-row"><div class="venue-name">Ferry to Capri</div><div class="venue-detail">Scenic day trip</div><div class="venue-tip">💡 Buy tickets the night before</div></div>
    <div class="venue-row"><div class="venue-name">Ferry to Amalfi</div><div class="venue-detail">Easy day trip from Positano</div><div class="venue-tip">💡 Check schedule in advance</div></div>
  </div>

  <div class="card">
    <div class="card-label card-label-wide">✨ AI-Suggested Alternatives</div>
    <div class="alt-block">
      <div class="alt-cat-heading">🏨 Alternative Hotels</div>
      <div class="alt-pill"><div class="alt-name">Le Sirenuse</div><div class="alt-reason">Iconic Positano luxury — views are unmatched if budget allows</div></div>
      <div class="alt-pill"><div class="alt-name">Casa Mariantonia</div><div class="alt-reason">Charming Capri boutique, perfect island base</div></div>
    </div>
    <div class="alt-block">
      <div class="alt-cat-heading">🍽 Alternative Restaurants</div>
      <div class="alt-pill"><div class="alt-name">La Sponda at Le Sirenuse</div><div class="alt-reason">Candlelit terrace — most romantic restaurant on the coast</div></div>
      <div class="alt-pill"><div class="alt-name">Da Adolfo</div><div class="alt-reason">Legendary beach restaurant only accessible by boat</div></div>
    </div>
    <div class="alt-block">
      <div class="alt-cat-heading">🍸 Alternative Bars</div>
      <div class="alt-pill"><div class="alt-name">Music on the Rocks</div><div class="alt-reason">Built into a cliff cave — legendary Positano nightspot</div></div>
      <div class="alt-pill"><div class="alt-name">Bar Calypso</div><div class="alt-reason">Beachside bar with great aperitivo hour</div></div>
    </div>
    <div class="alt-block" style="margin-bottom:0">
      <div class="alt-cat-heading">🎯 Alternative Activities</div>
      <div class="alt-pill"><div class="alt-name">Path of the Gods hike</div><div class="alt-reason">Stunning clifftop trail with panoramic coast views</div></div>
      <div class="alt-pill"><div class="alt-name">Private boat tour</div><div class="alt-reason">Charter a small boat to reach hidden coves and grottos</div></div>
    </div>
  </div>

  <div class="card">
    <div class="card-label card-label-wide">🗺 Venue Map</div>
    <div id="map-loading"><div class="map-spinner"></div><span>Locating venues…</span></div>
    <div id="gmap" style="display:none"></div>
    <div class="map-legend">
      <span class="legend-item"><span class="legend-dot" style="background:#C1392B"></span>Hotels</span>
      <span class="legend-item"><span class="legend-dot" style="background:#2980B9"></span>Restaurants</span>
      <span class="legend-item"><span class="legend-dot" style="background:#8E44AD"></span>Bars</span>
      <span class="legend-item"><span class="legend-dot" style="background:#27AE60"></span>Activities</span>
    </div>
    <div><button class="kml-btn" id="kml-btn-body" onclick="generateKML()">⬇ Download KML — Open All Pins in Google Maps</button></div>
  </div>

  <div id="cta">
    <h2>Love what you see?</h2>
    <p>Get a full Blueprint like this for any trip on TripCopycat — AI alternatives, PDF export, Google Maps pins, and a shareable link.</p>
    <button id="cta-btn" onclick="window.location.href='/'">
      <span style="display:inline-block;transform:rotate(-45deg);color:#C4A882">▲</span>
      Browse Trips &amp; Get Your Blueprint — $1.99
    </button>
  </div>

  <div id="footer">
    <p>Generated by TripCopycat · tripcopycat.com</p>
    <small>Views and recommendations are those of the traveler and not of TripCopycat.</small>
  </div>
</div>

<script>
  const MAPSKEY = "${mapsKey}";

  const TRIP = {
    title: "Amalfi Coast Itinerary: Positano & Beyond",
    destination: "Positano, Amalfi Coast, Italy",
    // lat/lng verified from street addresses — never use Photon for sample page
    hotels:      [
      { item:"Hotel Miramare",                      detail:"Positano",    lat:40.6275718, lng:14.4855026 },
      { item:"Hotel Santa Lucia",                   detail:"Naples",      lat:40.8300198, lng:14.2491288 },
    ],
    restaurants: [
      { item:"Posides Café",                        detail:"Positano",    lat:40.6284107, lng:14.4811414 },
      { item:"Il Tridente",                         detail:"Positano",    lat:40.6288985, lng:14.4849206 },
      { item:"Saraceno D'Oro",                      detail:"Positano",    lat:40.6285642, lng:14.4809475 },
      { item:"Villa Verde",                         detail:"Capri",       lat:40.5500444, lng:14.2444639 },
      { item:"Casa Mele",                           detail:"Capri",       lat:40.5532009, lng:14.2221540 },
      { item:"Al Ruotolo",                          detail:"Naples",      lat:40.8519413, lng:14.2465921 },
    ],
    bars:        [
      { item:"Don't Worry Bar",                     detail:"Positano",    lat:40.6288599, lng:14.4875752 },
      { item:"Hotel Palazzo Murat",                 detail:"Positano",    lat:40.6289226, lng:14.4867725 },
      { item:"Il Capitano",                         detail:"Positano",    lat:40.6274490, lng:14.4845390 },
    ],
    activities:  [
      { item:"Amalfi Heaven Gardens Cooking Class", detail:"Amalfi",      lat:40.6255051, lng:14.5859367 },
      { item:"Cathedral of Sant'Andrea",            detail:"Amalfi",      lat:40.6344504, lng:14.6029926 },
      { item:"Ferry to Capri",                      detail:"Positano",    lat:40.6272221, lng:14.4862402 },
      { item:"Ferry to Amalfi",                     detail:"Positano",    lat:40.6272221, lng:14.4862402 },
    ],
  };

  const CAT_CONFIG = {
    hotels:      { label:"Hotel",      color:"#C1392B" },
    restaurants: { label:"Restaurant", color:"#2980B9" },
    bars:        { label:"Bar",        color:"#8E44AD" },
    activities:  { label:"Activity",   color:"#27AE60" },
  };

  // Geocode via Photon (OSM-based, free, no key)
  async function geocode(name, detail) {
    try {
      const q = encodeURIComponent(name + " " + (detail || "Amalfi Coast Italy"));
      const res = await fetch("https://photon.komoot.io/api/?q=" + q + "&limit=1");
      const data = await res.json();
      const c = data?.features?.[0]?.geometry?.coordinates;
      if (c) return { lat: c[1], lng: c[0] };
    } catch (_) {}
    return null;
  }

  // SVG pin icon coloured per category
  function makeSvgIcon(color) {
    const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="\${color}"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>\`;
    return {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(28, 36),
      anchor: new google.maps.Point(14, 36),
    };
  }

  // Build Google Map with coloured pins — coords are hardcoded, no geocoding needed
  async function initMap() {
    if (!MAPSKEY) {
      document.getElementById("map-loading").querySelector(".map-spinner").style.display = "none";
      document.getElementById("map-loading").querySelector("span").textContent = "Map unavailable — API key not configured";
      return;
    }

    const pins = [];
    for (const [cat, cfg] of Object.entries(CAT_CONFIG)) {
      for (const v of (TRIP[cat] || [])) {
        if (v.lat && v.lng) pins.push({ lat: v.lat, lng: v.lng, name: v.item, detail: v.detail || "", label: cfg.label, color: cfg.color });
      }
    }

    document.getElementById("map-loading").style.display = "none";
    const mapEl = document.getElementById("gmap");
    mapEl.style.display = "block";

    if (pins.length === 0) {
      mapEl.style.display = "none";
      document.getElementById("map-loading").style.display = "flex";
      document.getElementById("map-loading").querySelector(".map-spinner").style.display = "none";
      document.getElementById("map-loading").querySelector("span").textContent = "Map unavailable";
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    const map = new google.maps.Map(mapEl, {
      zoom: 12,
      center: { lat: pins[0].lat, lng: pins[0].lng },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    const infoWindow = new google.maps.InfoWindow();

    for (const pin of pins) {
      const position = { lat: pin.lat, lng: pin.lng };
      const marker = new google.maps.Marker({
        position,
        map,
        icon: makeSvgIcon(pin.color),
        title: pin.name,
      });

      const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(pin.name + " " + pin.detail);
      marker.addListener("click", () => {
        infoWindow.setContent(
          \`<div style="font-family:'DM Sans',sans-serif;padding:2px 4px">
            <div class="gm-iw-name">\${pin.name}</div>
            <div class="gm-iw-cat">\${pin.label}</div>
            <a class="gm-iw-link" href="\${mapsUrl}" target="_blank" rel="noopener">Open in Google Maps ↗</a>
          </div>\`
        );
        infoWindow.open(map, marker);
      });

      bounds.extend(position);
    }

    map.fitBounds(bounds);
    // Don't zoom in too far for a single point
    google.maps.event.addListenerOnce(map, "idle", () => {
      if (map.getZoom() > 15) map.setZoom(15);
    });
  }

  // KML Download
  function xmlEsc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function generateKML() {
    const btns = document.querySelectorAll("#kml-btn-header, #kml-btn-body");
    btns.forEach(b => { b.disabled = true; b.textContent = "Downloading…"; });

    const cats = [
      { key:"hotels",      color:"ff0000ff", label:"Hotels" },
      { key:"restaurants", color:"ff4400ff", label:"Restaurants" },
      { key:"bars",        color:"ff00ffff", label:"Bars" },
      { key:"activities",  color:"ff00aa00", label:"Activities" },
    ];

    const parts = [];
    for (const cat of cats) {
      for (const p of (TRIP[cat.key] || [])) {
        const pt = (p.lat && p.lng)
          ? "<Point><coordinates>" + p.lng + "," + p.lat + ",0</coordinates></Point>"
          : "";
        parts.push(
          "<Placemark><name>" + xmlEsc(p.item) + "</name>" +
          "<description>" + xmlEsc(cat.label + (p.detail ? " - " + p.detail : "")) + "</description>" +
          "<Style><IconStyle><color>" + cat.color + "</color></IconStyle></Style>" +
          pt + "</Placemark>"
        );
      }
    }

    const kml = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>' + xmlEsc(TRIP.title) + '</name>' + parts.join("") + '</Document></kml>';
    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "amalfi-coast-sample-blueprint.kml";
    a.click();

    btns.forEach(b => {
      b.disabled = false;
      b.id === "kml-btn-header" ? (b.textContent = "🗺 Open in Google Maps") : (b.textContent = "⬇ Download KML — Open All Pins in Google Maps");
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert("Link copied!"))
      .catch(() => prompt("Copy this link:", window.location.href));
  }

  // Load Google Maps JS API then run initMap
  (function loadGoogleMaps() {
    if (!MAPSKEY) { initMap(); return; }
    window._initMap = initMap;
    const s = document.createElement("script");
    s.src = "https://maps.googleapis.com/maps/api/js?key=" + MAPSKEY + "&callback=_initMap";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  })();
</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).send(html);
}
