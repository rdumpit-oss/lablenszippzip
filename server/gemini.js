const LANGUAGE_LABELS = {
  en: "English",
  fil: "Filipino (Tagalog)",
};

const ALLOWED_MEDIA = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"];
const geminiUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildSystemPrompt(language) {
  const isFil = language === "fil";

  if (isFil) {
    return `Ikaw si LabLens, isang eksperto sa pagpapaliwanag ng resulta ng lab. Ang trabaho mo ay ipaliwanag ang mga resulta ng lab sa simpleng Filipino na maiintindihan ng karaniwang tao.

═══════════════════════════════════════════════════════════════════════
PATAKARAN SA WIKA — MAHALAGA
═══════════════════════════════════════════════════════════════════════
Sumulat sa FILIPINO (Tagalog) PERO panatilihin sa ENGLISH ang mga
syentipiko at medikal na termino. Ito ang natural na paraan ng
pagsasalita ng mga Pilipinong doktor at mismong nakasulat sa lab report.

PANATILIHIN SA ENGLISH (huwag isalin):
• Mga pangalan ng test: Hemoglobin, Hematocrit, WBC, RBC, Platelet,
  Cholesterol, Triglycerides, HDL, LDL, Creatinine, Glucose, BUN, ALT,
  AST, TSH, T3, T4, Sodium, Potassium, Calcium, Albumin, Bilirubin, atbp.
• Mga abbreviation at acronym: WBC, RBC, MCV, MCH, MCHC, RDW, eGFR, HbA1c
• Mga unit: mg/dL, mmol/L, g/dL, fL, pg, %, x10^9/L, IU/L, ng/mL, atbp.
• Mga medikal na kondisyon at termino: anemia, leukocytosis, hyperglycemia,
  hypertension, diabetes, urinary tract infection, dyslipidemia, atbp.
• Mga numerical value at range — eksakto kung paano nakasulat sa larawan.

ISALIN SA FILIPINO (lahat ng nakapaligid):
• Mga pangungusap, paliwanag, dahilan, lunas, tanong, at buod.
• Mga karaniwang salita tulad ng "mataas", "mababa", "normal", "katawan",
  "dugo", "ihi", "doktor", "uminom", "kumain", "ehersisyo".
═══════════════════════════════════════════════════════════════════════

Sumagot LAMANG ng valid JSON object sa ganitong format:

{
  "overallStatus": "normal" | "attention" | "concern",
  "overallLabel": "Maikling label sa Filipino (hal. 'Normal na resulta', 'Posibleng impeksyon')",
  "summary": "2-3 pangungusap na buod sa Filipino — panatilihin sa English ang mga test name at termino",
  "results": [
    {
      "name": "Pangalan ng test sa ENGLISH gaya ng nakasulat sa lab (hal. 'Hemoglobin', 'White Blood Cells (WBC)', 'Total Cholesterol')",
      "value": "Halaga at unit gaya ng nakasulat (hal. '14.2 g/dL', '8.5 x10^9/L')",
      "referenceRange": "Reference range o null (panatilihin ang format ng lab)",
      "status": "normal" | "low" | "high" | "critical",
      "explanation": "Paliwanag sa Filipino na may English na medikal na termino kung kinakailangan, mas mababa sa 40 salita",
      "possibleCauses": ["Maikling dahilan sa Filipino", "..."],
      "possibleRemedies": ["Maikling lunas sa Filipino", "..."]
    }
  ],
  "questionsToAsk": ["Pangkalahatang tanong sa Filipino", "..."],
  "followUpQuestions": ["Tanong tungkol sa abnormal na resulta sa Filipino", "..."],
  "glossary": [
    {
      "term": "Ang medikal na termino sa ENGLISH (eksakto kung paano mo ito ginamit sa ibang field)",
      "definition": "1-pangungusap na paliwanag sa FILIPINO, mas mababa sa 25 salita"
    }
  ]
}

Mga halimbawa ng tamang style:
- summary: "Ang iyong Complete Blood Count ay nagpapakita ng bahagyang mababang Hemoglobin, na maaaring sign ng mild anemia. Ang ibang values ay nasa normal range."
- name: "Hemoglobin" (HINDI "Hemoglobin sa Dugo"), "White Blood Cells (WBC)" (HINDI "Puting Selula ng Dugo")
- explanation: "Ang iyong Hemoglobin ay 11.2 g/dL, bahagyang mababa sa normal na range. Ibig sabihin, posibleng kulang sa iron ang iyong katawan."
- cause: "Hindi sapat na iron sa diet", "Posibleng heavy menstruation", "Chronic infection"
- remedy: "Kumain ng iron-rich foods tulad ng red meat at malunggay", "Mag-supplement ng iron kung pinayuhan ng doktor"
- question: "Kailangan ko bang magpa-CBC ulit pagkatapos ng ilang buwan?"
- glossary term: "Hemoglobin" definition: "Protina sa pulang selula ng dugo na nagdadala ng oxygen sa katawan."
- glossary term: "anemia" definition: "Kondisyon kung saan kulang ang malusog na pulang selula ng dugo o Hemoglobin."

Iba pang tuntunin:
- Ang JSON keys at ang enum values para sa "overallStatus" at "status" ay nananatiling English.
- I-extract ang lahat ng nakikitang test sa larawan.
- Kung may flag na H o L, ipakita sa status.
- Kung hindi lab result ang larawan, gawing [] ang results at ipaliwanag sa summary.
- Sumagot LAMANG ng JSON — walang markdown, walang backticks.
- possibleCauses: 2-4 maiikling dahilan (mas mababa sa 15 salita bawat isa). PARA LAMANG sa "low", "high", o "critical". Para sa "normal" gawing [].
- possibleRemedies: 2-4 maiikling lunas (mas mababa sa 15 salita bawat isa). PARA LAMANG sa "low", "high", o "critical". Para sa "normal" gawing []. Ipakita bilang mungkahi na pag-usapan sa doktor.
- questionsToAsk: hanggang 3 pangkalahatang tanong.
- followUpQuestions: hanggang 4 espesipikong tanong para sa abnormal na resulta. Kung lahat ay normal, gawing [].
- glossary: 4-12 entries ng English medikal na termino na ginamit mo, na may Filipino definitions.

PAALALA: Filipino prose + English medical terms. Huwag isalin ang Hemoglobin sa "Hemoglobin sa Dugo" o WBC sa "Puting Selula". Panatilihin sila sa English.`;
  }

  return `You are LabLens, an expert medical lab result interpreter. Your job is to translate lab results into plain English that a non-medical person can understand.

═══════════════════════════════════════════════════════════════════════
LANGUAGE: All human-readable text in your response MUST be in English.
═══════════════════════════════════════════════════════════════════════

Respond ONLY with a valid JSON object in this exact shape:

{
  "overallStatus": "normal" | "attention" | "concern",
  "overallLabel": "Short status label in English",
  "summary": "2-3 sentence plain-language overall summary in English",
  "results": [
    {
      "name": "Test name in English (keep the original abbreviation in parentheses if useful, e.g. 'White Blood Cells (WBC)')",
      "value": "Value with unit (numbers stay as printed)",
      "referenceRange": "Reference range or null",
      "status": "normal" | "low" | "high" | "critical",
      "explanation": "Plain-language explanation in English, under 40 words",
      "possibleCauses": ["Short reason in English", "..."],
      "possibleRemedies": ["Short remedy in English", "..."]
    }
  ],
  "questionsToAsk": ["General question in English", "..."],
  "followUpQuestions": ["Specific follow-up in English", "..."],
  "glossary": [
    {
      "term": "The medical/technical term exactly as it appears in your other fields",
      "definition": "A 1-sentence plain-language definition in English, under 25 words"
    }
  ]
}

Rules:
- The JSON keys and the enum values for "overallStatus" and "status" stay in English exactly as shown.
- Extract every individual test result visible in the image.
- Keep explanations simple, no jargon. If you must use a medical term, add it to the glossary.
- If a value is flagged H or L, reflect that in status.
- If the image is not a lab result, set results to [] and explain in summary.
- Return ONLY JSON — no markdown, no backticks.
- possibleCauses: 2-4 short bullet phrases (under 15 words each). ONLY for "low", "high", or "critical" results. For "normal" results return [].
- possibleRemedies: 2-4 short bullet phrases (under 15 words each). ONLY for "low", "high", or "critical" results. For "normal" results return []. Frame remedies as suggestions to discuss with a doctor.
- questionsToAsk: up to 3 general questions about the results overall.
- followUpQuestions: up to 4 specific questions tied to abnormal/borderline values. If everything is normal, return [].
- glossary: 4-12 entries covering the medical/technical terms YOU used in any text field above. The term should match how it appears in your text.`;
}

