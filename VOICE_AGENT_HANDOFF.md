# LIONOVART Voice Agent Handoff & Hostinger 503 Debug Guide

**Date:** April 15, 2026
**Status:** Local Development is 100% functional. Production on Hostinger is throwing a `503 Service Unavailable` error.

To the next AI Agent assisting Leon: Please read this document carefully before modifying the codebase. We have established a complex, dual-server architecture to support the Gemini Live API, and standard Next.js assumptions may break it.

---

## 1. Architecture Overview
We successfully integrated a real-time **Gemini Live API** voice agent into the Hero section (`MagneticOrb.tsx` -> `StrategistPanel.tsx` -> `ConversationView.tsx`).

Because the Gemini Live API requires a persistent bidirectional WebSocket for raw PCM audio, and Next.js API routes are stateless HTTP only, we built a custom WebSocket proxy to keep `GEMINI_API_KEY` secure:

*   **Production Server (`server.js`):** A unified custom Next.js server. It handles standard Next.js HTTP routing AND upgrades `/api/strategist/live` to a `ws` WebSocket server. This runs on Hostinger via `npm run start`.
*   **Local Dev Server (`ws-dev.js` + `next dev --webpack`):** We **cannot** use `node server.js` for local development because it forces Next.js 16 to use Turbopack, which *completely breaks Tailwind v4 and GSAP animations* in this specific project (sections render with `opacity: 0`). Therefore, local dev requires two terminals:
    1.  `npm run dev` (Frontend on port 3000)
    2.  `npm run dev:ws` (WebSocket proxy on port 3001)
*   **Audio Pipeline:** The frontend uses `AudioContext` and `public/audio-processor.js` (an AudioWorklet) to capture 16kHz mic audio and convert it to Base64 PCM for Gemini, and vice versa.
*   **Memory/Database:** The agent executes `save_lead_data` and `fetch_user_memory`. The WebSocket proxy securely forwards these to `src/app/api/strategist/tool/route.ts` to interact with Firebase.

---

## 2. Resolved Bugs (DO NOT REVERT THESE FIXES)
1.  **React Strict Mode Crash:** `useStrategistSession.ts` cleanup used to call `onClose()`, causing the panel to instantly close on mount. Fixed.
2.  **React Portal Event Bubbling:** Clicking the `MagneticOrb` bubbled the click to the `StrategistPanel` backdrop, instantly closing it. Fixed via `e.stopPropagation()` on the Orb.
3.  **Turbopack Invisible Content Bug:** Running custom `server.js` locally invoked Turbopack, breaking Tailwind v4 classes and causing GSAP/Framer Motion to freeze at `opacity: 0`. Fixed by separating local dev into `next dev --webpack` and `ws-dev.js`.
4.  **Mobile Safari Silence:** Added `audioCtx.resume()` after `getUserMedia` to prevent iOS from suspending the audio context. Added immediate "Thinking..." UI feedback and `alert()` dialogs to surface WebSocket connection errors on phones.

---

## 3. The Current Issue: Hostinger 503 Error
Local development works flawlessly. However, deploying `master` to Hostinger results in a `503 Service Unavailable` error for the entire site.

**What this means:** The `node server.js` process is crashing immediately on startup, or failing to bind to the port/socket provided by Hostinger's reverse proxy (Phusion Passenger / LiteSpeed). 

### Next Agent Debug Checklist for Hostinger:
1.  **Missing Dependencies:** Did Hostinger actually run `npm install`? We added `ws` and `@google/genai`. If they are missing, `server.js` throws `Cannot find module` and crashes instantly.
2.  **Named Pipe Binding:** Hostinger often passes a named pipe (string) to `process.env.PORT` (e.g., `/tmp/passenger.1234`). 
    *   *What I tried:* I updated `server.js` to NOT use `parseInt()` if the port is a string, and passed `port: undefined` to the Next.js constructor if it's a pipe. 
    *   *What might still be broken:* Does `server.listen(port)` fail if the socket file already exists from a previous crashed run? Does Passenger require a specific `hostname`? 
3.  **Environment Variables:** If Hostinger's environment is missing `.env.local` (expected), does `require("dotenv").config()` crash, or is there another required ENV variable missing that crashes `app.prepare()`?
4.  **Build Output:** Did `npm run build` actually succeed on Hostinger? If the `.next` folder is malformed or missing, `app.prepare()` will throw a fatal error. I added a `.catch()` to `app.prepare()` to log the error and `process.exit(1)`, but we need to see Hostinger's `stderr` logs to know what it is.

### How the Next Agent should help Leon:
1. Ask Leon to check the **Node.js Error Logs** in his Hostinger hPanel. The exact crash trace will be in `stderr.log` or the application logs.
2. If Hostinger logs show an error related to `ws` or `@google/genai`, instruct Leon to manually run `npm install` via Hostinger SSH or the panel.
3. If Hostinger logs show a `EADDRINUSE` or `EACCES` error on the port/pipe, adjust the `server.listen` logic in `server.js` to handle Passenger's socket cleanup, or revert production to `next start` and find a different hosting solution for the WebSocket proxy.

Good luck! You've got this.
