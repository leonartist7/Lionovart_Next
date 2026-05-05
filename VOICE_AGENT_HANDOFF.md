# LIONOVART Voice Agent — Architecture & Handoff Guide

**Last updated:** 2026-05-05  
**Status:** Gemini 3.1 Flash Live — fully functional, single-server architecture.

---

## Architecture Overview

Everything runs from a single Node.js server (`server.js`). There is no separate microservice or external voice proxy.

```
server.js (port 8080 in production, controlled by $PORT)
│
├── HTTP — Next.js pages + API routes
│     ├── /api/strategist/chat   (text chat, gemini-2.5-flash, SSE)
│     ├── /api/strategist/tool   (server-side tool execution via Firebase)
│     ├── /api/strategist/lead   (lead save to Firestore)
│     └── /api/health
│
└── WebSocket — Gemini Live API proxy
      └── All upgrade requests → wss proxy to Gemini Live
```

**Dev mode** runs two separate processes:

| Process | Command | Port |
|---|---|---|
| Next.js (webpack) | `npm run dev` | 3000 |
| WS proxy | `npm run dev:ws` | 3001 |

The browser auto-detects: `localhost` → `ws://localhost:3001`, everything else → `wss://{host}/api/strategist/live`.

---

## How the Voice Session Works

1. Browser opens WebSocket to the server
2. Browser sends `{ type: "setup", config: { ... } }` — server calls `ai.live.connect()`
3. Gemini confirms with `setupComplete` → server sends `{ type: "setup_complete" }` to browser
4. Browser starts streaming 16kHz PCM audio via `AudioWorklet` → base64 → `{ realtimeInput: { audio: { mimeType, data } } }`
5. Server passes audio directly: `liveSession.sendRealtimeInput(payload.realtimeInput)`
6. Gemini streams back 24kHz PCM audio → server forwards `serverContent` to browser
7. Browser decodes audio and queues it via `AudioBufferSourceNode` at 24kHz
8. Transcriptions (`inputAudioTranscription` + `outputAudioTranscription`) are enabled so the UI shows text
9. Tool calls from Gemini are forwarded to the browser; UI tools handled locally, server tools via `/api/strategist/tool`

---

## Key Files

| File | Purpose |
|---|---|
| `server.js` | Production server — Next.js + WebSocket proxy combined |
| `ws-dev.js` | Dev-only WebSocket proxy on :3001 |
| `public/audio-processor.js` | AudioWorklet — captures mic, downsamples to 16kHz PCM |
| `src/components/ai-strategist/useStrategistSession.ts` | Core React hook — session lifecycle, audio, tools |
| `src/lib/strategist-config.ts` | System prompt + tool declarations |
| `src/components/ai-strategist/StrategistPanel.tsx` | Modal panel wrapper |
| `src/components/ai-strategist/ConversationView.tsx` | Session UI (visualizer, transcript, lead form, handoff cards) |

---

## Changing the Model

Update the model string in **`server.js`**, line ~76:

```js
const model = process.env.GEMINI_LIVE_MODEL || "models/gemini-3.1-flash-live-preview";
```

Set `GEMINI_LIVE_MODEL` in the environment to override without touching code. The text chat model is separate — `GEMINI_MODEL` env var, used by `/api/strategist/chat`.

---

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `GEMINI_API_KEY` | YES | — | Authenticates all Gemini API calls |
| `GEMINI_LIVE_MODEL` | no | `models/gemini-3.1-flash-live-preview` | Live voice model |
| `GEMINI_MODEL` | no | `gemini-2.5-flash` | Text chat model |
| `FIREBASE_PROJECT_ID` | no | — | Firestore for lead data |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | no | — | Firebase service account |
| `FIREBASE_ADMIN_PRIVATE_KEY` | no | — | Firebase service account key |
| `WHATSAPP_NUMBER` | no | `15878974772` | WhatsApp deep link number |
| `BOOKING_URL` | no | `https://calendar.app.google/` | Calendar booking URL |
| `PORT` | no | `8080` | HTTP server port |

---

## Audio Format Reference

| Direction | Format | Rate | Encoding |
|---|---|---|---|
| Browser → Gemini | PCM 16-bit | 16 kHz | base64, little-endian |
| Gemini → Browser | PCM 16-bit | 24 kHz | base64, little-endian |
| Wire message (audio in) | `{ realtimeInput: { audio: { mimeType: "audio/pcm;rate=16000", data: "<base64>" } } }` | | |
| Wire message (text in) | `{ realtimeInput: { text: "..." } }` | | |

---

## Tool Architecture

Six tools are declared in `src/lib/strategist-config.ts`:

| Tool | Executed by |
|---|---|
| `update_screen_info` | Browser (React state update only) |
| `show_handoff_cards` | Browser (renders WhatsApp + booking cards) |
| `fetch_user_memory` | Server via `/api/strategist/tool` → Firestore |
| `save_lead_data` | Server via `/api/strategist/tool` → Firestore |
| `generate_whatsapp_link` | Server via `/api/strategist/tool` |
| `fetch_booking_link` | Server via `/api/strategist/tool` |

Flow: Gemini triggers tool → server forwards to browser → browser calls `/api/strategist/tool` → browser sends `{ type: "tool_response", responses }` back → server calls `liveSession.sendToolResponse({ functionResponses: responses })`.

---

## Known Limitations

- Proactive audio features (affective dialog) not yet available on `gemini-3.1-flash-live-preview`
- `VoiceVisualizer` bars are cosmetic (random heights), not driven by actual audio amplitude
- No automatic WebSocket reconnection if connection drops mid-session
- `contextWindowCompression` was intentionally removed — triggers UNIMPLEMENTED (Code 1008) on this model
