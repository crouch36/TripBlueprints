import { ImageResponse } from "@vercel/og";
import React from "react";

export const config = { runtime: "edge" };

const SUPABASE_URL = "https://wnjxtjeospeblvqdqsdj.supabase.co";
const SITE_URL = "https://www.tripcopycat.com";

export default async function handler(req) {
  const { searchParams } = new URL(req.url, SITE_URL);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  let title = "TripCopycat";
  let destination = "";
  let image = null;
  let duration = "";
  let region = "";

  try {
    const key = process.env.SUPABASE_ANON_KEY;
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/trips?id=eq.${id}&status=eq.published&select=title,destination,image,duration,region&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (res.ok) {
      const rows = await res.json();
      const trip = rows?.[0];
      if (trip) {
        title       = trip.title       ?? title;
        destination = trip.destination ?? destination;
        image       = trip.image       || null;
        duration    = trip.duration    ?? duration;
        region      = trip.region      ?? region;
      }
    }
  } catch (_) {
    // Fall through to branded fallback
  }

  const meta = [region, duration].filter(Boolean).join("  ·  ");
  const titleFontSize = title.length > 55 ? 46 : title.length > 35 ? 54 : 62;
  const STRIP_H = 100;

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#2C3E50",
        },
      },

      // Cover photo — full bleed
      image
        ? React.createElement("img", {
            src: image,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
              objectPosition: "center",
            },
          })
        : null,

      // Gradient overlay
      React.createElement("div", {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "1200px",
          height: "630px",
          background: image
            ? "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.1) 100%)"
            : "linear-gradient(135deg, #1C2B3A 0%, #2C3E50 100%)",
        },
      }),

      // Trip text — pinned above the strip
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            bottom: STRIP_H + 8,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            padding: "0 56px 28px",
          },
        },

        meta
          ? React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  fontSize: "19px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.65)",
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                },
              },
              meta
            )
          : null,

        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              fontSize: `${titleFontSize}px`,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.15,
              marginBottom: "10px",
              maxWidth: "1060px",
            },
          },
          title
        ),

        destination
          ? React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  fontSize: "26px",
                  color: "rgba(255,255,255,0.80)",
                  fontWeight: 400,
                },
              },
              destination
            )
          : null
      ),

      // Bottom branding strip
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "1200px",
            height: `${STRIP_H}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(20,30,38,0.96)",
            padding: "0 48px",
          },
        },

        // Left: wordmark
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            },
          },
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                fontSize: "30px",
                fontWeight: 700,
                color: "#C4A882",
                letterSpacing: "0.02em",
              },
            },
            "TripCopycat"
          ),
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                fontSize: "15px",
                color: "rgba(196,168,130,0.6)",
                letterSpacing: "0.04em",
              },
            },
            "tripcopycat.com"
          )
        ),

        // Right: tagline
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              fontSize: "17px",
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.03em",
            },
          },
          "Real itineraries from real travelers"
        )
      )
    ),
    { width: 1200, height: 630 }
  );
}
