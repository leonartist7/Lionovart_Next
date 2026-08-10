# LIONOVART — `/services/ai` — Smart Systems & AI

> Status: **DESIGN SPEC (no code yet). This is the approval document.**
> Register: **brand** (the design IS the product). System: "The Creative King" (`DESIGN.md`).
> Spine: inherits the 7-act arc from `SERVICE_PAGES_SPEC.md §0.3`, with per-act media rebuilt for this page.
> Route already reserved in `src/lib/service-routes.ts` (`id: "ai"`, `ready: false`). This spec flips it to `true`.

---

## 0. Strategic foundation

### 0.1 The one job
A founder lands, scrolls, and books an audit call — or talks to Nova on the page. One decision. No competing CTAs.

### 0.2 The positioning problem we're solving
The market is saturated with "AI automation agencies": Make.com screenshots, Zapier logos, $2k/mo retainers, a Loom and a Notion board. They sell **tools**. The visitor has seen nine of them this month and cannot tell them apart.

We are not that. The position is **AI systems consultant**, and the difference is stated structurally, not adjectivally:

| Them | Us |
|---|---|
| Sell a workflow | Sell an outcome, guaranteed |
| Start building day one | **Audit and strategize first**, build second |
| Templated automations | Custom system, tuned to *this* business after evaluation |
| "Here's your Zap, good luck" | Fully done for you, measured, maintained |
| No accountability | **Min 10h/week back · 4× return on investment** |

The audit is the hero of the story, not the automation. Everyone can build a bot. Almost nobody does the diagnostic work that makes the right bot get built. That is the entire differentiator and it must be the *most cinematic act on the page* (Act 3).

### 0.3 The honest content position
Per `SERVICE_PAGES_SPEC.md §0.2`: no client case studies yet. This is a **capability-demonstration page**. The proof is threefold and all of it is real:
1. **The page itself** — a WebGL system that assembles itself as you scroll.
2. **Nova** — the visitor can *talk to a live voice agent* in-page. We do not claim we build voice agents. We hand them one.
3. **Slots built to receive proof** — testimonial and metric frames designed now, filled later, zero redesign.

### 0.4 Anti-references (hard rules)
From `PRODUCT.md`, plus category-specific ones:
- ❌ Floating pastel cards, hero metric tiles, Webflow-template SaaS aesthetic.
- ❌ Logo soup of tool integrations (Zapier / OpenAI / Make icons in a grid). Every competitor does this. It says "we are a reseller."
- ❌ Robot imagery, humanoid faces, brains-with-circuits, generic "AI" stock.
- ❌ Corporate blue. Our blue is **violet-cyan and luminous**, never Salesforce.
- ❌ Terminal/matrix green, glitch text, cyberpunk.

---

## 1. Visual system — "the same brand under different light"

### 1.1 Palette
The main site is black · lacquer red · sovereign gold. This page is the **tech wing**, so the light changes — but the body does not.

```
--ai-void        #05060E   page ground (cooler than brand #000, deliberately)
--ai-violet      #6E4BFF   primary particle / system colour
--ai-indigo      #3A2ED6   mid-tone, links and depth
--ai-cyan        #2BD9FF   signal, energy, "data flowing"
--ai-glass       rgba(110,75,255,0.06) + backdrop-blur   panel surfaces
--brand-red      #e5192a   RESERVED — Navbar + final CTA only
```

**The red rule (non-negotiable, it is the whole concept):**
Violet/cyan = the machine. Red = the human. Red appears exactly twice on this page — the Navbar (brand continuity) and the closing CTA. When the visitor reaches the close, the cold field warms and red enters for the first time in the scroll, under the line: *"A person builds it. The machine only runs it."* The colour restraint **is** the argument. It also keeps us clear of the "safe corporate blue" anti-reference in `PRODUCT.md`.

### 1.2 Typography
Unchanged from `DESIGN.md` — Clash Display display/headline/title, same clamps, same 0.9 line-height, same `-0.02em` tracking. **Do not introduce a mono or "techy" typeface.** The type staying identical to the main site is what proves it's the same studio while everything else changes.

One addition: `--font-mono` (Geist Mono, already tokenised) for **data annotations only** — node labels in the system graph, calculator readouts, telemetry captions. Never for headings or body.

### 1.3 Surfaces — "smart glass"
Extend the existing `@utility glass-surface` in `globals.css` with an `ai` variant: violet-tinted, higher blur, a 1px cyan top-edge highlight. Panels sit **over the live canvas** so the particle field is genuinely visible and moving behind the frost. This is not a decorative gradient faking glass — it's real `backdrop-filter` over real animated content, which is why it reads as expensive.

---

