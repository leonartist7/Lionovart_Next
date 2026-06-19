# LIONOVART — Homepage Revamp Plan (2026-06)

Plan for the requested round of homepage changes. Each task lists the exact
file(s), the intended change, my interpretation/assumptions, and a
**recommended model + thinking level** chosen to balance token cost against
quality. Tasks are grouped into execution batches so related work shares
context (cheaper, more coherent).

> **Goal of the model/thinking column:** spend the expensive reasoning only
> where it pays off (scroll/z-index choreography, strategic copy) and keep the
> mechanical CSS tweaks on a cheaper, lower-thinking pass.

---

## Model & thinking legend

| Tier | Model | When |
|------|-------|------|
| 💚 Cheap | **Sonnet 4.6** | Surgical CSS/layout/responsive tweaks, value swaps, low ambiguity. |
| 🔶 Strong | **Opus 4.8** | Strategic copy with brand voice, or logic with real failure modes. |

| Thinking | Meaning |
|----------|---------|
| `none/low` | Just do it — the change is mechanical and verifiable by eye. |
| `think` | One layout/interaction to reason about. |
| `think hard` | Copy that must land a strategic point, or multi-file layout. |
| `think harder` | Scroll-linked + stacking-context choreography with regressions at stake. |

**Always verify visually** (run `npm run dev`, check the affected breakpoints) for
anything touching layout, spacing, or animation. The cheap tiers assume a
visual check at the end of the batch, not a blind edit.

---

## Reference map (where things actually live)

- Hero CTA copy + placeholder → `src/components/ui/HeroEmailCapture.tsx`
- Hero section shell / bottom gradient → `src/components/sections/HeroTop.tsx`
- Logo fly-to-navbar → `src/components/ui/HeroLogoFly.tsx`
- Navbar + Expertise mega-band z-index → `src/components/sections/Navbar.tsx`
- "Video that splits" section → `src/components/sections/what-we-do/DisciplineSplit3D.tsx` (via `WhatWeDo.tsx`)
- Background video peeking behind hero → `src/components/sections/SceneVideoBackdrop.tsx`
- Trust badges → `src/components/sections/TrustedBadgesSection.tsx` (rendered inside `HeroTop`)
- About section → `src/components/sections/AboutUsHalf.tsx`
- "Imagine" problem/solution → `src/components/sections/ProblemsSolvedSection.tsx`
- In-card marquee → `src/components/sections/MarqueeSlanted.tsx`
- Card-size token → `--imagine-card-d` in `src/app/globals.css:228`
- Copy lives in i18n: `src/lib/i18n/locales/en.ts` + `fr.ts` (es/it/ko inherit from `en`)

---

# 1 — HERO SECTION

### 1.1 — Rework the CTA microcopy + add charisma line
**File:** `src/components/ui/HeroEmailCapture.tsx` (placeholder ~L57-59, helper text ~L96-108)
**Change:** "Get your free brand audit" → frame it as **"Get your custom demo"** *and* a free brand audit. Add a witty confidence line (e.g. a "100% delivered on time"-style proof phrase). Keep it inside the email-box helper area; keep mobile/desktop variants in sync.
**Interpretation:** Lead value = the custom demo; the brand audit is the bonus. The charisma line should reassure, not clutter — one short line under the pill.
**Recommendation:** 🔶 **Opus 4.8 · `think hard`** — short but it's conversion copy that needs voice + wit. Cheap to run (tiny edit), worth the better wording.

### 1.2 — Logo SVG layering + extended hero stickiness ⚠️ HIGHEST RISK
**Files:** `HeroLogoFly.tsx`, `Navbar.tsx` (Expertise band `-z-10` @ L428, logo flier `z-[60]` @ L62), possibly `HeroTop.tsx`
**Two coupled problems:**
1. **Layering:** When the flown logo docks in the navbar it sits at `z-[60]`, *above* the Expertise mega-band (`-z-10` relative to navbar) and mobile dropdown. The dropdown service cards must render **on top of** the docked logo. Fix by lowering the docked logo's stacking layer (or raising the dropdown panels) so menu cards always win, without breaking the logo riding above the bar during its flight.
2. **Timing:** Let the logo finish docking *before* the rest of the hero scrolls away — give the hero a short extra sticky hold so the logo "lands" first.
**Decided:** Logo **sits behind the dropdown cards** once docked — keep it in place and *lower its stacking layer* (or raise the dropdown/mobile panels) so menu cards always render on top. The logo stays the visible navbar wordmark. Add only a **short sticky pin** (~0.3–0.5 viewport of scroll) so the logo finishes docking before the hero releases — not a long hold.
**Recommendation:** 🔶 **Opus 4.8 · `think harder`** — this is scroll-linked transforms + nested stacking contexts; easy to regress the whole nav/hero. Isolate it in its own batch and verify on desktop + mobile, hero + scrolled states.

