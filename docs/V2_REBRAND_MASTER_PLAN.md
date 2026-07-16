# LIONOVART /v2 — MASTER PLAN v3
## The Ultimate Premium Rebrand: prompt + full implementation spec

This single document is the source of truth for building the LIONOVART v2 landing page. It contains: the research digest (what makes a site read as premium), the improved master prompt (Part A), the complete chapter-by-chapter implementation spec (Part B), the asset generation kit (Part C), and the verification protocol (Part D). It is written so lighter models can implement each chapter without re-reading anything else.

**State:** Chapters 1–8 are built, wired into `src/app/v2/page.tsx`, verified, and pushed on branch `claude/lionovart-rebrand-v2-8624vy` (open PR #18; chapters 1–2 previously merged to master via PR #16). Chapters 9–10 remain. Build ONE chapter at a time, in order. Read the Progress Log near the end of this doc first — it records real bugs and learnings that will save you multiple debugging cycles.

---

# PART 0 — Research digest: what makes a website read as "$50k"

Distilled from the current award landscape (Awwwards SOTD/SOTY winners; studios like Active Theory, Lusion, Obys, Unseen Studio, OFF+BRAND's Lando Norris SOTY site) and conversion practice for high-ticket creative services:

1. **One art direction, zero exceptions.** Every pixel obeys the same palette, type scale, easing curve, and corner-radius system. Template smell comes from inconsistency, not from simplicity.
2. **WebGL/shaders are a scene, not wallpaper.** Award sites use ONE signature real-time moment (a silk field, a particle portal) tied to the story. Everything else is calm. Shaders everywhere = slop.
3. **Type-led motion.** The most premium-feeling sites animate typography with restraint (masked line reveals, slow settles) rather than flying elements.
4. **Film assets beat UI decoration.** Real cinematic footage/renders (even 3 seconds, looped) instantly outclass any CSS trick. Asset quality is the single biggest "expensive" signal.
5. **The wow is choreographed, not loud.** First 2 seconds: dark stage → light blooms → headline settles → scene breathes. A sequence, not an explosion.
6. **Storytelling structure wins awards AND converts.** Chapters with emotional logic (desire → recognition → clarity → trust → action) outperform feature grids.
7. **Mystery sells high-ticket.** Show taste, not inventory. Tease the work cinematically; keep full case detail for the call. One clear primary action, repeated, unmissable.
8. **Performance is part of the aesthetic.** 60fps scroll, instant LCP, graceful reduced-motion. Jank reads as cheap faster than any visual choice.

Sources: [Awwwards design agencies](https://www.awwwards.com/websites/design-agencies/), [Best award-winning websites 2026 (WebGL)](https://www.hontran.dev/blog/best-award-winning-websites-2026), [Award-winning agencies 2026](https://linkupst.com/design/blog-design/best-award-winning-design-agencies), [Web Design Awards winners index](https://www.webdesignawards.io/winners).

---

# PART A — THE IMPROVED MASTER PROMPT

## A.1 Per-chapter launcher prompt (paste this to start any implementation session)

> You are implementing ONE chapter of the LIONOVART v2 rebrand. Read `docs/V2_REBRAND_MASTER_PLAN.md` in the repo root: the Global Rules (Part B.1), the Foundations (Part B.2), YOUR chapter's spec (Part B.3), and the Verification Protocol (Part D). Also read `src/components/v2/ChapterHero.tsx`, `src/app/v2/page.tsx`, and `src/app/v2/v2.css` as the style benchmark. Read nothing else: no brief, no other sections of the repo, no docs, no image files. Build exactly the chapter I name below to the spec, run the full verification protocol, commit with the specified trailer format, push to `claude/lionovart-rebrand-v2-8624vy`, send me both screenshots, and STOP for my review.
>
> Chapter to build: **[N — Name]**

## A.2 The creative brief v3 (context for any model; the spec in Part B implements it)

**You are building the digital home of LIONOVART: a high-end brand and innovation studio.** Not an agency template. A cinematic experience that makes a founder think "these people operate at a level I want" within two seconds of landing.

**Positioning.** LIONOVART turns brand potential into cinematic brand worlds: brand films, creative content, digital experiences (websites, apps, intelligent custom ecosystems), and audiovisual experiences. Core idea: THE ART OF INNOVATION. LION = presence and legacy. NOVA = innovation and intelligence. ART = emotion and craft.

**The standard.** This must look like a $50k engagement: one uncompromising art direction, a single signature WebGL moment, film-grade assets, choreographed motion, generous negative space, editorial typography. Sophisticated, intentional, coherent. Zero AI-slop tells (no purple gradients, no equal card grids, no fake stats, no mascot, no template rhythm).

**The conversion logic.** Expensive-looking yet high-converting: ONE primary action ("Start Your Project") present in every act, one low-friction secondary path (the free Brand Presence Audit). The work is shown as cinematic teasers with honest labels; full case detail is deliberately reserved ("the full stories are told on a call"). Curiosity, not a catalog. No pricing, no packages, no service menus.

**The honesty covenant (non-negotiable).** No fake client logos, invented stats, fabricated testimonials, or fake awards. Work labels only from: Website Build, Brand Identity, Concept Direction, Creative Study, Campaign Direction, Content System, App Concept. Experience Lab is framed as concept direction with partner-led production. Premium is earned by taste and honesty, never by fabricated proof.

**The emotional arc (10 chapters).** Desire (hero) → Recognition (the truth) → Transformation (stronger together) → The Reveal (dark turns to cream: clarity) → The System (4 pillars) → Proof of taste (selected work) → Frontier (Experience Lab) → Trust (founder) → Action (audit) → Legacy (final CTA). Dark cinematic opening, warm cream middle, dark cinematic close (~45/35/20 dark/cream/red-gold).

**Technology.** Existing stack (Next 16, Tailwind v4, framer-motion, GSAP+ScrollTrigger, Lenis) plus the already-installed `@paper-design/shaders` for the signature real-time silk/energy moment. Generated video assets per the Asset Generation Kit (Part C), with static fallbacks so the site ships regardless. Everything respects `prefers-reduced-motion`, lazy-loads, and holds 60fps.

**Review discipline.** One chapter per cycle. Stop after each for review. Never touch the production homepage or shared components.

---

# PART B — IMPLEMENTATION SPEC

## B.1 Global rules (apply to every chapter)

### Repo facts (do not re-explore)
- Next.js 16.2.1 App Router, Tailwind v4 (tokens in `globals.css` — never edit), framer-motion, GSAP+ScrollTrigger, Lenis (root layout provides smooth scroll), `@paper-design/shaders` installed.
- v2 files: `src/app/v2/layout.tsx` (Fraunces + Outfit fonts, `robots: noindex,nofollow`), `src/app/v2/v2.css` (tokens/utilities), `src/app/v2/page.tsx` (assembly), `src/components/v2/HeaderV2.tsx`, `src/components/v2/ChapterHero.tsx`.
- Reusable: `getWhatsAppUrl(message)` + `CONTACT_EMAIL` from `src/lib/contact.ts`; `POST /api/strategist/lead` (accepts `{name, contact, contact_type, project_summary, source}`, returns 200 even without Firebase — reuse for Ch 9, do not modify).
- Local dev needs `WHATSAPP_NUMBER=15878974772 npm run dev` (pre-existing env quirk in an unrelated API route).
- **Never edit:** `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/sections/**`, `src/components/ui/**`. All v2 work lives in `src/app/v2/**` + `src/components/v2/**`. Shared v2 styles go in `v2.css`.
- **Dependencies:** none may be added. The shader moment uses the already-installed `@paper-design/shaders`. (If its API cannot produce the silk effect in reasonable time, fall back to the layered-gradient + generated-video approach in Part C — do NOT install three.js without explicit user approval.)

### Design tokens (in `v2.css`)
Base `#0d0d0d` · charcoal `#171412` · cream `#f2ede3` · red `#e5192a` · wine `#4a0d14`. Cream sections: text `#171412`, secondary `rgba(23,20,18,0.65)`. Utilities: `.v2-serif` (Fraunces), `.v2-display` (Clash Display), `.v2-gold-text` (gold as gradient light).

### The taste layer (creative direction — internalize before coding)
- **Negative space is the luxury.** `py-28 md:py-40` minimum per chapter. Empty feels correct; resist filling.
- **Light is the material.** Depth = radial glows, gradient masks, ember textures. Never borders, boxes, or drop shadows. Photos always melt into the stage via gradient overlays (Ch 1 recipe); a visible photo rectangle edge is a defect.
- **Motion is slow and expensive.** One easing everywhere: `[0.16, 1, 0.3, 1]`. Durations 0.8–2.2s. Reveals fire once (`viewport={{ once: true }}`). Nothing loops (except ambient shader/video), nothing bounces.
- **Type carries emotion.** Serif = feeling (sentence case, `font-medium`, `leading-[1.05]`). Display sans = conviction (short uppercase tracked lines). Body = clarity (65% opacity, `leading-[1.65+]`, ≤52ch).
- **Red is narrative, gold is precious.** Red: story line, eyebrows, CTAs only. Gold: at most once per chapter, always as light, never fill.
- **Headline masked line reveals** (the type-led premium move), CORRECTED RECIPE: the `overflow-hidden` wrapper must be a `motion.div` that CARRIES `initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}`, and the inner `motion.h2` animates via variants propagation (`hidden: { y: "100%" }`, `visible: { y: "0%", transition: ... }`). NEVER put `whileInView` on the clipped inner element itself: IntersectionObserver computes intersection AFTER ancestor clipping, so an element translated fully out of an overflow-hidden wrapper has intersection ratio 0 forever and the reveal never fires — the headline stays permanently invisible. This exact bug shipped in Chapters 3 and 5 via the earlier version of this recipe (caught at the Chapter 5 QA gate; see the Progress Log).
- **Reduced-motion pattern (MANDATORY, hydration-safe):** pass `initial`/`animate`/`whileInView`/`style` props UNCONDITIONALLY, and express reduced motion only through the `transition` prop: `transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: EASE }}`. NEVER write `initial={reduceMotion ? false : ...}` or `style={reduceMotion ? undefined : ...}` — `useReducedMotion()` is null during SSR but resolves instantly on the client, so any branch that changes RENDERED OUTPUT causes a hydration mismatch (this exact bug shipped in Chapters 1-3 and was fixed in a dedicated pass; see the Progress Log). Transitions never appear in SSR HTML, so gating them is safe. The only exception is a structurally different reduced-motion layout (like Chapter 4's `StaticReveal`), which must be gated behind a post-mount flag (see `ChapterReveal.tsx`).

### Hard content rules
- Zero em/en-dashes (`—`/`–`) in visible strings; use periods, commas, colons. Grep before commit.
- No printing/merch language; no "web design / app development" phrasing (say Brand Platforms / digital experiences).
- Eyebrow labels: page total exactly 3 — Ch 1 (exists), Ch 5, Ch 9. No others.
- No scroll cues, section numbering, pills overlaid on images, decorative dots, marquees, fake precision numbers.
- Lion = symbolic motif only (never mascot / lion-headed human).

### Buttons & CTA intent lock (page-wide)
Copy classes from `ChapterHero.tsx` exactly. Pills, `.v2-display` uppercase `text-[13px] tracking-[0.14em]`, `w-full sm:w-auto text-center` on mobile.
- **"Start Your Project"** (primary red) → `getWhatsAppUrl("Hello Leon, I'd like to start a project with LIONOVART.")`, `target="_blank"`
- **"Get My Free Audit"** (secondary) → `#audit`
- **"View Our Work"** (secondary) → `#work`
On cream: secondary = `border-[#171412]/30 text-[#171412] hover:border-[#171412]/70`.

### Theme arc (do not deviate)
Ch 1–3 dark → Ch 4 IS the dark→cream transition → Ch 5–6 cream (Ch 6 fades to dark over its last ~30vh) → Ch 7 dark → Ch 8–9 warm cream (Ch 8 opens with a diagonal light wedge) → Ch 10 dark.

### The red story line (signature motif)
A `w-px` vertical gradient-red line at chapter seams, drawn with `whileInView` scaleY, suggesting one continuous thread: Ch 1 exits bottom-left (built) → Ch 2/3 continue left-edge (`left-6 md:left-12`) → Ch 4 runs center through the portal → Ch 5 becomes the left rail through cream → Ch 10 descends center and terminates at the LN mark. Implemented per-chapter as simple divs (robust with Lenis), never one page-spanning SVG.

### Verified asset map (do NOT Read image files; assignments were made visually)
| Path | Content | Use |
|---|---|---|
| `/images/hero_img/34513451.webp` | particle lion, dark, negative space | Ch 1 (used) |
| `/images/hero_img/1231234.webp` | red-gold energy burst | Ch 3 portal |
| `/images/hero_img/123613.webp` | gold particle field + grid | Ch 7 backdrop |
| `/images/hero_img/1341.webp` | gold rays + particle swirl | Ch 10 backdrop |
| `/images/hero_img/134634.webp` | faint ember sparks | Ch 2 texture |
| `/images/Leon-Studioshot.avif` | founder portrait | Ch 8 |
| `/images/LOGO.svg` | white wordmark | header/footer/marks |
Generated-video upgrades and their drop paths are in Part C; every video slot has one of these images as its poster/fallback.

### Layout family ledger (each used once, no repeats)
Ch1 asymmetric split · Ch2 editorial offset stack · Ch3 triptych · Ch4 pinned scrub scene · Ch5 connected vertical rail · Ch6 asymmetric editorial grid · Ch7 full-bleed scene · Ch8 portrait split · Ch9 centered form column · Ch10 centered manifesto close.

## B.2 Foundations (build within the Chapter 3 cycle, as they're first needed there)

**`src/components/v2/MagneticCTA.tsx`** — wrapper adding magnetic hover physics to any CTA. Client component; MUST use motion values, never state:
```tsx
const x = useMotionValue(0); const y = useMotionValue(0);
const sx = useSpring(x, { stiffness: 180, damping: 18 });
const sy = useSpring(y, { stiffness: 180, damping: 18 });
// onPointerMove: from element center, set x/y to offset * 0.25 (max ~10px)
// onPointerLeave: x.set(0); y.set(0)
// render <motion.span style={{ x: sx, y: sy }}>{children}</motion.span>
```
Disabled when `useReducedMotion()` or coarse pointer. Retrofit onto Ch 1 CTAs in the same commit that introduces it. Max translation 10px: felt, not seen.

**`src/components/v2/V2Silk.tsx`** — the ONE signature real-time layer: slow red silk/smoke energy on dark, used in Ch 4's portal moment and Ch 10's backdrop only. Implementation order of preference:
1. `@paper-design/shaders` (already installed; the repo already uses it for liquid-metal buttons): a slow-flowing warp/smoke shader tinted `#e5192a` on transparent/dark, `speed ≤ 0.3`, contained in an absolutely-positioned `pointer-events-none` div.
2. If the package's presets can't achieve it within one working session: use the generated silk video loop from Part C (`/videos/v2/silk-loop.mp4`) with the same API (a `<V2Silk />` that renders video instead), poster `1231234.webp`.
Either way: lazy-mount via IntersectionObserver, unmount off-screen, render static `1231234.webp` under `prefers-reduced-motion` or when WebGL unavailable. The component's public API must not change between implementations.

**Film grain (optional, cheap):** a `.v2-grain` utility in `v2.css` using the same data-URI SVG turbulence technique as `globals.css`'s `.bg-texture-grain` (opacity ~0.03, `pointer-events-none`, applied per dark chapter as an absolutely-positioned layer, never fixed to the page).

## B.3 Chapter specifications

> **Chapters 2–8 are DONE** (built, wired into `page.tsx`, verified, committed). Read them as the reference implementations for this spec's quality bar, including the CORRECTED masked-reveal recipe (viewport props on the overflow wrapper). Do not rebuild them. Start at Chapter 9.

### Chapter 2 — The Truth (dark) · editorial offset stack · DONE
**File:** `src/components/v2/ChapterTruth.tsx` (client).
- Section `relative bg-[#0d0d0d] py-28 md:py-40 overflow-hidden`; `134634.webp` full-bleed at `opacity-25` under a `from-[#0d0d0d] via-[#0d0d0d]/70 to-[#0d0d0d]` vertical gradient overlay.
- Story line enters top at `left-6 md:left-12` (gradient `#e5192a → transparent`, scaleY draw).
- Headline (serif, cream, `text-[clamp(2.4rem,5.5vw,4.5rem)]`, max-w 16ch, `md:ml-[8%]`, masked line reveal): **"Many strong brands stay invisible."**
- Body (`text-white/65`, ≤52ch, same offset): **"They have the vision. The drive. The product. But online they look scattered, inconsistent, easy to forget. The problem is not effort. It is direction."**
- Three points as a progressively indented stack (`ml-0` / `md:ml-[10%]` / `md:ml-[20%]`), each sliding in from a different x (-24/0/+24) so the composition itself reads "scattered". Per point: `.v2-display` phrase (white, `text-lg md:text-2xl font-semibold`) + support line (`text-white/50 text-sm`):
  1. **No clear direction** / "Strong work, pointing in three directions at once."
  2. **Scattered presence** / "A brand that looks different on every platform."
  3. **Forgotten too soon** / "Seen for a moment, then lost in the feed."
- Mobile: single column, indents collapse, `px-6`.

### Chapter 3 — The Transformation (dark, red energy) · triptych + foundations · DONE
**Files:** `src/components/v2/ChapterTransformation.tsx` + build `MagneticCTA.tsx` and `V2Silk.tsx` this cycle (retrofit MagneticCTA onto Ch 1 CTAs; V2Silk is used next chapter).
- Dark section, `py-28 md:py-40`, center red radial glow (`rgba(229,25,42,0.12)`).
- Headline centered (serif, masked reveal): **"Strong alone. Stronger together."**
- Support (centered, `text-white/60`, ≤46ch): **"You bring the vision, the drive, the standard. We bring the direction that pulls it into one world."**
- Desktop `grid grid-cols-12 gap-8 items-center`; mobile stacks before → portal → after:
  - **Before (cols 1–4):** the words `Identity`, `Content`, `Website`, `Socials` as `.v2-display` fragments, `text-white/35`, uneven offsets and slight rotations (`rotate-[-3deg]`…), deliberately misaligned; slow 6–8s drift loop of ±4px (ambient exception; disabled reduced-motion).
  - **Threshold (cols 5–8):** circular portal `w-56 md:w-72 aspect-square rounded-full overflow-hidden`, `1231234.webp` object-cover, `border border-[#e5192a]/40`, soft red outer glow; a red story line runs vertically through it (above and below).
  - **After (cols 9–12):** the same four words aligned in a clean stack, full opacity, under a small `LOGO.svg` (h-6) lit by a faint gold radial (gold-as-light budget for this chapter).
- Orchestration: fragments in first, portal scales 0.9→1, aligned stack settles last (staggered delays, durations ≥0.8s). Elegant; no arrows.

### Chapter 4 — The Reveal (dark → cream) · pinned scrub scene (the only GSAP chapter) · DONE
**File:** `src/components/v2/ChapterReveal.tsx` (client).
- Outer `<section class="relative h-[220vh]">`; inner `sticky top-0 h-[100dvh] flex items-center justify-center overflow-hidden`.
- Layers inside the sticky frame, bottom→top: (1) dark `#0d0d0d` layer with `<V2Silk />` breathing slowly behind the text and the promise line in cream serif; (2) cream `var(--v2-cream)` layer with the SAME line in `#171412`, hidden via `clipPath: "circle(0% at 50% 55%)"`.
- Promise line (serif, centered manifesto, `text-[clamp(2rem,4.5vw,3.75rem)]`, ≤20ch): **"Not just an agency. A partnership building your legacy."**
- GSAP: register ScrollTrigger in the component, `gsap.context`, cleanup `ctx.revert()`. One tween: cream layer `clipPath → "circle(150% at 50% 55%)"`, `scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 1 }`. The read: light floods in; the page turns cream.
- A red story line runs vertically through the circle origin, present on both layers (crossing the threshold).
- Reduced-motion fallback (gate with `useReducedMotion()`, skip GSAP entirely): single static layer, `background: linear-gradient(180deg, #0d0d0d 0%, #0d0d0d 35%, var(--v2-cream) 65%)`, line centered in cream-on-dark upper half.
- All following cream sections declare `bg-[#f2ede3]` explicitly.

### Chapter 5 — The Brand World System (cream) · connected vertical rail · eyebrow 2/3 · DONE
**File:** `src/components/v2/ChapterSystem.tsx` (client).
- `bg-[#f2ede3] text-[#171412] py-28 md:py-40`.
- Eyebrow (red, Ch 1 classes): **"The Brand World System"**. Headline (serif): **"One story. Four forces. Endless momentum."** Intro (secondary): **"Everything your brand needs, connected into one world."**
- A continuous `w-px` red rail down the left; each pillar row hangs off it with a `w-2 h-2 rounded-full bg-[#e5192a]` node (semantic connector). Rows 2 & 4 offset `md:ml-[6%]`. No cards, no borders; whitespace separates. Rail draws with scroll (`whileInView` scaleY per segment).
- Pillar rows: name (`.v2-display` semibold `text-2xl md:text-3xl`) / outcome (serif italic `text-lg leading-[1.2] pb-1`) / capabilities (Outfit, secondary):
  1. **Brand Worlds** / *"A brand people recognize, trust, and remember."* / "Strategy, identity, naming, visual systems."
  2. **Brand Films & Content Universe** / *"One story, told in every format that matters."* / "Brand films, founder stories, campaign and short-form content."
  3. **Brand Platforms** / *"A digital home built to move people and perform."* / "Cinematic websites, digital ecosystems, intelligent brand experiences."
  4. **Experience Lab** / *"Brand presence beyond the screen."* / "Smart glass, projection, audiovisual environments. Concept-led, produced with partners."
- Visual diversity: rows 2 and 3 get an image chip (`rounded-2xl overflow-hidden w-full md:w-56 aspect-[4/3]`, right-aligned): `/videos/v2/film-frame.jpg` and `/videos/v2/platform-frame.jpg` if the Part C kit has produced them, else `picsum.photos/seed/lionovart-film-frame/640/480` and `.../lionovart-platform/640/480`.

### Chapter 6 — Selected Work & Creative Directions (cream→dark) · asymmetric editorial grid · id="work" · DONE
**File:** `src/components/v2/ChapterWork.tsx` (client).
- `bg-[#f2ede3]`; final ~30vh is `bg-gradient-to-b from-[#f2ede3] to-[#0d0d0d]` (tiles inside it switch captions to light text).
- Headline (serif, charcoal): **"Selected work and creative directions."** Support: **"Built work, creative studies, and directions in progress. Labeled honestly."**
- The tease (conversion by mystery): tiles are cinematic crops, not case studies. Closing line under the grid (`text-[#171412]/60`, in the dark band: `text-white/60`): **"The full stories are told on a call."** followed by a single secondary CTA **"Start Your Project"**.
- 6 tiles, asymmetric `grid-cols-12` (rows: 7+5 / 5+7 / 8+4; mobile single column), mixed aspects (`aspect-[4/3]`, `aspect-[3/4]`, `aspect-[16/10]`). Image `rounded-2xl overflow-hidden`, hover scale 1.04→1 (`duration-500`); caption BELOW image: label (`text-[11px] uppercase tracking-[0.18em] text-[#e5192a]`) + title (Outfit medium).
- Single `const WORK` array at top of file (drop-in replaceable). Labels ONLY from the approved list. Placeholder entries:
  1. Website Build / "Lionovart.com" / seed `lionovart-website-build`
  2. Brand Identity / "Identity system in progress" / seed `lionovart-identity-study`
  3. Creative Study / "Cinematic still exploration" / seed `lionovart-creative-study`
  4. Concept Direction / "Immersive space concept" / seed `lionovart-space-concept`
  5. Content System / "Short-form story system" / seed `lionovart-content-system`
  6. Campaign Direction / "Launch campaign direction" / seed `lionovart-campaign`

### Chapter 7 — Experience Lab (dark) · full-bleed scene · DONE
**File:** `src/components/v2/ChapterLab.tsx` (client).
- `relative min-h-[90vh] bg-[#0d0d0d] flex items-end overflow-hidden`.
- Backdrop: `/videos/v2/lab-loop.mp4` if produced (lazy `<video muted loop playsInline preload="none">`, poster `123613.webp`, mounted only in-view and not reduced-motion), else `123613.webp` with a slow Ken Burns (scale 1→1.06 over 12s, ambient exception). Scrim `bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-[#0d0d0d]/30`.
- Copy bottom-left (max-w-[620px], `pb-24 px-6 md:px-12`):
  - Headline (serif, cream, masked reveal): **"Beyond screens. Beyond ordinary."**
  - Body (`text-white/70`): **"We explore brand presence in physical space: smart glass, transparent LED, projection, digital windows, immersive environments. Developed as creative direction and produced with specialist partners."**
  - Capability row (one Outfit line, `text-white/45 text-sm`): **"Smart glass, transparent LED, projection mapping, audiovisual spaces."**
- No CTA here (intent budget stays clean).

### Chapter 8 — Founder-Led (warm cream) · portrait split · DONE
**File:** `src/components/v2/ChapterFounder.tsx` (client).
- `bg-[#f2ede3] text-[#171412]`; top edge is a diagonal light wedge: `clip-path: polygon(0 4vw, 100% 0, 100% 100%, 0 100%)` + `margin-top: -4vw` slicing over Ch 7's dark bottom (mobile `2.5vw`).
- Desktop split: portrait right ~42% (`Leon-Studioshot.avif`, `rounded-2xl`, warm overlay `from-[#8a6d2f]/15 to-transparent` bottom-up so gold reads as light); copy left. Mobile: portrait first.
- Headline (serif): **"Founder-led. Artist-minded. Strategy-obsessed."**
- Body (exact): **"I'm Leonardo, founder and creative director of LIONOVART. I think like an artist, compose like a musician, and build like an entrepreneur. That is the heart of LIONOVART: art, innovation, and execution working together."**
- Attribution (plain, no signature graphic): **"Leonardo, Founder & Creative Director"** (`text-[#171412]/60 text-sm`).
- Beliefs litany (stacked, staggered, NOT bullets): `.v2-display` uppercase `text-[13px] tracking-[0.14em] text-[#171412]/70 space-y-3`:
  **"Story before content." / "Feeling before format." / "Strategy before design." / "Direction before production." / "Legacy over trends."**

### Chapter 9 — Brand Presence Audit (warm cream) · centered form · id="audit" · eyebrow 3/3
**File:** `src/components/v2/ChapterAudit.tsx` (client).
- `bg-[#f2ede3] text-[#171412] py-28 md:py-36`; column `max-w-[560px] mx-auto`.
- Eyebrow (red): **"Free Brand Presence Audit"**. Headline (serif): **"Clarity begins with one conversation."** Body: **"A free, personalized review of your brand, website, content, and first impression, with clear next steps."**
- Form (labels ABOVE inputs, `gap-2` blocks, errors below with `aria-describedby`/`aria-invalid`): Name (required) · Email (required, `/.+@.+\..+/`) · Website or social link (optional) · "What do you want your brand to be known for?" (optional textarea).
- Inputs: `bg-white/60 border border-[#171412]/25 rounded-xl px-4 py-3 text-[#171412] placeholder:text-[#171412]/40 focus:outline-none focus:ring-2 focus:ring-[#e5192a]`.
- Submit: primary red pill **"Get My Free Audit"**; microcopy below (`text-[#171412]/55 text-sm`): **"No sales pitch. Just clarity."**
- POST `/api/strategist/lead`: `{ name, contact: email, contact_type: "email", project_summary: "Brand Presence Audit request. Website: <w|not provided>. Wants to be known for: <k|not provided>", source: "v2_audit" }`.
- Four states: idle → submitting ("Sending...", disabled) → success (replace form: serif **"Request received."** + **"Leonardo will review your brand personally and reply with clear next steps."**) → error (inline: **"Something went wrong. Email us instead at connect@lionovart.com."** with `mailto:` via `CONTACT_EMAIL`).

### Chapter 10 — Final CTA + Footer (dark) · centered manifesto close
**Files:** `src/components/v2/ChapterFinal.tsx` (client) + `src/components/v2/FooterV2.tsx` (server).
- `relative min-h-[90vh] bg-[#0d0d0d] flex items-center justify-center overflow-hidden`.
- Backdrop: `<V2Silk />` (or its video/image fallback chain) + `1341.webp` at `opacity-70` under a dark scrim + low red ember glow (Ch 1 recipe).
- The story line descends from top center and terminates at a small LN mark (`LOGO.svg` h-8) above the headline: the thread ends at the brand.
- Headline (serif, centered, cream, masked reveal): **"Ready to build something unforgettable?"**
- CTA row (MagneticCTA-wrapped): primary **"Start Your Project"** + secondary **"Get My Free Audit"** (`#audit`).
- FooterV2 (`bg-[#0d0d0d] border-t border-white/10 py-10`): `LOGO.svg` h-5 · `mailto:` via `CONTACT_EMAIL` · "lionovart.com" link to `/` · **"© 2026 LIONOVART. All rights reserved."** Single row desktop, stacked mobile. Nothing invented.

---

# PART C — ASSET GENERATION KIT (video & imagery)

Generated assets are the single biggest premium upgrade. They are OPTIONAL per chapter: every slot has a shipped fallback, so chapters never block on assets. Generate with the Magnific connector (requires the user to authorize it in claude.ai connector settings; any session can then run these) or any video model the user prefers. Drop files at the exact paths; components pick them up without refactoring.

**Global asset style (append to every prompt):** "Cinematic, photoreal, ultra-premium. Palette: near-black #0d0d0d, deep crimson red silk light #e5192a, warm gold light accents, subtle film grain, shallow depth of field, slow motion, no text, no people, no logos, seamless loop."

| # | Drop path | Spec | Generation prompt (core) | Fallback |
|---|---|---|---|---|
| 1 | `public/videos/v2/silk-loop.mp4` | 16:9, 6–8s seamless loop, ≤4MB, no audio | "Slow-flowing dark crimson silk fabric floating in black void, lit by a single warm light, elegant fluid motion" | `1231234.webp` |
| 2 | `public/videos/v2/hero-lion.mp4` | 16:9, 8s loop, ≤5MB | "Majestic lion made of golden and crimson particles dissolving and reforming in darkness, profile view, embers drifting" (Ch 1 upgrade, optional) | `34513451.webp` |
| 3 | `public/videos/v2/lab-loop.mp4` | 16:9, 8s loop, ≤5MB | "Dark exhibition space with transparent LED screens and projection light beams, red and gold light reflections on black glass floor" | `123613.webp` |
| 4 | `public/videos/v2/final-embers.mp4` | 16:9, 8s loop, ≤4MB | "Golden embers and red light rays rising slowly over a dark reflective floor, cinematic haze" | `1341.webp` |
| 5 | `public/videos/v2/film-frame.jpg` | 4:3 still | "Cinematic film production frame: anamorphic lens flare over a dark set with warm practical lights" | picsum seed `lionovart-film-frame` |
| 6 | `public/videos/v2/platform-frame.jpg` | 4:3 still | "Premium dark website interface glowing on a floating glass screen in a dark studio, red accent light" | picsum seed `lionovart-platform` |
| 7 | Ch 6 work tiles (6 stills) | mixed aspects, `public/videos/v2/work-{1..6}.jpg` | one per tile, themed to its label (e.g. "brand identity moodboard on black marble, gold foil details" for Brand Identity) | picsum seeds listed in Ch 6 |

Rules: every `<video>` is `muted loop playsInline preload="none"` with a poster, lazy-mounted in view, unmounted off-view, and replaced by its poster under `prefers-reduced-motion` or save-data. Compress to H.264 + reasonable bitrate; a 20MB hero video is a defect, not a flex.

---

# PART D — VERIFICATION PROTOCOL (every chapter, no exceptions)

1. `npx tsc --noEmit` passes.
2. Dash guard: `grep -rn '—\|–' src/components/v2 src/app/v2` returns nothing.
3. `WHATSAPP_NUMBER=15878974772 npm run dev` (background); wait for HTTP 200 on `http://localhost:3000/v2` (`--noproxy localhost`).
4. Playwright screenshots (`playwright-core` npm-installed in scratchpad + executablePath `/opt/pw-browsers/chromium`): 1440×900 and 390×844. For below-fold chapters scroll with `page.evaluate(() => window.scrollTo(0, N))` + `waitForTimeout(1500)` (Lenis tolerates programmatic scrollTo).
5. Check: no horizontal overflow, AA contrast on real backgrounds, CTAs one line at desktop, previous chapters unbroken, motion fires once and settles.
6. Ch 4 extra: screenshots at ~25/50/75% scroll through the section + one with `page.emulateMedia({ reducedMotion: "reduce" })` showing the static gradient fallback. Ch 9 extra: submit test data, expect HTTP 200 (`saved:false` without Firebase = success), screenshot success state.
7. Commit `Add /v2 chapter N: <name>` with the repo's required trailers (see commit `a01d66f`), push to `claude/lionovart-rebrand-v2-8624vy`.
8. Send both screenshots to the user with a short summary. STOP for review.

**Final pass (own commit after Ch 10):** full-page scroll-through desktop + mobile; eyebrow count exactly 3; theme ratio reads ~45/35/20; `npm run build` compiles (`✓ Compiled successfully`; the pre-existing `WHATSAPP_NUMBER` strategist error is acceptable); quick LCP sanity on `/v2`; verify all video slots degrade to posters with network throttled.

---

# PROGRESS LOG (read before starting Chapter 5)

## Done
- **Chapter 1 — Hero.** `src/components/v2/ChapterHero.tsx`, `src/components/v2/HeaderV2.tsx`. Commit `a01d66f`.
- **Chapter 2 — The Truth.** `src/components/v2/ChapterTruth.tsx`. Built earlier as an unwired reference file, wired into `page.tsx` and verified in the same cycle as Chapter 3.
- **Chapter 3 — The Transformation.** `src/components/v2/ChapterTransformation.tsx`, plus the two foundations from Part B.2: `src/components/v2/MagneticCTA.tsx` and `src/components/v2/V2Silk.tsx`. `MagneticCTA` is retrofitted onto both Chapter 1 CTAs.
- **Chapter 4 — The Reveal.** `src/components/v2/ChapterReveal.tsx`. This is the first chapter to actually render `V2Silk`, which surfaced three real bugs in code that Chapter 3 had only built and unit-tested in isolation, never mounted for real. All three are fixed and verified; read the entries below before touching `V2Silk.tsx` or writing another chapter with a structurally-different reduced-motion fallback.
- **Chapter 5 — The Brand World System.** `src/components/v2/ChapterSystem.tsx`. Cream section; continuous vertical red rail (content offset only); eyebrow 2/3; local next/image chips on pillars 2–3.
- **Chapter 5 QA corrections (applied):** continuous rail at constant x; corrected masked-reveal recipe on Ch 5 + Ch 3 headlines; picsum replaced with local `/images` assets.
- **Chapter 6 — Selected Work.** `src/components/v2/ChapterWork.tsx`. `id="work"`; asymmetric 7+5 / 5+7 / 8+4 grid; cream→dark band with light captions on last row; closing + Start Your Project WhatsApp CTA; local studio tile images.
- **Chapter 7 — Experience Lab.** `src/components/v2/ChapterLab.tsx`. Full-bleed dark scene; `123613.webp` Ken Burns backdrop (lab-loop.mp4 not produced yet); bottom-left copy; no CTA.
- **Chapter 8 — Founder-Led.** `src/components/v2/ChapterFounder.tsx`. Cream diagonal wedge over Lab; portrait split; beliefs litany.
- `src/app/v2/page.tsx` now renders Header → Hero → Truth → Transformation → Reveal → System → Work → Lab → Founder.
- **Verify/debug pass (post-Chapter 4):** fixed the reduced-motion hydration bug across Chapters 1-3 + MagneticCTA (see the FIXED section below), re-verified hydration (0 errors both motion modes), reduced-motion visuals (all content visible, 59-60fps), and typecheck. The hydration-safe motion pattern is now a mandatory rule in Part B.1's taste layer.

## Chapter 5 QA findings (supervisor gate; FIXED)

Chapter 5's first submission passed copy fidelity, the eyebrow budget, the hydration gate (0/0 in both motion modes), typecheck, and the taste layer's motion pattern. Three findings, then fixed:

**1. The rail is not continuous (spec deviation). FIXED.** Rail column stays at constant x; `md:ml-[6%]` offsets content only; segments run down from each node through the list gap; last row ends at its node.

**2. Masked headline never renders. FIXED** on Chapter 5 and Chapter 3 via the corrected recipe (viewport on overflow wrapper, variants on inner).

**3. Remote picsum chips. FIXED** with local next/image assets. Chapter 5 chips: pillar 2 → `/images/hero_img/1235.webp`, pillar 3 → `/images/hero_img/123613.webp`. Chapter 6 tiles use local `/images` studio assets (see ChapterWork.tsx WORK arrays). Part C kit stills still replace all of these when generated.

## Bugs found building Chapter 4 (read before reusing V2Silk or a structural reduced-motion branch)

**1. `V2Silk`'s wrapper hardcoded `position: relative`, which conflicts with callers passing `absolute`.** Both target the same CSS property; the cascade winner between two same-specificity Tailwind utilities is undefined by class-string order. Fixed: the wrapper no longer sets a default position. Callers MUST supply one via `className` (`absolute inset-0`, `relative w-56 h-56`, etc.) — same convention as `next/image`'s `fill`.

**2. The noise-texture uniform raced against image decode, and `.complete` alone doesn't catch it.** `getShaderNoiseTexture()` returns an `<img>` pointed at a data: URI. `ShaderMount` throws `"image for uniform u_noiseTexture must be fully loaded"` if bound before decode finishes. `image.complete` can read `true` for a data URI before `naturalWidth` is actually populated (a real browser timing quirk) — checking `.complete` and falling back to a `load` listener otherwise still hit the race. The fix that actually works: `image.decode()` (a Promise that resolves only once the image is genuinely safe to use as a paint/texture source). See the current `V2Silk.tsx` for the full pattern, including the fallback path for browsers without `decode()`.

**3. Stacking-context bug: a `z-10` element inside an unpositioned parent escapes and paints above unrelated siblings.** Chapter 4 stacks a dark layer and a cream layer as siblings, each `absolute inset-0`, relying on DOM order (cream, painted second, on top) for the reveal to work. The dark layer's heading had `relative z-10` (to sit above its own `V2Silk` background), but neither layer wrapper `div` established its own stacking context. Result: the dark layer's `z-10` heading escaped upward and painted above the *cream* layer too, regardless of DOM order. Because that heading is cream-colored text (`#f2ede3`, identical to the cream layer's own background), the bleed-through was invisible except at anti-aliased glyph edges — it rendered as a ghostly text outline once the cream layer became visible (looked fine at 0%/25% scroll, visibly broken at 75%/100%; don't assume the first frame you check is representative). Fixed by adding `isolate` to both layer wrapper divs. **General lesson: any element using `z-index` inside a layered/absolute composition needs its intended containing layer to have `isolate` (or its own explicit `z-index`), or the z-index isn't actually scoped to that layer.**

**4. This environment's WebGL is software-rendered (SwiftShader), not real GPU hardware** (confirm via `WEBGL_debug_renderer_info` → `UNMASKED_RENDERER_WEBGL`; it will report `SwiftShader Device`). A live warp shader at the default 2x pixel ratio measured 2fps here with zero screenshot contention. **Do not use FPS readings from this sandbox to judge shader performance or decide to simplify a shader** — real GPUs, including mobile ones, render this same shader trivially at 60fps. That said, `ShaderMount`'s `minPixelRatio` defaults to 2 (retina-quality), which is real, avoidable cost even on real hardware for a soft ambient background layer. `V2Silk` now passes `minPixelRatio: 1` (roughly halved the SwiftShader reading here, confirming the change takes effect; expect no perceptible fidelity loss on a blurred/noisy shader like this one). Keep this cap when reusing `V2Silk` in Chapter 10.

## Two implementation learnings (save yourself a debugging cycle)

**1. The dash-guard grep in Part D catches comment banners, not just visible copy.** `grep -rn '—\|–' src/components/v2 src/app/v2` matches the em-dashes used in this codebase's existing comment-banner style (e.g. `/* ─── Chapter 1 — Hero ───` in `ChapterHero.tsx`, `HeroTop.tsx`, and elsewhere across the repo). That style predates this rebrand and is not in scope to change. The rule's actual intent, confirmed against Chapters 1–3, is **zero em/en-dashes in rendered JSX text and string literals** (headlines, body copy, labels, alt text, button text). Before treating a grep hit as a failure, check whether the match is inside a `/* ... */` comment; if so, it's a false positive and can be ignored. Do not mass-edit existing comment banners to "fix" this.

**2. `@paper-design/shaders` has no React wrapper in this repo — use the vanilla `ShaderMount` class directly**, matching the existing pattern in `src/components/ui/liquid-metal-button.tsx`. Key facts that took real investigation to nail down (skip re-deriving them):
   - Uniforms passed to `new ShaderMount(el, fragmentShader, uniforms, webGlContextAttributes, speed)` must be the raw `u_*` keys the specific shader declares (e.g. for `warpFragmentShader`: `u_colors`, `u_colorsCount`, `u_proportion`, `u_softness`, `u_shape`, `u_shapeScale`, `u_distortion`, `u_swirl`, `u_swirlIterations`, `u_noiseTexture`, plus the standard sizing uniforms `u_fit`, `u_scale`, `u_rotation`, `u_originX/Y`, `u_offsetX/Y`, `u_worldWidth/Height`). There is no "friendly params" auto-conversion at this layer; the `*Params` TypeScript interfaces in the package describe a higher-level API this repo doesn't have installed.
   - Colors: convert with `getShaderColorFromString(hex)` per color, not raw hex strings.
   - Noise-based shaders (`warp`, several others) need `u_noiseTexture: getShaderNoiseTexture()` explicitly, or the noise-driven distortion silently fails to look right (the sampler has nothing bound).
   - The cleanup method on a mounted instance is **`.dispose()`**, not `.destroy()` (the `liquid-metal-button.tsx` reference file calls `.destroy?.()`, which silently no-ops via optional chaining since that method doesn't exist on this package version; don't copy that specific line).
   - Always wrap `new ShaderMount(...)` in try/catch and fall back to the static poster image on failure. See `V2Silk.tsx` for the full lazy-mount / dispose-off-screen / reduced-motion / error-fallback pattern; reuse it rather than re-deriving.

## A testing note, not a product bug
If you drive this page with Playwright, do not use `page.hover()` synthetically on CTAs as a verification step: this repo's global `CustomCursor` component (root layout, outside `/v2` scope) can produce a visually confusing composited screenshot around the cursor position (looked like wrapped button text in one throwaway test here; it was not, confirmed via direct `getBoundingClientRect()`/`getComputedStyle()` measurement showing correct single-line `nowrap` layout on a clean, no-hover load). Verify CTA layout via DOM measurement or a clean-load screenshot, not a post-hover screenshot.

Also: this site uses Lenis in `root` virtual-scroll mode (`src/components/providers/SmoothScrollProvider.tsx`). **Playwright's `page.screenshot({ fullPage: true })` is unreliable on this site** — it can render with large, incorrect gaps because Lenis positions content via CSS transform, not native scroll. For chapter verification, either take viewport-sized screenshots at specific scroll depths, or scroll precisely via `window.__lenis.scrollTo(y, { immediate: true })` (exposed in dev builds only) using each chapter's `getBoundingClientRect().top` measured immediately after page load, before anything has scrolled.

## Reduced-motion hydration bug in Chapters 1-3: FIXED (dedicated debug pass)

Previously flagged here as a known issue: loading `/v2` with `prefers-reduced-motion: reduce` active from the start produced a React hydration warning, because `useReducedMotion()` is null during SSR but resolves instantly on the client, and Chapters 1-3 branched RENDERED styles on it (`initial={reduceMotion ? false : "hidden"}`, `style={reduceMotion ? undefined : {...}}`), so server HTML and a reduced-motion client's first paint disagreed.

Fixed in a dedicated verify/debug pass across `ChapterHero.tsx`, `ChapterTruth.tsx`, `ChapterTransformation.tsx`, and `MagneticCTA.tsx` using the pattern now mandated in Part B.1's taste layer: all rendered props (`initial`/`animate`/`whileInView`/`style`) are passed unconditionally, and reduced motion is expressed only through `transition={reduceMotion ? { duration: 0 } : {...}}` (transitions never appear in SSR output). The Chapter 3 ambient drift loop keeps its keyframes but collapses to static under duration 0 (keyframes start and end at 0); MagneticCTA passes its motion values unconditionally since they rest at 0 and its pointer handlers already no-op under reduced motion. Verified after the fix: **0 hydration errors in BOTH normal and reduced motion modes** (was 1 under reduced motion), reduced-motion rendering visually intact at 59-60fps (all content visible, layouts unchanged), typecheck clean. Follow this fixed pattern in Chapters 5-10; the current chapter files are the reference implementations.

## Out of scope (do not do)
No edits outside `src/app/v2/**`, `src/components/v2/**`, `docs/V2_REBRAND_MASTER_PLAN.md`. No new npm dependencies (incl. three.js) without explicit user approval. No i18n. No full navigation menu (HeaderV2 stays). One draft PR per branch max; if the GitHub connector is unauthenticated, pushing the branch is sufficient.

---

# PART A.3 — LAUNCHER PROMPT FOR GLM 5.2 (or any other cold-start coding agent)

Use this instead of A.1 when handing a chapter off to a different model/agent (confirmed: GLM 5.2 running as a coding agent with direct repo read/write access, not a plain chat window). It is more explicit and repeats the highest-risk-to-drop constraints inline, because a model with no shared history on this project needs the guardrails stated, not implied. Copy the whole block, fill in the bracketed chapter name, and send it as the first message of a fresh session.

```
You are implementing exactly ONE chapter of an existing, partially-built
landing page. This is not a greenfield task and not a creative-freedom
task: a full design spec already exists and you must follow it literally,
not reinterpret or improve it.

STEP 1 — READ ONLY THESE FILES, IN THIS ORDER, BEFORE WRITING ANY CODE:
1. docs/V2_REBRAND_MASTER_PLAN.md — read Part B.1 (Global rules), Part B.2
   (Foundations, only if your chapter needs them), Part B.3 → the section
   for YOUR chapter only, and Part D (Verification Protocol).
2. src/components/v2/ChapterHero.tsx — copy its button class strings, its
   framer-motion variant objects (container/rise), and its
   useReducedMotion() pattern EXACTLY. Do not invent new button styles.
3. src/components/v2/ChapterTruth.tsx — a second reference implementation
   already matching this spec. Match its code shape and quality bar.
4. src/app/v2/page.tsx and src/app/v2/v2.css — see how chapters are
   assembled and which tokens/utilities already exist.

Do NOT read any other file in this repository. Do NOT read Next.js docs,
node_modules, or any file outside src/app/v2/**, src/components/v2/**,
and docs/V2_REBRAND_MASTER_PLAN.md. Everything you need is in the plan.
If your chapter's spec seems ambiguous on some small detail, pick the
simplest interpretation that satisfies the rules below, note the decision
in one sentence in your final summary, and keep moving. Do not stop to
ask questions.

STEP 2 — NON-NEGOTIABLE RULES (also in the plan doc, repeated here because
dropping any one of these breaks the page):
- Build ONLY the chapter named below. Do not build other chapters. Do not
  add navigation, a footer, or anything not in that chapter's spec.
- Files you may create or edit: new files under src/components/v2/ for
  this chapter (and shared foundations in Part B.2 ONLY if your chapter
  is Chapter 3, which introduces them), plus wiring the import into
  src/app/v2/page.tsx. Nothing else. Never touch src/app/page.tsx,
  src/app/layout.tsx, src/app/globals.css, src/components/sections/**,
  or src/components/ui/**.
- Zero em-dashes (—) or en-dashes (–) anywhere in visible text. Use
  periods or commas instead. This is checked mechanically before you
  finish (grep below) — do not skip this.
- Use the EXACT copy text given in the chapter spec, word for word.
  Do not paraphrase or "improve" the copy.
- No new npm dependencies. The one exception (@paper-design/shaders for
  the V2Silk component in Chapter 3/4/10) is already installed — check
  package.json, do not run npm install for it.
- Reuse getWhatsAppUrl() and CONTACT_EMAIL from src/lib/contact.ts, and
  the existing POST /api/strategist/lead route, exactly as documented in
  Part B.1 — do not create new contact/lead-capture logic.
- Every animated element must degrade to static under
  useReducedMotion() / prefers-reduced-motion. Animate only transform
  and opacity. Never use window.addEventListener("scroll").
- One CTA label per intent, page-wide, using the exact hrefs specified in
  the CTA intent lock table in Part B.1. Do not invent new CTA copy.

STEP 3 — BUILD the chapter to its spec in Part B.3.

STEP 4 — VERIFY (adapt exact commands to whatever shell/sandbox you are
running in; the checks themselves are not optional):
1. Type-check the project (e.g. `npx tsc --noEmit`) and fix any errors.
2. Run: grep -rn '—\|–' src/components/v2 src/app/v2
   This MUST return nothing. If it finds a match, fix the copy and
   re-run until clean.
3. Start the dev server and confirm the /v2 route renders with no
   console errors and no hydration warnings. (This repo's dev server
   needs WHATSAPP_NUMBER set, e.g.
   `WHATSAPP_NUMBER=15878974772 npm run dev` — this is a pre-existing,
   unrelated env requirement, not something to fix.)
4. Take a screenshot (or describe precisely what you visually verified)
   at a desktop width (~1440px) and a mobile width (~390px). Confirm:
   no horizontal overflow, text is readable against its actual
   background, CTA buttons fit on one line, nothing from earlier
   chapters broke.
5. If your chapter is Chapter 4, additionally verify the scroll-scrub
   transition at roughly 25/50/75 percent scroll through the section,
   and verify the static reduced-motion fallback separately.
   If your chapter is Chapter 9, additionally submit the form with test
   data and confirm you get an HTTP 200 from /api/strategist/lead, and
   verify the success and error UI states render correctly.

STEP 5 — COMMIT AND STOP.
- Stage only the files you created/edited for this chapter.
- Write a plain, factual commit message describing what was added
  (no marketing language). Sign it with YOUR actual identity as the
  co-author (do not write "Claude" or any Anthropic model name in the
  commit — you are not Claude; use your own model/tool name, or omit
  a co-author trailer entirely if you are unsure what's appropriate).
- Push to branch: claude/lionovart-rebrand-v2-8624vy
- Then STOP. Do not proceed to the next chapter. Do not open or update
  a pull request. Report back: what you built, what you verified, any
  ambiguity you resolved and how, and the two screenshots/descriptions
  from Step 4. Wait for review before anything else happens on this
  branch.

Chapter to build: [N — Name, e.g. "5 — The Brand World System"]
```

### Notes on why this differs from the Claude launcher prompt (A.1)
- Constraints that Part B.1 states once are repeated inline here, because a cold-start agent with no accumulated project context is more likely to drop a rule it read once in a long document than one restated at point of use.
- The commit-authorship instruction is explicit: the repo's existing commits are signed "Claude Fable 5" because a Claude Code session wrote them. A different model must not reuse that trailer; it would misattribute the work.
- Verification commands are phrased as "adapt to your environment" rather than the exact scratchpad/proxy paths used in this container, since GLM 5.2 will most likely run in a different sandbox.
- The prompt forbids opening/updating the PR, since PR management for this branch is being handled from this Claude Code session (subscribed to leonartist7/Lionovart_Next#16); a second agent pushing commits to the same branch is fine, a second agent also touching the PR description/state is not.

---

# PART A.4 — EXECUTION DIRECTIVE FOR GROK 4.5: CHAPTERS 5-10

This supersedes A.1 and A.3 for the remaining work. Written by the supervising session after Chapters 1-4 shipped; it reflects the true current state. Copy the block below as the first message of a fresh Grok 4.5 session with repo access.

```
You are executing chapters 5 through 10 of a partially-built landing
page for LIONOVART under an executive director who has already built
chapters 1-4 and written a full spec. Your job is disciplined
execution, not creative reinterpretation. Follow the spec literally.
Do not introduce WebGPU, Three.js, or any new dependency: that is a
separate later phase.

STEP 0 - BRANCH AND PR (the state you are inheriting)
Work on the EXISTING branch claude/lionovart-rebrand-v2-8624vy (do not
create a new branch; chapters 1-4 and the master plan live there, and
draft PR #18 already tracks it). Commit after each chapter and push to
that branch; the PR updates automatically. Do NOT open, edit, close,
or merge any PR - PR management is handled by the supervising session.

STEP 1 - READ, IN THIS ORDER, BEFORE WRITING ANY CODE
1. docs/V2_REBRAND_MASTER_PLAN.md: the PROGRESS LOG first (real bugs
   already found and fixed - do not re-debug or reintroduce them),
   then Part B.1 (global rules, especially the taste layer's MANDATORY
   reduced-motion pattern), then Part B.3 sections for chapters 5-10,
   then Part D (verification protocol).
2. src/components/v2/ChapterTruth.tsx and ChapterTransformation.tsx -
   the quality bar and the exact motion/reveal patterns to copy
   (unconditional initial + transition gated on useReducedMotion()).
3. src/components/v2/ChapterReveal.tsx - reference for GSAP usage and
   the mounted-gate pattern, though no chapter in 5-10 needs GSAP.
4. src/components/v2/MagneticCTA.tsx and V2Silk.tsx - foundations.
   Chapter 10 renders <V2Silk className="absolute inset-0" /> as-is;
   never modify V2Silk's implementation or public API. Note its
   className contract: the caller supplies the position.
5. src/app/v2/page.tsx and src/app/v2/v2.css - assembly and tokens.
Read nothing else in the repo. If a small detail is ambiguous, pick
the simplest interpretation satisfying the global rules, note it in
one sentence in your report, and keep moving.

STEP 2 - NON-NEGOTIABLE RULES (the ones most often dropped)
- Chapters 5, 6, 7, 8, 9, 10, in order, one commit per chapter.
- Files you may touch: new chapter files under src/components/v2/,
  their imports in src/app/v2/page.tsx, and nothing else. Never touch
  src/app/page.tsx, src/app/layout.tsx, src/app/globals.css,
  src/components/sections/**, src/components/ui/**, or V2Silk.tsx.
- EXACT copy text from each chapter's spec, word for word. Zero
  em-dashes or en-dashes in visible text (grep per Part D; matches
  inside /* */ comment banners are known false positives - ignore
  those, never "fix" them).
- Reduced-motion pattern from Part B.1's taste layer is mandatory:
  render props unconditional, gate ONLY the transition. Never
  initial={reduceMotion ? false : ...}.
- Reuse getWhatsAppUrl()/CONTACT_EMAIL from src/lib/contact.ts and
  POST /api/strategist/lead for the Chapter 9 form. No new lead logic.
- framer-motion whileInView only; no GSAP in chapters 5-10; animate
  only transform/opacity; never window.addEventListener("scroll").
- CTA intent lock per Part B.1: exact labels and hrefs, no new CTA copy.
- Dev server needs WHATSAPP_NUMBER=15878974772 (pre-existing quirk).
- Playwright on this site: no fullPage screenshots, no hover-based CTA
  checks; scroll via window.__lenis.scrollTo(y, { immediate: true })
  with offsets measured at load (details in the Progress Log). WebGL
  here is SwiftShader (software): do NOT judge shader performance by
  this sandbox's FPS.

STEP 3 - BUILD each chapter to its Part B.3 spec.

STEP 4 - VERIFY per chapter (Part D): typecheck, dash-guard grep,
/v2 renders with no console errors AND no hydration warnings in BOTH
normal and reduced motion modes (this is now a hard gate; chapters 1-4
currently measure 0/0), desktop ~1440px and mobile ~390px screenshots
at the chapter's scroll depth, earlier chapters unbroken. Chapter 9
extra: form submit returns HTTP 200 (saved:false without Firebase is
success), success and error UI states verified.

STEP 5 - COMMIT after each chapter with a plain factual message.
Sign with YOUR own identity as co-author, never "Claude" or any
Anthropic model name. Push after each chapter. After Chapter 10, run
Part D's final pass, push, and STOP with a full report: what you
built, what you verified, every ambiguity you resolved and how.
```

### Supervisor's QA gates (held by the directing session, not Grok)
On each pushed chapter the supervisor reviews: layout-family fidelity to the ledger in B.1, copy fidelity word-for-word, eyebrow budget (exactly 3 page-wide: Ch 1, Ch 5, Ch 9), theme arc correctness at the chapter's seams, hydration 0/0, and the taste layer (spacing, light-as-material, motion restraint). Chapter 9's form and Chapter 10's V2Silk reuse get a functional pass. Deviations get sent back with a one-line correction, not silently patched, so the executing model's context stays coherent.
