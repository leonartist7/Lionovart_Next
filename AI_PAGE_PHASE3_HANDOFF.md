# /services/ai — Full Analysis & Phase 3 Handoff

> **What this is:** the complete record of the `/services/ai` rebuild — what was
> found, what was decided and why, what shipped, and what is left. Written so a
> cold session can pick the work up without re-deriving anything.
>
> **Status:** Phase 1 (narrative) and Phase 2 (copy, typography, colour, CTA
> ladder) are shipped in [PR #59](https://github.com/leonartist7/Lionovart_Next/pull/59)
> on `claude/ai-services-rebuild-lcjqs8`. Phase 3 — **particles, layout,
> pricing** — is specified here and not yet built.
>
> **Which spec is current — read this before anything else.** There are two, and
> the newer one is easy to miss:
>
> - **`specs/ai-master-page/{spec.md, tasks.md, verification.md}` — CURRENT.**
>   The spec the shipped crown-system code implements (commit `c7a796b`, spec
>   last touched 2026-08-25). All 16 tasks checked off, verification passed. It
>   owns the **performance contract** (§6.4), the interaction contract, and the
>   acceptance criteria. **This is the binding document.**
> - `AI_SYSTEMS_PAGE_SPEC.md` — **older** (2026-08-21), superseded on structure.
>   Still the *only* source for the typeface rule (§1.2) and the red-restraint
>   rule (§1.1), which the current spec is silent on. Cited in §5.3 and §9.1 for
>   exactly that reason and no other.
>
> **Also read:** `LIONOVART_SCROLL_LAG_HANDOFF.md` (perf methodology),
> `DESIGN_SYSTEM.md` (tokens).

---

## 0. Starting the next session

### 0.1 Skills

| Skill | Why |
|---|---|
| **`impeccable`** | Primary. Motion, micro-interactions, visual hierarchy, performance, and "ambitious visual effects that should feel technically extraordinary" — exactly the particle work. |
| **`run`** | **Non-negotiable.** Launches the app so you can look at the page. See §0.2. |
| **`code-review`** | Final pass before pushing, at `high`. |
| `design-taste-frontend` | Optional alternative for the layout pass — audit-first on redesigns, anti-templating, which suits §7. |

Do **not** use `ui-ux-pro-max` here. It is broad UI intelligence tuned for
greenfield product surfaces; this is a bespoke WebGL narrative page with an
established design system, and generic palette/font/style libraries will fight it.

### 0.2 The single biggest quality risk

**Nobody has looked at this page in a browser.** Not the Phase 0 audit, not the
Phase 1 copy work, not the Phase 2 build. Every judgement in this document — the
two defects in §6.2 and §7.1 included — was made by reading source and reasoning
about it.

That is adequate for copy and structural defects. It is **not** adequate for
particles, motion timing, or layout rhythm, which are the whole of Phase 3. A
shader that reads correctly in GLSL can look like nothing on screen.

**So: run the page and look at it before writing any Phase 3 code.** Use `run`,
or drive Chromium with Playwright (preinstalled at `/opt/pw-browsers/chromium`;
`PLAYWRIGHT_BROWSERS_PATH` is set — do **not** run `playwright install`). Scroll
slowly at desktop and at 390px. Screenshot each of the four Systems tabs. Then
verify §6.2's claim rather than trusting it.

Preview of the current head:
https://lionovartnext-git-claude-ai-services-rebuild-lcjqs8-lionovart.vercel.app/services/ai

---

## 1. The business context

Not inferable from the codebase. Carried forward so it does not get lost.

LIONOVART is a premium multilingual creative studio — **"THE ART OF INNOVATION."**
Positioning: cinematic craft *amplified* by AI, not replaced by it. Calgary,
in-house, no overseas outsourcing, limited partner capacity.

**Two buyers, one page:**

| Buyer | Needs |
|---|---|
| **Local businesses** (restaurants, salons, boutiques) | De-jargoned. Needs to see the outcome. Price-anxious. |
| **Growth brands** | Proof of technical depth. Afraid of generic AI slop and black-box vendors. |

**Real differentiators — all verifiable, none invented:**

1. **LIONOVART OS** — multi-vendor AI orchestration coordinating Claude, Codex,
   Kimi and Grok in parallel, via git as message bus, a file-based taskboard and
   a persistent memory vault. Very few studios build their own orchestration
   layer. **Strongest trust asset on the page.**
2. **Five languages natively** (EN, FR, ES, IT, KO) — real delivery, not a
   translation plugin. Verifiable at `nova-brain/prompts/`.
3. **Audiovisual and music background** — the "cinematic" claim is earned.
4. **Cinematic web builds** — this site is the artifact.

**Hard rule, permanent:** zero fabricated content. No invented testimonials,
client names, metrics, headshots, or "trusted by 200+ brands." Where proof is
missing, build credibility from process transparency and demonstrable capability,
and flag the gap. This is not a placeholder state to be filled with
plausible-sounding filler later.

---

## 2. The problem ledger

The five problems the rebuild was called to fix, with current status.

| # | Problem | Status | Evidence |
|---|---|---|---|
| 1 | **Page feels laggy** | ◐ Partly addressed | Not the particle system — it is correctly code-split and absent from the initial bundle. Real cost is site-wide shell weight (40KB-gzip Lottie hamburger) plus uncoordinated scroll systems. **This route already avoids the Lottie** via `<Navbar lightweightMenu />`. Remaining: §10.1. |
| 2 | **Hero is cluttered** | ✅ Fixed | The hero's own composition was clean; the problem was three floating CTA systems visible simultaneously. Fixed structurally — §5.4. |
| 3 | **Particles lack premium quality** | ○ Not started | The crown (rest state) is well-built and edge-sampled — leave it alone. The four transition states are generic sci-fi tropes. §6. |
| 4 | **Morphing figures unclear / decoupled from the pillars** | ○ Not started, now **measured** | Three of the four tabs land in the same shader blend window. §6.2. |
| 5 | **Design reads generic** | ◐ Half fixed | Typography and colour fixed in Phase 2 (§5.2). The **layout** half is still standing: six sections share one composition. §7.1. |

---

## 3. Codebase facts worth not re-deriving

Findings from reading the repo. Recorded so the next session skips the search.

### 3.1 Nova is a live, real proof asset

Not a chat widget. `src/app/api/strategist/*` + `nova-brain/` is a full voice-capable
AI strategist with tool calling, skills (`qualification`, `objections`, `scheduling`,
`faq`), lead capture, dossier and scoring. **The visitor can talk to a real agent
the studio built, on the page.** This is why the hero CTA is "Talk to Nova" and
not "book a call" — the lowest-friction proof beats the lowest-friction conversion
for a skeptical AI buyer.

- Store: `src/lib/stores/nova-store.ts` — `openNova(source, autoStart)`.
  Sources: `hero | orb | sticky | nav | offer | roi | audit | call`.
- `autoStart: true` starts the conversation; `false` opens quietly. The close
  section uses this difference deliberately: primary = `("call", true)`,
  secondary = `("orb", false)`.

### 3.2 `nova-brain/knowledge.js` is the studio's source of truth

Founder-approved facts and voice. **Read it before writing any customer-facing
copy** — it is where the studio's actual positions live:

- Modular subscriptions ("scale up, scale down, or pause without starting over")
- "We don't take clients — we take partners"
- "We talk in investment, never price"
- Limited capacity, in-house Calgary, no overseas outsourcing
- 20-minute free growth-map call with Leon
- A full FAQ and `niche_insights` per business type

`nova-brain/skills/objections.js` is a written objection-handling playbook. The
page's objection section (§4, Act 7) is aligned to it — keep them in sync.

### 3.3 Five languages, confirmed in the repo

`nova-brain/prompts/` contains `en.js`, `fr.js`, `es.js`, `it.js`, `ko.js` — five
separately written prompt sets, not one English brain with translation. This is
what licenses the page's claim. Production liveness still needs confirming (§11).

### 3.4 Routes that already exist

`/pricing` (with **real published numbers** — see §8), `/call`, `/audit`,
`/audit/thanks`, plus the four sibling service pages.

### 3.5 Design tokens

Tailwind v4, CSS-first. Tokens are in `src/app/globals.css` under `@theme inline`,
**not** `tailwind.config.ts`.

- `--color-brand-red: #e5192a` · `--color-brand-gold: #f0c917` · `--color-brand-red-secondary: #db0000`
- `--font-clash: var(--font-clash-display)` — Clash Display is both heading and body face
- `data-art-directed="light" | "dark"` is a real site-wide convention that sets
  `color-scheme` per narrative chapter (`globals.css:69–71`). `AiRoi` uses it
  correctly.

---

## 4. The copy spine

The argument, as it scans. Body copy lives in the components — **those are the
source of truth**, deliberately not duplicated here to avoid divergence.

| Act | Component | Heading |
|---|---|---|
| 1 · Hook | `AiHeroCopy` | Talk to the AI we built. **Then decide if we should build yours.** |
| 2 · Tension | `AiChaosBeat` | It writes like everyone else. → It doesn't know your business. → Nobody can explain what they built. |
| 3 · Reframe | `AiActs → AiReframe` | AI is a multiplier. Multiply nothing and you get nothing. |
| 4 · Proof | `AiActs → AiSystemProof` | We built our own AI studio before we sold you a system. |
| 5 · Offer | `AiActs → AiSystems` | Four systems. Start with the one that's costing you most. |
| 5b · Lens | `AiRoi` | What is the repetitive hour actually costing you? |
| 6 · Process | `AiActs → AiProcess` | You'll see it working before you're asked to trust it. |
| 6b · Accountability | `AiActs → AiProcess` | We write the number down before we start. |
| 7 · Objections | `AiActs → AiObjections` | The questions you should be asking. |
| 8 · Way in | `AiActs → AiOffers` | Start focused. Grow into something connected. |
| 9 · Close | `AiDecision` | **A person builds it.** The machine only runs it. |

The four pillars were renamed from abstractions to **rooms** — The Front Desk,
The Follow-Through, The Back Office, The Control Room. **This is a deliberate
divergence from `specs/ai-master-page/spec.md`**, which names them Capture &
Convert / Serve & Retain / Run & Fulfill / See & Scale. Raise it with Leon
rather than silently reverting either way. Two reasons: a buyer can
picture a room and cannot picture "Capture & Convert", and rooms hand the
particle system four legible shapes (§6.3). That renaming is what makes problem
#4 solvable at all.

---

## 5. What Phase 2 shipped

### 5.1 Files changed

| File | Change |
|---|---|
| `src/app/services/ai/page.tsx` | Removed the Space Grotesk fork; new section order; palette variables reassigned; metadata rewritten |
| `AiHeroCopy.tsx` | New hero; single CTA; stat strip removed |
| `AiChaosBeat.tsx` | Three tension beats rewritten; `BRIDGE_MORPH_END` 0.58 → 0.44 |
| `AiActs.tsx` | Substantial rewrite. Added `AiReframe` and `AiObjections`; `AiFlow` → `AiSystemProof`; four rooms; guarantee replaced; chapter handoff ranges fixed |
| `AiRoi.tsx` | Planning-lens framing; Clash; warm gradient |
| `AiDecision.tsx` | New close; two deliberately unequal CTAs |
| `AiPageNav.tsx` | New labels; holds until the hero exits; cached threshold |
| `graph.ts` | Nodes are now the LIONOVART OS mechanism |
| `LiquidGlass.tsx` | `--ai-blue` → `--ai-ember`; decorative orb cyan → gold |
| `src/lib/lion/shaders.ts` | Violet/magenta removed from transition colours |
| `src/components/ai-strategist/StickyCTA.tsx` | Suppressed on `/services/ai` |

### 5.2 Typography and colour

**Clash Display restored.** The page had forked to Space Grotesk with a code
comment justifying the override — against its own spec (§5.3).

**Colour now carries the argument instead of decorating it:**

- `--ai-gold` **#f0c917** — the human hand. Dominant accent: eyebrows, numerals,
  list marks, rules, the crown, the close.
- `--ai-cyan` **#63cfe6** — the machine. The **only** cold accent, used **only**
  on elements depicting the system itself: the OS rail, the tab indicator, node
  dots, the "You see:" labels.
- `brand-red` **#e5192a** — reserved for action.
- Shaders: violet/magenta deleted. The cold family runs cyan → deep signal blue
  and warms toward gold; it does not go purple.

### 5.3 Divergences found between the spec and the build

Worth recording, because both were deliberate overrides that made the page worse:

1. `AI_SYSTEMS_PAGE_SPEC.md §1.2` says *"Unchanged from DESIGN.md — Clash
   Display… **Do not introduce a mono or 'techy' typeface**"* — because type
   staying identical is what proves it is the same studio. The build shipped
   Space Grotesk anyway, with a comment explaining why.
2. `§1.1` declared *"red appears exactly twice on this page"* — Navbar and final
   CTA — and called the restraint "the whole concept." The build fired
   `bg-brand-red` on five CTAs.

**So the page read generic because it abandoned its own concept, not because the
concept was wrong.** Phase 2 restored the concept with gold carrying the warmth
instead of red doing all the work.

### 5.4 The CTA ladder

Problem #2, fixed structurally rather than cosmetically:

| Zone | Visible CTA |
|---|---|
| Hero | `Talk to Nova` — **only** |
| Acts 2–4 | none; page nav appears after the hero exits |
| Acts 5–6 | one inline: `Find out which hours are recoverable` |
| Close | `Book 20 minutes with Leon`, plus a quiet Nova fallback |

`AiPageNav` holds until the hero fully leaves, with the threshold cached and
recomputed on resize — no layout read in the scroll handler. `StickyCTA` is
suppressed on this route.

### 5.5 A bug fixed in passing

Adjacent particle chapters were both writing `setMorph`/`setLayout` across a
~60vh overlap, fighting each other during momentum scroll. The original code had
a comment acknowledging this for one instance only. Every chapter now ends at
`bottom 82%` so exactly one owner holds state at any scroll position.

---

## 6. Phase 3A — Particles

### 6.1 How the system actually works

One `LionExperience`, one canvas, one RAF loop, mounted fixed behind all content
by `AiLionStage.tsx`. Sections drive it through three setters on the stage ref
(`src/lib/lion/stage-ref.ts`):

- `setMorph(0..1)` — position along the story. **The only state input.**
- `setLayout(-1..1)` — horizontal composition offset (copy left ⇄ copy right)
- `setBloom(0..1)` — reforms the crown for the close

The morph states are **not** procedural. Four target positions per particle are
computed once on the CPU and uploaded as static attributes; the vertex shader
interpolates between them.

**`src/lib/lion/LionExperience.ts:378–436`** — one loop, four generators:

| Attribute | Lines | Current shape |
|---|---|---|
| `aBurst` | ~394–402 | Radial scatter |
| `aEcosystem` | ~404–414 | Three intersecting orbital bands |
| `aEnergy` | ~416–425 | Double helix drifting on Y |
| `aHub` | ~427–435 | Five stacked rings |

**`src/lib/lion/shaders.ts:178–190`** — the blend windows:

```glsl
float burstT     = smoothstep(0.08, 0.28, m);
float ecosystemT = smoothstep(0.30, 0.50, m);
float flowT      = smoothstep(0.56, 0.76, m);
float hubT       = smoothstep(0.80, 0.97, m);
```

The crown is the `position` attribute (edge-sampled mesh, gold, genuinely well
built — **do not touch it**). `uBloom` mixes back to it for Act 9.

### 6.2 The defect: the four tabs are not four states

Tab morph values, from `AiActs.tsx` `SYSTEMS[].to`:

| Tab | Room | `to` | Lands in |
|---|---|---|---|
| 01 | The Front Desk | `0.72` | mid **flow** (helix) |
| 02 | The Follow-Through | `0.80` | start of **hub** |
| 03 | The Back Office | `0.88` | mid **hub** |
| 04 | The Control Room | `0.96` | end of **hub** |

**Tabs 02, 03 and 04 all sit inside the same `hubT` window.** Switching between
them rotates the same five rings a few degrees. Three of four pillars are
visually one picture. Tab 01 is a helix with nothing to do with a front desk.

This is problem #4 with coordinates. **Verify it on screen before acting.**

### 6.3 The fix

Four rooms, four distinguishable forms, four non-overlapping windows. Match the
geometry to the noun the copy already gives you:

| # | Room | Form | Reads as |
|---|---|---|---|
| 01 | **The Front Desk** | Dense vertical **portal/arch**, with a steady inbound stream crossing its threshold and being absorbed | A door that is always open |
| 02 | **The Follow-Through** | Long **filaments** leaving the mass, arcing out, curving *back* — none escaping frame. Slow, patient | Threads that don't drop |
| 03 | **The Back Office** | Interlocking **counter-rotating bands** on a shared axis. Tight, regular, obviously periodic | A mechanism turning |
| 04 | **The Control Room** | Wide shallow **instrument array** — sparse readable lattice facing the viewer, slow brightness scan travelling across | A room of dials |

**Rules for all four:**

0. **Survive 77 particles.** This is the hardest constraint and it comes from
   `specs/ai-master-page/spec.md` — the mobile budget is **77 points**, and
   principle 2 ("Crown, not lion") requires the form to stay recognizable at
   that budget. Design each room at 77 points **first**, then let the desktop
   budget add density. A form that only reads at 777 points is a failed form.
1. **Silhouette first.** Each must be identifiable in a 200×200 greyscale
   thumbnail. If two are confusable, redo the one that lost.
2. **No filled centres.** `shaders.ts:141` warns about the "opaque sphere /
   white-hole artifact" — that lesson is already paid for. Keep forms open and
   individually readable.
3. **A distinct axis of motion per room.** Portal = inbound on Z. Filaments =
   out-and-return on a curve. Bands = counter-rotation on Y. Array = travelling
   scan on X. Four different motions is half of what makes four different states.
4. **Cold.** These are machine states. Gold belongs to the crown and the close.

**New windows** — evenly spaced, non-overlapping, each with a real hold:

```glsl
float roomAT = smoothstep(0.30, 0.42, m) * (1.0 - smoothstep(0.46, 0.56, m));
float roomBT = smoothstep(0.50, 0.60, m) * (1.0 - smoothstep(0.64, 0.72, m));
float roomCT = smoothstep(0.66, 0.76, m) * (1.0 - smoothstep(0.80, 0.86, m));
float roomDT = smoothstep(0.82, 0.92, m);
```

A sketch, not a spec — tune against what you see. The requirement: **each room
owns a plateau where it is fully itself**, and tab morph values land dead-centre
(roughly `0.44 / 0.62 / 0.78 / 0.94`).

Then update `SYSTEMS[].to` and re-check `BRIDGE_MORPH_END` (`AiChaosBeat`),
`AiReframe`, `AiSystemProof` and `AiProcess` so the page still walks
monotonically 0 → 1.

### 6.4 What must not regress

**The performance contract is in `specs/ai-master-page/spec.md` and is binding:**

| Tier | Particle budget | DPR cap | Post | Ambient detail |
|---|---:|---:|---|---|
| Mobile / low capability | **77** | 1.25 | none | no dust, trails, plexus or pointer math |
| Tablet | 177 | 1.45 | none | short trails, restrained dust |
| Desktop | 777 | 1.65 | subtle bloom | trails, dust, plexus |
| High-end wide desktop | 1,377 | 1.8 | subtle bloom | full restrained detail |

Also from that spec: crown points are mathematically generated (no GLB fetch or
surface sampling); mobile sprites use a crisp opaque core, never a faded disc;
mobile glass uses gradients and edge lighting, **not** `backdrop-filter`; the
render loop pauses when the tab is hidden and lowers cadence while idle; scroll
assistance is proximity-only and never captures touch.

Plus, from `LIONOVART_SCROLL_LAG_HANDOFF.md`:

- Generators run **once, on the CPU, at build time.** No per-particle work in the
  RAF loop. Check memory cost before adding a fifth attribute.
- The vertex shader gates curl noise behind `m < 0.62` and `USE_ORGANIC_DETAIL`
  because it is the most expensive work in the pass. New forms must be cheap
  arithmetic — trig and mixes, **no noise in the geometric states**.
- No new canvases, no new RAF loops, no `getBoundingClientRect()` in a scroll or
  frame handler.
- `prefers-reduced-motion` still resolves to one composed frame (`skipIntro()` +
  `renderOnce()`), and the page stays fully comprehensible with the canvas gone.

---

## 7. Phase 3B — Layout

### 7.1 The defect: one rhythm, six times

Measured on the current head: **six** sections use an identical composition — a
single copy column at `md:w-[62%]` / `md:w-[64%]`, alternating `md:ml-auto` to
flip sides. `AiReframe`, `AiSystemProof`, `AiSystems`, `AiProcess`,
`AiObjections`, `AiOffers`. Left, right, left, right, left, right.

Alternation is not variety. After the second flip the reader stops reading it as
composition and starts reading it as a template — which is the "reads generic"
complaint expressed in layout rather than colour. **This is the unfixed half of
problem #5.**

### 7.2 The defect: ~17 viewports

| Section | Desktop height |
|---|---|
| Hero | 220svh |
| Chaos beat (tension) | 420svh |
| Reframe | 145svh |
| System proof | 145svh |
| Systems | 120svh |
| ROI | 135svh |
| Process | 145svh |
| Objections | content (~80svh) |
| Offers | content (~150svh) |
| Close | 165svh |
| **Total** | **≈ 17 viewports** |

Worst offender: the tension act spends **4.2 viewports on three paragraphs** —
roughly 40 seconds of scrolling for 25 seconds of reading, at exactly the point
where a skeptical buyer decides whether to continue.

### 7.3 The fix

1. **Cut the chaos beat to ~260svh.** Three beats at ~85svh still gives each a
   real reading hold. Re-check the opacity curve in `AiChaosBeat.tsx` (`onUpdate`,
   the `distance <= 0.09` plateau) — it is expressed in scroll progress so it
   scales, but *time on screen* shortens and the plateau may need widening.
2. **Break the column rhythm in at least two places:**
   - **`AiSystemProof`** — the OS rail is seven mechanisms and wants to be wide,
     not squeezed into 62%. Let it run edge to edge.
   - **`AiObjections`** — already a two-column `<dl>`. Take it full width and drop
     the 64% wrapper so it reads as a reference block, deliberately different in
     register from the narrative around it.
3. **Give the ROI section a real entrance.** It is the only opaque light section
   (`bg-[#f4f1ea]`) and currently just arrives. That colour flip is the strongest
   structural beat available and is being spent for free.
4. **Check `min-h-[38rem]`** on the Systems tab panel. A fixed floor across four
   panels of unequal length leaves dead space under the shortest. Measure all
   four; set the floor to the tallest, or animate the height change.
5. **Mobile is untested.** Every section collapses to one column at `<md`, and
   the alternation carrying the desktop composition vanishes. At 390px this is
   currently ten near-identical text blocks in a row. **Possibly the most
   important item in this section, and the one nobody has looked at.**
6. **Check snap density on screen.** `AiScrollSnap` runs Lenis proximity snapping
   over every `[data-ai-snap]` element — now ~12 points across ~17 viewports, at
   an 18% distance threshold. Two were added in Phase 2 (reframe, objections).
   Not asserted as broken; worth feeling on a real trackpad and a real phone.

---

## 8. Pricing

**Finding:** `/pricing` already publishes real numbers — "From **$400**" Brand
Starter, "From **$2,000**" Full Build, 50% deposit, and metadata reading
*"starting at real numbers."* Meanwhile `/services/ai` currently says *"We don't
publish a number."*

That is a **posture** contradiction, not a pricing one. A visitor moving between
the two pages sees one studio with two stances and reads the silence on the
expensive-sounding page as evasion. (This was my miss in Phase 2 — the paragraph
was written from the Nova FAQ's "investment, not price" line without checking
`/pricing`.)

### 8.1 The recommendation

**Anchor, in two parts:**

> From **$X** to build. From **$Y/month** to run.

Two lines, in the existing "How it's priced" block in `AiOffers`. Prose, not cards.

**Why two parts:** AI systems genuinely have two costs — a one-time build (audit,
blueprint, integration, training on real material) and a real ongoing cost (model
usage per call, monitoring, tuning, the model swaps the page promises). Saying so
proves you understand your own cost base and kills the "why a monthly fee if it's
built?" objection before it forms. A flat monthly hides the build cost; a flat
package hides the run cost. The split is simply honest.

**Why not a tier grid:** Starter / Professional / Enterprise with checkmarks and
one column marked "Most Popular" is the most generic-SaaS artifact that exists,
and this page's entire argument is *"we are not that."* `OfferCards` supports
`price` + `priceSuffix` and the temptation to reuse it is real — **don't.** It
would undo the direction work in one section.

**Price the audit separately and name the price.** Every automation shop gives
away a free audit as a lead magnet. Charging for the diagnostic flips the frame:
the thinking is the product, the build is the consequence. It filters well —
someone who paid arrives differently. The process copy already says *"if the
numbers don't justify building, we say so"*, and that only fully lands if the
audit is a paid deliverable handed over even when the answer is no.

### 8.2 Blocked on Leon

1. **Build, from:** `$____`
2. **Monthly, from:** `$____`
3. **Audit:** `$____` (or "free" — say which)

The build "from" must read sanely next to the $400 anchor already on `/pricing`,
or the local-business buyer bounces before the calculator.

### 8.3 When the numbers arrive — three edits, one commit

1. `AiActs.tsx` → `AiOffers` "How it's priced": replace the we-don't-publish
   paragraph with the two-part anchor.
2. `src/app/pricing/page.tsx` → add an AI row with the same numbers so the pages
   stop diverging.
3. `nova-brain/knowledge.js` → update the `faq` "How much does this cost?" entry.
   **Right now Nova would say "it depends, let's book a call" to someone staring
   at a published number** — that reads as bait-and-switch.

---

## 9. Decisions locked — do not relitigate

Argued and settled. Changing one reopens the argument, not just a value.

| Decision | Rule |
|---|---|
| **Typeface** | Clash Display, site-wide. Do not reintroduce a second face. Geist Mono permitted for data annotations only, per spec §1.2. |
| **Colour roles** | Gold = the human hand, dominant. Cyan = the machine, only on system-depicting elements. Red = action, reserved. |
| **No violet/magenta** | Removed from the shaders. It is the generic-AI tell. |
| **No fabricated content** | See §1. Permanent. |
| **No outcome guarantees** | The "5-Hour-Back Guarantee" and every unmeasured claim (`10+ hours weekly`, `5+ hours target`, `4× return`) are gone. The page commits to *the measurement*, not the result. Do not reintroduce an hours or multiple-of-investment promise without a real measured client result attached. |
| **No pricing tier grid** | §8.1. |
| **CTA ladder** | §5.4. Do not add a fourth CTA system. |
| **The strategic fork** | Settled: pull back to brand. Reasoning below. |

The current spec (`specs/ai-master-page/spec.md`) is **silent on typeface and
palette** — it governs structure, motion and performance only. So the Phase 2
type and colour decisions do not contradict it, and `AI_SYSTEMS_PAGE_SPEC.md`
remains the only written rule on either.

### 9.1 The fork, and why it went this way

The open question was whether to keep the blue/violet/Space Grotesk fork as a
deliberate "AI wing of the brand", or pull back to red/gold/Clash Display.

**Pulled back.** Two reasons: every AI page on the internet is violet-cyan on
near-black, so the fork was not a wing of the brand but camouflage in the exact
category the page claims to be different from; and Clash Display is the only
element that pre-consciously says *same studio*. Gold + black is the rarer, more
ownable signal in this category, and it lets the page's core argument — **craft
is the input, AI is the multiplier** — be carried by the colour itself.

The spec's original concept (red = human, cool = machine) was **preserved and
strengthened**, not discarded: gold now carries the warmth so red can stay
reserved for action alone.

### 9.2 The guarantee, and why it was cut

The live copy read: *"Reclaim at least five verified team hours every week within
60 days—or we continue optimizing without a management fee until the agreed
target is reached."*

That is a fee-at-risk commercial term. `AI_SYSTEMS_PAGE_SPEC.md §6` lists the
remedy as an **open question** — it was never confirmed. A guarantee you would
have to litigate is worse than no guarantee.

Replaced with **"We write the number down before we start"** — the audit baseline
is recorded before the build and the same number is measured after. This is
verifiable, commercially free, and a stronger trust position than a promise every
vendor makes. If a remedy clause comes back, it comes from Leon in writing.

---

## 10. Backlog — analyzed, not built

Everything noticed and not acted on, so none of it is lost.

### 10.1 Performance

- **The 40KB-gzip Lottie hamburger** is site-wide shell weight and the largest
  single item. `/services/ai` already avoids it via `<Navbar lightweightMenu />`.
  Other routes do not. Worth a site-wide pass — out of scope for this page.
- **Three uncoordinated scroll systems** run during the hero: Lenis, GSAP
  ScrollTrigger, and IntersectionObserver, plus `LenisSnap`. The spec's §5.2
  ("one scroll subscription for the whole page") was never implemented — every
  section subscribes independently. This is the real remaining lag source on
  this route, and it is a genuine refactor, not a tweak.

### 10.2 Dead code — mention, do not delete

`graph.ts` exports `EDGES` and `NODE_COUNT`, and every `FlowNode` carries
`x / y / mx / my` coordinates. **None are consumed.** `AiSystemProof` reads only
`label`, `detail` and `accent`. (The `EDGES`/`NODE_COUNT` hits in
`AssistantCard.tsx` are unrelated local constants that happen to share the names.)

**Do not delete them.** They are the scaffolding for `AI_SYSTEMS_PAGE_SPEC.md
§3.4` — the DOM↔canvas node-graph binding where hovering a card lights its node
and edges in the particle field. That feature was specced and never built. If
Phase 3 builds it, the coordinates are already there.

### 10.3 Content slots waiting on real material

- **Testimonials.** None invented, none implied, no placeholder frames pretending.
  The moment one real client quote about an AI build exists, it slots directly
  after Act 4 (`AiSystemProof`) and becomes the page's strongest asset after
  LIONOVART OS.
- **Named film/music credits** would materially strengthen the "Voice is not a
  setting." block in `AiReframe`.

### 10.4 Known broken, not ours

`npm run lint` fails to start **on this branch and on `master`** —
`eslint-plugin-react-hooks` cannot resolve `zod/v4/core`. Worth a separate fix.
Do not let it block, and do not "fix" it by editing the lint config.

---

## 11. Still open with the founder

None block Phase 3 code; all block ship.

1. **Ownership answer** — the page states the client owns their data, accounts,
   conversations and written configuration, and leaves with the system and its
   documentation. Written as a *recommendation*, not a confirmed policy.
   **Highest priority — it is a contractual claim.**
2. **"If the numbers don't justify building, we say so"** and **"it goes live
   supervised before it goes live alone"** — carried from the spec, but they
   describe how the studio operates.
3. **Pricing** — §8.2.
4. **Five languages** — confirm all five are live in production.
5. **Film and music background** — currently generic; named credits are stronger.

---

## 12. Verification before pushing

- [ ] Rendered in a browser at desktop **and** 390px, scrolled end to end
- [ ] Four Systems tabs screenshotted; all four states distinguishable in
      greyscale at thumbnail size
- [ ] Morph walks monotonically 0 → 1; no two sections write morph or layout at
      the same scroll position
- [ ] `prefers-reduced-motion` renders one composed frame, content intact
- [ ] No scroll regression versus `/services/web` on the same machine
      (methodology in `LIONOVART_SCROLL_LAG_HANDOFF.md`)
- [ ] Copy contrast ≥ 4.5:1 over glass, independent of particle state
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` green
- [ ] `/code-review` at `high`

---

## 13. Branch and PR

- Branch: `claude/ai-services-rebuild-lcjqs8`
- PR: https://github.com/leonartist7/Lionovart_Next/pull/59 (draft)
- PR monitoring is **off by default** in this repo per `CLAUDE.md`. Do not
  subscribe to PR activity or create check-in routines unless asked in that
  conversation.
