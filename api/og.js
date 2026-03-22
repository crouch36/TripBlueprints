import { ImageResponse } from "@vercel/og";
import React from "react";

export const config = { runtime: "edge" };

export default function handler() {
  return new ImageResponse(
    React.createElement("div", {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2C3E50",
        color: "#C4A882",
        fontSize: "60px",
        fontWeight: "bold",
      }
    }, "TripCopycat"),
    { width: 1200, height: 630 }
  );
}