import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(500).json({ error: "Stripe secret key not configured" });
    return;
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    res.status(400).json({ error: "Failed to parse request body: " + e.message });
    return;
  }

  const { tripId, tripTitle } = body || {};
  if (!tripId) {
    res.status(400).json({ error: "Missing tripId" });
    return;
  }

  const stripe = new Stripe(secret, { apiVersion: "2023-10-16" });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/blueprint/${tripId}?success=true`,
      cancel_url: `${req.headers.origin}/trip/${tripId}?cancelled=true`,
      metadata: {
        tripId: String(tripId),
        tripTitle: tripTitle || "",
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message || "Stripe session creation failed" });
  }
}
