import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeWithGemini, chatWithGemini } from "./gemini.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "..", "dist");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "20mb" }));

const apiKey = () => (process.env.GEMINI_API_KEY || "").trim();

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, hasApiKey: apiKey().length > 0 });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const result = await analyzeWithGemini({
      apiKey: apiKey(),
      imageData: req.body?.imageData,
      mediaType: req.body?.mediaType,
      context: req.body?.context,
      language: req.body?.language,
    });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("[/api/analyze]", err);
    res.status(500).json({ error: { message: err?.message || "Internal server error" } });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const result = await chatWithGemini({
      apiKey: apiKey(),
      language: req.body?.language,
      labContext: req.body?.labContext,
      messages: req.body?.messages,
    });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("[/api/chat]", err);
    res.status(500).json({ error: { message: err?.message || "Internal server error" } });
  }
});

app.use(
  express.static(DIST_DIR, {
    index: false,
    maxAge: "1h",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }),
);

app.get("*", (_req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`LabLens server listening on http://${HOST}:${PORT}`);
  if (!apiKey()) {
    console.warn("[warn] GEMINI_API_KEY is not set — /api/analyze and /api/chat will fail.");
  }
});
