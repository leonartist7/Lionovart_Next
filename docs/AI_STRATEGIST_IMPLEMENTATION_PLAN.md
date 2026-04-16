# LIONOVART AI STRATEGIST — Verified Implementation Plan

> **Generated:** 2026-04-14
> **Status:** Pre-implementation — All compatibility checks passed
> **Delivery:** 5 modules, sequential, pause after each for review

---

## TABLE OF CONTENTS

1. [Compatibility Audit Results](#1-compatibility-audit-results)
2. [Spec Corrections & Deviations](#2-spec-corrections--deviations)
3. [Architecture Overview](#3-architecture-overview)
4. [Critical Architecture Decision: Chat API vs Live API](#4-critical-architecture-decision-chat-api-vs-live-api)
5. [File Map](#5-file-map)
6. [Dependencies](#6-dependencies)
7. [Environment Variables](#7-environment-variables)
8. [CSS & Design Token Additions](#8-css--design-token-additions)
9. [Module 1: Magnetic Orb Button](#9-module-1-magnetic-orb-button)
10. [Module 2: Glass Panel Container](#10-module-2-glass-panel-container)
11. [Module 3: Chat Interface](#11-module-3-chat-interface)
12. [Module 4: Gemini Integration](#12-module-4-gemini-integration)
13. [Module 5: Hand-off Cards & Persistence](#13-module-5-hand-off-cards--persistence)
14. [Scroll Lock Fix (Bonus)](#14-scroll-lock-fix-bonus)
15. [Known Risks & Mitigations](#15-known-risks--mitigations)
16. [Testing Checklist](#16-testing-checklist)

---

## 1. COMPATIBILITY AUDIT RESULTS

Every technology in the stack was verified against the actual installed versions.
All checks passed. No blockers found.

### Stack Versions (Confirmed from package.json + node_modules)

| Technology | Version | Notes |
|---|---|---|
| Next.js | **16.2.1** | NOT 14 as spec states |
| React | **19.2.4** | Concurrent features available |
| React DOM | **19.2.4** | `createPortal` works with FM context |
| Tailwind CSS | **4.2.2** | v4 — NO config file, uses `@theme inline` |
| Framer Motion | **12.38.0** | All required APIs confirmed exported |
| Lucide React | **1.7.0** | All 10 required icons confirmed available |
| GSAP | **3.14.2** | Used for carousel + scroll bridge |
| Lenis | **0.0.47** | `stop()`/`start()` confirmed in API |

### Framer Motion v12 API Verification

| API | Status | Used in Project |
|---|---|---|
| `motion` | Exported | 19 files |
| `AnimatePresence` | Exported | 7 files |
| `useInView` | Exported | 7 files |
| `useMotionValue` | Exported | 4 files |
| `useTransform` | Exported | 6 files |
| `useSpring` | Exported | 4 files |
| `LayoutGroup` | Exported | 0 files (available) |
| `layoutId` prop | Working | 2 files, 14 usages |

**React 19 compatibility:** Framer Motion v12.38.0 has explicit React 19 support
(ref cleanup functions, `props.ref` fallback in `PopChild.mjs`). `peerDependencies`
includes `^19.0.0`.

**Portal compatibility:** `AnimatePresence` uses React context (`PresenceContext`,
`LayoutGroupContext`). `createPortal` preserves React context. Shared layout
animations via `layoutId` across portal boundaries work correctly because
`getBoundingClientRect` provides viewport-relative coordinates.

### Lucide React Icons Verification

All 10 required icons confirmed in `node_modules/lucide-react/dist/esm/icons/`:

| Icon | Export Name | Already Used |
|---|---|---|
| Microphone | `Mic` | No |
| Mic muted | `MicOff` | No |
| Close | `X` | Yes (Comparison.tsx, interactive-bento-gallery.tsx) |
| Send | `Send` | No |
| Chat | `MessageSquare` | No |
| Phone | `Phone` | No |
| Calendar | `Calendar` | No |
| Keyboard | `Keyboard` | No |
| Speaker | `Volume2` | Yes (LumaShowcase.tsx) |
| Sparkles | `Sparkles` | Yes (liquid-metal-button.tsx) |

**Import pattern (matches project convention):**
```tsx
import { Mic, MicOff, X, Send, Calendar, Keyboard, Volume2 } from "lucide-react";
```

### Next.js 16 Route Handler Verification

| Feature | Status |
|---|---|
| `app/api/*/route.ts` pattern | Unchanged, fully supported |
| `GET`/`POST` named exports | Work exactly the same |
| `NextRequest`/`NextResponse` | Unchanged |
| `await req.json()` body parsing | Unchanged |
| **`params` in dynamic routes** | **NOW a Promise — must `await`** |
| **`cookies()`/`headers()`** | **NOW async-only — must `await`** |
| Streaming (ReadableStream) | Fully supported natively |
| Server-Sent Events (SSE) | Supported via ReadableStream |
| **WebSocket** | **NOT supported in route handlers** |

**Breaking change to watch for:** Dynamic route params are now `Promise<...>`.
Any route with `[id]` segments must `await params`.

### Tailwind v4 Pattern Verification

| What | Where to Define | Utility Generated |
|---|---|---|
| New color | `--color-X` in `@theme inline` | `bg-X`, `text-X`, `border-X` |
| New animation | `--animate-X` + `@keyframes` in `@theme inline` | `animate-X` |
| Keyframes (inline style only) | Top-level `@keyframes` | None (use `style={}`) |
| Custom utility class | `@utility name { ... }` | `className="name"` |
| CSS custom property | `:root { ... }` | Use via `var(--name)` |
| Backdrop filter | Built-in, no config | `backdrop-blur-*`, `backdrop-saturate-*` |

### Lenis Scroll Lock Verification

| Question | Answer |
|---|---|
| `lenis.stop()` / `lenis.start()` exist? | Yes, confirmed in types and source |
| `useLenis()` exposes them? | Yes, returns full Lenis instance |
| GSAP bridge breaks on stop/start? | No. `lenis.raf()` is no-op when stopped |
| Scroll position preserved? | Yes. Only velocity is zeroed |
| Existing scroll-lock patterns? | **Bug found:** Portfolio.tsx uses `overflow:hidden` only — Lenis keeps scrolling |

**Resolution:** Create a `useScrollLock` hook that calls BOTH `lenis.stop()` AND
`document.body.style.overflow = 'hidden'`. This fixes the existing bug and
prevents the same issue in the AI Strategist panel.

---

## 2. SPEC CORRECTIONS & DEVIATIONS

These corrections prevent build failures and runtime errors.

| # | Spec Says | Reality | Resolution |
|---|---|---|---|
| 1 | Next.js 14 (App Router) | **Next.js 16.2.1** | Use Next.js 16 patterns. `params` must be awaited in dynamic routes |
| 2 | Tailwind CSS config file (`tailwind.config.ts`) | **Tailwind v4** — no config file. All tokens via `@theme inline` in `globals.css` | Add tokens to `globals.css` using `@theme inline` syntax |
| 3 | Bebas Neue (display) / Outfit (body) fonts | **Clash Display** (6 weights, variable `--font-clash-display`) | Use `font-clash` utility class, `var(--font-heading)` for inline styles |
| 4 | Brand red `#E63946` | **`#e5192a`** (`--color-brand-red`) | Use existing `--color-brand-red` / `bg-brand-red` |
| 5 | Brand red deep `#C62D39` | **`#db0000`** (`--color-brand-red-secondary`) | Use existing token |
| 6 | Brand black `#0A0A0A` | **`#181818`** (`--color-bg-dark`) / root `#0d0d0d` | Use existing `bg-bg-dark` |
| 7 | Brand gold `#D4A843` | **`#f0c917`** (`--color-brand-gold`) | Use existing token |
| 8 | "Light spark" in hero center | **No light spark exists** — hero has: video bg, cycling heading, subtitle, CTA buttons, 3D carousel, trust badges | Place orb between CTA buttons and 3D carousel |
| 9 | Gemini 3.1 Flash Live model | **Does not exist** — verified against `@google/genai` SDK v1.50.1 docs | Use `gemini-live-2.5-flash-preview` (configurable via env var) |
| 10 | Firebase installed | **Not installed** — no `firebase` or `firebase-admin` in `node_modules` | `npm install firebase firebase-admin` |
| 11 | `@google/genai` installed | **Not installed** | `npm install @google/genai` |
| 12 | WebSocket handler via Firebase Functions | Next.js Route Handlers **do not support WebSocket** | Use `ai.chats.create()` + SSE streaming (see Architecture Decision below) |
| 13 | `NEXT_PUBLIC_GEMINI_API_KEY` | SDK warns: "Avoid exposing API keys in client-side code" | Keep API key server-side only, proxy through Route Handler |

---

## 3. ARCHITECTURE OVERVIEW

```
src/
├── components/
│   └── ai-strategist/
│       ├── MagneticOrb.tsx           # Module 1 — Pulsing glass orb button
│       ├── StrategistPanel.tsx        # Module 2 — Glass morphism container
│       ├── ConversationView.tsx       # Module 3 — Chat messages + input
│       ├── VoiceVisualizer.tsx        # Module 3 — Audio waveform bars
│       ├── HandoffCards.tsx           # Module 5 — WhatsApp + Meet CTAs
│       └── useStrategistSession.ts    # Module 4 — Session lifecycle hook
├── hooks/
│   └── useScrollLock.ts              # Reusable Lenis + body scroll lock
├── app/
│   └── api/
│       └── strategist/
│           ├── chat/route.ts          # Module 4 — Gemini chat proxy (SSE)
│           └── lead/route.ts          # Module 5 — Firestore lead save
├── lib/
│   ├── gemini-client.ts              # Module 4 — Client-side fetch wrapper
│   ├── strategist-config.ts          # Module 4 — System prompt + tool defs
│   ├── firebase.ts                   # Module 5 — Firebase client init
│   └── firebase-admin.ts             # Module 5 — Firebase Admin (server only)
```

### Integration Point in HeroTop.tsx

The orb is inserted between the CTA buttons and the 3D carousel:

```
Line 482-497:  <motion.div> CTAs </motion.div>
               ↓
               INSERT: <MagneticOrb />
               ↓
Line 503-510:  <motion.div> <Carousel3D /> </motion.div>
```

The `StrategistPanel` renders via `createPortal` to `document.body` to avoid
z-index and overflow issues with the hero section.

---

## 4. CRITICAL ARCHITECTURE DECISION: CHAT API VS LIVE API

### Why NOT the Live API (`ai.live.connect()`)

The original spec calls for Gemini Live API via WebSocket. After thorough
verification, this is **architecturally incompatible** with the deployment model:

1. **Next.js Route Handlers are request-response.** They cannot upgrade to
   WebSocket connections. The docs explicitly state: "WebSockets won't work
   because the connection closes on timeout, or after the response is generated."

2. **The Live API requires a persistent WebSocket.** The `Session` object holds
   a `conn: WebSocket` reference. There is no way to store this across
   separate HTTP requests in a serverless environment.

3. **API key exposure.** The Live API embeds the API key in the WebSocket URL:
   `?key=${apiKey}`. Running it client-side exposes the key. Ephemeral tokens
   exist but are experimental (`v1alpha` only).

### What We Use Instead: `ai.chats.create()` + `sendMessageStream()`

| Feature | `ai.chats.create()` | `ai.live.connect()` |
|---|---|---|
| Protocol | HTTP (request-response) | WebSocket (persistent) |
| Streaming | `sendMessageStream()` via SSE | Real-time bidirectional |
| Function calling | Full support via `tools` | Supported |
| History management | Built-in (`getHistory()`) | Server-managed |
| Works with Route Handlers | **Yes** | **No** |
| Works serverless | **Yes** | **No** |
| Voice I/O | No (handle client-side) | Yes |
| API key hidden | **Yes** (server-side only) | Requires ephemeral tokens |

### Data Flow

```
Browser (Client)                      Next.js Server (Route Handler)
┌──────────────────┐                  ┌─────────────────────────────┐
│                  │   POST /api/     │                             │
│  ConversationView│  strategist/chat │  const ai = new GoogleGenAI │
│                  │ ──────────────→  │    ({apiKey: process.env    │
│  {               │  {message,       │     .GEMINI_API_KEY})       │
│    message list  │   history[]}     │                             │
│    voice input   │                  │  const chat = ai.chats      │
│    text input    │  SSE stream ←──  │    .create({model, config,  │
│  }               │  text/event-     │      tools, history})       │
│                  │  stream          │                             │
│                  │                  │  for await (chunk of        │
│                  │                  │    chat.sendMessageStream())│
│                  │                  │    → stream to client       │
│                  │                  │                             │
│                  │                  │  Handle function calls:     │
│                  │                  │   save_lead_data → Firestore│
│                  │                  │   show_handoff_cards → SSE  │
└──────────────────┘                  └─────────────────────────────┘
```

### Voice Architecture (Handled Client-Side)

Since the Chat API is text-only, voice is handled entirely in the browser:

1. **Speech-to-Text:** Browser's `SpeechRecognition` API (Web Speech API)
   captures user speech and converts to text. Supported in Chrome, Edge, Safari.
   Falls back to text input if unavailable.

2. **Text-to-Speech:** Browser's `SpeechSynthesis` API reads agent responses
   aloud. Voice selection prioritizes natural-sounding voices matching the
   detected language.

3. **Fallback:** If neither API is available (Firefox, some mobile browsers),
   the UI defaults to text-only mode with no voice toggle shown.

This approach:
- Keeps the API key secure (server-side only)
- Works with standard Next.js Route Handlers (no WebSocket needed)
- Provides voice I/O without the Live API
- Supports multilingual via browser speech APIs (language auto-detection)

### Future Upgrade Path to Live API

When ready for true real-time voice (lower latency, Gemini-native voice):
1. Deploy a separate WebSocket server (Express + `ws`) alongside Next.js
2. Or use Google's experimental ephemeral token flow (when it exits alpha)
3. The system prompt, function tools, and UI components are all reusable

---

## 5. FILE MAP

### New Files (13 total)

| File | Module | Purpose |
|---|---|---|
| `src/components/ai-strategist/MagneticOrb.tsx` | 1 | Pulsing glass orb button in hero |
| `src/components/ai-strategist/StrategistPanel.tsx` | 2 | Glass morphism panel container |
| `src/components/ai-strategist/ConversationView.tsx` | 3 | Chat messages + voice/text input |
| `src/components/ai-strategist/VoiceVisualizer.tsx` | 3 | Audio waveform animation bars |
| `src/components/ai-strategist/HandoffCards.tsx` | 5 | WhatsApp + Google Meet CTAs |
| `src/components/ai-strategist/useStrategistSession.ts` | 4 | React hook — session lifecycle |
| `src/hooks/useScrollLock.ts` | 2 | Reusable Lenis + body scroll lock |
| `src/lib/gemini-client.ts` | 4 | Client-side fetch wrapper for chat API |
| `src/lib/strategist-config.ts` | 4 | System prompt + function tool definitions |
| `src/lib/firebase.ts` | 5 | Firebase client SDK initialization |
| `src/lib/firebase-admin.ts` | 5 | Firebase Admin SDK (server-side only) |
| `src/app/api/strategist/chat/route.ts` | 4 | Gemini chat proxy, SSE streaming |
| `src/app/api/strategist/lead/route.ts` | 5 | Firestore lead persistence |

### Modified Files (3 total)

| File | Changes |
|---|---|
| `src/app/globals.css` | Add strategist CSS variables, `@keyframes orb-pulse`, glass utilities |
| `src/components/sections/HeroTop.tsx` | Import + render `MagneticOrb`, state for panel open/close |
| `package.json` | New dependencies (via `npm install`) |

### NOT Modified

| File | Reason |
|---|---|
| `src/app/layout.tsx` | No providers needed at root level |
| `src/app/page.tsx` | Panel renders via portal from HeroTop, not page-level |
| `tsconfig.json` | Path aliases already correct |
| `next.config.ts` | No new image domains needed |

---

## 6. DEPENDENCIES

### Install Command

```bash
npm install @google/genai firebase firebase-admin
```

### Dependency Analysis

| Package | Purpose | Size Impact | Server/Client |
|---|---|---|---|
| `@google/genai` | Gemini API SDK (chat, streaming, function calling) | ~200KB | Server only |
| `firebase` | Firebase client SDK (future client-side features) | ~800KB (tree-shakeable) | Client |
| `firebase-admin` | Firestore writes, Admin SDK | ~2MB | Server only |

**Note:** `firebase-admin` is server-only. It will be imported only in Route
Handlers and `lib/firebase-admin.ts`. Next.js tree-shakes it out of client bundles.

### Already Installed (No Action Needed)

| Package | Used For |
|---|---|
| `framer-motion` ^12.38.0 | All animations, `AnimatePresence`, `layoutId` |
| `lucide-react` ^1.7.0 | Icons (Mic, X, Send, Calendar, etc.) |
| `clsx` + `tailwind-merge` | `cn()` utility for class merging |

---

## 7. ENVIRONMENT VARIABLES

Create `.env.local` in project root with:

```env
# ═══════════════════════════════════════════════════════════
# LIONOVART AI STRATEGIST — Environment Variables
# ═══════════════════════════════════════════════════════════

# Google AI — Gemini API (SERVER-SIDE ONLY — not NEXT_PUBLIC_)
GEMINI_API_KEY=

# Gemini model identifier (change when newer model is available)
# Verified working: gemini-2.5-flash (for chat API)
# Alternative: gemini-live-2.5-flash-preview (for future Live API)
GEMINI_MODEL=gemini-2.5-flash

# Firebase Admin (SERVER-SIDE ONLY — for Firestore writes)
FIREBASE_PROJECT_ID=lionovart
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Firebase Client (for future client-side features)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lionovart.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lionovart
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lionovart.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Business Configuration
WHATSAPP_NUMBER=15878974772
BOOKING_URL=https://calendar.app.google/YOUR_APPOINTMENT_SLUG

# Lead Notification (for future Gmail API integration)
LEAD_NOTIFICATION_EMAIL=leon@lionovart.com
```

### Security Notes

- `GEMINI_API_KEY` is NOT prefixed with `NEXT_PUBLIC_` — it stays server-side only.
- `FIREBASE_ADMIN_PRIVATE_KEY` must be the full private key string with `\n` for
  newlines (or base64 encoded). Never commit this to git.
- The `.env.local` file is already in `.gitignore` by default in Next.js projects.

---

## 8. CSS & DESIGN TOKEN ADDITIONS

All additions go in `src/app/globals.css`. Three insertion points:

### 8a. Add to `:root { ... }` block (after line 165, before closing `}`)

```css
  /* AI Strategist panel */
  --strategist-bg: rgba(13, 13, 13, 0.85);
  --strategist-border: rgba(255, 255, 255, 0.1);
  --strategist-glow: rgba(229, 25, 42, 0.06);
  --strategist-overlay: rgba(0, 0, 0, 0.6);
```

### 8b. Add to `@theme inline { ... }` block (before closing `}` on line 125)

```css
  /* --- AI Strategist colors --- */
  --color-strategist-bg: var(--strategist-bg);
  --color-strategist-border: var(--strategist-border);
  --color-strategist-glow: var(--strategist-glow);
  --color-strategist-overlay: var(--strategist-overlay);

  /* --- Orb pulse animation (3-second cycle) --- */
  --animate-orb-pulse: orb-pulse 3s ease-in-out infinite;

  @keyframes orb-pulse {
    0%, 100% {
      box-shadow:
        0 0 60px rgba(229, 25, 42, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -2px 4px rgba(0, 0, 0, 0.3);
    }
    50% {
      box-shadow:
        0 0 80px rgba(229, 25, 42, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -2px 4px rgba(0, 0, 0, 0.3);
    }
  }

  /* --- Typing indicator animation --- */
  --animate-typing-dot: typing-dot 1.4s ease-in-out infinite;

  @keyframes typing-dot {
    0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
    30% { opacity: 1; transform: translateY(-4px); }
  }
```

### 8c. Add after `@utility no-scrollbar { ... }` block (after line 59)

```css
@utility glass-panel {
  background: var(--strategist-bg);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid var(--strategist-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 80px var(--strategist-glow);
}
```

### 8d. Reduced motion override (add at end of file)

```css
@media (prefers-reduced-motion: reduce) {
  .animate-orb-pulse {
    animation: none !important;
  }
}
```

---

## 9. MODULE 1: MAGNETIC ORB BUTTON

### File: `src/components/ai-strategist/MagneticOrb.tsx`

### Component API

```tsx
interface MagneticOrbProps {
  onOpen: () => void;
}
```

### Implementation Details

**Structure:**
- `motion.button` as the root element
- Absolute/relative positioning to sit between CTAs and carousel in the hero flow
- Not truly "absolute" — it's a flex child in the hero's `flex-col` layout

**Dimensions:**
- Desktop: `w-[100px] h-[100px]`
- Mobile (< 768px): `w-[80px] h-[80px]`
- Border radius: `rounded-full`

**Visual Layers (bottom to top):**
1. **Outer glow ring:** `box-shadow: 0 0 60px rgba(229,25,42,0.4)` — pulsed via
   `animate-orb-pulse` (defined in globals.css `@theme inline`)
2. **Glass body:** `background: rgba(10, 10, 10, 0.6)` +
   `backdrop-filter: blur(20px)` + `border: 1px solid rgba(255,255,255,0.12)`
3. **Inner highlight:** `box-shadow: inset 0 1px 0 rgba(255,255,255,0.3)` (top edge)
4. **Inner shadow:** `box-shadow: inset 0 -2px 4px rgba(0,0,0,0.3)` (bottom depth)
5. **Icon:** Lucide `Mic`, 24px, white, centered

**Pulse Animation:**
- 3-second cycle via `animate-orb-pulse` utility class
- Box-shadow opacity varies 0.4 → 0.6 → 0.4
- Respects `prefers-reduced-motion` (CSS media query disables animation)

**Hover State (Framer Motion):**
- `whileHover={{ scale: 1.08 }}` with `transition={{ type: "spring", stiffness: 400, damping: 25 }}`
- Glow intensifies (toggled via state → inline style override)
- Tooltip appears above via `AnimatePresence` + `motion.div`:
  - Text: "Free brand audit -- 3 min -- Voice or text"
  - Glass background matching orb style
  - `initial={{ opacity: 0, y: 8 }}` → `animate={{ opacity: 1, y: 0 }}`
  - Arrow/caret pointing down toward orb

**Click Handler:**
- Calls `props.onOpen()` which sets panel state to open in parent
- No expand animation on the orb itself (the panel opens separately via portal)

**Accessibility:**
- `aria-label="Open AI brand strategist"`
- `role="button"` (implicit from `<button>`)
- `tabIndex={0}` (implicit from `<button>`)
- `onKeyDown`: Enter and Space trigger click (native button behavior)
- Focus ring: `focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark`

**Reduced Motion:**
- Detect via `useEffect` + `window.matchMedia("(prefers-reduced-motion: reduce)")`
  (matching the existing pattern in `HeroCycling.tsx` lines 99-106)
- When active: no pulse animation, hover scale 1.02 instead of 1.08, no tooltip animation

### HeroTop.tsx Modifications

```tsx
// New imports
import { useState } from "react";  // already imported
import MagneticOrb from "@/components/ai-strategist/MagneticOrb";
import StrategistPanel from "@/components/ai-strategist/StrategistPanel";

// New state (inside HeroTop component)
const [strategistOpen, setStrategistOpen] = useState(false);

// Insert after CTA buttons motion.div (line 497), before carousel motion.div (line 503):
<motion.div
  variants={itemVariants}
  className="flex items-center justify-center mt-4"
>
  <MagneticOrb onOpen={() => setStrategistOpen(true)} />
</motion.div>

// Add at end of component, before closing </section> (line 533):
<StrategistPanel
  isOpen={strategistOpen}
  onClose={() => setStrategistOpen(false)}
/>
```

---

## 10. MODULE 2: GLASS PANEL CONTAINER

### File: `src/components/ai-strategist/StrategistPanel.tsx`

### Component API

```tsx
interface StrategistPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Implementation Details

**Rendering:** Uses `createPortal(jsx, document.body)` to render outside the hero's
overflow/z-index context. The portal is rendered only on client side (guard with
`useState` + `useEffect` for SSR safety).

**Overlay:**
- `motion.div` covering viewport: `fixed inset-0 z-[9998]`
- `background: rgba(0,0,0,0.6)` + `backdrop-filter: blur(8px)`
- Click to close (onClick → `onClose()`)
- Animation: `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}`

**Panel:**
- `motion.div` centered: `fixed z-[9999]`
- Desktop: `w-[560px] h-[680px]`, centered via `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`
- Mobile (< 768px): `inset-0` (full screen)
- Uses `glass-panel` utility class (defined in globals.css)
- `border-radius: 24px` desktop, `0` mobile
- Additional shadows for premium depth:
  ```css
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),    /* deep drop shadow */
    0 0 0 1px rgba(255, 255, 255, 0.05),       /* hairline border */
    inset 0 1px 0 rgba(255, 255, 255, 0.08),   /* top highlight */
    inset 0 0 80px rgba(229, 25, 42, 0.06);    /* subtle red inner glow */
  ```

**Open Animation:**
- `initial={{ opacity: 0, scale: 0.9, y: 20 }}`
- `animate={{ opacity: 1, scale: 1, y: 0 }}`
- `transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}`

**Close Animation:**
- `exit={{ opacity: 0, scale: 0.95, y: 10 }}`
- `transition={{ duration: 0.3, ease: [0.4, 0, 1, 1] }}`

**Close Mechanisms (3):**
1. X button: top-right corner, `w-10 h-10` hit area, Lucide `X` icon 20px,
   `text-white/60 hover:text-white` transition
2. ESC key: `useEffect` with `keydown` listener, guarded by `isOpen`
3. Backdrop click: `onClick` on overlay div (with `e.stopPropagation()` on panel)

**Scroll Lock:**
- Uses `useScrollLock(isOpen)` hook (see Section 14)
- Prevents Lenis smooth scrolling AND native scroll behind the panel

**Body Layout Shift Prevention:**
- When panel opens on desktop, the scrollbar disappears due to `overflow: hidden`.
  This causes a layout shift. Mitigate by adding `padding-right` equal to
  scrollbar width when locking.
- On mobile, scrollbar is hidden by default, so no shift.

**State Machine:**
- Internal state managed by the session hook (`useStrategistSession`)
- Five states: `idle`, `listening`, `thinking`, `speaking`, `handoff`
- State is passed down to `ConversationView` as a prop
- The panel itself doesn't change appearance based on state — that's the
  conversation view's responsibility

**Cleanup on Unmount:**
- Close Gemini session (abort any pending requests)
- Stop audio playback and speech recognition
- Release microphone MediaStream
- Restore scroll

### File: `src/hooks/useScrollLock.ts`

```tsx
"use client";

import { useEffect } from "react";
import { useLenis } from "@studio-freight/react-lenis";

export function useScrollLock(locked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    if (locked) {
      lenis.stop();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      lenis.start();
    }

    return () => {
      document.body.style.overflow = "";
      if (lenis.isStopped) {
        lenis.start();
      }
    };
  }, [locked, lenis]);
}
```

---

## 11. MODULE 3: CHAT INTERFACE

### File: `src/components/ai-strategist/ConversationView.tsx`

### Layout (Inside StrategistPanel)

Three vertical sections, flex column, `h-full`:

```
┌──────────────────────────────────────────┐
│  HEADER (56px)                           │
│  [Lion icon] LIONOVART AI Strategist     │
│  [Voice|Text toggle]    [EN ▾]           │
├──────────────────────────────────────────┤
│                                          │
│  MESSAGE AREA (flex-grow, scrollable)    │
│                                          │
│        [Agent bubble]                    │
│                    [User bubble]         │
│        [Agent bubble]                    │
│        [Typing indicator...]             │
│                                          │
├──────────────────────────────────────────┤
│  INPUT AREA (~100px)                     │
│                                          │
│  Voice mode:  [  🎤  Hold to speak  ]    │
│  Text mode:   [Type a message...] [→]    │
│                                          │
│  [Switch to text] or [Switch to voice]   │
└──────────────────────────────────────────┘
```

### Message Types

```tsx
interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
}
```

### Header Bar
- Left: Small lion icon (use `/images/favicon.svg` already in public) + "LIONOVART AI Strategist" in `font-clash` uppercase, `text-[13px]`, `tracking-widest`
- Right: Mode toggle — two pills "Voice" / "Text" with active state highlight
- Below toggle: Language indicator — small text "EN" / "FR" / "ES" etc., updates when language detected

### Message Bubbles

**User bubbles (right-aligned):**
- `bg-brand-red text-white`
- `rounded-2xl rounded-br-sm` (tail on bottom-right)
- `max-w-[80%] ml-auto`
- `px-4 py-2.5`
- `text-[14px] leading-relaxed`
- Timestamp: `text-[11px] text-white/40 mt-1 text-right`

**Agent bubbles (left-aligned):**
- `bg-white/[0.06] text-white`
- `rounded-2xl rounded-bl-sm` (tail on bottom-left)
- `max-w-[80%] mr-auto`
- `px-4 py-2.5`
- `text-[14px] leading-relaxed`
- `backdrop-filter: blur(8px)` for subtle glass effect
- Timestamp: `text-[11px] text-white/40 mt-1 text-left`

**Typing indicator:**
- Three dots, staggered animation delay (0s, 0.2s, 0.4s)
- Uses `animate-typing-dot` class (defined in globals.css)
- Appears when `state === 'thinking'`
- Same bubble style as agent messages

### Auto-scroll
- `useRef<HTMLDivElement>` on message container
- `useEffect` triggers `scrollIntoView({ behavior: "smooth" })` on the
  last message element whenever `messages.length` changes
- Scroll indicator appears if user has scrolled up (arrow down button)

### Voice Mode (Default)

**Mic Button:**
- Centered, `w-16 h-16` (64px)
- Idle: `bg-brand-red/20 border-2 border-brand-red` with `Mic` icon white
- Active (recording): `bg-brand-red` solid, pulsing ring animation,
  `Mic` icon white, text changes to "Tap to stop"
- Click-to-toggle mode (press to start, press again to stop)
- Uses `SpeechRecognition` API (Web Speech API) for speech-to-text

**Waveform Visualization (VoiceVisualizer.tsx):**
- When user speaks: 5 vertical bars pulsing with audio amplitude
  - Uses `AudioContext` + `AnalyserNode` + `getByteFrequencyData`
  - Each bar maps to a frequency band
  - Heights animated via `transform: scaleY()` on `requestAnimationFrame`
  - Pure div implementation (no canvas) for simplicity
- When agent speaks: circular pulse ring expanding outward
  - CSS animation: `@keyframes speaking-ring` — scale 1→2, opacity 1→0

**SpeechRecognition Setup:**
```tsx
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = true;
recognition.lang = detectedLanguage || "en-US";
```

### Text Mode

**Toggle:** "Type instead" link below mic button, or "Use voice" below text input.
Switches internal `inputMode` state between `"voice"` and `"text"`.

**Text Input:**
- `<textarea>` with auto-grow (height adjusts to content, max 4 lines)
- `bg-white/[0.06] border border-white/10 rounded-2xl`
- `px-4 py-3 text-white text-[14px]`
- `placeholder="Type a message..."`
- Resize: `resize-none`
- Send button: appears when text is non-empty, Lucide `Send` icon,
  `bg-brand-red rounded-full w-9 h-9` positioned inside the input area
- Enter to send, Shift+Enter for newline

### Text-to-Speech (Agent Responses)

```tsx
const utterance = new SpeechSynthesisUtterance(agentMessage);
utterance.lang = detectedLanguage || "en-US";
utterance.rate = 1.0;
utterance.pitch = 1.0;
// Prefer natural voices
const voices = speechSynthesis.getVoices();
const preferred = voices.find(v => v.lang.startsWith(detectedLanguage) && v.name.includes("Natural"));
if (preferred) utterance.voice = preferred;
speechSynthesis.speak(utterance);
```

Only speaks when in voice mode. Silent in text mode.

### Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---|---|---|---|---|
| SpeechRecognition | Yes | Yes (webkit) | No | Yes |
| SpeechSynthesis | Yes | Yes | Yes | Yes |
| AudioContext | Yes | Yes | Yes | Yes |

**Fallback:** If `SpeechRecognition` is unavailable (Firefox), auto-switch to
text mode and hide the voice toggle entirely.

---

## 12. MODULE 4: GEMINI INTEGRATION

### File: `src/lib/strategist-config.ts`

Contains the system prompt and function tool definitions. Exported as constants.

**System Prompt:** Exactly as specified in the original spec (the full multi-paragraph
prompt with personality rules, conversation flow phases, objection handling, etc.).

**Function Tool Declarations:**

```tsx
import { Type } from "@google/genai";

export const STRATEGIST_TOOLS = [
  {
    functionDeclarations: [
      {
        name: "save_lead_data",
        description: "Save the lead's contact information to our CRM",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Lead's name" },
            contact: { type: Type.STRING, description: "Email or phone number" },
            contact_type: { type: Type.STRING, description: "Type of contact: email, phone, or whatsapp" },
            project_summary: { type: Type.STRING, description: "Brief summary of their project needs" },
            language_detected: { type: Type.STRING, description: "ISO language code detected from conversation" },
            urgency: { type: Type.STRING, description: "Urgency level: low, medium, or high" },
          },
          required: ["name", "contact", "contact_type", "project_summary"],
        },
      },
      {
        name: "detect_user_location",
        description: "Detect the user's location based on their IP address",
        parameters: { type: Type.OBJECT, properties: {} },
      },
      {
        name: "generate_whatsapp_link",
        description: "Generate a WhatsApp deep link with pre-filled message",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            project_summary: { type: Type.STRING },
            language: { type: Type.STRING },
          },
          required: ["name", "project_summary"],
        },
      },
      {
        name: "fetch_booking_link",
        description: "Get the Google Calendar booking link for scheduling a call",
        parameters: {
          type: Type.OBJECT,
          properties: {
            service_type: { type: Type.STRING, description: "Optional service type" },
          },
        },
      },
      {
        name: "show_handoff_cards",
        description: "Display WhatsApp and booking cards to the user",
        parameters: {
          type: Type.OBJECT,
          properties: {
            whatsapp_url: { type: Type.STRING },
            booking_url: { type: Type.STRING },
            summary_message: { type: Type.STRING },
          },
          required: ["whatsapp_url", "booking_url"],
        },
      },
    ],
  },
];
```

### File: `src/app/api/strategist/chat/route.ts`

**Route Handler:** `POST` — receives user message + conversation history,
returns SSE stream of agent responses.

**Request Body:**
```tsx
interface ChatRequest {
  message: string;
  history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
}
```

**Response:** `text/event-stream` (SSE) with events:
- `data: {"type":"text","content":"..."}` — streaming text chunks
- `data: {"type":"function_call","name":"...","args":{...}}` — function call notification
- `data: {"type":"function_result","name":"...","result":{...}}` — function result
- `data: {"type":"handoff","whatsapp_url":"...","booking_url":"..."}` — trigger handoff UI
- `data: {"type":"done"}` — stream complete
- `data: {"type":"error","message":"..."}` — error

**Function Call Handling (Server-Side):**

When Gemini calls a function, the route handler:

1. Parses the `FunctionCall` from the response
2. Executes the function server-side:
   - `save_lead_data` → writes to Firestore via `firebase-admin`
   - `detect_user_location` → fetches from `ipapi.co/json` (IP geolocation)
   - `generate_whatsapp_link` → constructs `wa.me/15878974772?text=...`
   - `fetch_booking_link` → returns `process.env.BOOKING_URL`
   - `show_handoff_cards` → sends SSE event to trigger UI transition
3. Sends the function result back to the chat via `FunctionResponse`
4. Continues streaming the model's response after receiving the function result

**Important:** The Chat API with `sendMessageStream()` does NOT support
automatic function calling in the streaming variant in all SDK versions.
We handle it manually: detect function calls in the stream, execute them,
then send a follow-up message with the function response.

### File: `src/lib/gemini-client.ts`

**Client-side wrapper.** Provides a simple API for the conversation view:

```tsx
export async function* sendMessage(
  message: string,
  history: Message[]
): AsyncGenerator<StreamEvent> {
  const response = await fetch("/api/strategist/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: formatHistory(history) }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  // Parse SSE events from the stream
  // Yield StreamEvent objects for each parsed event
  // ...
}
```

### File: `src/components/ai-strategist/useStrategistSession.ts`

**React hook** managing the entire session lifecycle:

```tsx
interface UseStrategistSessionReturn {
  state: "idle" | "listening" | "thinking" | "speaking" | "handoff";
  messages: Message[];
  sendText: (text: string) => Promise<void>;
  startVoice: () => void;
  stopVoice: () => void;
  inputMode: "voice" | "text";
  setInputMode: (mode: "voice" | "text") => void;
  detectedLanguage: string;
  handoffData: HandoffData | null;
  close: () => void;
}
```

**State transitions:**
```
idle ──(user starts typing/speaking)──→ listening
listening ──(user sends message)──→ thinking
thinking ──(agent starts responding)──→ speaking
speaking ──(agent finishes)──→ idle
any ──(show_handoff_cards called)──→ handoff
```

**Session timer:** 8-minute max duration. At 7:30, a flag is set that causes
the next agent response to wrap up gracefully.

**Transcript accumulation:** All messages are collected in state. When the
session ends (close, handoff, or timeout), the transcript can be sent to
the lead persistence endpoint.

---

## 13. MODULE 5: HAND-OFF CARDS & PERSISTENCE

### File: `src/components/ai-strategist/HandoffCards.tsx`

### Layout

Two cards, flex row on desktop, stacked on mobile:

```
┌─────────────────────┐  ┌─────────────────────┐
│  ◉ WhatsApp         │  │  ◉ Book a Call      │
│                     │  │                     │
│  Continue on        │  │  Book a Call with   │
│  WhatsApp           │  │  Leon               │
│                     │  │                     │
│  Pick up the        │  │  30 minutes.        │
│  conversation with  │  │  No pressure.       │
│  our team instantly.│  │  Honest strategic   │
│  Your context is    │  │  advice from our    │
│  already prepared.  │  │  founder.           │
│                     │  │                     │
│  [ Open WhatsApp ]  │  │  [Schedule Meeting] │
│                     │  │                     │
│  green accent       │  │  red accent         │
└─────────────────────┘  └─────────────────────┘

"Your info is saved. Leon will personally review
this within 24 hours."
```

### Card Styling

**WhatsApp Card:**
- `border-l-4 border-[#25D366]` (WhatsApp green)
- Icon: Custom WhatsApp SVG or Lucide `MessageSquare` with green tint
- Button: `bg-[#25D366] text-white hover:bg-[#20BD5A]`
- Opens: `https://wa.me/15878974772?text=...` (pre-filled with lead context)

**Meet Card:**
- `border-l-4 border-brand-red`
- Icon: Lucide `Calendar` with red tint
- Button: `bg-brand-red text-white hover:bg-brand-red-secondary`
- Opens: `process.env.NEXT_PUBLIC_BOOKING_URL` or passed from handoff data

### Animation

Cards animate in with 150ms stagger:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.15 * index, ease: [0.16, 1, 0.3, 1] }}
>
```

### File: `src/lib/firebase-admin.ts`

```tsx
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  : getApps()[0];

export const db = getFirestore(app);
```

### File: `src/app/api/strategist/lead/route.ts`

**Route Handler:** `POST` — saves lead data to Firestore.

**Firestore Schema:**
```tsx
interface LeadDocument {
  name: string;
  contact: string;
  contact_type: "email" | "phone" | "whatsapp";
  country_code: string;
  language: string;
  project_summary: string;
  full_transcript: Array<{
    role: "user" | "agent";
    content: string;
    timestamp: number; // Unix ms
  }>;
  outcome: "whatsapp" | "meeting" | "abandoned" | "email_only";
  urgency: "low" | "medium" | "high";
  created_at: FirebaseFirestore.FieldValue; // serverTimestamp()
  user_agent: string;
}
```

**Collection:** `leads`

**Security:** All writes go through the server-side Route Handler using
`firebase-admin`. No client-side reads or writes. Firestore security rules
should deny all client access to the `leads` collection.

### Deferred to Follow-Up Pass

These features are scoped OUT of Module 5 v1 to reduce complexity:

| Feature | Reason for Deferral |
|---|---|
| reCAPTCHA Enterprise | Requires Google Cloud project setup + API key |
| Rate limiting (3/IP/24h) | Requires Firestore counter documents + IP tracking |
| Gmail API notifications | Requires OAuth2 setup + refresh token management |
| Max conversation timer | Low risk — implement after core flow works |
| Email confirmation to lead | Requires Gmail API (deferred) |

---

## 14. SCROLL LOCK FIX (BONUS)

### Existing Bug Found During Audit

**`src/components/sections/Portfolio.tsx` (lines 545-550)** uses
`document.body.style.overflow = "hidden"` to prevent scrolling when a modal
opens. However, Lenis intercepts wheel/touch events via its own `VirtualScroll`
class, completely bypassing `overflow: hidden`. The background continues to
scroll smoothly behind the modal.

**The same bug exists in:**
- `src/components/blocks/expandable-bento-grid.tsx` — No scroll locking at all
- `src/components/blocks/interactive-bento-gallery.tsx` — No scroll locking at all

### Fix

The `useScrollLock` hook created for the Strategist panel (Section 10) should
also be applied to these three existing components. This is a free bug fix
that improves the overall UX.

**After Module 2 is delivered**, the following files should be updated:
1. `Portfolio.tsx` — Replace `document.body.style.overflow` with `useScrollLock(activeIdx !== null)`
2. `expandable-bento-grid.tsx` — Add `useScrollLock(selectedProject !== null)`
3. `interactive-bento-gallery.tsx` — Add `useScrollLock(selectedItem !== null)`

---

## 15. KNOWN RISKS & MITIGATIONS

### Risk 1: SpeechRecognition Browser Support

**Risk:** Firefox does not support the Web Speech API (`SpeechRecognition`).
~8% of desktop users use Firefox.

**Mitigation:** Auto-detect support on mount. If unavailable:
- Default to text-only mode
- Hide the Voice/Text toggle
- Show no mic button
- All functionality works via text input

### Risk 2: Gemini API Rate Limits

**Risk:** Free tier Gemini API has rate limits (15 RPM for gemini-2.5-flash).
Multiple concurrent visitors could hit limits.

**Mitigation:**
- Queue messages server-side if rate limited (retry with exponential backoff)
- Show "One moment..." in the UI during retries
- Monitor usage and upgrade API plan if needed

### Risk 3: Gemini Function Calling Reliability

**Risk:** Function calling with streaming (`sendMessageStream`) may not always
return function calls in a predictable position in the stream.

**Mitigation:**
- Use non-streaming `sendMessage()` for the first implementation
- Switch to streaming only after verifying function call handling works reliably
- The SSE layer can still stream text to the client while waiting for the
  complete response server-side

### Risk 4: Firebase Admin SDK Bundle Size

**Risk:** `firebase-admin` is ~2MB. Could affect cold start times.

**Mitigation:**
- `firebase-admin` is only imported in server-side Route Handlers
- Next.js tree-shakes it out of client bundles automatically
- For Route Handler cold starts, this is acceptable (< 500ms added)

### Risk 5: Lenis + Modal Focus Trap

**Risk:** When the panel opens, keyboard users need focus trapped inside the
panel. Tab key should not escape to the page behind.

**Mitigation:** Implement a simple focus trap:
- On panel open, focus the first focusable element inside the panel
- On Tab at the last element, wrap to the first element
- On Shift+Tab at the first element, wrap to the last element
- On panel close, restore focus to the orb button

### Risk 6: Model Identifier Changes

**Risk:** Google may deprecate `gemini-2.5-flash` or release newer models.

**Mitigation:** Model ID is in `.env.local` as `GEMINI_MODEL`. Change one
env var to switch models without code changes.

---

## 16. TESTING CHECKLIST

### Module 1: Magnetic Orb
- [ ] Orb renders at correct position (between CTAs and carousel)
- [ ] Orb is 100px on desktop, 80px on mobile
- [ ] Pulse animation runs at 3-second cycle
- [ ] Hover: scale 1.08x with spring, glow intensifies
- [ ] Hover: tooltip appears above with glass background
- [ ] Click: triggers panel open
- [ ] Keyboard: Enter/Space activates
- [ ] Focus ring visible on keyboard navigation
- [ ] Reduced motion: no pulse, simpler hover
- [ ] No layout shift when orb appears

### Module 2: Glass Panel
- [ ] Panel opens with smooth animation (0.5s, cubic-bezier)
- [ ] Panel is 560x680 on desktop, fullscreen on mobile
- [ ] Glass morphism visible (blur, border, inner glow)
- [ ] Close via X button
- [ ] Close via ESC key
- [ ] Close via backdrop click
- [ ] Smooth close animation (reverse of open)
- [ ] Background scroll is locked (Lenis + native)
- [ ] Scroll restores correctly after close
- [ ] No layout shift when panel opens
- [ ] Focus trapped inside panel
- [ ] Focus returns to orb on close

### Module 3: Chat Interface
- [ ] Header shows lion icon + title
- [ ] Voice/Text toggle switches modes
- [ ] Voice mode: mic button renders centered
- [ ] Voice mode: SpeechRecognition captures speech (Chrome/Safari/Edge)
- [ ] Voice mode: waveform visualization animates with audio
- [ ] Voice mode: falls back to text on Firefox
- [ ] Text mode: textarea auto-grows
- [ ] Text mode: send button appears when text present
- [ ] Text mode: Enter sends, Shift+Enter newlines
- [ ] User bubbles: red, right-aligned
- [ ] Agent bubbles: glass, left-aligned
- [ ] Typing indicator shows during thinking state
- [ ] Auto-scroll to newest message
- [ ] Messages persist within session

### Module 4: Gemini Integration
- [ ] First message gets agent greeting response
- [ ] Multilingual detection works (test EN, FR, ES)
- [ ] Agent responds in detected language
- [ ] Function calling: save_lead_data saves to Firestore
- [ ] Function calling: detect_user_location returns country
- [ ] Function calling: generate_whatsapp_link returns valid URL
- [ ] Function calling: fetch_booking_link returns booking URL
- [ ] Function calling: show_handoff_cards transitions to handoff state
- [ ] API key not exposed in browser (check Network tab)
- [ ] SSE streaming works — text appears progressively
- [ ] Error handling: network failure shows user-friendly message
- [ ] Error handling: API rate limit handled gracefully

### Module 5: Hand-off Cards
- [ ] Two cards render side-by-side on desktop
- [ ] Cards stack vertically on mobile
- [ ] WhatsApp card: green accent, correct link with +15878974772
- [ ] Meet card: red accent, correct booking URL
- [ ] Cards animate in with 150ms stagger
- [ ] Confirmation text appears below cards
- [ ] WhatsApp link opens in new tab with pre-filled message
- [ ] Booking link opens in new tab
- [ ] Lead data saved to Firestore with full transcript
- [ ] Lead data includes: name, contact, language, country, summary

### Cross-Cutting
- [ ] Works on Chrome desktop
- [ ] Works on Safari desktop
- [ ] Works on Firefox desktop (text-only mode)
- [ ] Works on iOS Safari mobile
- [ ] Works on Android Chrome mobile
- [ ] Reduced motion preferences respected throughout
- [ ] Screen reader announces messages via `aria-live` region
- [ ] No memory leaks (WebSocket closes, streams abort, refs cleaned)
- [ ] No console errors in production build
- [ ] `npm run build` succeeds without TypeScript errors

---

## DELIVERY SCHEDULE

| Module | Scope | Pause for Review |
|---|---|---|
| **1** | Magnetic Orb — visible in hero, animated, accessible | Yes |
| **2** | Glass Panel — opens/closes with placeholder content | Yes |
| **3** | Chat Interface — static UI, voice/text toggle, no AI | Yes |
| **4** | Gemini integration — real conversations, function calling | Yes |
| **5** | Hand-off cards + Firestore persistence | Yes |

Each module is self-contained and testable independently.
Modules 1-3 work without any API keys or backend services.
Module 4 requires `GEMINI_API_KEY`.
Module 5 requires Firebase credentials.

---

*End of implementation plan.*
