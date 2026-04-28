import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { analyzeWithGemini } from "./server/gemini.js";

function geminiProxyPlugin() {
  return {
    name: "gemini-proxy",
    configureServer(server) {
      server.middlewares.use("/api/analyze", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: { message: "Method not allowed" } }));
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");

          const result = await analyzeWithGemini({
            apiKey: (process.env.GEMINI_API_KEY || "").trim(),
            imageData: body.imageData,
            mediaType: body.mediaType,
            context: body.context,
          });

          res.statusCode = result.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result.body));
        } catch (err) {
          console.error("[gemini-proxy] error:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: { message: err?.message || "proxy error" } }));
        }
      });
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