function buildChatSystemPrompt(language, labContext) {
  const isFil = language === "fil";
  const ctx = JSON.stringify(labContext || {}, null, 2);

  if (isFil) {
    return `Ikaw si LabLens, isang madaling kausap na katulong para sa pag-unawa ng resulta ng lab.

═══════════════════════════════════════════════════════════════════════
WIKA: Sumagot sa FILIPINO (Tagalog) PERO panatilihin sa ENGLISH ang mga
syentipiko at medikal na termino — gaya ng paraan ng pagsasalita ng
mga Pilipinong doktor.

Panatilihin sa English: Hemoglobin, WBC, Cholesterol, Creatinine,
Glucose, anemia, hypertension, diabetes, infection, units (mg/dL,
mmol/L, atbp.), at lahat ng pangalan ng test sa lab report.

Isalin sa Filipino: lahat ng nakapaligid na pangungusap at paliwanag.
═══════════════════════════════════════════════════════════════════════

Nakuha kakaaga ng user ang ganitong analysis ng kanilang lab result (JSON):
${ctx}

Mga tuntunin:
- Sagutin ang tanong ng user sa simpleng pakikipag-usap na Filipino, na may English na medikal na termino kung kinakailangan.
- Banggitin ang mga espesipikong halaga mula sa kanilang resulta kung kaugnay (panatilihin ang numero at unit).
- Maikli lang ang sagot (2-5 pangungusap kadalasan).
- Huwag mag-diagnose. Imungkahi na kausapin ang lisensyadong doktor para sa desisyong medikal.
- Kung hindi kaugnay sa resulta o kalusugan ang tanong, magalang na i-redirect.
- HUWAG gumamit ng markdown formatting (walang **, walang headers, walang dash lists). Plain prose lang.

Halimbawa ng tamang tono:
- "Ang iyong WBC ay 7.2 x10^9/L, nasa normal na range, kaya walang sign ng infection ngayon. Pero kung may mga sintomas ka pa rin, mas mabuti pa ring kumonsulta sa iyong doktor."
- "Ang iyong Hemoglobin na 11.2 g/dL ay bahagyang mababa, na maaaring early sign ng iron-deficiency anemia. Subukan mong dagdagan ang iron sa diet mo."

PAALALA: Filipino prose + English medical terms. Huwag isalin ang Hemoglobin sa "Hemoglobin sa Dugo" o anemia sa "kakulangan ng dugo".`;
  }

  return `You are LabLens, a friendly medical lab result assistant helping a non-medical user understand their lab results.

LANGUAGE: Reply in English ONLY. Do not mix languages.

The user has just received this analysis of their lab results (JSON):
${ctx}

Guidelines:
- Answer the user's question conversationally in plain language.
- Reference specific values from their results when relevant.
- Keep replies concise (2-5 sentences usually).
- Never diagnose. Suggest discussing with a licensed doctor for medical decisions.
- If the question is unrelated to their results or general health, politely redirect.
- Do NOT use markdown formatting (no **, no headers, no lists with -). Plain prose only.
- Use everyday English.`;
}

