# 🗺️ Client Portal — Page Specs

Every screen still showing **"Soon"**, specced to the point where it can be built without re-deciding anything. Read `PORTAL_HANDOFF.md` first for the architecture, rules, and patterns to copy.

Flip `ready: true` in `src/lib/portal/nav.ts` **only when a page actually works** — a dimmed "Soon" is honest, a link into a broken screen is not.

---

## ⚖️ One IA decision to make first

The nav currently shows every section to every client. But a **brand-identity client has no use for a Content tab**, and a content-retainer client barely looks at Projects.

**Recommendation:** derive the visible nav from the workspace's project kinds — show Content only when the workspace has a `content` or `marketing` project, Calendar only when something is scheduled. `PORTAL_NAV` already has the shape for this; it needs a filter, not a rewrite. A client seeing four relevant tabs beats seven where three are permanently empty.

Decide this before building Content, because it changes whether Content is a nav item or a section inside a project. **This is a call for Leon, not a model.**

---

## 📋 Board — `/portal/[ws]/projects/[id]/board`

**Purpose.** Where work actually moves. The client watches; the studio drags.

| | |
|---|---|
| **Client sees** | Read-only columns, `client`-visibility tasks only. No drag. |
| **Studio sees** | Drag between columns, add/edit tasks, toggle a task's visibility |
| **Data** | `workspaces/{ws}/projects/{p}/tasks` — already typed in `types.ts` |
| **Columns** | `backlog · in_progress · review · approved · done` (from `TASK_COLUMNS`) |

**The hard part — ordering.** `order` is a **fractional index**: to drop between two cards, write `(prev.order + next.order) / 2` and touch **one** document. Never renumber a column. Two edge cases decide whether this is correct or quietly broken:
- Float precision collapses after ~50 midpoint inserts between the same pair. Detect `prev.order === next.order` (or a gap below `1e-6`) and rebalance that column once.
- Two people dragging at once can produce identical orders. Tie-break deterministically on document id so both clients render the same sequence.

**Mobile.** Horizontal column scroll with snap, one column mostly filling the viewport. Long-press to pick up, auto-scroll near the edges. **Drag must not fight page scroll** — this is the reason `touch-action` exists; get it wrong and the board is unusable on a phone.

**Verify.** Drag on a real phone → reload → order held. Keyboard: focus a card, move it with arrows, confirm it persisted. Client `PATCH` on a task → 403. An `internal` task absent from the client's HTML.

🔴 **Opus:** reorder algorithm, drag/touch behaviour · 🟢 **Sonnet:** card, column, task dialog

---

## ✅ Approvals — `/portal/[ws]/approvals`

**Purpose.** The single "what needs me" queue. For most clients this is the most valuable screen in the portal, and the reason they open it at all.

| | |
|---|---|
| **Client sees** | Everything pending their decision, newest first; each with a preview, context, and two actions |
| **Studio sees** | The same queue plus who it's waiting on and how long |
| **Data** | `workspaces/{ws}/approvals` — already typed |
| **Targets** | `asset` (a design), `post` (social), `milestone` (a stage sign-off) |

**Design decisions already made:**
- **"Request changes" requires a note.** A rejection with no reason costs a whole round trip. Enforce it server-side, not just in the form.
- Approving records `decidedBy` + `decidedAt`. Decisions are **append-only history**, never overwritten — "who approved this and when" is the question that matters six months later.
- Requires role `approver` or above. A `commenter` sees the queue but not the buttons — gated server-side, as always.

**This feeds the Overview.** The "awaiting you" slot on the dashboard is currently empty and wires to exactly this query. Build the query once in `src/lib/portal/approvals.ts` and call it from both.

**Empty state.** "Nothing needs you right now." — that's a *good* state, say it warmly rather than showing a sad empty box.

🟢 **Sonnet**, with the note-required rule enforced in the route.

---

## 🖼️ Files — `/portal/[ws]/assets` and `/[assetId]`

**Purpose.** Where work is delivered and where feedback gets pinned. Build the viewer knowing annotation lands on top of it in Phase 4.

| | |
|---|---|
| **Client sees** | Grid of deliverables, version history, download, upload their own material |
| **Studio sees** | Same, plus delete and "request approval on this version" |
| **Data** | `workspaces/{ws}/assets` + `assets/{id}/versions` subcollection |

**Upload path.** Client asks `/api/portal/[ws]/assets/sign-upload` → gets a **v4 signed PUT URL** → uploads **direct to Firebase Storage**. Bytes never route through Cloud Run. Server enforces the mime allowlist and the 25 MB cap when it issues the URL — never trust the client's declared type.

**Versions are the point.** v2 does not replace v1; it stacks. The viewer shows "v3 of 3" with a way back. Phase 4's pins attach to a **specific version**, so old feedback stays legible against the frame it was written on.

**Mobile.** Upload comes from the camera roll — that's the primary path, not a desktop file picker. Show real upload progress; a spinner with no percentage on a 20 MB file over cellular feels broken.

**Viewer.** Fit-to-screen by default, pinch to zoom, double-tap to reset. Leave a clean coordinate space: Phase 4 needs pointer position **normalized to the rendered image box**, not the viewport.

