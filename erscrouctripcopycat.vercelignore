import { ImageResponse } from "@vercel/og";

const SUPABASE_URL = "https://wnjxtjeospeblvqdqsdj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Induanh0amVvc3BlYmx2cWRxc2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTI2MjQsImV4cCI6MjA4OTI4ODYyNH0.l3OHQ9_v5__lkX_AryEkmg2uYGgxnTR4KqViV8foNlssb_publishable_8usxe69F1Loh3l3-dYHp4g_dnXxwWY7";
const SITE_URL = "https://tripcopycat.com";

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  // Fetch trip from Supabase REST API (lighter than supabase-js in edge)
  let title = "TripCopycat";
  let destination = "";
  let image = null;
  let author = "";
  let duration = "";
  let region = "";

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/trips?id=eq.${id}&status=eq.published&select=title,destination,image,author_name,duration,region&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const rows = await res.json();
    const trip = rows?.[0];
    if (trip) {
      title       = trip.title       ?? title;
      destination = trip.destination ?? destination;
      image       = trip.image       || null;
      author      = trip.author_name ?? author;
      duration    = trip.duration    ?? duration;
      region      = trip.region      ?? region;
    }
  } catch (_) {
    // Render branded fallback if fetch fails
  }

  // Load Inter Bold for crisp text rendering
  let fontData;
  try {
    fontData = await fetch(
      "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff"
    ).then((r) => r.arrayBuffer());
  } catch (_) {
    // Fall back to no custom font — Satori will use its built-in
  }

  const meta = [region, duration].filter(Boolean).join(" · ");
  const titleFontSize = title.length > 55 ? 46 : title.length > 35 ? 54 : 62;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#2C3E50",
        }}
      >
        {/* Cover photo — full bleed */}
        {image && (
          <img
            src={image}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        )}

        {/* Gradient overlay — strong at bottom, gentle at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            background: image
              ? "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)"
              : "linear-gradient(135deg, #1C2B3A 0%, #2C3E50 100%)",
          }}
        />

        {/* Text content — pinned to bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            padding: "0 56px 48px",
          }}
        >
          {/* Region · Duration */}
          {meta && (
            <div
              style={{
                display: "flex",
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.70)",
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              {meta}
            </div>
          )}

          {/* Trip title */}
          <div
            style={{
              display: "flex",
              fontSize: `${titleFontSize}px`,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.15,
              marginBottom: "12px",
              maxWidth: "920px",
            }}
          >
            {title}
          </div>

          {/* Destination */}
          {destination && (
            <div
              style={{
                display: "flex",
                fontSize: "26px",
                color: "rgba(255,255,255,0.82)",
                fontWeight: 400,
                marginBottom: "28px",
              }}
            >
              {destination}
            </div>
          )}

          {/* Footer row: author left, logo right */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {author && (
                <div
                  style={{
                    display: "flex",
                    fontSize: "19px",
                    color: "#C4A882",
                    fontWeight: 600,
                  }}
                >
                  by {author}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#C4A882",
                  letterSpacing: "0.01em",
                }}
              >
                TripCopycat
              </div>
            </div>

            {/* Logo on white pill so it reads on any background */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.92)",
                borderRadius: "16px",
                padding: "10px 14px",
              }}
            >
              <img
                src={`${SITE_URL}/copycat.png`}
                style={{ width: "64px", height: "64px", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fontData && {
        fonts: [
          { name: "Inter", data: fontData, style: "normal", weight: 400 },
          { name: "Inter", data: fontData, style: "normal", weight: 700 },
        ],
      }),
    }
  );
}
