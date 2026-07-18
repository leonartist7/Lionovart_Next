const { createServer } = require("http");
const { parse } = require("url");
const { WebSocketServer } = require("ws");
const { GoogleGenAI } = require("@google/genai");
const { verifyWsToken, isAllowedOrigin, getRequestIp, tryAcquireSlot, releaseSlot } = require("./ws-auth");
const { getAgentConfig, buildLiveConfig } = require("./nova-agent-config");

require("dotenv").config({ path: ".env.local" });

const port = 3001; // Separate port for local dev
const server = createServer();
const wss = new WebSocketServer({ noServer: true });

// Server-side tools that the dev proxy handles directly
// (in prod, these are forwarded to the client which calls /api/strategist/tool)
const SERVER_TOOLS = ["fetch_user_memory", "save_lead_data", "generate_whatsapp_link", "fetch_booking_link"];

server.on("upgrade", (req, socket, head) => {
  const origin = req.headers.origin;
  if (!isAllowedOrigin(origin, true)) {
    console.warn("[WS-DEV] Rejected upgrade — disallowed origin:", origin);
    socket.destroy();
    return;
  }

  const secret = process.env.NOVA_WS_SECRET;
  if (secret) {
    const { query } = parse(req.url, true);
    const tokenPayload = verifyWsToken(query.t, secret);
    if (!tokenPayload) {
      console.warn("[WS-DEV] Rejected upgrade — invalid or expired session token");
      socket.destroy();
      return;
    }
  } else {
    console.warn("[WS-DEV] NOVA_WS_SECRET not set — allowing unauthenticated WS connections (dev mode)");
  }

  const ip = getRequestIp(req);
  if (!tryAcquireSlot(ip)) {
    console.warn("[WS-DEV] Rejected upgrade — concurrency cap reached for ip:", ip);
    socket.destroy();
    return;
  }
  req.__novaIp = ip;

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws, req) => {
  console.log("[WS-DEV] Client connected to Live Strategist");

  const ip = req.__novaIp || getRequestIp(req);
  let slotReleased = false;
  function releaseSlotOnce() {
    if (slotReleased) return;
    slotReleased = true;
    releaseSlot(ip);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    ws.send(JSON.stringify({ type: "error", message: "API key missing" }));
    ws.close();
    releaseSlotOnce();
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
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

        // Config hot-swap spine: read agent_config/live (60s cache) or
        // agent_config/draft (10s cache, Agent Studio test-calls) — falls
        // back to hardcoded defaults if Firestore is null/unreachable.
        const agentConfig = await getAgentConfig(payload.draft ? "draft" : "live");
        const { model, config: liveConfig, resolvedVoice } = buildLiveConfig(
          payload.config,
          agentConfig,
          payload.locale,
          payload.conversationId,
        );
        console.log(`[WS-DEV] model: ${model}, voice: ${resolvedVoice}`);
        sendToClient({ type: "voice_resolved", voice: resolvedVoice });

        try {
          liveSession = await ai.live.connect({
            model,
            config: liveConfig,
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

                  // Session resumption handle — forward so the client can
                  // store it and replay it verbatim on reconnect.
                  if (msg.sessionResumptionUpdate) {
                    sendToClient({ sessionResumptionUpdate: msg.sessionResumptionUpdate });
                  }
                } catch (err) {
                  console.error("[WS-DEV] Error in Gemini onmessage handler:", err);
                }
              },

              onerror: (e) => {
                console.error("[WS-DEV] Gemini WebSocket error:", e);
                sendToClient({ type: "error", message: `Gemini connection error: ${e?.message || e?.error || JSON.stringify(e)}` });
              },

              onclose: (e) => {
                console.log("[WS-DEV] Gemini WebSocket closed. Code:", e?.code, "Reason:", e?.reason);
                liveSession = null;
                if (ws.readyState === ws.OPEN) {
                  sendToClient({ type: "error", message: `Gemini session ended. Code: ${e?.code}, Reason: ${e?.reason || 'none'}` });
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

      // ── REALTIME INPUT (audio chunks or text) ───────────────────
      if (payload.realtimeInput) {
        liveSession.sendRealtimeInput(payload.realtimeInput);
        return;
      }

      // ── CLIENT CONTENT (text turns, system alerts) ──────────────
      if (payload.clientContent) {
        liveSession.sendClientContent(payload.clientContent);
        return;
      }

      // ── TOOL RESPONSES from the frontend (new format) ───────────
      if (payload.type === "tool_response") {
        liveSession.sendToolResponse({ functionResponses: payload.responses });
        return;
      }

      // ── TOOL RESPONSE (legacy direct path) ──────────────────────
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
    releaseSlotOnce();
  });

  ws.on("error", (err) => {
    console.error("[WS-DEV] Client WebSocket error:", err.message);
    closeLiveSession();
    releaseSlotOnce();
  });
});

server.listen(port, () => {
  console.log(`> Local WS Server listening at ws://localhost:${port}`);
});
