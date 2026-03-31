import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    res.status(500).json({ error: "Stripe secret key not configured" });
    return;
  }

  const stripe = new Stripe(secret, { apiVersion: "2023-10-16" });

  let event;
  try {
    const rawBody = await getRawBody(req);
    if (webhookSecret) {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // Dev mode — no signature verification
      event = JSON.parse(rawBody.toString());
    }
  } catch (err) {
    res.status(400).json({ error: "Webhook verification failed: " + err.message });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { tripId } = session.metadata || {};

    if (tripId) {
      // Store blueprint purchase in Supabase via REST
      // Using fetch directly to avoid SDK dependency in edge function
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseKey) {
        try {
          await fetch(`${supabaseUrl}/rest/v1/blueprint_purchases`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              trip_id: tripId,
              stripe_session_id: session.id,
              customer_email: session.customer_details?.email || null,
              amount_paid: session.amount_total,
              paid_at: new Date().toISOString(),
            }),
          });
        } catch (err) {
          console.error("Supabase insert failed:", err.message);
        }
      }
    }
  }

  res.status(200).json({ received: true });
}
