# 🦁 `/services/ai` Redesign — Execution Handoff

**Branch:** `claude/ai-services-redesign` · **PR:** #64 (draft, base `master`)
**Preview:** https://lionovartnext-git-claude-ai-services-redesign-lionovart.vercel.app/services/ai
**State:** 8 commits shipped · **~55% complete** · never pushed to `master`

---

## 1. Context — what this is

`/services/ai` read as a stack of separate sections rather than one place, and sold a
catalogue of four automations. The redesign makes it **one continuous scroll world** selling
**one product**: an operating system a business owns and talks to.

**The product, in the owner's words:** not automations, not bots, not chatbots. A business
gets *its own operating system* — comms, follow-up, invoices, scheduling, social, reporting —
and **talks to it**. The voice agent is the *door into it*, not the thing being sold.
Positioning is **AI consultant**, not reseller. Target feeling: *the future is here, and it
is one button away.*

---

## 2. What is already shipped (do not redo)

| # | Commit | What |
|---|---|---|
| 1 | `d080b49` | One conductor replaces five scroll owners |
| 2 | `9e2f94d` | A camera move per chapter |
| 3 | `afd4696` | Regent naming, guarantee decision, em-dash sweep |
| 4 | `a8144af` | Volume + ~18× density |
| 5 | `f048bdd` | Film grade + `?tier=` override |
| 6 | `bbd3175` | Lion promoted to protagonist at both ends |
| 7 | `b1efc08` | Three layers of fixed chrome cut to one |
| 8 | `edf9379` | Sculpted lion bust, 20MB compressed to 2.6MB |

**Measured results:**

| | Before | Now |
|---|---|---|
| Desktop particles | 777 (1,377 ultra) | **14,000** (26,000 ultra) |
| Crown depth | 0.18 on a 2.5-wide form (7%) | **0.62** extruded band |
| Post chain | bloom + vignette | + aberration, grain, contrast curve |
| Static scroll | **45%** | **0%** |
| On-page em dashes | 15 | **0** |

---

## 3. Architecture — read before touching anything

```
ONE ScrollTrigger (conductor.ts)
      ↓ resolves active chapter from cached pixel ranges
  chapters.ts  ← THE LEDGER. every value the engine is ever told, as data
      ↓ one write per frame
  LionExperience.ts  (uniforms only)
      ↑ DOM subscribes to the SAME progress value
```

**`src/lib/lion/chapters.ts`** — ordered list of 7 chapters (`hero, bridge, systems, flow,
process, offers, close`). Each has `resolve(t, ctx)` returning `{morph, layout, bloom, lion}`
and an optional `camera(t)` returning `{dist, height, lookY, fov}`.

**`src/lib/lion/conductor.ts`** — the single owner. Measures chapter ranges **on refresh only**,
never in the scroll hot path. Overlapping ranges resolve to *last chapter in document order*.

### 🔒 Invariants — breaking these regresses shipped work

1. **One WebGL canvas on this route.** Spec requirement. The lion shares the particle scene —
   that is what buys real occlusion (mesh writes depth, additive points test against it).
2. **No `getBoundingClientRect()` in any RAF or per-tick handler.** Measure on refresh, cache.
3. **No React state driven by scroll.** Refs and uniforms only.
4. **Chapter seams must be continuous** in `dist/height/lookY/fov`. Chapter A at `t=1` must
   equal chapter B at `t=0`. There is a static check pattern in commit `9e2f94d`.
5. **`halfH` derives from `BASE_DIST`/`BASE_FOV`, never the live camera.** Authored layout
   units must not move when the camera dollies.
6. **World-space offsets scale by `camPose.dist / BASE_DIST`.** Perspective projects x as
   x/dist, so without this the composition drifts to centre on every pull-back.
7. **Lenis owns smoothing.** Do not add a second damper. `SmoothScrollProvider` is correct —
   do not touch it.
8. **Reduced motion**: conductor never starts, one static composed frame, lion absent.

---

## 4. Decisions locked — do not relitigate

| Decision | Ruling |
|---|---|
| 🏷️ **Product name** | **REGENT** = the system the client owns · **Nova** = the voice they talk to it through |
| 🔢 **Guarantee** | **No fixed hours claim.** The audit produces the number; that number becomes the commitment. Trust move: *"Sometimes the answer is no."* |
| 💰 **Audit** | **FREE — the lead magnet.** Matches the `/audit` route and the instrumented `STICKY_AUDIT_CLICKED` funnel |
| 🦁 **Lion** | Protagonist at **both ends**; particles are its interior between; crown is the low-tier fallback |
| 🧭 **Chrome** | One layer. Sticky CTA hidden on this route only; navbar auto-hide is an opt-in prop |
| 🔤 **Typeface** | Revert to **Clash Display**. Not yet executed — see §6 |
| ⚡ **WebGPU** | **No.** See §5 |

### Naming rules for all copy
- Regent is a **product, not a person**: "Regent runs it", never "Regent thinks".
- Nova is the **interface**; brand docs use *she* for Nova — keep that.
- Never imply Regent is sentient, autonomous of oversight, or replaces the owner's judgement.
- 🔒 **Never name the stack.** No vendor, platform or tool names, ever.

