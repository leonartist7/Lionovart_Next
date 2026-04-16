const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { GoogleGenAI } = require("@google/genai");

require("dotenv").config({ path: ".env.local" });

const port = 3001; // Separate port for local dev
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  console.log("[WS-DEV] Client connected to Live Strategist");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    ws.send(JSON.stringify({ type: "error", message: "API key missing" }));
    ws.close();
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-live-2.5-flash-preview";
  let liveSession;

  ws.on("message", async (data) => {
    try {
      const payload = JSON.parse(data.toString());

      if (payload.type === "setup" && !liveSession) {
        console.log("[WS-DEV] Setting up Live API...");
        liveSession = await ai.live.connect({
          model,
          config: payload.config
        });

        // Listen from Gemini -> Send to Client
        (async () => {
          try {
            for await (const chunk of liveSession) {
              if (chunk.toolCall) {
                const serverTools = ["fetch_user_memory", "save_lead_data", "generate_whatsapp_link", "fetch_booking_link"];
                const toolResponses = [];
                for (const call of chunk.toolCall.functionCalls) {
                  if (serverTools.includes(call.name)) {
                    try {
                      // Note: calls next.js dev server running on 3000
                      const res = await fetch(`http://localhost:3000/api/strategist/tool`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: call.name, args: call.args })
                      });
                      const result = await res.json();
                      toolResponses.push({ id: call.id, name: call.name, response: result });
                    } catch (e) {
                      toolResponses.push({ id: call.id, name: call.name, response: { error: e.message } });
                    }
                  } else {
                    if (ws.readyState === ws.OPEN) {
                      ws.send(JSON.stringify({ toolCall: { functionCalls: [call] } }));
                    }
                  }
                }
                if (toolResponses.length > 0) {
                  await liveSession.send({ toolResponse: { functionResponses: toolResponses } });
                }
              } else {
                if (ws.readyState === ws.OPEN) {
                  ws.send(JSON.stringify(chunk));
                }
              }
            }
          } catch (err) {
            console.error("[WS-DEV] Gemini stream error:", err);
          }
        })();

        ws.send(JSON.stringify({ type: "setup_complete" }));
        return;
      }

      if (liveSession) {
        await liveSession.send(payload);
      }
    } catch (err) {
      console.error("[WS-DEV] Error sending to Gemini:", err);
    }
  });

  ws.on("close", () => {
    console.log("[WS-DEV] Client disconnected");
  });
});

server.listen(port, () => {
  console.log(`> Local WS Server listening at ws://localhost:${port}`);
});
