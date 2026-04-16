// server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer } = require("ws");
const { GoogleGenAI } = require("@google/genai");

// Load .env.local manually for the custom server
require("dotenv").config({ path: ".env.local" });

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Setup WebSocket Server for Gemini Live Proxy
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "", true);
    if (pathname === "/api/strategist/live") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", async (ws, req) => {
    console.log("[WS] Client connected to Live Strategist");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      ws.send(JSON.stringify({ type: "error", message: "API key missing" }));
      ws.close();
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    // Use the live model specified or fallback
    const model = process.env.GEMINI_MODEL || "gemini-live-2.5-flash-preview";

    let liveSession;

    // Receive from Client -> Send to Gemini
    ws.on("message", async (data) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.type === "setup" && !liveSession) {
          // Connect to Gemini Live API with config
          liveSession = await ai.live.connect({
            model,
            config: payload.config
          });

          // Start listening to Gemini stream
          (async () => {
            try {
              for await (const chunk of liveSession) {
                // Check if it's a tool call
                if (chunk.toolCall) {
                  const serverTools = ["fetch_user_memory", "save_lead_data", "generate_whatsapp_link", "fetch_booking_link"];
                  
                  const toolResponses = [];
                  for (const call of chunk.toolCall.functionCalls) {
                    if (serverTools.includes(call.name)) {
                      // Execute on server via local API route
                      try {
                        const res = await fetch(`http://${hostname}:${port}/api/strategist/tool`, {
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
                      // It's a client tool (e.g. update_screen_info), forward to client
                      if (ws.readyState === ws.OPEN) {
                        ws.send(JSON.stringify({ toolCall: { functionCalls: [call] } }));
                      }
                    }
                  }

                  // If we executed server tools, send responses back to Gemini
                  if (toolResponses.length > 0) {
                    await liveSession.send({ toolResponse: { functionResponses: toolResponses } });
                  }
                } else {
                  // Forward audio or text chunks to client
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

        if (liveSession) {
          await liveSession.send(payload);
        }
      } catch (err) {
        console.error("[WS] Error sending to Gemini:", err);
      }
    });

    ws.on("close", () => {
      console.log("[WS] Client disconnected");
      // liveSession doesn't have an explicit close in some versions, but we should stop sending.
    });
  });

  server.listen(port, () => {
    console.log(
      `> Server listening at http://${hostname}:${port} as ${
        dev ? "development" : process.env.NODE_ENV
      }`
    );
  });
});
