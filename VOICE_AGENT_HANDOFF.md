# LIONOVART Voice Agent Handoff & Architecture Guide

**Date:** April 17, 2026
**Status:** Gemini 3.1 Flash Live Voice Agent is fully functional via a Split-Architecture deployment.

To the next AI Agent assisting Leon: Please read this document carefully. We encountered severe `503 Service Unavailable` errors when trying to run WebSockets on Hostinger, which required a complete architectural overhaul.

---

## 1. The Architectural Split (Why we did it)
The Gemini Live API requires a persistent, bidirectional WebSocket connection (`wss://`) to stream raw PCM audio in real-time. 

**The Hostinger Problem:** Hostinger Shared/Cloud hosting uses Phusion Passenger. Passenger explicitly blocks/drops incoming WebSocket `Upgrade` headers. Any attempt to run the WebSocket proxy on Hostinger resulted in a hard `Code: 1006` Abnormal Closure. Furthermore, Passenger's strict startup timeouts caused Next.js to throw 503 errors when we tried to bundle the proxy into the main Next.js server.

**The Solution:** We split the frontend and the Voice Proxy backend.
1. **The Voice Proxy (Backend):** The `voice-server` folder in this repository was extracted into its own standalone Node.js microservice and deployed to **Render.com**. Render natively supports WebSockets. This microservice securely holds the `GEMINI_API_KEY` and passes the live audio stream back and forth to Gemini.
2. **The Frontend (Hostinger):** The main Next.js website remains on Hostinger. In `useStrategistSession.ts`, the frontend explicitly opens its WebSocket connection to the Render URL (`wss://lionovart-voice.onrender.com`).

---

## 2. Server Tools & Firebase
Because the Voice Server was moved to Render, it can no longer directly access the local Next.js API routes or Firebase Admin logic without duplicating all the code and keys. 

**How tools work now:**
When Gemini triggers a tool call (like `save_lead_data` or `fetch_booking_link`), the Render Voice Server forwards the raw tool call payload down the WebSocket to the client. The client (`useStrategistSession.ts`) intercepts the tool call, makes a standard HTTP POST request to Hostinger's `/api/strategist/tool`, receives the database response, and sends it back up the WebSocket to Gemini.

---

## 3. Hostinger 503 Debugging ("The Glass Window")
If Hostinger ever throws a `503 Service Unavailable` error again, it means `app.prepare()` crashed while Passenger was booting Next.js. Because Passenger hides the logs, we built a **"Glass Window" Logger** in `server.js`.

If Next.js crashes on boot, `server.js` catches the fatal error and writes the entire stack trace to a public text file.
**To view the error:** Simply navigate to `https://lionovart.com/crash.txt`.

### Known Causes for 503s on Hostinger:
*   **Next.js Cache Corruption:** If `next.config.ts` was modified (e.g., trying to use `output: "standalone"` with Turbopack), the `.next` folder gets corrupted. The fix is to run `npm run build` in the Hostinger terminal to flush the cache.
*   **Passenger Socket Timeouts:** `server.js` is specifically written to call `.listen()` *before* `app.prepare()` so Passenger doesn't time out. DO NOT change the boot sequence in `server.js` or Passenger will 503.

---

## 4. Upgrading Models
The system currently uses **Gemini 3.1 Flash Live Preview**. 
If Google deprecates this model or releases a newer one, you must update the model string in:
1. `voice-server/index.js`
2. Redeploy the Render service via the Render dashboard.

You do not need to redeploy Hostinger to change the model, as the model logic is entirely handled by Render.
