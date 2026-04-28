import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function anthropicProxyPlugin() {
  return {
    name: "anthropic-proxy",
    configureServer(server) {
      server.middlewares.use("/api/analyze", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: { message: "ANTHROPIC_API_KEY not configured" } }));
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const body = Buffer.concat(chunks).toString("utf8");

          const upstream = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body,
          });

          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
          res.end(text);
        } catch (err) {
          console.error("[anthropic-proxy] error:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: { message: err?.message || "proxy error" } }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), anthropicProxyPlugin()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },
});
