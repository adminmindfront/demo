const functions = require("@google-cloud/functions-framework");

const OPENAI_REALTIME_SECRET_URL = "https://api.openai.com/v1/realtime/client_secrets";

function setCors(res, origin = "*") {
  res.set("Access-Control-Allow-Origin", origin || "*");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");
}

functions.http("helloHttp", async (req, res) => {
  const origin = req.get("origin") || "*";
  setCors(res, origin);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (!["GET", "POST"].includes(req.method)) {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    res.status(500).json({
      ok: false,
      error: "Missing OPENAI_API_KEY environment variable",
    });
    return;
  }

  const model =
    req.body?.model ||
    req.query?.model ||
    "gpt-realtime";
  const voice =
    req.body?.voice ||
    req.query?.voice ||
    "marin";

  try {
    const openaiResponse = await fetch(OPENAI_REALTIME_SECRET_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model,
          audio: {
            output: {
              voice,
            },
          },
        },
      }),
    });

    const data = await openaiResponse.json().catch(() => null);

    if (!openaiResponse.ok) {
      res.status(openaiResponse.status).json({
        ok: false,
        error: data?.error?.message || "Failed to create realtime client secret",
        details: data || null,
      });
      return;
    }

    res.status(200).json({
      ok: true,
      client_secret: data?.client_secret || null,
      expires_at: data?.expires_at || null,
      session: data?.session || null,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error?.message || "Unexpected server error",
    });
  }
});
