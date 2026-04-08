// api/notify-submission.js
// Called by Supabase webhook on INSERT to submissions table.
// Sends an email to andrew@tripcopycat.com with trip details.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
  if (!RESEND_API_KEY) return res.status(500).json({ error: "RESEND_API_KEY not set" });

  // Supabase webhook sends the full row in req.body.record
  const record = req.body?.record || req.body || {};
  const trip = record.trip_data || {};
  const submitter = record.submitter_name || "Unknown";
  const email = record.submitter_email || "";
  const status = record.status || "pending";
  const title = trip.title || "Untitled Trip";
  const destination = trip.destination || "";
  const duration = trip.duration || "";
  const travelers = trip.travelers || "";
  const submittedAt = record.submitted_at
    ? new Date(record.submitted_at).toLocaleString("en-US", { timeZone: "America/New_York" })
    : new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

  const flagged = status === "flagged";
  const statusBadge = flagged
    ? `<span style="background:#fdecea;color:#b03a2e;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;">⚠️ FLAGGED</span>`
    : `<span style="background:#eef5e8;color:#3b6d11;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;">✓ PENDING REVIEW</span>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'DM Sans',Arial,sans-serif;background:#FAF7F2;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E8DDD0;">

    <!-- Header -->
    <div style="background:#1C2B3A;padding:24px 28px;">
      <div style="font-size:11px;font-weight:700;color:#C1692A;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px;">TripCopycat</div>
      <div style="font-size:22px;font-weight:700;color:#fff;font-family:Georgia,serif;">New Trip Submission</div>
      <div style="margin-top:8px;">${statusBadge}</div>
    </div>

    <!-- Body -->
    <div style="padding:24px 28px;">

      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr>
          <td style="color:#A89080;padding:7px 0;width:120px;vertical-align:top;">Trip</td>
          <td style="color:#1C2B3A;font-weight:700;padding:7px 0;">${title}</td>
        </tr>
        <tr style="border-top:1px solid #FAF7F2;">
          <td style="color:#A89080;padding:7px 0;vertical-align:top;">Destination</td>
          <td style="color:#1C2B3A;padding:7px 0;">${destination}</td>
        </tr>
        ${duration ? `<tr style="border-top:1px solid #FAF7F2;">
          <td style="color:#A89080;padding:7px 0;vertical-align:top;">Duration</td>
          <td style="color:#1C2B3A;padding:7px 0;">${duration}</td>
        </tr>` : ""}
        ${travelers ? `<tr style="border-top:1px solid #FAF7F2;">
          <td style="color:#A89080;padding:7px 0;vertical-align:top;">Travelers</td>
          <td style="color:#1C2B3A;padding:7px 0;">${travelers}</td>
        </tr>` : ""}
        <tr style="border-top:1px solid #FAF7F2;">
          <td style="color:#A89080;padding:7px 0;vertical-align:top;">Submitted by</td>
          <td style="color:#1C2B3A;padding:7px 0;">${submitter}${email ? ` &lt;${email}&gt;` : ""}</td>
        </tr>
        <tr style="border-top:1px solid #FAF7F2;">
          <td style="color:#A89080;padding:7px 0;vertical-align:top;">Submitted at</td>
          <td style="color:#1C2B3A;padding:7px 0;">${submittedAt} ET</td>
        </tr>
        ${flagged && record.ai_flag_reason ? `<tr style="border-top:1px solid #FAF7F2;">
          <td style="color:#A89080;padding:7px 0;vertical-align:top;">Flag reason</td>
          <td style="color:#b03a2e;padding:7px 0;font-weight:600;">${record.ai_flag_reason}</td>
        </tr>` : ""}
      </table>

      <!-- CTA -->
      <div style="margin-top:20px;text-align:center;">
        <a href="https://www.tripcopycat.com" style="display:inline-block;background:#1C2B3A;color:#fff;text-decoration:none;padding:11px 28px;border-radius:8px;font-size:13px;font-weight:700;">
          Review in Admin Queue →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:14px 28px;border-top:1px solid #E8DDD0;text-align:center;">
      <div style="font-size:11px;color:#A89080;">TripCopycat · tripcopycat.com · Bishop Creek Ventures LLC</div>
    </div>

  </div>
</body>
</html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TripCopycat <notifications@tripcopycat.com>",
        to: "andrew@tripcopycat.com",
        subject: `${flagged ? "⚠️ Flagged" : "✈️ New"} Trip Submission: ${title}`,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Resend error");
    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error("notify-submission error:", err);
    return res.status(500).json({ error: err.message });
  }
}