## 2. THE SPINE — one canvas, six states

### 2.1 The architecture decision
**A single persistent full-viewport WebGL canvas** (`<AISystemField />`) mounts once, `position: fixed`, `z-0`, behind all content. It runs one particle system whose **state machine is driven by a single scroll-progress uniform**. Particles are never destroyed or re-created between acts — they **transform**.

Two reasons, and they agree:

1. **Conceptually.** The visitor's disorder becomes their system, continuously, in front of them. Six separate scenes would be six effects. One transforming scene is one argument.
2. **Performance.** `LIONOVART_SCROLL_LAG_HANDOFF.md` establishes that per-Lenis-tick work is what kills scroll on this site. One canvas, one RAF loop, one uniform write per frame is dramatically cheaper than six scenes mounting, allocating buffers, and unmounting during scroll. See §5.

### 2.2 The six states

| Act | Scroll zone | Particle state | The argument |
|---|---|---|---|
| **1 · HOOK** | 0–100vh | Turbulent unsorted swarm. Curl noise, no structure, particles collide and scatter. Cold violet. | *This is your operations right now.* |
| **2 · STAKES** | 100–200vh | The swarm begins to **leak** — particles drift down and off the bottom edge, never returning. Density visibly drops. | Time bleeding out. Loss aversion made literal, not stated. |
| **3 · THE AUDIT** | 200–320vh | A horizontal **scan plane** sweeps top→bottom. Particles it crosses are **classified**: sorted into 4 coloured strata by "type of work". Chaos becomes legible. | **The differentiator.** We measure before we build. This is the page's first peak. |
| **4 · THE BUILD** | 320–460vh | Classified strata **snap into a node graph** — 7 nodes, animated links, light pulses travelling edge to edge. Nodes are labelled with real systems (see §3.4). | The custom system. Personalised, connected, deliberate. |
| **5 · THE AGENT** | 460–560vh | The entire graph **collapses inward into a single orb**, which then reacts to live audio amplitude. | The 24/7 worker. Reuses `NovaOrb`'s analyser wiring — the orb on this page is *the same orb* that speaks to them. |
| **6 · PROOF → CLOSE** | 560vh–end | Particles resolve into the guarantee numerals (**10h** / **4×**), hold, then cool, settle, and **warm to red** as the CTA enters. | Peak-end rule: the last image is their guarantee, assembled out of the chaos they arrived with. |

### 2.3 Engine tiering (reuse `NovaOrb`'s exact pattern)
`NovaOrb.tsx` already implements a three-tier engine selector with WebGPU probing, live override from Agent Studio, and graceful demotion on `device.lost`. Mirror it:

| Tier | Engine | Particles | Audience |
|---|---|---|---|
| `gpu` | WebGPU compute (extend `nova-orb-gpu.wgsl.ts`) | ~120,000 | Modern desktop |
| `webgl` | WebGL2 GPGPU / instanced points | ~24,000 | Default, the ~15–25% without solid WebGPU |
| `css` | Static violet gradient field + CSS-only act transitions | 0 | `prefers-reduced-motion`, mobile low-power, no-WebGL |

**Never blank-frame while probing** — start on `webgl`, promote to `gpu` after the probe resolves, exactly as `NovaOrb` does today.

### 2.4 The cursor trail
`TubesCursor` already accepts `initialColors` / `lightColors` / `layer` props. On this route only, pass the violet-cyan palette and `layer="landing"` (radius/intensity caps, `z-[35]`, `opacity-.82`) so the trail rides *between* the particle field and the content, not over the copy. `enableRandomizeOnClick={false}` here — random palettes would break the red rule.

`TrailAttractionTarget` wraps the CTA and the calculator handles, so the trail magnetically snaps to the things we want touched. Fitts's law, made beautiful.

---

## 3. Act-by-act build

### ACT 1 — HOOK (0–100vh)
Not the shared `ServiceCurtainHero` video curtain. This page earns a bespoke hook: **the canvas is the hero.** Content is minimal and sits in a glass panel, off-centre.

```
eyebrow   SMART SYSTEMS & AI · AUDIT-FIRST
headline  YOUR BUSINESS,          ← Clash Display, display clamp
          ALWAYS ON.
sub       We audit, strategise, then build the custom AI system
          your operation actually needs. Minimum 10 hours a week
          back. 4× your investment. Guaranteed in writing.
cta       [ Book the audit ]  ·  [ ▸ Hear a voice agent ]   ← second opens Nova
scroll cue
```

The two CTAs are the only place on the page with two actions, and the second is a *demo*, not a competing conversion. Everything below funnels to one.

### ACT 2 — STAKES (100–200vh)
Reuse `StatementRelay` (sticky, one beat at a time, pinned, black void). Per-page copy, PAS structure:

