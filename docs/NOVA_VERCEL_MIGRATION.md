# NOVA on Vercel

## Refined implementation brief

Migrate the existing NOVA voice agent to the latest deployment of the `Lionovart_next` Vercel project. Preserve the studio's voice, language selection, Agent Studio configuration, audio interruption, tool calls, lead capture and conversation history. Replace the Cloud Run WebSocket dependency with a Vercel-compatible architecture. Keep permanent provider credentials server-side, constrain temporary credentials to the server-selected model/prompt/tools, protect conversation operations, and make connection failures recoverable. Verify application behavior locally and then repeat meaningful voice checks against a real Vercel deployment. Distinguish tests with simulated providers from live provider and deployment evidence.

Acceptance requires a real voice greeting, microphone input and audible responses, interruption, mute/unmute, authorized tools, reconnects with the same conversation, transcript persistence and a complete microphone shutdown. Production configuration, live Google availability and the deployed URL must be verified before calling the migration complete.

## Architecture implemented

1. The visitor accepts the privacy notice and grants microphone access.
2. `POST /api/strategist/session-token` runs as a short-lived Node function. It checks the origin, validates the requested locale, authenticates draft Studio calls, enforces a shared Firestore issuance quota, and builds the model configuration from the existing server-only NOVA modules.
3. The Gemini Developer API issues a single-use ephemeral token through `v1alpha`. The token locks the model, system instruction, tools, voice, transcription and session settings. Its connection window is one minute; its lifetime is limited to the original 45-minute session deadline. The response contains neither the permanent Gemini API key nor the system prompt.
4. The browser uses the installed Google Gen AI SDK to connect directly to Gemini's constrained Live WebSocket endpoint. Vercel functions do not carry audio or accept WebSocket upgrades.
5. Server tools and transcript/post-call operations use a separate HMAC receipt bound to the server-created conversation ID. Reconnects require that receipt and keep the same ID, language, draft mode and deadline.
6. The audio worklet continuously resamples microphone audio to 16 kHz PCM, preserving fractional position across blocks, and sends 20 ms packets. Playback uses the existing 24 kHz audio path. SDK events feed the existing NOVA UI and tool handling.
7. Conversation saving finishes before summary/dossier requests start. Server-side deferred notification/analytics work uses Next.js `after`; required database writes and dossier delivery are awaited. No long-running process is required on Vercel.

Cloud Run is no longer required for this browser flow. Firebase/Firestore and the Gemini Developer API remain backend services; moving the web host does not migrate their data or credentials. The SDK currently marks ephemeral-token support experimental and requires `v1alpha`; verify the installed SDK/model combination with a real live session during release.

## Required Vercel settings

Inspect the existing project first, preserving existing bindings. The project ID, team, latest deployment URL and environment values have not been readable from this session, so these are concrete deployment requirements, not claims that the remote settings were changed.

- Framework: Next.js. Root directory: the checkout root containing `package.json`.
- Install: `npm ci`. Build: `npm run build`. Use the Next.js output default; remove any custom Docker/Cloud Run start command or static output override.
- Use a Vercel-supported Node version compatible with Next.js 16 (Node 22 or 24; this workspace uses Node 24).
- Session-token function: Node runtime, 30 seconds. Tool, summary and dossier routes: Node runtime, up to 60 seconds, subject to the Vercel plan's limits. Audio duration is independent of function duration.
- Do not set the local regression fixture variables or preload script in Vercel.

Set the following **server-only** variables securely for the intended Production and Preview scopes. Reuse usable existing bindings; do not place their values in source, logs, chat or `NEXT_PUBLIC_*` variables.

| Name | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Gemini Developer API access, with Live API quota/billing and the configured model enabled |
| `NOVA_WS_SECRET` | At least 32 characters of cryptographically random signing material; retained name for existing installations, now signs conversation receipts |
| `FIREBASE_PROJECT_ID` | Existing Firestore project |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server service-account identity |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Corresponding service-account private key; existing initialization accepts escaped newlines |
| `WHATSAPP_NUMBER` | Real handoff destination for the WhatsApp link tool |
| `BOOKING_URL` | Real booking destination for the booking-link tool |

`GEMINI_LIVE_MODEL` optionally overrides the existing default. Agent Studio's `agent_config/live` model setting takes precedence. Reuse the existing configured model initially, then verify that it is available to this key and supports the required Live features. Do not guess a newer model identifier. `GEMINI_MODEL` controls text/summary generation; `GEMINI_DOSSIER_MODEL` controls dossier generation where configured.

Firebase client `NEXT_PUBLIC_FIREBASE_*` settings and `NOVA_ADMIN_EMAILS` remain necessary for the existing admin/portal UI. Add actual Vercel production/custom domains and only the intended preview domains to Firebase Authentication's authorized domains if admin login is used there. Do not authorize every Vercel tenant.

Optional integrations retain their existing settings: `RESEND_API_KEY` (plus verified sender/domain), `SLACK_WEBHOOK_URL`, Cal.com settings, PostHog and Google Places. Configure only the integrations used by the deployment. Mark missing optional features accurately; do not claim mail, booking or notifications are tested from a voice handshake.

### Shared quota and Firestore

Production token issuance requires working Firestore admin access. This keeps rate control shared across Vercel function instances. The `nova_live_quota` collection uses HMAC-hashed IP/window keys and limits issuance to ten grants per IP per ten-minute window, including reconnect grants. It contains no raw IP addresses or audio. Enable Firestore TTL on its `expiresAt` field to remove expired documents. Browser clients should not be permitted to read or write this server-owned collection. A quota-store failure rejects issuance with 503 rather than silently dropping protection.

