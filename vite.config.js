import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { analyzeWithGemini, chatWithGemini } from "./server/gemini.js";

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function jsonRoute(handler) {
  return async (req, res) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: { message: "Method not allowed" } }));
      return;
    }
    try {
      const body = await readJsonBody(req);
      const result = await handler(body);
      res.statusCode = result.status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result.body));
    } catch (err) {
      console.error("[api] error:", err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: { message: err?.message || "proxy error" } }));
    }
  };
}

function geminiProxyPlugin() {
  return {
    name: "gemini-proxy",
    configureServer(server) {
      const apiKeys = () =>
        [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2]
          .map((k) => (k || "").trim())
          .filter((k) => k.length > 0);

      server.middlewares.use("/api/analyze", jsonRoute((body) => analyzeWithGemini({
        apiKey: apiKeys(),
        imageData: body.imageData,
        mediaType: body.mediaType,
        context: body.context,
        language: body.language,
      })));

      server.middlewares.use("/api/chat", jsonRoute((body) => chatWithGemini({
        apiKey: apiKeys(),
        language: body.language,
        labContext: body.labContext,
        messages: body.messages,
      })));
    },
  };
}

export default defineConfig({
  plugins: [react(), geminiProxyPlugin()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },
});
