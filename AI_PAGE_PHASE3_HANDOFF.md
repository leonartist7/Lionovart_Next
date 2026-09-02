# /services/ai — Phase 3 Handoff

> **Status:** Phase 2 (narrative, typography, colour, CTA ladder) is shipped in
> [PR #59](https://github.com/leonartist7/Lionovart_Next/pull/59) on branch
> `claude/ai-services-rebuild-lcjqs8`. This document is the brief for Phase 3:
> **particles, layout, and pricing.**
>
> **Read this file first, then `AI_SYSTEMS_PAGE_SPEC.md`** (the original approval
> doc — still authoritative on intent, superseded here where they disagree).

---

## 0. How to start the next session

### Skills to load

| Skill | Why |
|---|---|
| **`impeccable`** | Primary. Covers motion, micro-interactions, visual hierarchy, performance, and "ambitious visual effects that should feel technically extraordinary" — which is exactly the particle work. |
| **`run`** | **Non-negotiable.** Launches the app so you can actually look at the page. See §0.1. |
| **`code-review`** | Final pass before pushing, at `high`. |
| `design-taste-frontend` | Optional alternative for the layout pass specifically — it is audit-first on redesigns and anti-templating, which suits §2. |

Do **not** reach for `ui-ux-pro-max` here. It is broad UI intelligence tuned for
greenfield product surfaces; this is a bespoke WebGL narrative page with an
established design system, and generic palette/font/style libraries will fight it.

### 0.1 The single biggest quality risk

**Nobody has looked at this page in a browser.** Not the Phase 0 audit, not the
Phase 2 build. Every judgement so far — including every judgement in this
document — was made by reading source code and reasoning about it.

That is fine for copy and for structural defects. It is **not** fine for
particles, motion timing, or layout rhythm, which are the entire subject of
Phase 3. A shader that reads correctly in GLSL can look like nothing on screen.

**So: before writing any Phase 3 code, run the page and look at it.** Use the
`run` skill, or drive it with Playwright (Chromium is preinstalled at
`/opt/pw-browsers/chromium`; `PLAYWRIGHT_BROWSERS_PATH` is already set — do not
run `playwright install`). Scroll it slowly at desktop and at 390px. Screenshot
each of the four Systems tabs. Then compare what you see against §1.2's claim
that three of the four are visually near-identical. Verify it; don't take it on
faith.

Preview deployment of the current head:
https://lionovartnext-git-claude-ai-services-rebuild-lcjqs8-lionovart.vercel.app/services/ai

---

## 1. Phase 3A — Particles

### 1.1 How the system actually works

One `LionExperience` instance, one canvas, one RAF loop, mounted fixed behind
all content by `AiLionStage.tsx`. Sections drive it through three setters on the
stage ref (`src/lib/lion/stage-ref.ts`):

- `setMorph(0..1)` — position along the story. **This is the only state input.**
- `setLayout(-1..1)` — horizontal composition offset (copy left ⇄ copy right).
- `setBloom(0..1)` — reforms the crown for the close.

The morph states are **not** procedural. Four target positions per particle are
computed once on the CPU and uploaded as static attributes, then the vertex
shader interpolates between them:

**`src/lib/lion/LionExperience.ts:378–436`** — one loop, four generators:

| Attribute | Lines | Current shape |
|---|---|---|
| `aBurst` | ~394–402 | Radial sphere-ish scatter |
| `aEcosystem` | ~404–414 | Three intersecting orbital bands |
| `aEnergy` | ~416–425 | Double helix, drifting on Y |
| `aHub` | ~427–435 | Five stacked rings |

**`src/lib/lion/shaders.ts:178–190`** — the blend windows:

```glsl
float burstT     = smoothstep(0.08, 0.28, m);
float ecosystemT = smoothstep(0.30, 0.50, m);
float flowT      = smoothstep(0.56, 0.76, m);
float hubT       = smoothstep(0.80, 0.97, m);
```

The crown itself is the `position` attribute (edge-sampled mesh, gold, genuinely
well built — **do not touch it**). `uBloom` mixes back to it for Act 8.

### 1.2 The defect: the four tabs are not four states

This is the measurable form of "morphing figures are unclear and decoupled from
the pillars." Current tab morph values, set in `AiActs.tsx` `SYSTEMS[].to`:

| Tab | Room | `to` | Falls inside |
|---|---|---|---|
| 01 | The Front Desk | `0.72` | mid **flow** (helix) |
| 02 | The Follow-Through | `0.80` | start of **hub** |
| 03 | The Back Office | `0.88` | mid **hub** |
| 04 | The Control Room | `0.96` | end of **hub** |

**Tabs 02, 03 and 04 all land inside the same `hubT` window.** Switching between
them moves the same rings by a few degrees of rotation. Three of the four
pillars are, visually, the same picture. Tab 01 is a helix that has nothing to
do with a front desk.

Verify this on screen first (§0.1), then fix it.

### 1.3 The fix

**Four rooms, four distinguishable forms, four non-overlapping windows.**

The copy already names shapes a viewer can read. Match the geometry to the noun:

| # | Room | Form to build | Reads as |
|---|---|---|---|
| 01 | **The Front Desk** | A dense vertical **portal/arch** with a steady inbound stream of particles crossing its threshold and being absorbed. Nothing passes through unanswered. | A door that is always open |
| 02 | **The Follow-Through** | Several long **filaments** that leave the mass, arc out, and curve *back* — none of them escaping the frame. Slow, patient travel. | Threads that don't drop |
| 03 | **The Back Office** | Interlocking **counter-rotating bands** on a shared axis, tight and regular. Mechanical, quiet, obviously periodic. | A mechanism turning |
| 04 | **The Control Room** | A wide, shallow **instrument array** — a sparse readable lattice facing the viewer, with a slow scan of brightness travelling across it. | A room of dials |

Design rules for all four:

1. **Silhouette first.** Each must be identifiable in a 200×200 thumbnail with
   colour removed. If two are confusable in greyscale at thumbnail size, redo
   the one that lost.
2. **No filled centres.** The existing comment at `shaders.ts:141` warns about
   the "opaque sphere / white-hole artifact" — that lesson is expensive and
   already paid for. Keep every form open and individually readable.
3. **Distinct axis of motion per room.** Portal = inbound on Z. Filaments =
   out-and-return on a curve. Bands = counter-rotation on Y. Array = a
   travelling scan on X. Four different motions is half of what makes four
   different states.
4. **Cold, per §3.** These are machine states. Gold belongs to the crown and the
   close.

**New windows** — evenly spaced, non-overlapping, with a real hold in each:

```glsl
float roomAT = smoothstep(0.30, 0.42, m) * (1.0 - smoothstep(0.46, 0.56, m));
float roomBT = smoothstep(0.50, 0.60, m) * (1.0 - smoothstep(0.64, 0.72, m));
float roomCT = smoothstep(0.66, 0.76, m) * (1.0 - smoothstep(0.80, 0.86, m));
float roomDT = smoothstep(0.82, 0.92, m);
```

That is a sketch, not a spec — tune it against what you see. The requirement is:
**each room owns a plateau where it is fully itself**, and the tab morph values
land dead-centre in their plateau (roughly `0.44 / 0.62 / 0.78 / 0.94`).

Update `SYSTEMS[].to` in `AiActs.tsx` to match, and re-check the chapter ranges
in `AiChaosBeat.tsx` (`BRIDGE_MORPH_END`), `AiReframe`, `AiSystemProof` and
`AiProcess` so the whole page still walks monotonically from 0 to 1.

### 1.4 What must not regress

The performance contract in `AI_SYSTEMS_PAGE_SPEC.md §5` and the findings in
`LIONOVART_SCROLL_LAG_HANDOFF.md` still bind:

- The four generators run **once, on the CPU, at build time.** Do not move
  per-particle work into the RAF loop, and do not add a fifth attribute without
  checking the memory cost at the high-tier particle budget.
- The vertex shader already gates curl noise behind `m < 0.62` and
  `USE_ORGANIC_DETAIL` because it is the most expensive work in the pass. New
  forms must be cheap arithmetic — trig and mixes, no noise in the geometric
  states.
- No new canvases, no new RAF loops, no `getBoundingClientRect()` in a scroll or
  frame handler.
- `prefers-reduced-motion` must still resolve to one composed frame
  (`skipIntro()` + `renderOnce()`), and the page must remain fully
  comprehensible with the canvas removed entirely.

---

## 2. Phase 3B — Layout

### 2.1 The defect: one rhythm, repeated six times

Measured on the current head: **six** sections use the identical composition —
a single copy column constrained to `md:w-[62%]` / `md:w-[64%]`, alternating
`md:ml-auto` to flip sides.

`AiReframe`, `AiSystemProof`, `AiSystems`, `AiProcess`, `AiObjections`,
`AiOffers`. Left, right, left, right, left, right.

Alternation is not variety. After the second flip the reader stops perceiving it
as composition and starts perceiving it as a template — which is precisely the
"reads generic" complaint, expressed in layout rather than colour. The typography
and palette were fixed in Phase 2; this is the part of that problem still standing.

### 2.2 The defect: 17 viewports of scroll

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

The worst offender is the tension act: **4.2 viewports to deliver three
paragraphs.** That is roughly 40 seconds of scrolling for 25 seconds of reading,
and it sits at the point in the page where a skeptical buyer is deciding whether
to keep going.

### 2.3 The fix

1. **Cut the chaos beat to ~260svh.** Three beats at ~85svh each still gives each
   one a genuine reading hold. Re-check the opacity curve in
   `AiChaosBeat.tsx` (`onUpdate`, the `distance <= 0.09` plateau) after changing
   the height — the plateau is expressed in scroll progress, so it scales, but
   the *time* on screen shortens and may need widening.
2. **Break the column rhythm in at least two places.** Candidates, in order of
   payoff:
   - **`AiSystemProof`** — the OS rail is a list of seven mechanisms. It wants
     to be wide, not squeezed into 62%. Give it the full measure and let the
     rail run edge to edge.
   - **`AiObjections`** — already a two-column `<dl>`; take it full-width and
     drop the 64% wrapper so it reads as a reference block, deliberately
     different in register from the narrative sections around it.
3. **Give the ROI section a real entrance.** It is the only opaque light section
   on the page (`bg-[#f4f1ea]`) and currently just arrives. That colour flip is
   the strongest structural beat available and it is being spent for free.
4. **Check `min-h-[38rem]` on the Systems tab panel** (`AiActs.tsx`). Fixed
   minimum height across four panels of unequal length means the shortest panel
   has dead space under it. Measure all four; set the floor to the tallest
   actual content, or let it size and animate the height change.
5. **Mobile is untested.** Every section collapses to the same single column at
   `<md`, and the alternation that carries the desktop composition disappears
   entirely. At 390px this page is currently ten identical text blocks in a row.
   This may be the most important item in §2 and it is the one nobody has looked
   at.

---

## 3. Locked decisions — do not relitigate

These were argued and settled in Phase 2. Changing one means reopening the
argument, not just editing a value.

| Decision | Rule |
|---|---|
| **Typeface** | Clash Display, site-wide. The page previously forked to Space Grotesk against its own spec (`AI_SYSTEMS_PAGE_SPEC.md §1.2`). Do not reintroduce a second face. Geist Mono is permitted for data annotations only, per §1.2. |
| **Colour roles** | `--ai-gold` (#f0c917) is the dominant accent and means *the human hand*. `--ai-cyan` (#63cfe6) is the only cold accent and appears **only** on elements depicting the machine (OS rail, tab indicator, node dots, "You see:" labels). `brand-red` is reserved for action. |
| **No violet/magenta** | Removed from the shaders in Phase 2. It is the generic-AI tell. The cold family runs cyan → deep signal blue and warms toward gold; it does not go purple. |
| **No fabricated content** | No invented testimonials, client names, metrics, headshots, or "trusted by N brands." Where proof is missing, the page shows mechanism instead. This is not a placeholder state to be filled with plausible-sounding filler later. |
| **No outcome guarantees** | The "5-Hour-Back Guarantee" and every unmeasured claim (`10+ hours weekly`, `4× return`) were removed. The page commits to *the measurement*, not the result. Do not reintroduce an hours or multiple-of-investment promise without a real measured client result attached to it. |
| **No pricing tier grid** | See §4. |
| **CTA ladder** | Hero button is the only CTA inside the hero's scroll range. `AiPageNav` holds until the hero fully exits. Global `StickyCTA` is suppressed on this route (`StickyCTA.tsx`). Do not add a fourth CTA system. |

---

## 4. Pricing — the recommendation

**Finding:** `/pricing` already publishes real numbers — "From **$400**" Brand
Starter, "From **$2,000**" Full Build, 50% deposit, and metadata that says
*"starting at real numbers."* Meanwhile `/services/ai` currently says *"We don't
publish a number."*

That is a posture contradiction, not a pricing one. A visitor moving between the
two pages sees one studio with two stances, and reads the silence on the
expensive-sounding page as evasion.

### The recommendation

**Anchor on the AI page, in two parts:**

> From **$X** to build. From **$Y/month** to run.

Two lines, inside the existing "How it's priced" block in `AiOffers`
(`AiActs.tsx`). Prose, not cards.

**Why two parts:** AI systems genuinely have two costs — a one-time build
(audit, blueprint, integration, training on real material) and a real ongoing
cost (model usage per call, monitoring, tuning, the model swaps the page
promises). Stating that structure out loud proves you understand your own cost
base, and it kills the "why is there a monthly fee if it's built?" objection
before it forms. A flat monthly hides the build cost. A flat package hides the
run cost. The split is simply honest.

**Why not a tier grid:** Starter / Professional / Enterprise with checkmarks and
one column marked "Most Popular" is the single most generic-SaaS artifact that
exists. This page's entire argument is *"we are not that."* `OfferCards` supports
`price` + `priceSuffix` and the temptation to reuse it here is real — don't. It
would undo the direction work in one section.

**Price the audit separately, and name the price.** Every automation shop gives
away a free audit as a lead magnet. Charging for the diagnostic flips the frame:
the thinking is the product, the build is the consequence. It also filters well —
someone who paid shows up to the call differently. The process copy already says
*"if the numbers don't justify building, we say so"*, and that line only fully
lands if the audit is a paid deliverable handed over even when the answer is no.

### Blocked on Leon

Three numbers. Nothing else is missing.

1. **Build, from:** `$____`
2. **Monthly, from:** `$____`
3. **Audit:** `$____` (or "free" — say which)

The build "from" has to be legible next to the $400 anchor already set on
`/pricing`, or the local-business buyer bounces before reaching the calculator.

### When the numbers arrive

Three edits, one commit:

1. `AiActs.tsx` → `AiOffers` "How it's priced" block: replace the
   we-don't-publish paragraph with the two-part anchor.
2. `src/app/pricing/page.tsx` → add an AI row carrying the same numbers, so the
   two pages stop diverging.
3. `nova-brain/knowledge.js` → update the `faq` "How much does this cost?" entry
   so Nova quotes the same anchor a visitor just read. **Right now Nova would say
   "it depends, let's book a call" to someone looking straight at a number** —
   that reads as bait-and-switch.

---

## 5. Still open with the founder

Carried from PR #59. None of these block Phase 3 code, all of them block ship.

1. **Ownership answer** — the page states the client owns their data, accounts,
   conversations and written configuration, and leaves with the system and its
   documentation. This was written as a *recommendation*, not a confirmed
   policy. **Highest priority of the five** — it is a contractual claim.
2. **"If the numbers don't justify building, we say so"** and **"it goes live
   supervised before it goes live alone"** — both carried from the original spec,
   but they describe how the studio operates.
3. **Pricing** — §4.
4. **Five languages** — the repo has `en/fr/es/it/ko` prompt sets in
   `nova-brain/prompts/`. Confirm all five are live in production before the page
   claims five.
5. **Film and music background** — written generically. Named credits would make
   the "Voice is not a setting" block materially stronger.

---

## 6. Verification before pushing

- [ ] Page rendered in a browser at desktop **and** 390px, scrolled end to end
- [ ] Four Systems tabs screenshotted; all four particle states distinguishable
      in greyscale at thumbnail size
- [ ] Morph walks monotonically 0 → 1 across the whole page; no two sections
      write morph or layout at the same scroll position
- [ ] `prefers-reduced-motion` renders one composed frame, full content intact
- [ ] No scroll regression versus `/services/web` on the same machine
      (the methodology is in `LIONOVART_SCROLL_LAG_HANDOFF.md`)
- [ ] Copy contrast ≥ 4.5:1 over glass panels, independent of particle state
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` green
- [ ] `/code-review` at `high`

**Known-broken, not yours:** `npm run lint` fails to start on this branch *and*
on `master` — `eslint-plugin-react-hooks` cannot resolve `zod/v4/core`. Worth a
separate fix; do not let it block, and do not "fix" it by editing the lint config.

---

## 7. Branch and PR

- Branch: `claude/ai-services-rebuild-lcjqs8`
- PR: https://github.com/leonartist7/Lionovart_Next/pull/59 (draft)
- PR monitoring is **off by default** in this repo per `CLAUDE.md` — do not
  subscribe to PR activity or create check-in routines unless asked in that
  conversation.
