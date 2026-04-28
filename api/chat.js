// api/chat.js
// Vercel serverless function — follow-up chat with Gemini using the existing analysis as context.

import { chatWithGemini } from "../server/gemini.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  try {
    const result = await chatWithGemini({
      apiKey: (process.env.GEMINI_API_KEY || "").trim(),
      language: req.body?.language,
      labContext: req.body?.labContext,
      messages: req.body?.messages,
    });
    return res.status(result.status).json(result.body);
  } catch (err) {
    return res.status(500).json({ error: { message: err?.message || "Internal server error" } });
  }
}
