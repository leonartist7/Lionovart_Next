# LIONOVART Website Changes — Current State (synced 2026-06-15)

> **Status: SHIPPED.** Every change in the original plan is live, and the code
> has since evolved past the original spec. This document was rewritten to
> describe what is **actually in the codebase today**, not the original
> proposal. No outstanding implementation work remains from this plan.

## Original goals (all done)
1. Redesign the "Sound Familiar?" problem/solution cards — new copy, white solution face, trust stats, horizontal layout. ✅
2. Move the red marquee relative to the Problems section. ✅ (ended up *inside* the Problems card)
3. Add a testimonials carousel. ✅ (placed after Comparison, not after Services)

---

## What is actually live

### 1. `src/lib/i18n/locales/en.ts` — `problems` key (line ~205)
3-card structure with `stats` on each solution. **Evolved past original copy:**
- `eyebrow`: `"Your Next Chapter Starts Here"`
- `heading`: `"IMAGINE"` (original plan said `"Sound Familiar?"`)
- Problem `heading`s reframed from pain → aspiration:
  - `"Your Brand Commands The Room"`
  - `"Your Business Shows Up Where It Counts"`
  - `"You Have a Full Team Behind You"`
- Each `solution` carries `stats: { value: string; label: string }[]` (3 each). The
  `Translations` type is inferred via `typeof en`, so `stats` is part of the type.

### 2. `src/lib/i18n/locales/fr.ts` — `problems` key
French mirror of the 3-card + `stats` structure. `es.ts` / `it.ts` / `ko.ts`
spread `...en` and don't override `problems`, so they inherit the English shape.

### 3. `src/components/sections/ProblemsSolvedSection.tsx`
Full rewrite shipped **and extended well beyond the plan:**
- Whole section now sits inside a red `#e5192a` rounded **"IMAGINE" card**, width
  driven by CSS var `--imagine-card-d` (shared with the Process lion circle).
- **`MarqueeSlanted` is rendered *inside* this card** (top band), not as a
  standalone section in `PageBuilder`. This is why step 4's "move the marquee
  between sections" no longer applies.
- Heading uses `SplitTextReveal` (`as="h2"`, `from="center"`).
- Each card: `position: sticky`, `top: 80 + index * 72` px (plan said `* 80`).
- Solution face: white bg, image placeholder left (`hidden md:flex`, 38%), text
  right with green checkmark, body, and brand-red `stats` row.
- **Problem overlay is title-only and centered** — big uppercase heading, *no
  body text* (original plan kept the body and left-aligned it).
- Lion-paw swipe animation preserved exactly: `PAW_IN_DURATION 0.35`,
  `PULL_DURATION 0.70`, `EASE_IN [0.2,0,0.6,1]`, `EASE_OUT [0.20,1,0.3,1]`,
  `runReveal`/`runReset`, Cloudinary paw URL `...Untitled_design_4_muu53f.png`,
  golden drop-shadow `rgba(240,201,23,0.55)`, hover spring `stiffness 350 / damping 24`.
- 3 cards, driven by `t.problems.items`.

### 4. `src/components/sections/MarqueeSlanted.tsx`
Bottom-only shadow shipped exactly as planned:
`shadow-[0_12px_24px_-4px_rgba(0,0,0,0.5)]`. Component is now consumed by
`ProblemsSolvedSection` (inside the IMAGINE card), **not** by `PageBuilder`.

### 5. `src/components/sections/PageBuilder.tsx`
Section order fully rebuilt past the plan. `MarqueeSlanted` is **no longer
imported here**. Current fallback order (`blocks` empty):

```
SceneVideoBackdrop, HeroLogoFly
hero        → HeroTop
what-we-do  → WhatWeDo
about       → AboutUsHalf
problems    → ProblemsSolvedSection   (contains the marquee)
offer       → SignatureOffer
services    → Services
process     → Process
SectionTitleCard "PROOF." (light)
comparison  → Comparison
SectionTitleCard "CONFIDENCE." (light)
TestimonialsCarousel                  (plan put this after Services)
testimonials → Testimonials
SectionTitleCard "ASK." (dark)
faq         → FAQ
closing-cta → ClosingCTA
```

A second `blocks.map` branch renders Sanity-driven blocks by `_type`.

### 6. `src/components/sections/TestimonialsCarousel.tsx`
Shipped, then **completely reworked** from the plan's mock version:
- Real partner data array `PARTNERS` (Rocco, Forty Seven, Lahaut, Podium) with
  `name`, `industry`, `quote`, `logo`, optional `image`, and `backImage`.
- **Venue photo as full-card background** (`backImage`, cross-faded via
  `AnimatePresence`) + black/blur legibility wash. No initials-avatar, no
  per-item `accentColor`, no star row (all of which the original plan had).
- Assets live in `public/images/Testimonials/<venue>/`; folder names contain
  spaces, so paths run through `encodeURI` at render.
- Brand logo shown free-standing; profile photo beside name when present.
- Dots on the **left** (active = yellow `#facc15`), arrows on the **right**.
- Auto-play 8s, pauses on hover and for 10s after any manual nav.
- Uses `framer-motion` + `lucide-react` (`ChevronLeft`/`ChevronRight` only).

---

## Files left untouched (as the original plan required)
`LumaShowcase`, `HeroTop`, `Navbar`, `Services`, `Testimonials` (the existing
scroll-stack one), `AboutUsHalf`, `Comparison`, `Process`, `Portfolio`, `FAQ`,
`Footer`, `ImageMarquee`, `TrustedBadgesSection`.

## Verification (already passing in shipped build)
- `npm run build` — no TS errors from `stats`; no missing imports.
- Paw swipe works on all 3 IMAGINE cards; cards sticky-stack on scroll.
- Carousel arrows/dots/auto-play work; venue backgrounds cross-fade.
- Existing `Testimonials` scroll-stack section still renders after the carousel.
