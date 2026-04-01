const functions = require("@google-cloud/functions-framework");

const OPENAI_REALTIME_SECRET_URL = "https://api.openai.com/v1/realtime/client_secrets";
const OPENAI_REALTIME_CALLS_URL = "https://api.openai.com/v1/realtime/calls";

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function createRealtimeSecret(apiKey, model, voice) {
  let lastError = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const openaiResponse = await fetchWithTimeout(
        OPENAI_REALTIME_SECRET_URL,
        {
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
        },
        10000
      );

      const data = await openaiResponse.json().catch(() => null);

      if (!openaiResponse.ok) {
        return {
          ok: false,
          status: openaiResponse.status,
          data,
        };
      }

      return {
        ok: true,
        status: 200,
        data,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Realtime secret request failed");
}

async function createRealtimeCall(apiKey, offerSdp, model, voice) {
  let lastError = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const sessionConfig = JSON.stringify({
        type: "realtime",
        model,
        audio: {
          output: {
            voice,
          },
        },
      });
      const payload = new FormData();
      payload.set("sdp", offerSdp);
      payload.set("session", sessionConfig);

      const openaiResponse = await fetchWithTimeout(
        OPENAI_REALTIME_CALLS_URL,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: payload,
        },
        15000
      );

      const rawText = await openaiResponse.text();

      if (!openaiResponse.ok) {
        return {
          ok: false,
          status: openaiResponse.status,
          rawText,
        };
      }

      return {
        ok: true,
        status: 200,
        rawText,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Realtime call request failed");
}

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
  const offerSdp = req.body?.offerSdp || "";

  try {
    if (offerSdp) {
      const callResult = await createRealtimeCall(apiKey, offerSdp, model, voice);

      if (!callResult.ok) {
        let detail = callResult.rawText;

        try {
          const parsed = JSON.parse(callResult.rawText);
          detail = parsed?.error?.message || callResult.rawText;
        } catch {}

        res.status(callResult.status).json({
          ok: false,
          error: detail || "Failed to create realtime call",
        });
        return;
      }

      res.status(200).json({
        ok: true,
        sdp: callResult.rawText,
      });
      return;
    }

    const result = await createRealtimeSecret(apiKey, model, voice);

    if (!result.ok) {
      res.status(result.status).json({
        ok: false,
        error: result.data?.error?.message || "Failed to create realtime client secret",
        details: result.data || null,
      });
      return;
    }

    res.status(200).json({
      ok: true,
      client_secret: result.data?.client_secret || null,
      expires_at: result.data?.expires_at || null,
      session: result.data?.session || null,
    });
  } catch (error) {
    const status = error?.name === "AbortError" ? 504 : 500;
    res.status(status).json({
      ok: false,
      error: error?.name === "AbortError"
        ? "OpenAI realtime token request timed out"
        : error?.message || "Unexpected server error",
    });
  }
});
