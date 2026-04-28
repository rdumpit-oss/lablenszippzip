// api/analyze.js
// Vercel serverless function — keeps your Gemini API key server-side.
// The frontend posts { imageData, mediaType, context } and gets back { content: {...} }.

import { analyzeWithGemini } from "../server/gemini.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  try {
    const result = await analyzeWithGemini({
      apiKey: (process.env.GEMINI_API_KEY || "").trim(),
      imageData: req.body?.imageData,
      mediaType: req.body?.mediaType,
      context: req.body?.context,
      language: req.body?.language,
    });
    return res.status(result.status).json(result.body);
  } catch (err) {
    return res.status(500).json({ error: { message: err?.message || "Internal server error" } });
  }
}
