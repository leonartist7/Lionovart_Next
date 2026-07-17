const WebSocket = require('ws');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;

function testMessage(msgPayload, name) {
  return new Promise((resolve) => {
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;
    const ws = new WebSocket(url);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        setup: {
          model: "models/gemini-3.1-flash-live-preview",
          generationConfig: { responseModalities: ["AUDIO"] }
        }
      }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.setupComplete) {
        console.log(`[${name}] Setup complete, sending payload...`);
        ws.send(JSON.stringify(msgPayload));
      } else if (msg.serverContent) {
        console.log(`[${name}] SUCCESS! Received serverContent response.`);
        ws.close();
        resolve(true);
      }
    });

    ws.on('close', (code, reason) => {
      if (code !== 1000 && code !== 1005) {
        console.log(`[${name}] FAILED! Code: ${code}, Reason: ${reason}`);
      }
      resolve(false);
    });
  });
}

async function runTests() {
  // Test 7: Send clientContent
  await testMessage({
    clientContent: {
      turns: [{ role: "user", parts: [{ text: "Hello" }] }],
      turnComplete: true
    }
  }, "Test 7: Send clientContent");

  // Test 8: Send realtimeInput (audio format)
  const dummyAudio = Buffer.alloc(16000 * 2).toString("base64");
  await testMessage({
    realtimeInput: {
      mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: dummyAudio }]
    }
  }, "Test 8: Send mediaChunks (should fail with 1007)");

  await testMessage({
    realtimeInput: {
      audio: { mimeType: "audio/pcm;rate=16000", data: dummyAudio }
    }
  }, "Test 9: Send audio (should succeed)");

  process.exit(0);
}

runTests();
