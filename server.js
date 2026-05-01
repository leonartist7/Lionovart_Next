const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer } = require("ws");
const { GoogleGenAI } = require("@google/genai");

// Force Webpack (disables Turbopack bugs causing opacity:0)
process.env.TURBOPACK = '0';
process.env.NEXT_TURBOPACK = '0';

// Automatically handled by Google Cloud Run / Next.js
const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 8080;

const app = next({ dev, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // WebSocket Proxy for Gemini Live API
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    // We completely bypass the strict pathname check. Google Cloud Run's load balancer 
    // sometimes strips or mutates the URL path for WebSockets, causing false 1005 rejections.
    // Since this server only handles one WebSocket endpoint, we allow all upgrades to pass through.
    console.log("[WS] Allowing upgrade for incoming WebSocket connection...");
    wss.handleUpgrade(req, socket, head, (ws) => {
      console.log("[WS] Upgrade successful");
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", async (ws, req) => {
    console.log("[WS] Client connected to Live Strategist");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      ws.send(JSON.stringify({ type: "error", message: "API key missing in environment variables" }));
      ws.close();
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    // Must use models/ prefix per AI Studio reference code
    const model = process.env.GEMINI_MODEL || "models/gemini-3.1-flash-live-preview";
    let liveSession;

    ws.on("message", async (data) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.type === "setup" && !liveSession) {
          console.log(`[DEBUG] Connecting with model: ${model}`);
          try {
            liveSession = await ai.live.connect({
              model,
              config: payload.config
            });
          } catch (connectErr) {
            console.error("[WS] Failed to connect to Gemini Live API:", connectErr);
            ws.send(JSON.stringify({ type: "error", message: `Gemini API Connection Failed: ${connectErr.message}` }));
            ws.close();
            return;
          }

          // Async iterator: listen for Gemini responses and forward to client
          (async () => {
            try {
              for await (const chunk of liveSession) {
                if (chunk.toolCall) {
                  if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({ toolCall: chunk.toolCall }));
                  }
                } else {
                  if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify(chunk));
                  }
                }
              }
            } catch (err) {
              console.error("[WS] Gemini stream error:", err);
            }
          })();

          ws.send(JSON.stringify({ type: "setup_complete" }));

          // Setup Ping/Pong Heartbeat to prevent Cloud Run idle timeout
          const pingInterval = setInterval(() => {
            if (ws.readyState === ws.OPEN) {
              ws.ping();
            }
          }, 30000); // Ping every 30 seconds

          ws.on('close', () => clearInterval(pingInterval));
          return;
        }

        // Handle tool responses from the frontend
        if (payload.type === "tool_response" && liveSession) {
          await liveSession.send({ toolResponse: { functionResponses: payload.responses } });
          return;
        }

        // Forward normal payloads (audio/text) via SDK method
        if (liveSession) {
          await liveSession.send(payload);
        }
      } catch (err) {
        console.error("[WS] Error processing message:", err);
      }
    });

    ws.on("close", () => {
      console.log("[WS] Client disconnected");
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("Next.js app.prepare failed:", err);
  process.exit(1);
});