1. "Your team is doing work a system should be doing."
2. "Every hour of it costs you twice — the hour, and the thing you didn't build instead."
3. "Most agencies will sell you an automation. Nobody asked which one you need."

Beat 3 opens the loop that Act 3 pays off. Zeigarnik.

### ACT 3 — THE AUDIT (200–320vh) · **the differentiator, the first peak**
The scan plane sweeps and classifies. Content is a **horizontally-pinned four-panel sequence** in smart glass, each panel entering as the scan crosses it:

| Panel | Title | Body |
|---|---|---|
| 01 | **Map** | Every recurring task, who does it, how long it takes, what it costs. Two weeks of real observation, not a questionnaire. |
| 02 | **Measure** | We put a number on the hours. That number becomes the guarantee — it's the baseline we're held to. |
| 03 | **Model** | We design the system on paper before a line of code. You approve the architecture, not a demo. |
| 04 | **Prove** | If the model doesn't clear 10h/week and 4×, we say so and we don't build it. |

Panel 04 is the trust move. Saying *"sometimes we tell you no"* is worth more than three testimonials, and it is the sentence no competitor will write.

### ACT 4 — THE BUILD (320–460vh)
Graph forms. Content overlays as **hover-linked node cards** — hovering a card lights its node and its edges in the canvas (real bidirectional binding between DOM and canvas, not decoration). The seven nodes:

| Node | System |
|---|---|
| `RECEPTION` | 24/7 voice agent — answers, qualifies, books, never sleeps |
| `OPERATIONS` | Ops manager agent — routes work, chases status, escalates |
| `INTAKE` | Lead capture, enrichment, and instant response |
| `FOLLOW-UP` | Sequences that run themselves and stop when a human replies |
| `KNOWLEDGE` | Your documents, searchable and answerable by the whole team |
| `REPORTING` | The weekly number, generated, not assembled |
| `SPACES` | Smart glass panels, displays, physical touchpoints → §3.5 |

### ACT 5 — THE AGENT (460–560vh) · **the proof act**
Graph collapses to the orb. This is where the visitor **talks to Nova**.

- Reuse `useStrategistSession` + `NovaOrb` + the existing Gemini Live WebSocket stack. No new backend.
- Framed as: *"This is a receptionist we built. Ask it something. It's answering live."*
- 40-second guided demo — three suggested prompts, then a natural handoff into booking via the existing `useNovaStore.openNova` path.
- Mic permission gated behind `PrivacyGate` (already built). Text input via `TextInputBar` for anyone who won't grant mic.

This act is why the page wins. Every competitor *describes* their voice agent. Ours picks up.

### ACT 5b — SMART SPACES (the glass panel act)
One panel, deliberately restrained. The particle field renders **behind a real frosted-glass surface** — smart glass panels, lobby displays, interactive physical touchpoints — proving "smart systems" extends past software. Links to `/services/print` (LED Glass) rather than expanding here. Earns its place, doesn't hijack the page.

### ACT 5c — THE CALCULATOR (interactive lead qualifier)
Three sliders in a smart-glass panel: **team size · hours/week on repetitive work · loaded hourly cost**.

Live output: hours back per year, dollar value, projected 4× return. **The particle field responds to the sliders in real time** — density and flow rate shift as they drag. The visitor's own number, computed in front of them, rendered in the medium of the whole page.

No email gate on the number itself (gating kills the moment). The number *is* the hook; the CTA underneath is "book the audit that verifies this."

### ACT 6 — PROOF & CLOSE (560vh–end)
- **Proof slot:** designed placeholder per `SERVICE_PAGES_SPEC.md §0.2`. Built to receive a real quote with zero redesign.
- **The guarantee panel** — stated plainly, in writing, with its terms (§6 open question).
- **Close:** particles resolve to `10h` / `4×`, cool, and **red enters for the first time in the scroll.**

```
        A person builds it.
        The machine only runs it.

        [ Book your systems audit ]      ← lacquer red, liquid-metal
```

Reuse `ClosingCTA`'s wiring (`openNova`) with an AI-page variant. Peak-end rule satisfied: the most cinematic beat is at the *end*, not only the top.

---

## 4. Component plan

