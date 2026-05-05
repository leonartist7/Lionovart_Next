# Gemini Live API — Full Documentation & Implementation Analysis

**Prepared:** 2026-05-05  
**Author:** Claude Code (AI assistant)  
**Purpose:** Consolidate all external documentation + deep-audit the current LIONOVART Voice Agent implementation for handoff to another AI model.

---

## TABLE OF CONTENTS

1. [Official Documentation Summary](#1-official-documentation-summary)
   - 1.1 Model Specification (gemini-3.1-flash-live-preview)
   - 1.2 Live API Overview
   - 1.3 WebSocket Protocol (Raw)
   - 1.4 SDK Approach (Google GenAI SDK)
   - 1.5 Community Guide — edTechniti (Python)
   - 1.6 Community Guide — DohkoAI (Practical WebSocket)
2. [LIONOVART Implementation Architecture](#2-lionovart-implementation-architecture)
3. [File-by-File Breakdown](#3-file-by-file-breakdown)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Deep Analysis — What Works, What's Broken, What's Missing](#5-deep-analysis)
6. [Known Bugs & Issues](#6-known-bugs--issues)
7. [Missing Features (vs Official Docs)](#7-missing-features-vs-official-docs)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Recommended Implementation Plan](#10-recommended-implementation-plan)

---

## 1. OFFICIAL DOCUMENTATION SUMMARY

### 1.1 Model Specification — `gemini-3.1-flash-live-preview`

| Property | Value |
|---|---|
| Model ID | `gemini-3.1-flash-live-preview` |
| SDK model string | `models/gemini-3.1-flash-live-preview` |
| Release date | March 2026 |
| Knowledge cutoff | January 2025 |
| Input token limit | 131,072 |
| Output token limit | 65,536 |
| Input modalities | Text, Images, Audio, Video |
| Output modalities | Text + Audio |
| Audio input format | 16-bit PCM, 16kHz, little-endian |
| Audio output format | 16-bit PCM, 24kHz |
| Supported languages | 70 languages |

**Enabled features:**
- Audio generation ✅
- Function calling / tool use ✅
- Live API ✅
- Search grounding ✅
- Thinking capability ✅

**NOT supported:**
- Batch API ❌
- Caching ❌
- Code execution ❌
- File search ❌
- Image generation ❌
- Structured outputs ❌
- URL context ❌

**Migration note from Gemini 2.5:**
- Use `thinkingLevel` instead of `thinkingBudget`
- Use `send_realtime_input` instead of `send_client_content` during active conversations
- Handle multiple content parts in server events
- Async function calling and proactive audio features are NOT yet available

---

### 1.2 Live API Overview

The Gemini Live API enables **low-latency, real-time bidirectional streaming** via WebSocket. Unlike traditional request/response LLM calls, this is a stateful, persistent connection.

**Core capabilities:**
- Native audio-to-audio processing (no STT → LLM → TTS chain)
- Sub-200ms response latency
- Barge-in / interruption support — user can interrupt the model mid-response
- 70 supported languages
- Tool use (function calling) during live conversations
- Audio transcriptions (user input + model output)
- Proactive audio control and affective dialog (tone/style adaptation)
- Visual input (~1 FPS JPEG frames)

**Two deployment models:**

| Model | Description | Security |
|---|---|---|
| Server-to-server | Backend connects via WebSocket; clients stream to backend first | API key stays on server |
| Client-to-server | Frontend connects directly to Gemini API | Use ephemeral tokens (NOT raw API keys) |

**Partner integrations:** LiveKit, Pipecat, Fishjam, Vision Agents, Voximplant, Agora

---

### 1.3 WebSocket Protocol (Raw — Low-Level)

**Connection URL:**
```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=YOUR_API_KEY
```

**Ephemeral token URL (for frontend-direct production use):**
```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token={short-lived-token}
```

**Step 1 — Setup (must be first message):**
```json
{
  "config": {
    "model": "models/gemini-3.1-flash-live-preview",
    "responseModalities": ["AUDIO"],
    "systemInstruction": {
      "parts": [{ "text": "You are a helpful assistant." }]
    }
  }
}
```

**Step 2 — Server confirms setup:**
```json
{ "setupComplete": {} }
```

**Step 3 — Send audio input (ongoing):**
```json
{
  "realtimeInput": {
    "audio": {
      "data": "<base64-encoded-PCM>",
      "mimeType": "audio/pcm;rate=16000"
    }
  }
}
```

**Step 4 — Send text input:**
```json
{
  "clientContent": {
    "turns": [{ "role": "user", "parts": [{ "text": "Hello" }] }],
    "turnComplete": true
  }
}
```

**Server sends audio back:**
```json
{
  "serverContent": {
    "modelTurn": {
      "parts": [{
        "inlineData": {
          "data": "<base64-PCM>",
          "mimeType": "audio/pcm;rate=24000"
        }
      }]
    }
  }
}
```

**Turn complete signal:**
```json
{ "serverContent": { "turnComplete": true } }
```

**Interrupted signal (barge-in):**
```json
{ "serverContent": { "interrupted": true } }
```

**Tool call from model:**
```json
{
  "toolCall": {
    "functionCalls": [{
      "id": "call_xyz",
      "name": "my_function",
      "args": { "param": "value" }
    }]
  }
}
```

**Tool response from client:**
```json
{
  "toolResponse": {
    "functionResponses": [{
      "id": "call_xyz",
      "name": "my_function",
      "response": { "result": "some result" }
    }]
  }
}
```

**Session ending warning:**
```json
{ "goAway": { "timeLeft": "60s" } }
```

---

### 1.4 SDK Approach — Google GenAI SDK

**JavaScript/TypeScript:**
```typescript
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

const session = await ai.live.connect({
  model: 'gemini-3.1-flash-live-preview',
  config: {
    responseModalities: [Modality.AUDIO],
    systemInstruction: { parts: [{ text: "..." }] },
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: "Aoede" }
      }
    }
  },
  callbacks: {
    onopen: () => {},
    onmessage: (msg) => {
      if (msg.setupComplete) { /* ready */ }
      if (msg.serverContent) { /* audio/text */ }
      if (msg.toolCall) { /* tool invoked */ }
      if (msg.goAway) { /* session ending soon */ }
    },
    onerror: (e) => {},
    onclose: (e) => {}
  }
});

// Send audio
session.sendRealtimeInput({ audio: { data: base64Data, mimeType: "audio/pcm;rate=16000" } });

// Send text turn
session.sendClientContent({
  turns: [{ role: "user", parts: [{ text: "Hello" }] }],
  turnComplete: true
});

// Respond to tool call
session.sendToolResponse({
  functionResponses: [{ id: callId, name: funcName, response: result }]
});

// Close session
session.close();
```

**Available voices:** Aoede, Charon, Fenrir, Kore, Puck, Sulafat

**Python (for reference):**
```python
from google import genai
client = genai.Client(api_key="YOUR_API_KEY")
async with client.aio.live.connect(model="gemini-3.1-flash-live-preview", config=config) as session:
    await session.send_realtime_input(audio={"data": base64, "mime_type": "audio/pcm;rate=16000"})
    async for response in session.receive():
        # process response
```

---

### 1.5 Community Guide — edTechniti Blog (Python Tutorial)

**Source:** https://blog.edtechniti.com/build-a-voice-agent-with-gemini-3-1-flash-live-in-python

**Key architecture patterns:**
- Separate `AudioHandler` class for mic capture + playback using PyAudio
- Separate `VoiceAgent` class wrapping the SDK session
- Run `send_audio` and `receive_audio` as concurrent async tasks
- Audio format: 16kHz, 16-bit PCM, chunk size 1024 bytes
- Output queue pattern for smooth audio playback

**Audio specs:**
- Input: 16kHz, 16-bit PCM, base64-encoded
- Output: decode base64 → play via speaker
- Chunk size: 1024 bytes (adjust to 512 if choppy, 2048 to reduce API requests)

**Interruption (barge-in) detection:**
```python
# Signal user is speaking (interrupt AI)
await session.send({ 'client_content': { 'turn_complete': False } })
# Signal user stopped speaking (AI can respond)
await session.send({ 'client_content': { 'turn_complete': True } })
```

**Common errors:**
| Error | Cause | Fix |
|---|---|---|
| 401 Unauthorized | Invalid API key | Regenerate at aistudio.google.com/apikey |
| 429 Too Many Requests | Rate limit hit | Wait 60s, reduce chunk rate |
| `websockets.exceptions.ConnectionClosed 1008` | API key lacks Live API access or UNIMPLEMENTED feature | Verify Live API enabled; remove unsupported config (e.g. contextWindowCompression) |
| ModuleNotFoundError _portaudio | PyAudio native dependency missing | Install portaudio system dep |
| Delayed playback 2-3s | Output buffer too large | Reduce output_queue.get() timeout |

---

### 1.6 Community Guide — DohkoAI / Dev.to (Practical WebSocket)

**Source:** https://dev.to/dohkoai/gemini-31-flash-live-build-real-time-voice-agents-that-actually-work-practical-guide-3hok

**Key improvements the community guide highlights:**

1. **Audio format conversion for browsers:**
   - Browser mic produces 48kHz Float32 audio
   - Must downsample to 16kHz PCM16 (Int16) via AudioWorklet
   - Use `AudioContext` with `sampleRate: 16000` or `AudioWorkletProcessor` to convert

2. **Barge-in handling:**
   - When `serverContent.interrupted = true` arrives, flush audio playback buffers immediately
   - Stop all active `AudioBufferSourceNode` instances

3. **Session persistence:**
   - WebSocket maintains conversation context
   - Implement reconnection with exponential backoff for production

4. **Function calling in Live API:**
   ```json
   {
     "setup": {
       "model": "models/gemini-3.1-flash-live",
       "generation_config": {
         "response_modalities": ["AUDIO"],
         "speech_config": {
           "voice_config": {
             "prebuilt_voice_config": { "voice_name": "Puck" }
           }
         }
       },
       "tools": [{
         "function_declarations": [{
           "name": "check_order_status",
           "description": "Check order status",
           "parameters": {
             "type": "object",
             "properties": { "order_id": { "type": "string" } },
             "required": ["order_id"]
           }
         }]
       }]
     }
   }
   ```

5. **Video streaming:**
   - Send JPEG frames at ~1 FPS
   - Encode with `cv2.imencode('.jpg', frame)` (Python) or `canvas.toDataURL()` (JS)
   - mimeType: `"image/jpeg"`

---

## 2. LIONOVART IMPLEMENTATION ARCHITECTURE

### Current Architecture (as of 2026-05-05)

```
Browser (Next.js)
│
├── MagneticOrb.tsx          ← Floating mic button on the page
├── StrategistPanel.tsx      ← Modal dialog wrapper (createPortal)
├── ConversationView.tsx     ← UI inside panel (visualizer, transcript, lead form)
├── VoiceVisualizer.tsx      ← Animated bars/ring visualizer
├── HandoffCards.tsx         ← WhatsApp + booking CTAs at end of conversation
│
└── useStrategistSession.ts  ← CORE: manages WebSocket, AudioContext, AudioWorklet
    │
    ├── Microphone → AudioWorklet (audio-processor.js) → WebSocket (client → server)
    └── WebSocket (server → client) → AudioBufferSourceNode → Speakers
```

```
Node.js Server (server.js)
│
├── HTTP Server            ← Handles Next.js requests (pages, API routes)
│   ├── /api/strategist/chat   ← Text-based SSE chat (gemini-2.5-flash)
│   ├── /api/strategist/tool   ← Server-side tool execution (Firebase Firestore)
│   ├── /api/strategist/lead   ← Lead save to Firestore
│   └── /api/health            ← Health check endpoint
│
└── WebSocket Server (wss) ← Handles voice connections
    └── /api/strategist/live (any upgrade request)
        │
        ├── Receives setup config from browser
        ├── Connects to Gemini Live API via @google/genai SDK
        ├── Proxies audio chunks (browser → Gemini)
        ├── Proxies audio chunks (Gemini → browser)
        └── Handles tool call routing
```

**Dev Mode (two separate servers):**
```
npm run dev      → Next.js on :3000 (Turbopack disabled, uses webpack)
npm run dev:ws   → ws-dev.js on :3001 (WebSocket proxy)
```

**Production Mode (one server):**
```
npm start → node server.js → Next.js + WebSocket on :8080 (Cloud Run / Hostinger)
```

---

## 3. FILE-BY-FILE BREAKDOWN

### `server.js` — Production WebSocket Proxy

- Runs Next.js HTTP server + WebSocket server on same port
- Uses `node:http` + `ws` + `@google/genai`
- Accepts ALL WebSocket upgrade requests (intentionally bypasses path check for Cloud Run load balancer compatibility)
- On `setup` message: calls `ai.live.connect()` with client's config
- On `realtimeInput` from client: calls `liveSession.sendRealtimeInput({ audio: chunk })`
- On `clientContent` from client: calls `liveSession.sendClientContent(payload.clientContent)`
- On `toolResponse` from client: calls `liveSession.sendToolResponse({ functionResponses: payload.responses })`
- Keeps a 30-second ping/pong heartbeat to prevent Cloud Run idle timeout
- Has global `uncaughtException` / `unhandledRejection` handlers to prevent container crashes

**Critical lines:**
```js
const model = process.env.GEMINI_LIVE_MODEL || "models/gemini-3.1-flash-live-preview";
// Line 76 — change model here
```

---

### `ws-dev.js` — Development WebSocket Proxy

- Mirrors `server.js` but runs standalone on port 3001
- Loads env vars from `.env.local`
- One key difference: **handles server-side tools directly** (fetches `http://localhost:3000/api/strategist/tool`), instead of forwarding tool calls to browser
- UI-side tools (`update_screen_info`, `show_handoff_cards`) are still forwarded to browser

---

### `public/audio-processor.js` — AudioWorklet (Mic Capture)

- Runs in the browser's audio thread
- Receives raw Float32 audio from hardware mic
- Detects hardware sample rate from `processorOptions.sampleRate`
- Downsamples to exactly 16kHz using **linear interpolation** (avoids metallic artifacts)
- Converts Float32 → Int16 PCM
- Posts `{ type: "audio", pcm: Int16Array }` to main thread

**Why this is important:** Browser mics record at 44.1kHz or 48kHz. Gemini requires 16kHz. The worklet handles the conversion.

---

### `useStrategistSession.ts` — Core React Hook

The most complex file. Manages the entire voice session lifecycle:

1. Request microphone access
2. Create `AudioContext` at 16kHz
3. Load `AudioWorkletNode` from `/audio-processor.js`
4. Connect mic → worklet → destination (required for iOS)
5. Open WebSocket to server
6. On `setup_complete`: start sending mic audio, trigger AI greeting, start 30-minute timer
7. On `serverContent.modelTurn.parts`: decode base64 audio → `AudioBufferSourceNode` at 24kHz → queue for seamless playback
8. On `serverContent.interrupted`: clear all active audio sources (barge-in)
9. On `toolCall`: handle UI tools locally, forward server tools to `/api/strategist/tool`
10. On `serverContent.turnComplete`: set state to "listening"

**Session states:** `idle` → `thinking` → `listening` → `speaking` → `handoff`

---

### `src/lib/strategist-config.ts` — System Prompt & Tool Declarations

- Contains `STRATEGIST_SYSTEM_PROMPT` — the AI persona and conversation flow
- Contains `STRATEGIST_TOOLS` — 6 function declarations:
  1. `update_screen_info` — updates the lead form UI in real-time
  2. `fetch_user_memory` — checks Firestore for returning user
  3. `save_lead_data` — saves lead to Firestore
  4. `generate_whatsapp_link` — creates pre-filled WhatsApp deep link
  5. `fetch_booking_link` — returns calendar booking URL
  6. `show_handoff_cards` — triggers the final WhatsApp + booking UI
- Also exports TypeScript types: `Message`, `HandoffData`, `SessionState`, `StreamEvent`

---

### `src/components/ai-strategist/StrategistPanel.tsx` — Modal Panel

- Uses `createPortal` to render in `document.body` (avoids z-index stacking issues)
- `autoStart` prop: when `true`, calls `startSession()` 300ms after modal opens
- Uses Framer Motion for smooth open/close animation
- Locks scroll via `useScrollLock` hook while open
- ESC key closes the panel

---

### `src/components/ai-strategist/ConversationView.tsx` — Session UI

- Shows a "Start Voice Chat" idle screen before session starts
- Shows `VoiceVisualizer` + status text during active session
- Shows scrollable transcript of agent and user messages
- Shows "Live CRM Sync" editable form when lead data arrives (populated by AI tool calls)
- Shows `HandoffCards` when session reaches handoff state

---

### `src/components/ai-strategist/VoiceVisualizer.tsx` — Audio Visualizer

- **Listening:** 5 bars with random heights, updated every 120ms
- **Speaking:** Expanding ring animation + center dot
- **Idle:** 5 static short bars at minimum height
- Purely cosmetic — NOT connected to actual audio amplitude

---

### `src/components/ai-strategist/HandoffCards.tsx` — Conversion CTAs

- Two cards: WhatsApp + Google Calendar booking
- Triggered by `show_handoff_cards` tool call from the AI
- Shows optional `summaryMessage` above cards
- Opens links in new tab

---

### `src/components/ai-strategist/MagneticOrb.tsx` — Entry Point Button

- Floating circular button with mic icon
- Hover tooltip: "Free brand audit · 3 min · Voice or text"
- Pulse animation (disabled for `prefers-reduced-motion`)
- Calls `onOpen()` to open the `StrategistPanel`

---

### `src/app/api/strategist/chat/route.ts` — Text Chat Route

- Completely separate from the voice system
- Uses `gemini-2.5-flash` (not the live model)
- Non-streaming `chat.sendMessage()` then word-by-word SSE output
- Handles full function call loop (up to 5 iterations)
- Functions: `detect_user_location`, `save_lead_data`, `generate_whatsapp_link`, `fetch_booking_link`, `show_handoff_cards`

---

### `src/app/api/strategist/tool/route.ts` — Tool Execution Route

- Called by the browser WebSocket client when it receives tool calls from voice session
- Handles: `fetch_user_memory`, `save_lead_data`, `generate_whatsapp_link`, `fetch_booking_link`
- Uses `adminDb` (Firebase Firestore) for memory + lead data

---

### `src/app/api/strategist/lead/route.ts` — Lead Save Route

- Called by the text chat route for async lead saves
- Writes to Firestore `leads` collection

---

### `src/lib/firebase-admin.ts` — Firebase Admin Init

- Graceful degradation: returns `null` if env vars not set
- Required env vars: `FIREBASE_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`

---

## 4. DATA FLOW DIAGRAMS

### Voice Session Audio Flow

```
User speaks
    │
    ▼
Browser Mic (48kHz Float32)
    │
    ▼
AudioWorkletNode (audio-processor.js)
  └── downsample to 16kHz
  └── Float32 → Int16 PCM
    │
    ▼
Main Thread
  └── Int16Array.buffer → base64 encode
  └── JSON { realtimeInput: { mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: base64 }] } }
    │
    ▼
WebSocket (browser → server)
    │
    ▼
server.js
  └── liveSession.sendRealtimeInput({ audio: mediaChunks[0] })
    │
    ▼
Gemini Live API (processes audio natively)
    │
    ▼
server.js receives: msg.serverContent.modelTurn.parts[].inlineData.data (base64 PCM 24kHz)
  └── sendToClient({ serverContent: msg.serverContent })
    │
    ▼
WebSocket (server → browser)
    │
    ▼
useStrategistSession.ts
  └── base64 → Int16Array
  └── Int16 → Float32 (divide by 32768)
  └── ctx.createBuffer(1, length, 24000) ← 24kHz rate
  └── source.start(nextPlaybackTimeRef.current) ← queued seamless playback
    │
    ▼
User hears AI response
```

### Tool Call Flow (Voice Session)

```
Gemini decides to call a tool
    │
    ▼
Gemini → server.js: msg.toolCall
    │
    ▼
server.js → browser: { toolCall: msg.toolCall }
    │
    ▼
useStrategistSession.ts receives toolCall
    │
    ├── UI-only tools (update_screen_info, show_handoff_cards)
    │     └── handled locally in React state
    │
    └── Server tools (fetch_user_memory, save_lead_data, etc.)
          └── fetch POST /api/strategist/tool
          └── receive result
          └── ws.send({ type: "tool_response", responses: [{ id, name, response }] })
              │
              ▼
          server.js
          └── liveSession.sendToolResponse({ functionResponses: payload.responses })
              │
              ▼
          Gemini continues conversation with tool result
```

---

## 5. DEEP ANALYSIS

### 5.1 What Works Correctly

| Feature | Status | Notes |
|---|---|---|
| WebSocket proxy architecture | ✅ Works | Clean server-to-server pattern |
| Audio capture at 16kHz via AudioWorklet | ✅ Works | Linear interpolation downsampling |
| Base64 audio encoding/decoding | ✅ Works | Both directions |
| Audio playback at 24kHz | ✅ Works | AudioContext handles upsampling from 16kHz context |
| Barge-in / interruption | ✅ Works | `serverContent.interrupted` stops all active sources |
| Seamless queued audio playback | ✅ Works | `nextPlaybackTimeRef` prevents gaps |
| Tool call routing | ✅ Works | UI tools local, server tools via HTTP |
| Lead data CRM sync to Firestore | ✅ Works | Firebase Admin gracefully degrades if not configured |
| 30-minute session timer | ✅ Works | Client-side timer with 5-min warning |
| Session state machine | ✅ Works | idle/thinking/listening/speaking/handoff |
| Handoff cards with WhatsApp + booking | ✅ Works | Triggered by `show_handoff_cards` tool call |
| Mobile Safari iOS compatibility | ✅ Works | AudioContext resume on user gesture, sampleRate passed |
| Cloud Run heartbeat (ping/pong) | ✅ Works | 30-second interval prevents idle timeout |
| Graceful crash recovery | ✅ Works | `uncaughtException` / `unhandledRejection` handlers |
| Dev/prod environment split | ✅ Works | `ws-dev.js` vs `server.js` |
| System prompt (AI persona) | ✅ Works | STRATEGIST_SYSTEM_PROMPT sent on setup |
| Voice selection (Aoede) | ✅ Works | Via `speechConfig.voiceConfig.prebuiltVoiceConfig` |

---

### 5.2 What Is Broken or Has Issues

#### BUG 1 — `mediaChunks` key mismatch (MINOR — server corrects it)

**Location:** `useStrategistSession.ts:293-300` vs `server.js:202-208`

The client sends audio using the legacy format:
```json
{ "realtimeInput": { "mediaChunks": [{ "mimeType": "audio/pcm;rate=16000", "data": "..." }] } }
```

But the SDK's `sendRealtimeInput` expects `audio` key, not `mediaChunks`. The server corrects this:
```js
liveSession.sendRealtimeInput({ audio: ri.mediaChunks[0] });
```

**Risk:** If the server ever passes `ri` directly (fallback path on line 207: `liveSession.sendRealtimeInput(ri)`), it sends the wrong format. The `mediaChunks` fallback would fail silently.

**Fix:** Client should send `{ realtimeInput: { audio: { mimeType, data } } }` directly to eliminate the conversion step and the risky fallback.

---

#### BUG 2 — `goAway` message never handled in client

**Location:** `useStrategistSession.ts` — no handler for `goAway`

`server.js` correctly forwards `goAway` to the client:
```js
if (msg.goAway) { sendToClient({ goAway: msg.goAway }); }
```

But `useStrategistSession.ts` `ws.onmessage` handler never checks for `data.goAway`. This means the browser gets no warning when Gemini is about to close the session (usually sent 60 seconds before the 30-minute hard cutoff).

**Impact:** Session cuts off abruptly with no user warning.

---

#### BUG 3 — `sendClientContent` deprecation for Gemini 3.1

**Location:** `useStrategistSession.ts:108-126` (`sendTextToAgent`) and `useStrategistSession.ts:272-286` (initial greeting)

The official Gemini 3.1 migration guide states:  
> "Use `send_realtime_input` instead of `send_client_content` during conversations"

The current code still uses `clientContent` / `sendClientContent` for:
1. Text message sending (`sendTextToAgent`)
2. The initial AI greeting trigger
3. The 5-minute warning system alert

This may work currently but is flagged as deprecated behavior that could cause issues in future API updates.

---

#### BUG 4 — Tool response format inconsistency

**Location:** `useStrategistSession.ts:432-435` vs `server.js:196-198`

Client sends:
```json
{ "type": "tool_response", "responses": [{ "id": "...", "name": "...", "response": {...} }] }
```

Server does:
```js
liveSession.sendToolResponse({ functionResponses: payload.responses });
```

The SDK's `sendToolResponse` expects:
```js
{ functionResponses: [{ id, name, response }] }
```

Each item in `payload.responses` has `{ id, name, response }` — this appears correct. However, the `id` field comes from `call.id` in the browser. If any tool call `id` is `undefined` (which can happen for certain Gemini responses), the response mapping fails silently.

---

#### BUG 5 — Outdated `VOICE_AGENT_HANDOFF.md` document

**Location:** `VOICE_AGENT_HANDOFF.md`

The handoff document says:
- The voice proxy is on **Render.com** at `wss://lionovart-voice.onrender.com`
- There is a `voice-server` folder that was extracted as a microservice
- To upgrade the model, update `voice-server/index.js` and redeploy on Render

**Reality (current code):**
- There is NO `voice-server` folder in the codebase
- The WebSocket proxy is built into `server.js` running on the same server as Next.js
- The frontend connects to `wss://${window.location.host}/api/strategist/live` (not Render)
- The model is set in `server.js` line 76 (not a separate service)

This document is **dangerously outdated** and will mislead any developer following it.

---

#### BUG 6 — `direct-test.js` uses old v1alpha WebSocket format

**Location:** `direct-test.js`

The test file uses:
```js
const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`;
// ...
{ setup: { model: ..., generationConfig: { responseModalities: ["AUDIO"] } } }
```

Official docs say the production endpoint is **v1beta**, and the setup key is `config` (not `setup`), and the config key is `responseModalities` at the top level (not nested in `generationConfig` for the v1beta format).

The `v1alpha` format uses `{ setup: { ... } }` structure which is the older protocol. This test may still work with v1alpha but it's not the same format the production server uses.

---

#### BUG 7 — `VoiceVisualizer` not connected to actual audio

**Location:** `VoiceVisualizer.tsx`

The visualizer uses `setInterval` with random bar heights — it is purely cosmetic and does NOT read actual audio amplitude from the mic or speaker.

This means:
- During `listening` state, bars animate randomly (not showing actual mic volume)
- During `speaking` state, only a ring appears (not showing actual AI audio volume)
- Users get no real visual feedback about audio levels

This is a UX issue, not a functional bug, but may cause confusion ("is it hearing me?").

---

### 5.3 Architecture Decision Record

| Decision | Why |
|---|---|
| Server-side WebSocket proxy (not direct browser → Gemini) | API key security; Hostinger/Cloud Run compatibility |
| AudioWorklet instead of ScriptProcessor | ScriptProcessor is deprecated; AudioWorklet runs off main thread |
| 16kHz AudioContext | Avoids double-resampling; matches Gemini input requirement |
| 24kHz AudioBuffer for playback | Matches Gemini output rate exactly |
| `contextWindowCompression` removed | Triggered UNIMPLEMENTED (Code 1008) on gemini-3.1-flash-live-preview |
| Webpack forced off Turbopack (`--webpack` flag) | Turbopack caused opacity:0 rendering bug in CSS |
| Two separate servers for dev | Avoid Turbopack breaking WebSocket upgrade handling |
| All WS upgrades accepted (no path check) | Cloud Run load balancer strips/mutates URL path |

---

## 6. KNOWN BUGS & ISSUES

### Priority Matrix

| # | Severity | Bug | Location |
|---|---|---|---|
| 1 | HIGH | `goAway` message unhandled — abrupt session cutoff | `useStrategistSession.ts` |
| 2 | HIGH | `VOICE_AGENT_HANDOFF.md` describes non-existent Render architecture | `VOICE_AGENT_HANDOFF.md` |
| 3 | MEDIUM | `sendClientContent` deprecated for Gemini 3.1 text turns | `useStrategistSession.ts` |
| 4 | MEDIUM | `mediaChunks` client format requires server-side correction | `useStrategistSession.ts:293` + `server.js:204` |
| 5 | MEDIUM | `direct-test.js` uses old v1alpha format with wrong setup key | `direct-test.js` |
| 6 | LOW | `VoiceVisualizer` not connected to real audio amplitude | `VoiceVisualizer.tsx` |
| 7 | LOW | No reconnection logic if WebSocket drops mid-conversation | `useStrategistSession.ts` |
| 8 | LOW | 4 untracked test files polluting git status | root directory |
| 9 | INFO | Two parallel 30-min timers (client + Gemini `goAway`) | `useStrategistSession.ts` |
| 10 | INFO | Text chat route and voice route use different Gemini models | `chat/route.ts` vs `server.js` |

---

## 7. MISSING FEATURES (vs Official Docs)

### 7.1 Input Transcription (NOT implemented)

Gemini Live API sends `inputTranscription` (what the user said) and `outputTranscription` (what the AI said in text form) alongside audio.

**Current code** only reads `serverContent.modelTurn.parts` for text, and only if `part.text` exists. It does NOT read the dedicated transcription fields.

**Docs say:**
```json
{
  "serverContent": {
    "inputTranscription": { "text": "What the user said" },
    "outputTranscription": { "text": "What the AI said" }
  }
}
```

**Impact:** The transcript shown in `ConversationView` may be incomplete or show agent text improperly. User speech is never transcribed.

**Fix:** Check `data.serverContent.inputTranscription` and `data.serverContent.outputTranscription` in `useStrategistSession.ts`.

---

### 7.2 Ephemeral Token Authentication (NOT implemented)

Google strongly recommends using ephemeral tokens for any client-to-server deployment to avoid exposing the raw API key.

The current architecture (server-side proxy) is the correct **server-to-server** pattern where the API key never leaves the server. This is fine.

However, if the architecture ever moves to direct browser → Gemini connection, ephemeral tokens would be required.

---

### 7.3 `goAway` Warning Handler (NOT implemented)

As documented in Bug #1. Gemini sends a `goAway` event with `timeLeft` before disconnecting. The client should:
1. Show a UI warning ("Session ending in Xs")
2. Optionally let the user start a new session

---

### 7.4 Video Input (NOT implemented)

The Live API supports sending JPEG frames at ~1 FPS for visual context. Not needed for the current use case (voice-only brand consultation) but documented as a future capability.

---

### 7.5 Reconnection Logic (NOT implemented)

If the WebSocket drops (network hiccup, server restart), the session terminates with an error. There is no automatic reconnection.

For a production voice agent, exponential backoff reconnection would improve reliability.

---

### 7.6 Real Audio Amplitude Visualization (NOT implemented)

The `VoiceVisualizer` uses random heights. A proper implementation would:
- Use `AnalyserNode` on the `AudioContext` to read real frequency data from mic input
- Use the received audio buffer amplitude for the "speaking" state

---

### 7.7 Proactive Audio Control (NOT available yet)

Gemini 3.1 Flash Live Preview does NOT yet support proactive audio features mentioned in some documentation. The migration guide confirms: "proactive audio features are not yet available."

---

## 8. ENVIRONMENT VARIABLES REFERENCE

| Variable | Used In | Purpose | Required |
|---|---|---|---|
| `GEMINI_API_KEY` | `server.js`, `ws-dev.js`, `chat/route.ts` | Authenticates all Gemini API calls | YES |
| `GEMINI_LIVE_MODEL` | `server.js`, `ws-dev.js` | Override live model string (default: `models/gemini-3.1-flash-live-preview`) | NO |
| `GEMINI_MODEL` | `chat/route.ts` | Override text chat model (default: `gemini-2.5-flash`) | NO |
| `FIREBASE_PROJECT_ID` | `firebase-admin.ts` | Firebase project | NO (graceful degradation) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `firebase-admin.ts` | Firebase service account email | NO |
| `FIREBASE_ADMIN_PRIVATE_KEY` | `firebase-admin.ts` | Firebase service account private key | NO |
| `WHATSAPP_NUMBER` | `tool/route.ts`, `chat/route.ts` | WhatsApp number for deep links (default: `15878974772`) | NO |
| `BOOKING_URL` | `tool/route.ts`, `chat/route.ts` | Google Calendar booking URL | NO |
| `PORT` | `server.js` | HTTP server port (default: `8080`) | NO |

---

## 9. DEPLOYMENT ARCHITECTURE

### Current (as of 2026-05-05)

```
Production: 
  Platform: Google Cloud Run (or Hostinger with custom Node.js)
  Entry: node server.js
  Port: 8080 (PORT env var)
  
  server.js handles:
  - Next.js HTTP (pages + API routes)
  - WebSocket proxy to Gemini Live API
  
Development:
  Terminal 1: npm run dev  (Next.js webpack on :3000)
  Terminal 2: npm run dev:ws  (ws-dev.js WebSocket on :3001)
  
  Browser connects to:
  - localhost === ws://localhost:3001/api/strategist/live
  - non-localhost === wss://{host}/api/strategist/live
```

### Previous Architecture (outdated — DO NOT follow `VOICE_AGENT_HANDOFF.md`)

The handoff document describes a split deployment where the voice proxy ran as a separate microservice on Render.com. This architecture was **abandoned** and merged back into `server.js`. The document is stale.

---

## 10. RECOMMENDED IMPLEMENTATION PLAN

Based on the analysis above, here are the recommended fixes in priority order for the next AI agent:

### Phase 1 — Critical Fixes (Bugs)

1. **Fix Bug #1 (goAway handler):**
   - In `useStrategistSession.ts`, add `data.goAway` check in `ws.onmessage`
   - Show UI notification with remaining time
   - Optionally call `stopSession()` when `timeLeft` reaches 0

2. **Fix Bug #3 (sendClientContent deprecation):**
   - Replace `clientContent` / `sendClientContent` calls for text turns with `sendRealtimeInput`
   - Per Gemini 3.1 migration guide: text inputs during conversations should use `send_realtime_input`
   - Format: `{ text: "Hello" }` instead of `{ turns: [...], turnComplete: true }`

3. **Fix Bug #4 (mediaChunks format):**
   - Change client to send: `{ realtimeInput: { audio: { mimeType: "audio/pcm;rate=16000", data: base64 } } }`
   - This eliminates the server conversion step and the fallback risk

4. **Fix Bug #2 (update VOICE_AGENT_HANDOFF.md):**
   - Rewrite the handoff doc to reflect the current single-server architecture

### Phase 2 — Missing Features

5. **Add transcription handling** in `useStrategistSession.ts`:
   ```typescript
   if (data.serverContent?.inputTranscription?.text) {
     setTranscript(prev => [...prev, { role: "user", text: data.serverContent.inputTranscription.text }]);
   }
   if (data.serverContent?.outputTranscription?.text) {
     // update agent transcript
   }
   ```

6. **Add real audio visualizer** using `AnalyserNode` instead of random heights

7. **Add reconnection logic** with exponential backoff

### Phase 3 — Cleanup

8. **Delete test files:** `direct-test.js`, `direct-test-2.js`, `run-test.js`, `test-client.js`

9. **Delete one-off script files** in root: all the `apply-*.js`, `fix-*.js`, `update-*.js` files are leftover one-time transformation scripts with no ongoing purpose

10. **Update `VOICE_AGENT_HANDOFF.md`** to reflect current architecture

---

## APPENDIX: Key API Format Reference

### Correct Current Production Format (SDK via server.js)

```typescript
// SETUP — sent once on WebSocket open
{
  type: "setup",
  config: {
    systemInstruction: { parts: [{ text: "..." }] },
    tools: [{ functionDeclarations: [...] }],
    responseModalities: ["AUDIO"],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: "Aoede" }
      }
    }
  }
}

// AUDIO INPUT — sent continuously from AudioWorklet
{
  realtimeInput: {
    mediaChunks: [{ mimeType: "audio/pcm;rate=16000", data: "<base64>" }]
    // NOTE: server.js converts this to: { audio: mediaChunks[0] }
  }
}

// TEXT TURN — sent for text messages / system alerts
{
  clientContent: {
    turns: [{ role: "user", parts: [{ text: "..." }] }],
    turnComplete: true
  }
}

// TOOL RESPONSE — sent after executing tool
{
  type: "tool_response",
  responses: [{ id: "<call_id>", name: "<func_name>", response: {...} }]
}
```

### Gemini SDK Expected Format (what server.js sends to Gemini)

```typescript
// Audio
session.sendRealtimeInput({ audio: { data: base64, mimeType: "audio/pcm;rate=16000" } })

// Text
session.sendClientContent({ turns: [...], turnComplete: true })

// Tool response
session.sendToolResponse({ functionResponses: [{ id, name, response }] })
```

---

*End of document — Generated 2026-05-05 by Claude Code analysis*
