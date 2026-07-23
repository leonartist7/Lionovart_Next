const WebSocket = require('ws');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) throw new Error("No API key");

function testPayload(setupPayload, name) {
  return new Promise((resolve) => {
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;
    const ws = new WebSocket(url);

    ws.on('open', () => {
      ws.send(JSON.stringify(setupPayload));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.setupComplete) {
        console.log(`[${name}] SUCCESS! Setup complete received.`);
        ws.close();
        resolve(true);
      } else {
        console.log(`[${name}] Other message:`, Object.keys(msg));
      }
    });

    ws.on('close', (code, reason) => {
      if (code !== 1000 && code !== 1005) {
        console.log(`[${name}] FAILED! Code: ${code}, Reason: ${reason}`);
      }
      resolve(false);
    });

    ws.on('error', (err) => {
      console.log(`[${name}] ERROR:`, err.message);
      resolve(false);
    });
  });
}

async function runTests() {
  const baseModel = "models/gemini-3.1-flash-live-preview";
  
  // Test 1: Bare minimum
  await testPayload({
    setup: {
      model: baseModel,
      generationConfig: { responseModalities: ["AUDIO"] }
    }
  }, "Test 1: Minimum");

  // Test 2: With speech config
  await testPayload({
    setup: {
      model: baseModel,
      generationConfig: { 
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Aoede" }
          }
        }
      }
    }
  }, "Test 2: With Speech Config");

  // Test 3: With context window compression
  await testPayload({
    setup: {
      model: baseModel,
      generationConfig: { 
        responseModalities: ["AUDIO"],
      },
      contextWindowCompression: {
        triggerTokens: 104857,
        slidingWindow: { targetTokens: 52428 }
      }
    }
  }, "Test 3: With Context Compression");

  // Test 4: With tools
  await testPayload({
    setup: {
      model: baseModel,
      generationConfig: { responseModalities: ["AUDIO"] },
      tools: [{
        functionDeclarations: [
          { name: "test_tool", description: "test", parameters: { type: "OBJECT" } }
        ]
      }]
    }
  }, "Test 4: With Tools");

  // Test 5: With tools and required fields
  await testPayload({
    setup: {
      model: baseModel,
      generationConfig: { responseModalities: ["AUDIO"] },
      tools: [{
        functionDeclarations: [
          { 
            name: "test_tool", 
            description: "test", 
            parameters: { 
              type: "OBJECT",
              properties: {
                 contact: { type: "STRING" }
              },
              required: ["contact"]
            } 
          }
        ]
      }]
    }
  }, "Test 5: Tools with Required properties");
  
  // Test 6: With full config matching user payload
  await testPayload({
    setup: {
      model: baseModel,
      generationConfig: { 
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Aoede" }
          }
        }
      },
      systemInstruction: { parts: [{ text: "Hello" }] },
      tools: [{
        functionDeclarations: [
          { name: "update_screen_info", description: "test", parameters: { type: "OBJECT", properties: { name: { type: "STRING" } } } }
        ]
      }]
    }
  }, "Test 6: Full User Config");

  process.exit(0);
}

runTests();
