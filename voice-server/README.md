# LIONOVART Voice Server

This is the standalone WebSocket proxy required for the Gemini Live API. Because Hostinger blocks WebSockets (`wss://`) on shared/cloud hosting via Phusion Passenger, this microservice must be hosted on a platform that natively supports WebSockets.

**We highly recommend deploying this folder to [Render.com](https://render.com) (Free Tier is perfect for this).**

## Deployment Instructions (Render.com)

1. Create a GitHub repository and push ONLY this `voice-server` folder to it (or just push your whole project, but tell Render to use the `voice-server` Root Directory).
2. Go to Render.com and create a **New Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Root Directory:** `voice-server` (if it's in your main repo)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Environment Variables (Required):
   - `GEMINI_API_KEY`: Paste your Gemini API key here.
6. Click **Deploy**.

## Linking to Hostinger

Once deployed on Render, Render will give you a URL like:
`https://lionovart-voice-server.onrender.com`

You need to update `src/components/ai-strategist/useStrategistSession.ts` in your main Next.js app to point to this new URL.

Change the `wsUrl` to:
```typescript
const wsUrl = "wss://lionovart-voice-server.onrender.com";
```