---

## 5. ⚡ WebGPU — the decision and its reasoning

**It is available:** `three@0.185.1` exports `./webgpu` and `./tsl`. `NovaOrbGPU.tsx` already
runs 24,576 particles through raw WGSL compute with ping-pong buffers and clean `onFail()`
demotion. There is an in-house pattern to mirror.

**It was still declined, for three reasons:**

1. **The particle system is analytic, not simulated.** Every form is a precomputed morph target
   (`aFrontDesk`, `aBackOffice`, `aControlRoom`) interpolated in the vertex shader. No physics,
   no collision, no per-frame state. **Compute shaders would have nothing to compute.**
2. **Density was never API-limited.** 777 was a *config value*. WebGL2 now runs 14k–26k and
   would run 100k+.
3. **A port means rewriting 637 lines of GLSL into TSL to render the identical image.**

**What "highly performant shaders" actually means on this page** — and it is all still WebGL:
the DOF bokeh in §6.2, the scan reveal in §6.3, the leak in §6.4. Those are real shader work
with visible payoff.

> ⚠️ **If the owner overturns this:** build behind `?tier=gpu`, deploy to the Vercel preview,
> and judge on real hardware. Do **not** port blind — see the aberration landmine in §8.

---

## 6. Remaining work, in order

### 6.1 ✍️ `AiActs.tsx` copy rewrite — **START HERE, highest leverage**

617 lines, the bulk of the page's words, still selling a catalogue. "Regent" currently appears
in **2 files, 3 times** across a 15-viewport page.

- The four systems (Capture & Convert, Serve & Retain, Run & Fulfill, See & Scale) **keep their
  names** — the particle rooms are built to them — but reframe from *four products you buy* to
  **four things Regent already does** for a business that owns it.
- `AiFlow`'s seven nodes describe **how Regent works**, not "The Lionovart AI Operating System".
- `AiProcess` (Blueprint / Build / Optimize) leads with the **free audit** as step one.
- `AiOffers`: the choice is *how much of Regent you turn on first*, not which product you buy.

**Voice:** Nova's register. Short sentences, rhythm not paragraphs, outcome-led,
founder-to-founder. "Investment" never "price". No false urgency. No competitor bashing.
No em dashes. Source of truth: `BRAND_MARKETING_HANDOFF.md` §2.

### 6.2 🌫️ DOF bokeh
`uDofAmount` has been wired the whole time but the crown was 7% deep, so it had nothing to
sort. The band is now 0.62 deep — near and far particles can genuinely defocus. Cheap, and it
is the classic premium-particle tell.

### 6.3 ⭐ The Audit chapter — the narrative centrepiece
**The single move that fixes the narrative and the tab-bar problem together.** A scan plane
sweeps and *classifies* the field into four strata; those strata **are** the four rooms' entry
state. The four domains then arrive as *what the audit found in your business*, not as a tab
bar. Use `build-wireframe-scan-reveal`.

### 6.4 The Cost chapter — the leak
Particles drift off the bottom edge and do not recycle; density visibly drops. Loss made
literal. Cheap: `DUST_VERT` already has wrap-around `mod()` recycling — this is a
recycle-disable plus a downward bias, not a new system.

### 6.5 🔤 Clash Display revert
✅ **Unblocked.** The page uses `font-light` in **17 places** and `fonts.ts` registers only
400–700, so a naive swap silently renders all body copy at 400. But
**`src/fonts/ClashDisplay-300.woff2` already exists** (15.3KB) and is simply not registered.
Add the weight, then re-tune: current `-0.05em`/`0.91` were tuned for Space Grotesk;
`DESIGN.md` specifies `-0.02em`/`0.9` for Clash. Screenshot-verified pass, not a find-replace.

### 6.6 Layout rhythm + offers overlap
Sections still alternate copy-left / copy-right like a metronome. Particles overlap the
guarantee copy in `AiOffers` — that section is full-width with no safe column, so it needs the
layout rework, not a camera tweak.

### 6.7 📄 Spec reconciliation
The audit-first spine **and** the lion both contradict `specs/ai-master-page/spec.md`, still
the binding doc (L10 "Crown, not lion", L37, L55; `tasks.md:3`; `verification.md:9`). Needs a
deliberate commit. Also: `AI_SYSTEMS_PAGE_SPEC.md` still claims to be "the approval document"
while `specs/ai-master-page/` is what shipped — one should be archived.

---

## 7. 🔬 Verification — the method that caught every real bug

**Nothing here was accepted without looking at it.** Build a Playwright harness, screenshot,
and read the image. `tsc` passing means nothing for visual work.

```js
chromium.launch({ args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'] })
// ?tier=low|medium|high|ultra  — force a tier (REQUIRED, see §8.1)
// ?count=N                     — force particle count
// ?lionyaw=N                   — force the lion's presented angle
// window.__lion                — the live engine instance, dev only
```

**Non-negotiable gates:**
- `npx tsc --noEmit` **and** `npm run build` green before every commit.
- Screenshot at **1440×900** and **390×844** minimum.
- **Scroll down in steps** (~500–700px with a settle), not `scrollTo`. Auto-hide and scrub
  behaviour only engage under real scrolling.