```
src/app/services/ai/page.tsx                        ← route (metadata, act composition)
src/components/sections/services/ai/
  AISystemField.tsx          ← the persistent canvas + engine tier selector
  ai-field-gpu.wgsl.ts       ← WebGPU compute (extends nova-orb-gpu pattern)
  ai-field-webgl.ts          ← WebGL2 fallback, same six states
  useSystemPhase.ts          ← single scroll-progress → phase uniform hook
  AIHero.tsx                 ← Act 1
  AuditScan.tsx              ← Act 3, pinned 4-panel sequence
  SystemGraph.tsx            ← Act 4, node cards ↔ canvas binding
  AgentDemo.tsx              ← Act 5, wraps existing Nova session stack
  SmartSpaces.tsx            ← Act 5b
  TimeBackCalculator.tsx     ← Act 5c
  GuaranteePanel.tsx         ← Act 6
```

**Reused unchanged:** `Navbar`, `Footer`, `StatementRelay`, `ProcessBand`, `OfferCards`, `ProofAndClose`, `LiquidMetalButton`, `SplitTextReveal`, `TrailAttractionTarget`, `TubesCursor`, `NovaOrb`, `useStrategistSession`, `PrivacyGate`, `TextInputBar`, Lenis.

**New dependencies: none.** `@paper-design/shaders`, `gsap`, `framer-motion`, `lenis` all present.

---

## 5. Performance contract (non-negotiable)

`LIONOVART_SCROLL_LAG_HANDOFF.md` documents that wheel scroll degrades from the moment a heavy section enters view, and that the cost is **per-Lenis-tick**. This page adds a full-viewport WebGL scene, so the budget is defined up front:

1. **One canvas. One RAF loop.** No per-act canvases. No `useLenis` callback that does layout work.
2. **One scroll subscription** for the whole page — `useSystemPhase` reads Lenis once and writes a single uniform. Every act reads phase from that hook. No section subscribes to scroll independently.
3. **Zero React re-renders from scroll.** Phase lives in a ref + uniform, never in `useState`.
4. **Never `getBoundingClientRect()` in the RAF loop.** Cache rects, invalidate on `ResizeObserver` — the pattern `TubesCursor` already uses.
5. **Canvas pauses when off-screen** (`IntersectionObserver`) and on `visibilitychange`.
6. **DPR capped at 1.5**; particle count auto-degrades if frame time exceeds 14ms over a 60-frame window.
7. **Mobile:** `webgl` tier max, halved particle count, no cursor trail (pointer: coarse already gates it).
8. **Verify before merge:** wheel-scroll the full page on the reference machine and confirm no regression vs `/services/web`. Ship gated behind this check, per the handoff doc's methodology.

## 5b. Accessibility (`PRODUCT.md` — WCAG AA, non-negotiable)
- `prefers-reduced-motion` → `css` tier, no scroll-driven transforms, full content and hierarchy retained.
- Canvas is `aria-hidden`; every act's meaning exists in the DOM text. The page must be fully comprehensible with the canvas removed entirely.
- All copy meets 4.5:1 against its glass panel — panels carry an opaque scrim floor, so contrast never depends on what the particles are doing behind them.
- Calculator sliders: real `<input type="range">`, keyboard operable, live `aria-live` readout.
- Nova demo: full keyboard path, text input alternative to voice, no audio autoplay.

---

## 6. Open questions (blocking nothing, but needed before Act 6 copy is final)

1. **The guarantee mechanism.** "Min 10h/week back & 4× investment" — what happens if it isn't hit? Refund, free continued work until it is, or fee-at-risk? The page is much stronger stating the remedy than the promise, but I won't invent commercial terms.
2. **Pricing.** `OfferCards` on `/services/web` still carries `$[price]` placeholders. Do we show price here, "from" anchoring, or audit-first-then-quote?
3. **The audit as a paid product.** Is the audit free (lead magnet) or paid (qualifier, and a far stronger position)? Changes the CTA copy throughout.
4. **Node list.** §3.4's seven systems are my proposal — confirm these are the systems you actually want to sell.
5. **Nova demo scope.** Should the in-page agent be a *demo persona* (a fictional client's receptionist) or Nova-as-LIONOVART? Demo persona proves the product better; Nova-as-LIONOVART qualifies the lead better.

---

## 7. Build order

```
1. Route + act skeleton, no canvas       → verify: page scrolls, all copy present, AA contrast
2. useSystemPhase + webgl tier, 6 states → verify: no wheel-scroll regression vs /services/web
3. Acts 1–3 (hook, stakes, audit scan)   → verify: scan classification reads as intentional
4. Act 4 graph + DOM↔canvas binding      → verify: hover lights the right node, still 60fps
5. Act 5 Nova demo + 5b smart spaces     → verify: live session connects, keyboard path works
6. Act 5c calculator                     → verify: slider → field response, aria-live readout
7. Act 6 close + red entrance            → verify: red appears exactly twice on the page
8. gpu tier + css tier                   → verify: reduced-motion loses nothing but motion
9. Flip service-routes ai.ready = true    → verify: nav + /services index link correctly
```
