const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer } = require("ws");
const { GoogleGenAI } = require("@google/genai");
const { verifyWsToken, isAllowedOrigin, getRequestIp, tryAcquireSlot, releaseSlot } = require("./ws-auth");
const { getAgentConfig, buildLiveConfig } = require("./nova-agent-config");

// Force Webpack (disables Turbopack bugs causing opacity:0)
process.env.TURBOPACK = '0';
process.env.NEXT_TURBOPACK = '0';

// ── Global debug log for Cloud Run visibility ─────────
global.wsDebugLog = [];
function addDebugLog(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  global.wsDebugLog.push(line);
  if (global.wsDebugLog.length > 50) global.wsDebugLog.shift();
}

// ── Global safety nets — prevent Cloud Run container crashes ─────────
process.on("uncaughtException", (err) => {
  addDebugLog(`[FATAL] Uncaught exception: ${err.message}`);
  console.error("[FATAL] Uncaught exception (process kept alive):", err);
});
process.on("unhandledRejection", (reason) => {
  addDebugLog(`[FATAL] Unhandled rejection: ${reason}`);
  console.error("[FATAL] Unhandled rejection (process kept alive):", reason);
});

// Automatically handled by Google Cloud Run / Next.js
const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 8080;

const app = next({ dev, port });
const handle = app.getRequestHandler();

