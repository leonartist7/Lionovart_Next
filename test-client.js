const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3001/api/strategist/live");

ws.on("open", () => {
  console.log("Connected to local dev server.");
  const payload = {
    type: "setup",
    config: {
      responseModalities: ["AUDIO"],
      systemInstruction: {
        parts: [{ text: "Hello" }]
      },
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Aoede"
          }
        }
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: "update_screen_info",
              description: "Updates the screen info",
              parameters: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" }
                }
              }
            }
          ]
        }
      ]
    }
  };
  ws.send(JSON.stringify(payload));
});

ws.on("message", (data) => {
  console.log("Received:", JSON.parse(data.toString()));
  if (JSON.parse(data.toString()).type === "setup_complete") {
     process.exit();
  }
  if (JSON.parse(data.toString()).type === "error") {
     console.error("ERROR RECEIVED!", JSON.parse(data.toString()));
     process.exit(1);
  }
});

ws.on("close", () => {
  console.log("Disconnected.");
  process.exit();
});
