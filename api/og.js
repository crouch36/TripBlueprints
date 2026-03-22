import React from "react";
import { ImageResponse } from "@vercel/og";

const SUPABASE_URL = "https://wnjxtjeospeblvqdqsdj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_8usxe69F1Loh3l3-dYHp4g_dnXxwWY7";
const SITE_URL = "https://tripcopycat.com";

export default async function handler(req) {
const { searchParams } = new URL(req.url, 'https://tripcopycat.com');
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
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/trips?id=eq.${id}&status=eq.published&select=title,destination,image,duration,region&limit=1`,
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
      duration    = trip.duration    ?? duration;
      region      = trip.region      ?? region;
    }
  } catch (_) {
    // Render branded fallback if fetch fails
  }

  // Load Inter Bold for crisp text rendering
  
  const meta = [region, duration].filter(Boolean).join(" · ");
  const titleFontSize = title.length > 55 ? 46 : title.length > 35 ? 54 : 62;
  const STRIP_H = 110;

  const element = React.createElement(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
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

    // Gradient overlay — strong at bottom where text lives
    React.createElement("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "1200px",
        height: "630px",
        background: image
          ? "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.60) 35%, rgba(0,0,0,0.15) 100%)"
          : "linear-gradient(135deg, #1C2B3A 0%, #2C3E50 100%)",
      },
    }),

    // Text content — pinned just above the bottom strip
    React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          bottom: STRIP_H,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          padding: "0 56px 32px",
        },
      },

      // Region · Duration
      meta
        ? React.createElement(
            "div",
            {
              style: {
                display: "flex",
                fontSize: "20px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.70)",
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                marginBottom: "14px",
              },
            },
            meta
          )
        : null,

      // Trip title
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
            maxWidth: "1000px",
          },
        },
        title
      ),

      // Destination
      destination
        ? React.createElement(
            "div",
            {
              style: {
                display: "flex",
                fontSize: "26px",
                color: "rgba(255,255,255,0.82)",
                fontWeight: 400,
              },
            },
            destination
          )
        : null
    ),

    // Bottom branding strip — TripCopycat_OG.webp full-width banner
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
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.75)",
          overflow: "hidden",
        },
      },
      React.createElement("img", {
        src: `${SITE_URL}/TripCopycat_OG.webp`,
        style: {
          width: "1200px",
          height: `${STRIP_H}px`,
          objectFit: "cover",
          objectPosition: "center",
        },
      })
    )
  );

return new ImageResponse(element, {
    width: 1200,
    height: 630,
  });
}
