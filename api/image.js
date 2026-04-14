export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    res.status(400).send("Missing url");
    return;
  }

  // Allow proxying from our Supabase bucket and Cloudflare R2 bucket
  const allowedHosts = [
    "wnjxtjeospeblvqdqsdj.supabase.co",
    "pub-f680025b41de449893423994b6e1c42b.r2.dev",
  ];
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    res.status(400).send("Invalid url");
    return;
  }

  if (!allowedHosts.some(h => parsed.hostname.endsWith(h))) {
    res.status(403).send("Forbidden");
    return;
  }

  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!upstream.ok) {
      res.status(502).send("Upstream error");
      return;
    }
    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buffer = await upstream.arrayBuffer();
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(Buffer.from(buffer));
  } catch {
    res.status(504).send("Timeout");
  }
}