🔴 **Opus:** signed uploads, mime/size enforcement, viewer coordinate space · 🟢 **Sonnet:** grid, cards, version list, upload progress UI

---

## 💬 Messages — `/portal/[ws]/messages`

**Purpose.** The client types here; it reaches Leon's WhatsApp. Replies come back into the thread.

| | |
|---|---|
| **Client sees** | One thread per workspace. Send text, attach an image. Delivery state. |
| **Studio sees** | Same thread, plus which channel each message came through |
| **Data** | `workspaces/{ws}/messages` — already typed with `channel`/`direction`/`status` |

**The constraint that shapes this screen.** Meta's WhatsApp Cloud API only allows free-form messages inside a **24-hour window** after the client's last message. Outside it, only pre-approved templates send. So:
- Surface the window honestly — if it's closed, say a reply may be delayed rather than silently failing.
- Never show "sent" for something that was rejected. `status` exists for this: `queued → sent → delivered → read → failed`.

**Until Meta approval lands**, `MockWhatsAppProvider` writes the outbound row and logs. The UI is complete and honest either way — that's the whole point of the adapter.

**Inbound webhook** verifies `X-Hub-Signature-256` before trusting anything, maps `wa_id` → workspace, writes a message row.

🔴 **Opus:** webhook signature verification, provider adapter, window handling · 🟢 **Sonnet:** thread UI, composer, message bubbles

---

## 📅 Calendar — `/portal/[ws]/calendar`

**Purpose.** What's landing when — deliverable due dates and scheduled content in one view.

**The design call:** a month grid on a 390px phone is close to useless — cells too small for a title, and everything truncates. So:
- **Mobile → agenda list**, grouped by day, scrolling forward from today.
- **Desktop → month grid**, with the agenda still available.

These are two different components, not one responsive one. Trying to make a month grid degrade into an agenda produces something bad at both.

**Sources:** milestone `dueAt`, project `dueAt`, post `scheduledFor`. Read-only for clients; studio can drag a date (later — not v1).

🟢 **Sonnet.** Pure layout over data that already exists.

---

## ✨ Content — `/portal/[ws]/content` and `/[postId]`

**Purpose.** Ideas → draft → client approval → scheduled. The workflow, not the publishing.

| | |
|---|---|
| **Client sees** | The pipeline, per-platform previews, approve / request changes with comments |
| **Studio sees** | Composer, AI idea generation, scheduling, "mark as posted" |
| **Data** | `workspaces/{ws}/posts` — already typed with the full state machine |
| **States** | `idea → draft → in_review → approved → scheduled → published` (+ `rejected`) |

**Per-platform previews are the feature.** A caption that reads well in the composer breaks differently on Instagram vs LinkedIn. Render each platform's real constraints — character limits, hashtag handling, aspect ratio — and **validate before it reaches the client**, so they never approve something that can't actually post.

**Publishing is deliberately not built.** `ManualPublisher` validates for real, then marks published on confirmation. Real Meta/LinkedIn drivers slot in behind `SocialPublisher` once app review clears — weeks of external approval that no amount of code shortens.

**Approval reuses the Approvals primitive.** Same `approvals` collection, `targetType: "post"`. Do not build a second approval flow.

🔴 **Opus:** `SocialPublisher` interface, per-platform validation rules · 🟢 **Sonnet:** composer, previews, pipeline board, Gemini idea generation

---

## 🔔 Notifications — cross-cutting, not a page

Currently unspecced and easy to forget until it's missing.

- `workspaces/{ws}/events` already exists in the schema and is written by every meaningful action.
- **In-app:** unread count on the relevant tab; the activity feed on Overview.
- **Email:** via the existing Resend setup — approvals requested and comments received. Nothing else, or people mute it.
- **WhatsApp:** only for genuinely time-sensitive things (an approval blocking work).

**Rule:** one event, many channels, deduped. `dispatch(event)` in `src/lib/portal/notify.ts` fans out. Never call Resend directly from a route.

🟢 **Sonnet** for the dispatcher; 🔴 **Opus** for what's worth interrupting someone over.

---

## 🎯 Suggested order

1. **Files** — unblocks annotation, and delivering work is the portal's core job
2. **Approvals** — highest client value; fills the empty "awaiting you" slot
3. **Board** — the biggest single build; do it when the surrounding pages are stable
4. **Calendar** — small, satisfying, pure layout
5. **Messages** — needs the WhatsApp adapter
6. **Content** — largest surface, and the IA decision above gates it

Files + Approvals together make the portal genuinely useful. Everything after that is depth.

---

## ✅ Definition of done, per page

A page ships when **all** of these hold:

- [ ] Real data, persisted — no fixtures outside `/portal/demo`
- [ ] Client and studio views both correct, gated **server-side**
- [ ] Its agency-only labels added to `AGENCY_MARKERS` in `verify.mjs`
- [ ] New assertions in `verify.mjs`, suite green
- [ ] Honest empty, loading and error states
- [ ] 375px → 1440px, no horizontal scroll, both themes
- [ ] Keyboard-reachable with visible focus
- [ ] `ready: true` in `nav.ts` — last, not first
- [ ] Added to `src/lib/portal/demo-data.ts` so the preview stays current
- [ ] `npm run build` clean