if (!dev && !process.env.NOVA_WS_SECRET) {
  addDebugLog(
    "[WS] FATAL config: NOVA_WS_SECRET is unset in production — the Nova voice proxy will refuse all WS upgrades until it's set.",
  );
}

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
    // Origin allowlist + token verification are unconditional, though.
    const origin = req.headers.origin;
    if (!isAllowedOrigin(origin, dev)) {
      addDebugLog(`[WS] Rejected upgrade — disallowed origin: ${origin}`);
      socket.destroy();
      return;
    }

    const secret = process.env.NOVA_WS_SECRET;
    if (secret) {
      const { query } = parse(req.url, true);
      const tokenPayload = verifyWsToken(query.t, secret);
      if (!tokenPayload) {
        addDebugLog("[WS] Rejected upgrade — invalid or expired session token");
        socket.destroy();
        return;
      }
    } else if (!dev) {
      // Fail closed in production — an unset secret must never silently
      // leave the voice proxy open to the internet on the project's API key.
      addDebugLog("[WS] Rejected upgrade — NOVA_WS_SECRET not configured in production");
      socket.destroy();
      return;
    } else {
      addDebugLog("[WS] NOVA_WS_SECRET not set — allowing unauthenticated WS connections (dev only)");
    }

    const ip = getRequestIp(req);
    if (!tryAcquireSlot(ip)) {
      addDebugLog(`[WS] Rejected upgrade — concurrency cap reached for ip=${ip}`);
      socket.destroy();
      return;
    }
    req.__novaIp = ip;

    console.log("[WS] Allowing upgrade for incoming WebSocket connection...");
    wss.handleUpgrade(req, socket, head, (ws) => {
      console.log("[WS] Upgrade successful");
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws, req) => {
    console.log("[WS] Client connected to Live Strategist");

    const ip = req.__novaIp || getRequestIp(req);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      ws.send(JSON.stringify({ type: "error", message: "API key missing in environment variables" }));
      ws.close();
      releaseSlot(ip);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    let liveSession = null;
    let pingInterval = null;
    let slotReleased = false;

    function releaseSlotOnce() {
      if (slotReleased) return;
      slotReleased = true;
      releaseSlot(ip);
    }

    // ── Helper: safely send JSON to client ───────────────────────────
    function sendToClient(obj) {
      if (ws.readyState === ws.OPEN) {
        try {
          ws.send(JSON.stringify(obj));
        } catch (e) {
          addDebugLog(`[WS] Failed to send to client: ${e.message}`);
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
          addDebugLog(`[WS] Connecting to Gemini Live with model: ${model}, voice: ${resolvedVoice}`);
          // Tells the client which voice A/B variant it landed on (if any) so
          // it can tag SESSION_STARTED — sent before connect() so it always
          // arrives ahead of setupComplete.
          sendToClient({ type: "voice_resolved", voice: resolvedVoice });

          try {
            liveSession = await ai.live.connect({
              model,
              config: liveConfig,
              callbacks: {
                onopen: () => {
                  addDebugLog("[WS] Gemini internal WebSocket opened, waiting for setupComplete...");
                },

                // ── Main message handler: Gemini → Client ─────────────
                onmessage: (msg) => {
                  try {
                    // Gemini finished setup — NOW tell the client it's safe to start
                    if (msg.setupComplete) {
                      addDebugLog("[WS] Gemini setupComplete received");
                      sendToClient({ type: "setup_complete" });
                    }

                    // Model content: audio chunks, text parts, turn signals, interruptions
                    if (msg.serverContent) {
                      sendToClient({ serverContent: msg.serverContent });
                    }

                    // Tool calls from Gemini → forward to client for dispatch
                    if (msg.toolCall) {
                      addDebugLog(`[WS] Gemini sent toolCall`);
                      sendToClient({ toolCall: msg.toolCall });
                    }

                    // Gemini cancelled previously issued tool calls
                    if (msg.toolCallCancellation) {
                      sendToClient({ toolCallCancellation: msg.toolCallCancellation });
                    }

                    // Gemini warning: session will disconnect soon
                    if (msg.goAway) {
                      addDebugLog(`[WS] Gemini goAway — time left: ${msg.goAway.timeLeft}`);
                      sendToClient({ goAway: msg.goAway });
                    }

                    // Session resumption handle — forward so the client can
                    // store it and replay it verbatim on reconnect.
                    if (msg.sessionResumptionUpdate) {
                      sendToClient({ sessionResumptionUpdate: msg.sessionResumptionUpdate });
                    }
                  } catch (err) {
                    addDebugLog(`[WS] Error in Gemini onmessage handler: ${err.message}`);
                  }
                },

                onerror: (e) => {
                  addDebugLog(`[WS] Gemini WebSocket error: ${e?.message || JSON.stringify(e)}`);
                  sendToClient({ type: "error", message: `Gemini connection error: ${e?.message || e?.error || JSON.stringify(e)}` });
                },

                onclose: (e) => {
                  addDebugLog(`[WS] Gemini WebSocket closed. Code: ${e?.code}, Reason: ${e?.reason}`);
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
            addDebugLog(`[WS] Failed to connect to Gemini Live API: ${connectErr.message}`);
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
          return;
        }

        // ── TOOL RESPONSES from the frontend ────────────────────────
        if (payload.type === "tool_response") {
          addDebugLog(`[WS] Forwarding tool_response to Gemini`);
          liveSession.sendToolResponse({ functionResponses: payload.responses });
          return;
        }

        // ── REALTIME INPUT (audio chunks or text) ───────────────────
        if (payload.realtimeInput) {
          liveSession.sendRealtimeInput(payload.realtimeInput);
          return;
        }

        // ── CLIENT CONTENT (text turns, system alerts) ──────────────
        if (payload.clientContent) {
          addDebugLog(`[WS] Forwarding clientContent to Gemini`);
          liveSession.sendClientContent(payload.clientContent);
          return;
        }

        // ── TOOL RESPONSE (alternative direct path) ─────────────────
        if (payload.toolResponse) {
          addDebugLog(`[WS] Forwarding toolResponse to Gemini`);
          liveSession.sendToolResponse(payload.toolResponse);
          return;
        }

      } catch (err) {
        addDebugLog(`[WS] Error processing client message: ${err.message}`);
        sendToClient({ type: "error", message: `Server error: ${err.message}` });
      }
    });

    // ── Client disconnect: clean up everything ──────────────────────
    ws.on("close", () => {
      console.log("[WS] Client disconnected — closing Gemini session");
      closeLiveSession();
      releaseSlotOnce();
    });

    ws.on("error", (err) => {
      console.error("[WS] Client WebSocket error:", err.message);
      closeLiveSession();
      releaseSlotOnce();
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("Next.js app.prepare failed:", err);
  process.exit(1);
});
