const LANGUAGE_LABELS = {
  en: "English",
  fil: "Filipino (Tagalog)",
};

function buildSystemPrompt(language) {
  const langName = LANGUAGE_LABELS[language] || "English";
  return `You are LabLens, an expert medical lab result interpreter. Your job is to translate lab results into plain language that a non-medical person can understand.

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
      "explanation": "Plain-language explanation under 40 words",
      "possibleCauses": ["Short reason 1", "Short reason 2", "Short reason 3"],
      "possibleRemedies": ["Short remedy 1", "Short remedy 2", "Short remedy 3"]
    }
  ],
  "questionsToAsk": ["Question 1", "Question 2", "Question 3"],
  "followUpQuestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
}

Rules:
- Write ALL human-readable text fields (overallLabel, summary, name, value, referenceRange, explanation, possibleCauses, possibleRemedies, questionsToAsk, followUpQuestions) in ${langName}.
- Keep the JSON keys and the enum values for "overallStatus" and "status" in English exactly as shown above.
- Extract every individual test result visible in the image.
- Keep explanations simple, no jargon.
- If a value is flagged H or L, reflect that in status.
- If the image is not a lab result, set results to [] and explain in summary.
- Return ONLY JSON — no markdown, no backticks.
- Keep each explanation under 40 words.
- possibleCauses: 2-4 short bullet phrases (under 15 words each) explaining the most common reasons a value is high or low. ONLY include this field for results with status "low", "high", or "critical". For "normal" results return an empty array [].
- possibleRemedies: 2-4 short bullet phrases (under 15 words each) with lifestyle changes, dietary tips, or medical actions that may help bring the value back into range. ONLY include this field for results with status "low", "high", or "critical". For "normal" results return an empty array []. Always frame remedies as suggestions to discuss with a doctor — never as prescriptions.
- questionsToAsk: up to 3 GENERAL questions to ask the doctor about these results overall.
- followUpQuestions: up to 4 SPECIFIC follow-up questions tied directly to the abnormal/borderline values found (causes, lifestyle changes, retesting, treatment options). If everything is normal, return an empty array for followUpQuestions.`;
}

const ALLOWED_MEDIA = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function analyzeWithGemini({ apiKey, imageData, mediaType, context, language }) {
  if (!apiKey) {
    return { status: 500, body: { error: { message: "GEMINI_API_KEY not configured" } } };
  }
  if (!imageData) {
    return { status: 400, body: { error: { message: "imageData is required" } } };
  }

  const lang = LANGUAGE_LABELS[language] ? language : "en";
  const mt = ALLOWED_MEDIA.includes(mediaType) ? mediaType : "image/jpeg";
  const langName = LANGUAGE_LABELS[lang];
  const userText = context
    ? `Analyze this lab result and respond in ${langName}. Patient context: ${context}`
    : `Analyze this lab result and respond in ${langName}.`;

  const payload = {
    system_instruction: { parts: [{ text: buildSystemPrompt(lang) }] },
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
