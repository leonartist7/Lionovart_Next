# 🦁 Client Portal — Handoff & Working Agreement

**Read this before touching anything under `src/app/(app)/portal`, `src/app/api/portal`, `src/components/portal`, or `src/lib/portal`.**

It exists so a new session can be productive in minutes instead of re-deriving the architecture. Everything here is established fact about this codebase, not suggestion.

---

## 1. Where things stand

| Phase | State |
|---|---|
| **1 — Foundation** | ✅ merged (PR #63) — route groups, portal theming, auth, invites, app shell |
| **2 — Projects** | ✅ built (PR #65) — projects, milestones, derived progress, agency authoring |
| **3 — Board / Calendar / Assets** | ⬜ next |
| **4 — Collaboration** | ⬜ threads, pin-on-image annotation, approvals, realtime |
| **5 — Content / WhatsApp** | ⬜ composer, approvals, adapters |
| **6 — Polish** | ⬜ motion, a11y, anti-slop review |

The portal is a **client-facing workspace**: clients are invited by the studio (no public signup), see progress, approve work, and will annotate designs and message the studio. LIONOVART staff author everything **inside the portal** via agency-only controls — there is deliberately no second admin CRUD UI.

---

## 2. Get running in 3 commands

```bash
# 1. Emulators (Java is already on the box; do NOT create a Firebase project)
npx firebase emulators:start --only auth,firestore --project lionovart-dev

# 2. Dev server (pinned to webpack in package.json — that's intentional)
npm run dev

# 3. Prove it works
node scripts/portal-verify/verify.mjs
```

`.env.local` (gitignored) points the app at the emulators. If it's missing:

```
FIREBASE_PROJECT_ID=lionovart-dev
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
NOVA_ADMIN_EMAILS=leonartist.cs@gmail.com
NEXT_PUBLIC_FIREBASE_API_KEY=demo-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=lionovart-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=lionovart-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=lionovart-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:0000000000000000000000
```

`src/lib/firebase-admin.ts` switches to emulator mode automatically when those `*_EMULATOR_HOST` vars are set. Production is untouched.

---

## 3. The five rules that must not break

These are the ones where being wrong is **silent** — the app looks fine and is wrong.

1. **Agency gating is server-side. A client's browser must never RECEIVE agency controls.**
   Not `hidden`, not `display:none` — absent from the response. Decide with `roleAtLeast(role, "agency")` in the server component (see `projects/[projectId]/page.tsx`) or `<AgencyOnly>`. `verify.mjs` asserts this against raw HTML. **If you add an agency-only control, add its label to `AGENCY_MARKERS` in `scripts/portal-verify/verify.mjs`.**

2. **`internal` visibility is filtered in the data layer**, in `src/lib/portal/projects.ts` — never fetched-then-filtered in the component, and never hidden with CSS. A client hitting an internal record's URL gets a 404, not a 403 (a 403 confirms it exists).

3. **Progress is derived, never stored.** `deriveProgress()` computes it from milestones on every read. Never add a writable progress field.

4. **Never touch the marketing site.** `src/app/(site)/` and `src/components/sections/` are a separately-tuned, motion-heavy surface. The portal lives in `src/app/(app)/`. If a change seems to require editing `(site)`, stop and ask.

5. **Every `layoutId` needs a `useId()` suffix.** Two instances of a component sharing a Framer `layoutId` make the indicator fly across the screen. This already bit us once — see `ThemeToggle.tsx`.

---

## 4. Copy these patterns

Don't invent; there's a working example of everything.

| Building | Copy from |
|---|---|
| A UI primitive | `src/components/ui/button.tsx` (cva + `cn()` + `data-slot`), then `dialog.tsx` / `select.tsx` for Base UI parts |
| A workspace-scoped API route | `src/app/api/portal/[workspace]/projects/route.ts` |
| A nested API route | `.../projects/[projectId]/milestones/route.ts` |
| A guarded portal page | `src/app/(app)/portal/(secure)/[workspace]/projects/page.tsx` |
| Data access + derived fields | `src/lib/portal/projects.ts` |
| An agency-editable component | `src/components/portal/MilestoneRail.tsx` (one component, `editable` prop) |
| A form in a dialog | `src/components/portal/ProjectFormDialog.tsx` |

**Auth guards** (`src/lib/portal-auth.ts`) — always the first lines of a route:
```ts
const access = await requireWorkspace(req, workspaceSlug, "agency"); // or "viewer"
if (access instanceof NextResponse) return access;
// access.workspace.id, access.membership.role, access.session
```

**UI primitives available:** button, accordion, dialog, select, field, input, textarea, progress, badge, toast.
**Not yet built** (add only when a screen actually needs one): drawer, popover, tooltip, tabs, checkbox, switch, scroll-area, avatar, skeleton. Base UI ships all of them — see `node_modules/@base-ui/react/<name>/index.d.ts` for part names.

**Design constraints:** mobile-first (clients are on phones); `PRODUCT.md` forbids the generic-SaaS look — no floating cards, pastel gradients or hero-metric dashboards. Black/red/gold, Clash Display headings, DM Sans body. Red is the accent and stays **scarce** — it marks work in flight, not every chip.

---

## 5. Model split — who does what

The point is to spend the expensive model on judgment and the cheap one on pattern application.

**A task is safe for Sonnet 5 when both are true:**
1. There is a **named file to copy** from §4, and
2. There is a **command that proves it worked** (`verify.mjs`, or a new assertion added to it).

Missing either → escalate to Opus.

### Sonnet 5 handles
- New UI primitives from the Base UI parts list, following `button.tsx`
- CRUD API routes following the `requireWorkspace` template
- Screens following an existing page's structure
- Wiring existing components into new layouts
- Adding assertions to `verify.mjs`
- Copy, labels, empty states, formatting
- Mechanical a11y sweeps against a checklist (focus rings, labels, contrast measurement)

### Escalate to Opus
- **Anything security-shaped** — new guards, signed uploads, webhook signature verification, anything deciding what a client can see
- **New data model or schema changes**, and any migration
- **Ordering / concurrency** — fractional indexing, optimistic reorder, conflicting writes
- **Coordinate math and pointer handling** — the annotation pin model, drag physics
- **Realtime transport** — polling vs SSE, reconnection, host portability
- **Adapter/interface seams** — WhatsApp and social providers, where getting the shape wrong forces a rewrite later
- **Design/taste calls** — the anti-slop review, motion feel
- **Anything touching `(site)`, `globals.css` tokens, or root layouts**
- **A bug where the code looks right but behaves wrong**

### Per-phase recommendation

| Work | Model | Why |
|---|---|---|
| **Ph3** kanban reorder algorithm + drag architecture | Opus | fractional indices, concurrent moves, precision loss |
| **Ph3** board UI, cards | Sonnet | after Opus fixes the reorder contract |
| **Ph3** calendar month + agenda | Sonnet | pure layout |
| **Ph3** signed upload endpoint, mime/size limits | Opus | security |
| **Ph3** asset grid / list UI | Sonnet | pattern work |
| **Ph4** threads + comments data & API | Sonnet | mirrors projects exactly |
| **Ph4** pin annotation math + pointer handling | Opus | normalized-box math, hysteresis, touch |
| **Ph4** approvals | Sonnet | state machine, straightforward |
| **Ph4** realtime feed hook | Opus | host portability (see §6) |
| **Ph4** notification dispatcher | Sonnet | fan-out over existing email lib |
| **Ph5** post composer + per-platform previews | Sonnet | UI-heavy |
| **Ph5** provider adapter interfaces | Opus | the seam that decides future rework |
| **Ph5** WhatsApp webhook verification | Opus | signature security |
| **Ph5** Gemini idea generation | Sonnet | existing `gemini-client.ts` |
| **Ph6** reduced-motion / contrast sweeps | Sonnet | measurable checklist |
| **Ph6** anti-slop design review | Opus | taste |

### Handoff shape between sessions
When Opus finishes a design decision, it leaves the **contract** — types, function signatures, and the assertion — and Sonnet fills in the implementation against it. When Sonnet finishes, `verify.mjs` must pass and the diff should be reviewable in one sitting.

---

## 6. Decisions already made — don't relitigate

- **Server-only Firestore.** No client SDK reads, no `firestore.rules`. One security boundary: the session cookie. Every read goes through `adminDb` in a server component or guarded route.
- **Realtime = cursor polling, not held SSE.** The site runs on **Cloud Run (live) and Vercel (staging)**. A held server-side `onSnapshot` works on Cloud Run and gets killed by Vercel's function duration cap — same code, silently different behaviour. Plan: `useWorkspaceFeed(workspaceId, { since })` polling `GET /api/portal/[ws]/changes?since=`, ~3s visible / ~20s idle / paused when hidden. SSE stays an upgrade behind the same hook.
- **`server.js` only runs on Cloud Run.** It hosts the Nova voice WebSocket proxy. Vercel uses its own Next adapter and never executes it.
- **Clients only, invited.** No public signup. Invite tokens are stored as SHA-256 hashes, bound to the recipient's address, single-use.
- **Uploads → Firebase Storage** with server-issued signed PUT URLs, so bytes never route through Cloud Run. Cloudinary stays for marketing media.
- **Annotation pins are normalized 0–1** against the rendered image box, tied to a specific asset **version**.

---

## 7. Token discipline

What actually costs context, in order:

1. **Screenshots.** One image ≫ one assertion. Lead with `verify.mjs` (15 pass/fail lines); screenshot only to judge something genuinely visual, or at the end of a phase.
2. **Re-exploration.** This document is the map. Don't re-derive it.
3. **Full builds during iteration.** `npx tsc --noEmit` (~15s) catches nearly everything; save `npm run build` for pre-push.
4. **Reading whole files** when you need one function — target with `grep`/`sed -n`.

Verification ladder, cheapest first:
```bash
npx tsc --noEmit                       # types
node scripts/portal-verify/verify.mjs  # behaviour + security
npm run build                          # before pushing
node scripts/portal-verify/shots.mjs   # only when judging visuals
```

---

## 8. Known issues (pre-existing, not yours)

- **`npm run lint` is broken** — `eslint-plugin-react-hooks` → `zod-validation-error` needs `zod/v4/core`, and `zod` isn't installed. Fails identically at the pre-portal commit. Don't let it block you; fixing it is its own small PR.
- **`Dockerfile` uses `npm install`, not `npm ci`** — builds aren't reproducible despite the lockfile, and devDependencies land in the build image. This is why `playwright-core` is deliberately **not** a dependency: `scripts/portal-verify/shots.mjs` asks you to `npm i --no-save playwright-core` instead.
- **One hydration warning on the marketing homepage**, from `SplashScreen` mutating `document.body.style`. Pre-existing; verified identical before and after the route-group split.
- Chromium is at `/opt/pw-browsers/` — **never run `playwright install`**.
