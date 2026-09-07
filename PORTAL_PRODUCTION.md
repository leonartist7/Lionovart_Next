# 🚀 Client Portal — Going Live on Vercel

Everything the portal needs to run for real instead of against the Firebase
emulators. This is a checklist for **you** — it needs values from your Firebase
and Meta accounts that no session running in this sandbox has access to.

---

## 1. A real Firebase project

Dev uses a fake `lionovart-dev` project against local emulators — nothing
persists. Production needs an actual Firebase project with Firestore and
Storage enabled.

1. In the [Firebase console](https://console.firebase.google.com), create a
   project (or use an existing one) with **Firestore** and **Storage** turned on.
2. Project Settings → Service Accounts → **Generate new private key**. This
   downloads a JSON file with `project_id`, `client_email`, `private_key`.
3. Project Settings → General → your web app's config gives you the
   `NEXT_PUBLIC_FIREBASE_*` values (or add a new web app if none exists).

Set these in **Vercel → Project → Settings → Environment Variables**
(Production, and Preview if you want portal work testable on PR previews):

| Variable | From |
|---|---|
| `FIREBASE_PROJECT_ID` | service account JSON, `project_id` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | service account JSON, `client_email` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | service account JSON, `private_key` — **paste with the literal `\n` sequences intact**, `firebase-admin.ts` un-escapes them |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | web app config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | web app config (same project id) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | web app config, e.g. `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | web app config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | web app config |
| `NOVA_ADMIN_EMAILS` | comma-separated list of the emails that should get **agency** access — your real login email must be here |

**No extra IAM setup needed for signed URLs.** `assets.ts` and `messages.ts`
sign upload/download/media URLs using the service account's own private key
(`getSignedUrl` with `cert()` credentials signs locally) — that only needs
"Service Account Token Creator" if you're running on Application Default
Credentials with no key file, which isn't this setup.

4. In the Firebase console, go to **Firestore → Rules** and confirm you're on
   whatever default rules Firebase created — it doesn't matter what they say.
   **Every read and write goes through `adminDb` on the server**, authenticated
   by the service account, never the client SDK. Client-side Firestore rules
   are a live consideration for a future security model, not this one.

**How to know it worked:** sign in as an agency email, create a workspace,
invite yourself as a client at a real address, and open **Files** — upload an
image and confirm it appears after a refresh. That exercises Firestore, Auth,
and Storage signing in one pass.

---

## 2. WhatsApp Cloud API

This is the part that's mostly on Meta's clock, not code. The adapter
(`src/lib/portal/providers/whatsapp.ts`) already runs against a mock driver
that logs instead of sending — the portal is fully usable today without any
of this. Do this when you're ready for real messages to flow.

1. Create a Meta developer app at [developers.facebook.com](https://developers.facebook.com)
   with the **WhatsApp** product added.
2. Meta gives you a **test number** immediately (works before business
   verification, but only to a handful of allow-listed recipient numbers) — good
   enough to prove the whole pipe before going further.
3. From the app dashboard, grab:
   - **Temporary access token** (swap for a permanent one via System Users
     once verified — the temp one expires in 24h)
   - **Phone number ID**
   - **App secret** (App Settings → Basic)
4. Set in Vercel:

| Variable | From |
|---|---|
| `WHATSAPP_ACCESS_TOKEN` | the app dashboard |
| `WHATSAPP_PHONE_NUMBER_ID` | the app dashboard |
| `WHATSAPP_APP_SECRET` | App Settings → Basic |
| `WHATSAPP_VERIFY_TOKEN` | **you make this one up** — any random string, used only to prove to Meta that your webhook belongs to you |

`getWhatsAppProvider()` switches from the mock driver to the live one
automatically the moment `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`
are both set — no code change, no redeploy of anything but env vars.

5. In the app dashboard's Webhooks section, subscribe to the **messages**
   field and set the callback URL to `https://your-domain.com/api/webhooks/whatsapp`,
   with the verify token from above. Meta calls it once (a `GET`) to confirm
   you control it — that's the handshake `route.ts` answers.
6. For each client workspace you want bridged, set that client's own WhatsApp
   number (E.164, e.g. `15551234567`) as the workspace's `whatsappNumber` when
   creating it in `/admin/portal`.

**Business verification** (needed before you can message anyone who hasn't
messaged you first, and before the test-number recipient limit goes away) is
a Meta review process — weeks, not something this checklist shortens. Until
then, the test number plus its allow-listed recipients is genuinely real
WhatsApp traffic, just capped in who it can reach.

**How to know it worked:** text the studio's WhatsApp number from an
allow-listed phone. The message should appear in that workspace's Messages
page within a few seconds (the page polls every 4s). Reply from the portal as
agency — it should arrive as a real WhatsApp message on that phone.

---

## 3. Before clients see it

- **Delete `/portal/demo`** (`src/app/(app)/portal/demo/`) — it's an
  unauthenticated preview with no guard because it has nothing real to guard.
  Fine while building; not something to ship live. Nothing else imports it.
- **Re-run `node scripts/portal-verify/verify.mjs`** against the emulators one
  last time before any portal-touching deploy — it's the thing that actually
  proves a client's browser can't see agency controls or another client's data,
  not something to eyeball.