- Settle **≥900ms** before sampling engine state — GSAP scrub needs it (see §8.2).
- Reverse scroll: walk back up and confirm state unwinds.
- Reduced motion: one static frame, conductor never starts.
- Console clean. One pre-existing hydration warning under reduced motion is **not yours** —
  it reproduces on an untouched tree.

---

## 8. 💣 Landmines — every one of these cost real time

**8.1 SwiftShader demotes to the 77-particle `low` tier**, and `buildPost()` only runs on
high/ultra. **Without `?tier=` you are not looking at what users see, and the post chain never
executes at all.** This produced a completely wrong first diagnosis.

**8.2 GSAP scrub needs ~900ms to settle.** A 140ms sample produced fake "non-monotonic
oscillation" and a wrong bug report. The system was fragile, not broken.

**8.3 Overriding `Euler.y` breaks the change callback** that updates the quaternion, so the
object never moves. An entire rotation contact sheet came back identical. Use a real probe.

**8.4 Chromatic aberration scales with r², in UV units.** At the frame edge the offset is
roughly `0.5 × 0.25 × value` of the width. `0.42` = ~70px of channel separation and three
ghosted RGB crowns. Correct is `0.013` (ultra) / `0.009` (high).

**8.5 Additive blending saturates to white where particles concentrate.** Raising density 18×
blew the gold/cyan language out. Fixed with a lower gain floor (0.72) and a 38% point-size
reduction during room states.

**8.6 A metal with no environment map is black** except where a light hits it directly. On a
flat-shaded surface this produced party-coloured triangles. A procedural gradient env fixed it.
Then a *tight* specular on a flat facet still clipped channels — roughness 0.52 fixed that.

**8.7 GLB `BIN\0` chunk type**: `.trim()` does not strip a null byte. Compare with
`.replace(/\0/g,'')`.

**8.8 The bundled Playwright ffmpeg has a PNG encoder only** — no JPEG, no WebP. Use Chromium's
canvas for image re-encoding.

**8.9 The navbar's auto-hide already existed**, gated behind an IntersectionObserver on
`#luma-showcase`. Always check whether a behaviour exists before writing a second one.

---

## 9. 🗺️ File map

**The spine:** `src/lib/lion/chapters.ts` (ledger) · `src/lib/lion/conductor.ts` (one owner)

**The engine:** `src/lib/lion/LionExperience.ts` (~1100 lines — quality tiers, adaptive DPR,
`gsap.ticker` loop, lion mesh + lights + env, full dispose) · `src/lib/lion/shaders.ts` (637
lines GLSL)

**Sections:** `src/components/sections/services/ai/` — `AiActs.tsx` (617, **the target**),
`AiHeroCopy`, `AiChaosBeat`, `AiRoi`, `AiDecision`, `AiCloseBeat`, `AiPageNav`, `LiquidGlass`

**Assets:** `public/models/lion-bust.glb` (2.6MB, in use)

### ⛔ Do not touch
- `master` — **never push to it**
- `claude/ai-services-rebuild-lcjqs8-1sukwc` (#61), `claude/ai-lion-preview` (#62)
- `SmoothScrollProvider.tsx` — the Lenis↔GSAP bridge is correct
- `StickyCTA.tsx` beyond the existing one-route guard — it is global and instrumented
- `public/models/lion-lowpoly.fbx` — still used by `LionCenterpiece.ts` on the preview route
- `public/models/lion.glb` — 2.2MB, unused *before* this work, not ours to sweep up

---

## 10. 🎯 The quality bar

1. **Look at it.** Screenshot and read the image. Every real bug here was found by looking.
2. **Report honestly.** If it is unverified, say so. Correct your own claims out loud — two
   wrong diagnoses were retracted in this work and that was the right call.
3. **Surgical changes.** Every changed line traces to the request. Clean up only your own mess.
4. **Comments explain *why*, with the number.** "0.42 was ~70px at 1440, correct is 0.013" beats
   "tuned aberration".
5. **No AI slop:** no gradient blobs, no ornamental bento, no glass-everywhere, no identical
   card grids, no hero-metric template, no fake testimonials, no motion without narrative role.
6. **Commit messages are prose** explaining the reasoning and what was verified, not bullets.
7. **Ask when a decision is the owner's** — commercial promises, conversion surfaces,
   brand-level calls. Do not make those unilaterally.

**Skills to read before implementing** (`.agents/skills/`): `build-threejs-scroll-worlds`
(the spine), `build-awwwards-quality-sites` (the contract), `cinematic-gsap-lenis-motion-system`
(motion tokens), `design-taste-frontend` (§9 AI Tells), `no-ai-design-slop` during and
`audit-ai-design-slop` after, `build-wireframe-scan-reveal` for §6.3.

⛔ **Do not use:** `performance-profiling` (it is iOS/Instruments, zero web content) ·
`gpt-taste` and `high-end-visual-design` (prescriptive templates that contradict `impeccable`
and `design-taste-frontend`) · any single-look style skill.
