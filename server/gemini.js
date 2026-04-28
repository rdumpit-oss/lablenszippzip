const LANGUAGE_LABELS = {
  en: "English",
  fil: "Filipino (Tagalog)",
};

const ALLOWED_MEDIA = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildSystemPrompt(language) {
  const langName = LANGUAGE_LABELS[language] || "English";
  const isFil = language === "fil";
  return `You are LabLens, an expert medical lab result interpreter. Your job is to translate lab results into plain language that a non-medical person can understand.

╔═════════════════════════════════════════════════════════════════════╗
║ LANGUAGE REQUIREMENT — THIS IS THE MOST IMPORTANT RULE              ║
║ Every single human-readable string in your response MUST be written ║
║ in ${langName.padEnd(63)}║
║ The schema below is written in English ONLY for documentation.      ║
║ Your actual output values MUST be in ${langName}.${" ".repeat(Math.max(0, 30 - langName.length))}║
╚═════════════════════════════════════════════════════════════════════╝

Respond ONLY with a valid JSON object in this exact shape:

{
  "overallStatus": "normal" | "attention" | "concern",
  "overallLabel": "Short status label IN ${langName.toUpperCase()}",
  "summary": "2-3 sentence plain-language overall summary IN ${langName.toUpperCase()}",
  "results": [
    {
      "name": "Test name IN ${langName.toUpperCase()} (keep the original abbreviation in parentheses if useful, e.g. 'White Blood Cells (WBC)')",
      "value": "Value with unit (numbers stay as printed)",
      "referenceRange": "Reference range or null",
      "status": "normal" | "low" | "high" | "critical",
      "explanation": "Plain-language explanation IN ${langName.toUpperCase()}, under 40 words",
      "possibleCauses": ["Short reason IN ${langName.toUpperCase()}", "..."],
      "possibleRemedies": ["Short remedy IN ${langName.toUpperCase()}", "..."]
    }
  ],
  "questionsToAsk": ["General question IN ${langName.toUpperCase()}", "..."],
  "followUpQuestions": ["Specific follow-up IN ${langName.toUpperCase()}", "..."],
  "glossary": [
    {
      "term": "The medical/technical term EXACTLY as it appears in your other fields (case-sensitive match preferred)",
      "definition": "A 1-sentence plain-language definition IN ${langName.toUpperCase()}, under 25 words"
    }
  ]
}

Rules:
- The JSON keys and the enum values for "overallStatus" and "status" stay in English exactly as shown.
- ALL other human-readable text (overallLabel, summary, name, explanation, possibleCauses, possibleRemedies, questionsToAsk, followUpQuestions, glossary.definition) MUST be in ${langName}. Do NOT mix languages. Do NOT default to English.
- Extract every individual test result visible in the image.
- Keep explanations simple, no jargon. If you must use a medical term, add it to the glossary.
- If a value is flagged H or L, reflect that in status.
- If the image is not a lab result, set results to [] and explain in summary.
- Return ONLY JSON — no markdown, no backticks.
- possibleCauses: 2-4 short bullet phrases (under 15 words each). ONLY for "low", "high", or "critical" results. For "normal" results return [].
- possibleRemedies: 2-4 short bullet phrases (under 15 words each). ONLY for "low", "high", or "critical" results. For "normal" results return []. Frame remedies as suggestions to discuss with a doctor.
- questionsToAsk: up to 3 general questions about the results overall.
- followUpQuestions: up to 4 specific questions tied to abnormal/borderline values. If everything is normal, return [].
- glossary: 4-12 entries covering the medical/technical terms YOU used in any text field above (e.g. "leukocytes", "hemoglobin", "creatinine", "specific gravity", "urinalysis"). The term should match how it appears in your text. Use plain-language ${langName} definitions.
${isFil ? `
FILIPINO SPECIFIC:
- Use natural conversational Filipino/Tagalog. It's OK to keep widely-used English medical terms (e.g. "urine", "blood pressure", "white blood cells") but explain them in Filipino in the glossary.
- Examples of natural phrasing:
  * summary: "Ang resulta ng iyong urinalysis ay nagpapakita ng mga senyales ng posibleng impeksyon sa ihi..."
  * explanation: "Ang kulay ng iyong ihi ay normal, na nagpapahiwatig ng sapat na hydration."
  * cause: "Posibleng impeksyon sa urinary tract"
  * remedy: "Uminom ng maraming tubig"
` : ""}`;
}

function buildChatSystemPrompt(language, labContext) {
  const langName = LANGUAGE_LABELS[language] || "English";
  return `You are LabLens, a friendly medical lab result assistant helping a non-medical user understand their lab results.

LANGUAGE: Reply in ${langName} ONLY. Do not mix languages.

The user has just received this analysis of their lab results (JSON):
${JSON.stringify(labContext || {}, null, 2)}

Guidelines:
- Answer the user's question conversationally in plain language.
- Reference specific values from their results when relevant.
- Keep replies concise (2-5 sentences usually).
- Never diagnose. Suggest discussing with a licensed doctor for medical decisions.
- If the question is unrelated to their results or general health, politely redirect.
- Do NOT use markdown formatting (no **, no headers, no lists with -). Plain prose only.
- ${language === "fil" ? "Sumagot sa natural na Filipino. OK lang ang ilang English medical terms na malawakang ginagamit." : "Use everyday English."}`;
}

async function callGemini(payload, apiKey) {
  const upstream = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await upstream.json().catch(() => ({}));
  return { upstream, data };
}

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
  const userText = (context
    ? `Analyze this lab result. Patient context: ${context}\n\n`
    : `Analyze this lab result.\n\n`)
    + `IMPORTANT: Write the entire response in ${langName}. Every text value in the JSON must be in ${langName}.`;

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
      maxOutputTokens: 6000,
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  const { upstream, data } = await callGemini(payload, apiKey);

  if (!upstream.ok) {
    return { status: upstream.status, body: { error: { message: data?.error?.message || `Gemini API error ${upstream.status}` } } };
  }

  const rawText = (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p?.text || "")
    .join("")
    .trim();

  if (!rawText) {
    const finishReason = data?.candidates?.[0]?.finishReason || "unknown";
    return { status: 502, body: { error: { message: `Gemini returned no content (finishReason: ${finishReason}). Please try again.` } } };
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

export async function chatWithGemini({ apiKey, language, labContext, messages }) {
  if (!apiKey) {
    return { status: 500, body: { error: { message: "GEMINI_API_KEY not configured" } } };
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return { status: 400, body: { error: { message: "messages array is required" } } };
  }

  const lang = LANGUAGE_LABELS[language] ? language : "en";

  const contents = messages
    .filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  if (contents.length === 0) {
    return { status: 400, body: { error: { message: "no valid messages" } } };
  }

  const payload = {
    system_instruction: { parts: [{ text: buildChatSystemPrompt(lang, labContext) }] },
    contents,
    generationConfig: {
      maxOutputTokens: 1200,
      temperature: 0.4,
    },
  };

  const { upstream, data } = await callGemini(payload, apiKey);

  if (!upstream.ok) {
    return { status: upstream.status, body: { error: { message: data?.error?.message || `Gemini API error ${upstream.status}` } } };
  }

  const reply = (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p?.text || "")
    .join("")
    .trim();

  if (!reply) {
    const finishReason = data?.candidates?.[0]?.finishReason || "unknown";
    return { status: 502, body: { error: { message: `Gemini returned no content (finishReason: ${finishReason}).` } } };
  }

  return { status: 200, body: { reply } };
}
