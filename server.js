const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer } = require("ws");
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

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
    const { pathname } = parse(req.url || "", true);
    console.log("[WS] Upgrade request received for path:", pathname);
    if (pathname === "/api/strategist/live") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        console.log("[WS] Upgrade successful");
        wss.emit("connection", ws, req);
      });
    } else {
      console.log("[WS] Upgrade rejected for path:", pathname);
      socket.destroy();
    }
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
    const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-live-preview";
    let liveSession;

    ws.on("message", async (data) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.type === "setup" && !liveSession) {
          console.log(`[WS] Setting up Gemini Live connection using model: ${model}...`);
          try {
            liveSession = await ai.live.connect({
              model,
              config: payload.config,
              callbacks: {
                onmessage: (chunk) => {
                  try {
                    console.log("[WS] Received from Gemini:", Object.keys(chunk));
                    if (chunk.toolCall) {
                      if (ws.readyState === ws.OPEN) {
                        ws.send(JSON.stringify({ toolCall: chunk.toolCall }));
                      }
                    } else {
                      if (ws.readyState === ws.OPEN) {
                        ws.send(JSON.stringify(chunk));
                      }
                    }
                  } catch (err) {
                    console.error("[WS] Error forwarding Gemini message:", err);
                  }
                },
                onerror: (err) => console.error("[WS] Gemini internal error:", err),
                onclose: () => console.log("[WS] Gemini connection closed")
              }
            });
          } catch (connectErr) {
            console.error("[WS] Failed to connect to Gemini Live API:", connectErr);
            ws.send(JSON.stringify({ type: "error", message: `Gemini API Connection Failed: ${connectErr.message}` }));
            ws.close();
            return;
          }

          ws.send(JSON.stringify({ type: "setup_complete" }));
          return;
        }

        // Handle tool responses from the frontend
        if (payload.type === "tool_response" && liveSession) {
          if (liveSession.conn) {
            liveSession.conn.send(JSON.stringify({ toolResponse: { functionResponses: payload.responses } }));
          }
          return;
        }

        // Forward normal payloads (audio/text) directly to raw Google WebSocket
        // This bypasses the SDK's strict input validation
        if (liveSession && liveSession.conn) {
          liveSession.conn.send(data.toString());
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