### 1.3 — Add a value "notice line" (scarcity / promo strip)
**File:** new small element in `HeroTop.tsx` (above headline or under CTA)
**Change:** A tasteful single-line notice — e.g. "Only a few spots left this month" or a seasonal promo — that adds value, not distraction.
**Interpretation:** A subtle pill/line, brand-red accent, not a full announcement bar. Static copy for now (no live spot-counter unless asked).
**Recommendation:** 🔶 **Opus 4.8 · `think`** — copy-led, light implementation. Pair with 1.1 for voice consistency.

### 1.4 — Deepen the black at the hero's bottom edge
**File:** `HeroTop.tsx` gradient @ ~L376
**Change:** Add a ~5px near-black band at the very bottom before the gradient, so the seam into the next (black) section is smoother.
**Interpretation:** Extend the final gradient stop to ~`#000` and/or add a thin solid black sliver at the bottom edge.
**Recommendation:** 💚 **Sonnet 4.6 · `low`** — one gradient string. Verify by eye.

---

# 2 — SECTION UNDER THE VIDEO (spacing)

### 2.1 — Close the gap between the splitting video and the trust badges
**File:** `src/components/sections/what-we-do/DisciplineSplit3D.tsx` (the "What We Do" splitting clip), plus wherever the trust-badges sit relative to it.
**Decided:** This is the **DisciplineSplit3D** video (the clip that splits into 3 cards), not the hero backdrop. Trim the large blank band so the video sits ~3px above the trust-badges component (close, not flush). Likely the `230vh` section height / sticky-frame padding (@ ~L167-169) or the spacing of the block that follows it.
**Recommendation:** 💚 **Sonnet 4.6 · `think`** — reproduce in browser first to confirm the exact empty band, then trim. Do not edit blind.

---

# 3 — ABOUT US SECTION

### 3.1 — Reduce desktop top whitespace (start sooner)
**File:** `AboutUsHalf.tsx` desktop block padding @ ~L174 (`pt-[clamp(4rem,7vh,6rem)]`)
**Change:** Tighten desktop top padding so the section begins higher. Mobile is fine — gate the change to `lg:` only.
**Recommendation:** 💚 **Sonnet 4.6 · `low`** — clamp tweak, desktop-only.

### 3.2 — Make the "Innovation… necessity." headline bolder
**File:** `AboutUsHalf.tsx` (`font-display` headline @ ~L178/L195)
**Change:** Increase weight (and/or switch to a heavier display face) for more presence.
**Recommendation:** 💚 **Sonnet 4.6 · `low`** — class change. Confirm the heavier weight is available in the loaded font.

### 3.3 — Swap the headline text-reveal animation
**Files:** `AboutUsHalf.tsx` (GSAP word-rise @ ~L141), optionally `src/components/ui/SplitTextReveal.tsx`
**Change:** Replace the current word-rise reveal with a different reveal style.
**Interpretation:** Direction unspecified — see Open Questions for which style. Default suggestion: a clip/mask wipe or blur-in if no preference given.
**Recommendation:** 🔶 **Opus 4.8 · `think`** — animation feel + not breaking the pinned GSAP timeline. Bump to `think hard` if the new reveal must stay scrubbed to the pin.

### 3.4 — Center the portrait + paint; fix the cropped paint on desktop
**File:** `AboutUsHalf.tsx` (grid `grid-cols-[1fr_34%]` @ ~L191; paint `-right-20` @ ~L106)
**Change:** Add symmetric lateral padding so the portrait/paint sit more centered and the paint image stops getting clipped on the right. Desktop only.
**Recommendation:** 💚 **Sonnet 4.6 · `think`** — overflow/positioning interplay; verify the paint isn't re-clipped at multiple desktop widths.

---

# 4 — "IMAGINE" (problem / solution)

