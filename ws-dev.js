const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { GoogleGenAI } = require("@google/genai");

require("dotenv").config({ path: ".env.local" });

const port = 3001; // Separate port for local dev
const server = createServer();
const wss = new WebSocketServer({ server });

// Server-side tools that the dev proxy handles directly
// (in prod, these are forwarded to the client which calls /api/strategist/tool)
const SERVER_TOOLS = ["fetch_user_memory", "save_lead_data", "generate_whatsapp_link", "fetch_booking_link"];

wss.on("connection", (ws, req) => {
  console.log("[WS-DEV] Client connected to Live Strategist");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    ws.send(JSON.stringify({ type: "error", message: "API key missing" }));
    ws.close();
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  // GEMINI_LIVE_MODEL is separate from GEMINI_MODEL (used by text chat route)
  const model = process.env.GEMINI_LIVE_MODEL || "models/gemini-3.1-flash-live-preview";
  let liveSession = null;

  // ── Helper: safely send JSON to client ───────────────────────────
  function sendToClient(obj) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify(obj));
      } catch (e) {
        console.error("[WS-DEV] Failed to send to client:", e.message);
      }
    }
  }

  // ── Helper: tear down Gemini session ─────────────────────────────
  function closeLiveSession() {
    if (liveSession) {
      try { liveSession.close(); } catch (e) {}
      liveSession = null;
    }
  }

  // ── Helper: execute a server-side tool via the Next.js API route ─
  async function executeServerTool(call) {
    try {
      const res = await fetch("http://localhost:3000/api/strategist/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: call.name, args: call.args }),
      });
      const result = await res.json();
      return { id: call.id, name: call.name, response: result };
    } catch (e) {
      console.error(`[WS-DEV] Tool ${call.name} failed:`, e.message);
      return { id: call.id, name: call.name, response: { error: e.message } };
    }
  }

  // ── Incoming messages from the browser ──────────────────────────
  ws.on("message", async (data) => {
    try {
      const payload = JSON.parse(data.toString());

      // ── SETUP ───────────────────────────────────────────────────
      if (payload.type === "setup" && !liveSession) {
        console.log("[WS-DEV] Setting up Live API...");

        try {
          liveSession = await ai.live.connect({
            model,
            config: payload.config,
            callbacks: {
              onopen: () => {
                console.log("[WS-DEV] Gemini internal WebSocket opened");
              },

              // ── Main message handler: Gemini → Client ───────────
              onmessage: async (msg) => {
                try {
                  // Gemini finished setup — NOW tell the client
                  if (msg.setupComplete) {
                    console.log("[WS-DEV] Gemini setupComplete received");
                    sendToClient({ type: "setup_complete" });
                  }

                  // Model content: audio, text, turn signals, interruptions
                  if (msg.serverContent) {
                    sendToClient({ serverContent: msg.serverContent });
                  }

                  // Tool calls from Gemini
                  if (msg.toolCall) {
                    const calls = msg.toolCall.functionCalls || [];
                    const serverToolResponses = [];
                    const clientToolCalls = [];

                    for (const call of calls) {
                      if (SERVER_TOOLS.includes(call.name)) {
                        // Execute server-side tools directly (dev mode)
                        const result = await executeServerTool(call);
                        serverToolResponses.push(result);
                      } else {
                        // Forward client-side tools (update_screen_info, show_handoff_cards) to browser
                        clientToolCalls.push(call);
                      }
                    }

                    // Send server tool responses back to Gemini immediately
                    if (serverToolResponses.length > 0 && liveSession) {
                      liveSession.sendToolResponse({ functionResponses: serverToolResponses });
                    }

                    // Forward client-side tool calls to the browser
                    if (clientToolCalls.length > 0) {
                      sendToClient({ toolCall: { functionCalls: clientToolCalls } });
                    }
                  }

                  // Tool call cancellation
                  if (msg.toolCallCancellation) {
                    sendToClient({ toolCallCancellation: msg.toolCallCancellation });
                  }

                  // GoAway warning
                  if (msg.goAway) {
                    console.log("[WS-DEV] Gemini goAway — time left:", msg.goAway.timeLeft);
                    sendToClient({ goAway: msg.goAway });
                  }
                } catch (err) {
                  console.error("[WS-DEV] Error in Gemini onmessage handler:", err);
                }
              },

              onerror: (e) => {
                console.error("[WS-DEV] Gemini WebSocket error:", e);
                sendToClient({ type: "error", message: "Gemini connection error" });
              },

              onclose: (e) => {
                console.log("[WS-DEV] Gemini WebSocket closed. Code:", e?.code, "Reason:", e?.reason);
                liveSession = null;
                if (ws.readyState === ws.OPEN) {
                  sendToClient({ type: "error", message: "Gemini session ended" });
                  ws.close();
                }
              },
            },
          });
        } catch (connectErr) {
          console.error("[WS-DEV] Failed to connect to Gemini Live API:", connectErr);
          sendToClient({ type: "error", message: `Gemini API Connection Failed: ${connectErr.message}` });
          ws.close();
          return;
        }

        return;
      }

      // ── GUARD: all remaining messages require an active session ──
      if (!liveSession) {
        console.warn("[WS-DEV] No active Gemini session, ignoring message");
        return;
      }

      // ── REALTIME INPUT (audio from mic) ─────────────────────────
      if (payload.realtimeInput) {
        const ri = payload.realtimeInput;

        // Client sends wire format: { mediaChunks: [{ mimeType, data }] }
        // SDK expects input key: { media: { mimeType, data } }
        if (ri.mediaChunks && Array.isArray(ri.mediaChunks) && ri.mediaChunks.length > 0) {
          liveSession.sendRealtimeInput({ media: ri.mediaChunks[0] });
        } else {
          liveSession.sendRealtimeInput(ri);
        }
        return;
      }

      // ── CLIENT CONTENT (text turns, system alerts) ──────────────
      if (payload.clientContent) {
        liveSession.sendClientContent(payload.clientContent);
        return;
      }

      // ── TOOL RESPONSE (from client after handling UI tools) ─────
      if (payload.toolResponse) {
        liveSession.sendToolResponse(payload.toolResponse);
        return;
      }
    } catch (err) {
      console.error("[WS-DEV] Error processing message:", err);
    }
  });

  // ── Client disconnect: clean up everything ─────────────────────
  ws.on("close", () => {
    console.log("[WS-DEV] Client disconnected — closing Gemini session");
    closeLiveSession();
  });

  ws.on("error", (err) => {
    console.error("[WS-DEV] Client WebSocket error:", err.message);
    closeLiveSession();
  });
});

server.listen(port, () => {
  console.log(`> Local WS Server listening at ws://localhost:${port}`);
});
