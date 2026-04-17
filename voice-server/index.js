const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const { GoogleGenAI } = require("@google/genai");

require("dotenv").config();

const port = process.env.PORT || 8080;
const server = createServer((req, res) => {
  // Simple health check endpoint for Render/Railway
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("LIONOVART Voice Server is running\n");
});

const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  console.log("[WS] Client connected to Live Voice Server");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    ws.send(JSON.stringify({ type: "error", message: "API key missing" }));
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
        console.log("[WS] Setting up Gemini Live connection...");
        liveSession = await ai.live.connect({
          model,
          config: payload.config
        });

        // Listen from Gemini -> Send to Client
        (async () => {
          try {
            for await (const chunk of liveSession) {
              if (chunk.toolCall) {
                // If it's a tool call, we pass it to the frontend.
                // The frontend will then hit the Hostinger HTTP API routes to execute server tools (like save_lead_data)
                // because we can't easily query the Firebase database from this isolated Render instance 
                // without copying all the Firebase admin keys over.
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
        return;
      }

      // Handle tool responses from the frontend
      if (payload.type === "tool_response" && liveSession) {
        await liveSession.send({ toolResponse: { functionResponses: payload.responses } });
        return;
      }

      // Forward normal payloads (audio/text) to Gemini
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
  console.log(`> Standalone Voice Server listening on port ${port}`);
});
