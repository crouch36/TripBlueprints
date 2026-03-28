const MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb", // photos can be large
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "API key not configured on server" });
    return;
  }

  try {
    // Parse body if it came in as a string
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body || !body.contents) {
      res.status(400).json({ error: "Invalid request body — missing contents" });
      return;
    }

    // Disable thinking to get clean JSON output
    const requestBody = {
      ...body,
      generationConfig: {
        ...(body.generationConfig || {}),
        thinkingConfig: { thinkingBudget: 0 },
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const upstream = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: data?.error?.message || "Gemini API error",
        code: data?.error?.code,
      });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    if (err.name === "AbortError") {
      res.status(504).json({ error: "Request timed out" });
    } else {
      res.status(500).json({ error: err.message || "Internal error" });
    }
  }
}
