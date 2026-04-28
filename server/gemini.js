const SYSTEM_PROMPT = `You are LabLens, an expert medical lab result interpreter. Your job is to translate lab results into plain language that a non-medical person can understand.

Analyze the lab result image and respond ONLY with a valid JSON object in this exact format:

{
  "overallStatus": "normal" | "attention" | "concern",
  "overallLabel": "Short status label",
  "summary": "2-3 sentence plain-language overall summary",
  "results": [
    {
      "name": "Test name",
      "value": "Value with unit",
      "referenceRange": "Reference range or null",
      "status": "normal" | "low" | "high" | "critical",
      "explanation": "Plain-language explanation under 40 words"
    }
  ],
  "questionsToAsk": ["Question 1", "Question 2", "Question 3"]
}

Rules:
- Extract every individual test result visible in the image
- Keep explanations simple, no jargon
- If value is flagged H or L, reflect that in status
- If not a lab result, set results to [] and explain in summary
- Return ONLY JSON, no markdown, no backticks
- Keep each explanation under 40 words
- questionsToAsk: maximum 3 items`;

const ALLOWED_MEDIA = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function analyzeWithGemini({ apiKey, imageData, mediaType, context }) {
  if (!apiKey) {
    return { status: 500, body: { error: { message: "GEMINI_API_KEY not configured" } } };
  }
  if (!imageData) {
    return { status: 400, body: { error: { message: "imageData is required" } } };
  }

  const mt = ALLOWED_MEDIA.includes(mediaType) ? mediaType : "image/jpeg";
  const userText = context
    ? `Analyze this lab result. Patient context: ${context}`
    : "Analyze this lab result.";

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{
      role: "user",
      parts: [
        { inline_data: { mime_type: mt, data: imageData } },
        { text: userText },
      ],
    }],
    generationConfig: {
      maxOutputTokens: 4000,
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const upstream = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    const message = data?.error?.message || `Gemini API error ${upstream.status}`;
    return { status: upstream.status, body: { error: { message } } };
  }

  const rawText = (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p?.text || "")
    .join("")
    .trim();

  if (!rawText) {
    const finishReason = data?.candidates?.[0]?.finishReason || "unknown";
    return {
      status: 502,
      body: { error: { message: `Gemini returned no content (finishReason: ${finishReason}). Please try again.` } },
    };
  }

  const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    return { status: 502, body: { error: { message: "Gemini did not return structured data. Please try again." } } };
  }

  let parsed;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    const fixes = ["]}", '"]}', '"]}}', "]}}}", '"]}}}}'];
    let ok = false;
    for (const suffix of fixes) {
      try { parsed = JSON.parse(match[0] + suffix); ok = true; break; } catch {}
    }
    if (!ok) {
      return { status: 502, body: { error: { message: "Response was cut off. Please try again." } } };
    }
  }

  return { status: 200, body: { content: parsed } };
}