### 4.1 — Add the LION-CIRCLE emblem at the top of the red card
**Files:** `ProblemsSolvedSection.tsx` (red card header @ ~L246-272); reference the lion-circle in `Process.tsx` (@ ~L189-191, sized via `--lion-circle-d`).
**Decided:** Use the **LION-CIRCLE** (the circular lion mark from the Process section) at the top of the red card, above the eyebrow/heading. Reuse the same asset/markup the Process circle uses; size it modestly here (don't reuse the full `--lion-circle-d` diameter — scale down for a header emblem). Centered.
**Recommendation:** 💚 **Sonnet 4.6 · `think`** — locate the lion-circle asset/markup in Process, replicate at emblem scale, responsive sizing.

### 4.2 — Make the red card 15% larger on big screens
**File:** `src/app/globals.css:228` (`--imagine-card-d`)
**Change:** On large breakpoints, increase the card width token by ~15%.
**Interpretation:** This token is shared with the Process lion-circle (`--lion-circle-d`, `globals.css:227`) — check whether the circle is meant to track it. If they must stay equal, bump both; if not, scope the +15% to `--imagine-card-d` at `lg`/`xl` only.
**Recommendation:** 💚 **Sonnet 4.6 · `think`** — small change but verify the shared-token relationship so Process doesn't desync.

### 4.3 — Solution-card responsive padding + trimmed content
**Files:** `ProblemsSolvedSection.tsx` (solution layer @ ~L99-162), i18n `en.ts`/`fr.ts` (`problems.items[*].solution`)
**Change:**
- **Tablet** (the breakpoint where the inner image disappears, ~`md` and below): more lateral padding.
- **Mobile:** shorten or drop the description; reduce to **2 stats** instead of 3.
**Interpretation:** Recommend keeping the two most persuasive stats (a hard result + a credibility/scale number), dropping the softest one. Copy trimming is light but voice-sensitive.
**Recommendation:** 🔶 **Opus 4.8 · `think hard`** — the stat-selection and shortened copy are persuasion decisions; the padding part is trivial. Do alongside 4.4 for one coherent copy pass.

### 4.4 — Rewrite the 3 core problem/solution points (strategic) ⭐
**Files:** i18n `en.ts` + `fr.ts` (`problems.items`)
**Change:** Reframe the three cards as the three reasons to hire Leon, without repetition. Themes the user gestured at:
1. **Stop guessing / "eyeballing" it** → trust experts who know what actually works *right now*.
2. **Hand it all off** → one team takes care of everything so they don't run marketing + business alone.
3. **Modern, creative, smart systems** → making cutting-edge creative + AI systems accessible to their brand.
**Interpretation:** These must read as three *distinct* benefits building one argument, in the LIONOVART voice. This is the most important copy on the page.
**Recommendation:** 🔶 **Opus 4.8 · `think harder`** — pure strategic positioning; worth the deepest reasoning. Confirm direction first (Open Questions) before writing final copy + FR translation.

### 4.5 — Remove the in-card marquee; make a diagonal "cross" between sections
**Files:** `ProblemsSolvedSection.tsx` (remove marquee @ ~L249-251), `MarqueeSlanted.tsx`, and the seam into the next section (`SignatureOffer`)
**Change:** Delete the marquee inside the red card. Instead, place two slanted marquees forming a diagonal **X/cross** in the gap between this section and the next.
**Interpretation:** Two counter-rotated slanted bands (one `+`deg, one `-`deg) overlapping in an X, spanning the section seam. Needs an overflow/z-index home that doesn't clip.
**Recommendation:** 🔶 **Opus 4.8 · `think hard`** — the crossed-diagonal layout (rotation, overlap, clipping, responsive) is the fiddly part; verify it doesn't introduce horizontal scroll.

---

## Suggested execution batches (token-efficient)

| Batch | Tasks | Model | Thinking | Rationale |
|-------|-------|-------|----------|-----------|
| **A — Copy pass** | 1.1, 1.3, 4.3 (copy), 4.4 | Opus 4.8 | `think harder` | One voice, one context load. Strategic + witty copy together. |
| **B — Nav choreography** | 1.2 | Opus 4.8 | `think harder` | Isolated; highest regression risk. |
| **C — CSS/spacing** | 1.4, 2.1, 3.1, 3.2, 3.4, 4.2, 4.3 (padding) | Sonnet 4.6 | `low`→`think` | Cheap mechanical tweaks, one browser-verify pass. |
| **D — Layout/animation** | 3.3, 4.1, 4.5 | Opus 4.8 / Sonnet | `think`/`think hard` | Animation feel + crossed marquee need judgment. |

Run each batch on its own branch slice, verify visually, then commit. Keep
batches B and the copy work (A/4.4) gated on the Open Questions below.

---

## Implementation status (all batches shipped)

- **Batch C** ✅ 1.4, 2.1, 3.1, 3.2, 3.4, 4.1, 4.2, 4.3 (padding) — commit `02a2b31`
- **Batch A** ✅ 1.1 (copy + charisma line), 1.3 (notice strip), 4.3 (mobile trim), 4.4 (3-reason rewrite EN/FR/ES)
- **Batch B** ✅ 1.2 — flier dropped to z-45 (cards now render above docked logo), docks sooner (0.42vh), navbar reveals its own logo past hero. Sticky-pin avoided in favour of dock-sooner (lower risk).
- **Batch D** ✅ 3.3 (clip-mask wipe reveal), 4.5 (in-card marquee removed → `MarqueeCross` diagonal X between Problems/Offer)

Build verified locally: TypeScript clean, 24/24 static pages generated. Vercel
failures are pre-existing missing env vars (`WHATSAPP_NUMBER`, `BOOKING_URL`,
`RESEND_API_KEY`) — unrelated to these changes.

## Resolved decisions

- **(1.2)** Logo sits **behind** the dropdown cards once docked; **short sticky pin** for the hold. ✅
- **(2.1)** It's the **"What We Do" splitting video** (DisciplineSplit3D). ✅
- **(4.1)** Emblem = the **LION-CIRCLE** from the Process section. ✅

## Still open (resolve before that task; safe defaults noted)

1. **(3.3) New reveal style** — Any preference (mask/clip wipe, blur-in, char-by-char, line-by-line)? **Default if no answer:** clip-mask wipe.
2. **(4.3) Stats to keep on mobile** — OK to keep the strongest result + one credibility number and drop the third? **Default if no answer:** keep best result + best scale/credibility stat.
3. **(4.4) Copy direction** — Confirm the three-reason framing in 4.4 before I write final EN copy + FR translation.
</content>
</invoke>