This issuance limit does not replace Vercel Firewall/bot controls, provider budget alerts or live concurrency accounting. Retain appropriate provider budgets and tune the public endpoint's Vercel rate rule for actual traffic. The legacy `NOVA_WS_MAX_GLOBAL` setting applies only to the old Cloud Run proxy, not this direct connection path.

### Privacy and failure behavior

The first-use notice identifies microphone capture, Gemini processing and possible transcript/contact storage. Automatic CTA startup respects this notice. Permanent keys, temporary tokens, transcripts and raw provider error objects must never be logged. The public health route exposes only a configuration-presence boolean; it is not a live-provider readiness guarantee.

Invalid origin/draft access, forged or expired receipts, rate exhaustion and provider outages produce explicit HTTP failures. Failed startup stops audio capture and does not create an automatic restart loop. Manual stop cancels pending retries. UI notices do not promise a transcript was saved when persistence has not been confirmed.

## Repeatable local verification

Install with `npm ci`, then run:

```sh
node --test scripts/nova-live.test.mjs
npx tsc --noEmit --incremental false
npm run build
```

The local HTTP/browser harness needs a separate development process. Its credentials below are deliberately nonfunctional fixtures, and its provider preloader is explicitly guarded for local tests:

```sh
NOVA_LOCAL_TEST=1 \
GEMINI_API_KEY=local-test-not-a-real-api-key \
NOVA_WS_SECRET=local-regression-signing-secret-at-least-32-characters \
NEXT_TELEMETRY_DISABLED=1 NEXT_BUILD_DIR=.next-nova-test \
NODE_OPTIONS='--import ./scripts/fixtures/nova-provider.mjs' \
npm run dev -- --hostname localhost --port 3100
```

From another terminal:

```sh
node scripts/verify-nova-runtime.mjs
node scripts/verify-nova-browser.mjs
```

The browser harness requires Playwright and Chromium. CI already installs browser tooling for integrated checks; use its pinned versions when installing locally. `CHROMIUM_PATH`, `NOVA_TEST_BASE` and `NOVA_TEST_ARTIFACTS` can select local test tooling. Both fixture harnesses reject remote deployment targets. These tests mock Gemini token issuance and its WebSocket, use a fake microphone and a read-only information tool, and never deliberately send a real email, booking or notification. They do not establish live voice quality, account quota or deployed Firestore access.

## Deployed smoke command

Once deployment access resolves the real URL, run:

```sh
node scripts/verify-nova-deployment.mjs https://ACTUAL_DEPLOYMENT_HOST
node scripts/verify-nova-deployment.mjs https://ACTUAL_DEPLOYMENT_HOST --live
```

The second command deliberately consumes one short live Gemini session and verifies
an authenticated read-only information tool plus received PCM audio. It creates no
lead or booking and sends no email/notification. Microphone hardware, interruption
quality and real mobile browsers still require the checks below. Replace the host
with the actual URL from Vercel; no deployment URL is inferred from the project name.

## Deployed release checks

1. Resolve the actual Vercel project/team and latest deployment through authorized Vercel access; compare its commit with the migration branch before publishing. Preserve newer unrelated site changes.
2. Apply environment bindings to the correct scopes and deploy a preview from the migration branch. Inspect build/runtime logs without dumping environment values.
3. Verify HTTPS, `/api/health`, a real same-origin session grant, and the new broker's no-store response. A cross-origin call from another Vercel tenant must fail.
4. In a browser, accept privacy, allow the microphone, hear the greeting, speak and interrupt it, mute/unmute, exercise a read-only tool, and end the session. Check Chrome and a real Safari/iOS device; simulated Chromium microphone tests cannot certify real hardware/audio quality.
5. Verify one natural-language call per enabled language, including Japanese. Confirm Studio draft mode requires an authenticated admin.
6. Drop and restore the connection: the same conversation and original expiry must survive, without another microphone prompt. Check denial, offline startup, quota exhaustion and provider outage messages.
7. With an explicitly designated test contact, verify saved transcript/lead data. Test email/booking/notification side effects only against approved test destinations; read-only setup tests must not contact real leads.
8. Confirm provider usage/budget and Firestore quota TTL, then promote the tested deployment. Retain the previous production deployment for rollback. A rollback of this migration must restore the client and broker together, since the old proxy-token format is different.

## Access status at implementation time

The requested Vercel plugin exposes no tools in this chat, no local Vercel project link or CLI credentials are present, and deployment API requests are denied by this cloud environment's network policy. Required documentation/API domains were saved to the environment configuration draft, preserving the existing font domains; the draft tool reports that publication is required to apply them. No Vercel settings, credentials or deployments have been changed, and no live Gemini/Firebase/notification result is claimed without subsequent evidence.

## Verification evidence — October 16, 2026

- Production `next build --webpack`: passed, including TypeScript and route generation.
- Standard `npm start`: served the built application and health route with HTTP 200. With no real credentials, the production session broker correctly returned 503.
- 15 NOVA policy/transport/audio regression tests: passed.
- 12 HTTP checks against the real Next.js routes with the local Google token fixture: passed.
- Seven Chromium scenarios with a fake microphone and mocked Gemini WebSocket: passed, covering consent, audio capture/playback, a read-only authenticated tool, mute/unmute, reconnect continuity, shutdown, startup failure and mobile microphone denial.
- ESLint on all 27 changed/new JavaScript and TypeScript files: passed. `git diff --check`: passed.
- No live Gemini, deployed Firestore, real-device Safari, external email/booking or Vercel deployment test has run. Those remain release gates requiring the actual project access and configuration.
- Local browser evidence is saved in `/workspace/nova-verification`; its screenshots are test-fixture evidence, not hosted deployment screenshots.