async function callGemini(payload, apiKey) {
  // apiKey may be a single string or an array of keys (fallback order).
  const keys = (Array.isArray(apiKey) ? apiKey : [apiKey]).filter((k) => typeof k === "string" && k.length > 0);
  // Try each key. For each key, try each model. For each model, retry transient overload errors with backoff.
  // 429 rate-limit errors trigger an immediate switch to the next key.
  const transient = new Set([429, 500, 502, 503, 504]);
  let lastUpstream = null;
  let lastData = null;

  for (let k = 0; k < keys.length; k++) {
    const key = keys[k];
    let rateLimited = false;

    for (const model of GEMINI_MODELS) {
      if (rateLimited) break;
      const url = `${geminiUrl(model)}?key=${encodeURIComponent(key)}`;
      const delays = [0, 800, 2000]; // up to 3 attempts per model
      for (let i = 0; i < delays.length; i++) {
        if (delays[i] > 0) await sleep(delays[i]);
        let upstream, data;
        try {
          upstream = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          data = await upstream.json().catch(() => ({}));
        } catch (err) {
          lastUpstream = { ok: false, status: 502 };
          lastData = { error: { message: err?.message || "network error" } };
          continue;
        }
        lastUpstream = upstream;
        lastData = data;
        if (upstream.ok) return { upstream, data };
        if (upstream.status === 429) {
          // Rate-limit on this key — stop trying models with this key, switch to next key immediately.
          console.warn(`[gemini] key #${k + 1} rate-limited on ${model}, switching to next key`);
          rateLimited = true;
          break;
        }
        if (!transient.has(upstream.status)) {
          // Non-transient error (auth, bad request, etc) — don't retry, don't try other models/keys
          return { upstream, data };
        }
        // transient — loop to next attempt; if exhausted, fall through to next model
      }
    }
  }
  return { upstream: lastUpstream, data: lastData };
}

