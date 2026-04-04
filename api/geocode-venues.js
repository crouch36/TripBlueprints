// api/geocode-venues.js
// Called server-side after a trip is approved.
// Geocodes all venues using Google Geocoding API and writes
// venue_coords (jsonb) back to the trips row in Supabase.
// Fire-and-forget from the client — errors never surface to the admin.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service role key — never exposed to client
);

const MAPS_KEY = process.env.VITE_GOOGLE_MAPS_KEY || "";

async function geocodeVenue(name, destination) {
  if (!MAPS_KEY) return null;
  try {
    const query = encodeURIComponent(`${name} ${destination}`);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${MAPS_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "OK" && data.results?.[0]) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
  } catch (_) {}
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { tripId } = req.body || {};
  if (!tripId) return res.status(400).json({ error: "tripId required" });

  // Fetch the trip
  const { data: trip, error } = await supabase
    .from("trips")
    .select("destination, hotels, restaurants, bars, activities")
    .eq("id", tripId)
    .maybeSingle();

  if (error || !trip) return res.status(404).json({ error: "Trip not found" });

  const destination = trip.destination || "";
  const cats = ["hotels", "restaurants", "bars", "activities"];
  const venue_coords = {};

  for (const cat of cats) {
    const venues = trip[cat] || [];
    const resolved = [];
    for (const v of venues) {
      if (!v.item) { resolved.push(null); continue; }
      const coords = await geocodeVenue(v.item, destination);
      resolved.push(coords); // null if not found — map skips silently
    }
    venue_coords[cat] = resolved;
  }

  await supabase
    .from("trips")
    .update({ venue_coords })
    .eq("id", tripId);

  return res.status(200).json({ ok: true, tripId });
}
