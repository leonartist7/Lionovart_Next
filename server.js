const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer } = require("ws");
const { GoogleGenAI } = require("@google/genai");

// Force Webpack (disables Turbopack bugs causing opacity:0)
process.env.TURBOPACK = '0';
process.env.NEXT_TURBOPACK = '0';

// ── Global safety nets — prevent Cloud Run container crashes ─────────
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception (process kept alive):", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled rejection (process kept alive):", reason);
});

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

  // ── WebSocket Proxy for Gemini Live API ────────────────────────────
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

  wss.on("connection", (ws, req) => {
    console.log("[WS] Client connected to Live Strategist");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      ws.send(JSON.stringify({ type: "error", message: "API key missing in environment variables" }));
      ws.close();
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    // GEMINI_LIVE_MODEL is separate from GEMINI_MODEL (used by text chat route)
    // so they don't collide — the text chat route uses gemini-2.5-flash, Live API needs a live-capable model
    const model = process.env.GEMINI_LIVE_MODEL || "models/gemini-3.1-flash-live-preview";
    let liveSession = null;
    let pingInterval = null;

    // ── Helper: safely send JSON to client ───────────────────────────
    function sendToClient(obj) {
      if (ws.readyState === ws.OPEN) {
        try {
          ws.send(JSON.stringify(obj));
        } catch (e) {
          console.error("[WS] Failed to send to client:", e.message);
        }
      }
    }

    // ── Helper: tear down Gemini session + heartbeat ─────────────────
    function closeLiveSession() {
      if (liveSession) {
        try { liveSession.close(); } catch (e) {}
        liveSession = null;
      }
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
    }

    // ── Incoming messages from the browser ────────────────────────────
    ws.on("message", async (data) => {
      try {
        const payload = JSON.parse(data.toString());

        // ── SETUP ─────────────────────────────────────────────────────
        if (payload.type === "setup" && !liveSession) {
          console.log(`[WS] Connecting to Gemini Live with model: ${model}`);

          try {
            liveSession = await ai.live.connect({
              model,
              config: payload.config,
              callbacks: {
                onopen: () => {
                  console.log("[WS] Gemini internal WebSocket opened, waiting for setupComplete...");
                },

                // ── Main message handler: Gemini → Client ─────────────
                onmessage: (msg) => {
                  try {
                    // Gemini finished setup — NOW tell the client it's safe to start
                    if (msg.setupComplete) {
                      console.log("[WS] Gemini setupComplete received");
                      sendToClient({ type: "setup_complete" });
                    }

                    // Model content: audio chunks, text parts, turn signals, interruptions
                    if (msg.serverContent) {
                      sendToClient({ serverContent: msg.serverContent });
                    }

                    // Tool calls from Gemini → forward to client for dispatch
                    if (msg.toolCall) {
                      sendToClient({ toolCall: msg.toolCall });
                    }

                    // Gemini cancelled previously issued tool calls
                    if (msg.toolCallCancellation) {
                      sendToClient({ toolCallCancellation: msg.toolCallCancellation });
                    }

                    // Gemini warning: session will disconnect soon
                    if (msg.goAway) {
                      console.log("[WS] Gemini goAway — time left:", msg.goAway.timeLeft);
                      sendToClient({ goAway: msg.goAway });
                    }
                  } catch (err) {
                    console.error("[WS] Error in Gemini onmessage handler:", err);
                  }
                },

                onerror: (e) => {
                  console.error("[WS] Gemini WebSocket error:", e);
                  sendToClient({ type: "error", message: `Gemini connection error: ${e?.message || e?.error || JSON.stringify(e)}` });
                },

                onclose: (e) => {
                  console.log("[WS] Gemini WebSocket closed. Code:", e?.code, "Reason:", e?.reason);
                  liveSession = null;
                  // Notify client if still connected
                  if (ws.readyState === ws.OPEN) {
                    sendToClient({ type: "error", message: `Gemini session ended. Code: ${e?.code}, Reason: ${e?.reason || 'none'}` });
                    ws.close();
                  }
                },
              },
            });
          } catch (connectErr) {
            console.error("[WS] Failed to connect to Gemini Live API:", connectErr);
            sendToClient({ type: "error", message: `Gemini API Connection Failed: ${connectErr.message}` });
            ws.close();
            return;
          }

          // Ping/Pong heartbeat to prevent Cloud Run idle timeout (30s intervals)
          pingInterval = setInterval(() => {
            if (ws.readyState === ws.OPEN) {
              ws.ping();
            }
          }, 30000);

          return;
        }

        // ── GUARD: all remaining messages require an active session ──
        if (!liveSession) {
          console.warn("[WS] No active Gemini session, ignoring message");
          return;
        }

        // ── TOOL RESPONSES from the frontend ────────────────────────
        if (payload.type === "tool_response") {
          liveSession.sendToolResponse({ functionResponses: payload.responses });
          return;
        }

        // ── REALTIME INPUT (audio from mic) ─────────────────────────
        if (payload.realtimeInput) {
          const ri = payload.realtimeInput;

          // Client sends wire format: { mediaChunks: [{ mimeType, data }] }
          // SDK expects input key: { media: { mimeType, data } }
          // The SDK internally transforms "media" → "mediaChunks" on the wire.
          // Passing "mediaChunks" directly is silently ignored — audio never reaches Gemini.
          if (ri.mediaChunks && Array.isArray(ri.mediaChunks) && ri.mediaChunks.length > 0) {
            // Gemini 3.1 strictly requires `audio`, rejecting legacy `mediaChunks` format
            liveSession.sendRealtimeInput({ audio: ri.mediaChunks[0] });
          } else {
            // Pass through other realtimeInput shapes (text, audioStreamEnd, etc.)
            liveSession.sendRealtimeInput(ri);
          }
          return;
        }

        // ── CLIENT CONTENT (text turns, system alerts) ──────────────
        if (payload.clientContent) {
          liveSession.sendClientContent(payload.clientContent);
          return;
        }

        // ── TOOL RESPONSE (alternative direct path) ─────────────────
        if (payload.toolResponse) {
          liveSession.sendToolResponse(payload.toolResponse);
          return;
        }

        console.warn("[WS] Unknown payload shape:", JSON.stringify(payload).substring(0, 120));
      } catch (err) {
        console.error("[WS] Error processing client message:", err);
        sendToClient({ type: "error", message: `Server error: ${err.message}` });
      }
    });

    // ── Client disconnect: clean up everything ──────────────────────
    ws.on("close", () => {
      console.log("[WS] Client disconnected — closing Gemini session");
      closeLiveSession();
    });

    ws.on("error", (err) => {
      console.error("[WS] Client WebSocket error:", err.message);
      closeLiveSession();
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("Next.js app.prepare failed:", err);
  process.exit(1);
});