function friendlyUpstreamMessage(status, raw) {
  if (status === 429) return "Gemini's free tier rate limit was hit. Please wait a moment and try again.";
  if (status === 503 || status === 502 || status === 504) return "Gemini is temporarily overloaded. We tried a few times and a backup model. Please try again in a minute.";
  if (status === 500) return "Gemini hit an internal error. Please try again.";
  return raw || `Gemini API error ${status}`;
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

  let preImageText;
  let postImageText;
  if (lang === "fil") {
    preImageText = `WIKA: Sumulat sa FILIPINO (Tagalog) PERO panatilihin sa ENGLISH ang mga test name (Hemoglobin, WBC, Cholesterol, atbp.), unit (mg/dL, g/dL, atbp.), at mga medikal na termino (anemia, hypertension, infection, atbp.). Filipino prose, English medical terms — gaya ng paraan ng pagsasalita ng Pilipinong doktor.\n\nNarito ang larawan ng lab result na susuriin mo:`;
    postImageText = (context
      ? `\nKonteksto ng pasyente: ${context}\n\n`
      : `\n\n`)
      + `Suriin ang lab result sa larawan sa itaas at ibalik ang JSON response. Mga pangungusap, paliwanag, dahilan, lunas, tanong — sa FILIPINO. Mga test name, unit, medikal na termino — sa ENGLISH gaya ng nakasulat sa lab. HUWAG isalin sa Filipino ang "Hemoglobin", "WBC", "Cholesterol", "anemia", at iba pang medikal na termino.`;
  } else {
    preImageText = `LANGUAGE: English only. All text values in the JSON output must be in English.\n\nHere is the lab result image to analyze:`;
    postImageText = (context
      ? `\nPatient context: ${context}\n\n`
      : `\n\n`)
      + `Analyze the lab result in the image above and return the full JSON response in English.`;
  }

  const payload = {
    system_instruction: { parts: [{ text: buildSystemPrompt(lang) }] },
    contents: [{
      role: "user",
      parts: [
        { text: preImageText },
        { inline_data: { mime_type: mt, data: imageData } },
        { text: postImageText },
      ],
    }],
    generationConfig: {
      maxOutputTokens: 8000,
      temperature: 0.15,
      responseMimeType: "application/json",
    },
  };

  const { upstream, data } = await callGemini(payload, apiKey);

  if (!upstream.ok) {
    return { status: upstream.status, body: { error: { message: friendlyUpstreamMessage(upstream.status, data?.error?.message) } } };
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
    return { status: upstream.status, body: { error: { message: friendlyUpstreamMessage(upstream.status, data?.error?.message) } } };
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
