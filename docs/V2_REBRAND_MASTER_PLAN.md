# LIONOVART /v2 — MASTER PLAN v3
## The Ultimate Premium Rebrand: prompt + full implementation spec

This single document is the source of truth for building the LIONOVART v2 landing page. It contains: the research digest (what makes a site read as premium), the improved master prompt (Part A), the complete chapter-by-chapter implementation spec (Part B), the asset generation kit (Part C), and the verification protocol (Part D). It is written so lighter models can implement each chapter without re-reading anything else.

**State:** Chapter 1 (Hero) is built and pushed on branch `claude/lionovart-rebrand-v2-8624vy` (commit `a01d66f`). Chapters 2–10 remain. Build ONE chapter per review cycle, then stop.

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
- **Headline masked line reveals** (the type-led premium move): wrap each headline line in `overflow-hidden` + animate inner span `y: "100%" → 0`. Use for every chapter's serif headline.

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

> A reference implementation of Chapter 2 may already exist at `src/components/v2/ChapterTruth.tsx` in the working tree; if present, wire it, verify, and commit it. If absent, build it from this spec.

### Chapter 2 — The Truth (dark) · editorial offset stack
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

### Chapter 3 — The Transformation (dark, red energy) · triptych + foundations
**Files:** `src/components/v2/ChapterTransformation.tsx` + build `MagneticCTA.tsx` and `V2Silk.tsx` this cycle (retrofit MagneticCTA onto Ch 1 CTAs; V2Silk is used next chapter).
- Dark section, `py-28 md:py-40`, center red radial glow (`rgba(229,25,42,0.12)`).
- Headline centered (serif, masked reveal): **"Strong alone. Stronger together."**
- Support (centered, `text-white/60`, ≤46ch): **"You bring the vision, the drive, the standard. We bring the direction that pulls it into one world."**
- Desktop `grid grid-cols-12 gap-8 items-center`; mobile stacks before → portal → after:
  - **Before (cols 1–4):** the words `Identity`, `Content`, `Website`, `Socials` as `.v2-display` fragments, `text-white/35`, uneven offsets and slight rotations (`rotate-[-3deg]`…), deliberately misaligned; slow 6–8s drift loop of ±4px (ambient exception; disabled reduced-motion).
  - **Threshold (cols 5–8):** circular portal `w-56 md:w-72 aspect-square rounded-full overflow-hidden`, `1231234.webp` object-cover, `border border-[#e5192a]/40`, soft red outer glow; a red story line runs vertically through it (above and below).
  - **After (cols 9–12):** the same four words aligned in a clean stack, full opacity, under a small `LOGO.svg` (h-6) lit by a faint gold radial (gold-as-light budget for this chapter).
- Orchestration: fragments in first, portal scales 0.9→1, aligned stack settles last (staggered delays, durations ≥0.8s). Elegant; no arrows.

### Chapter 4 — The Reveal (dark → cream) · pinned scrub scene (the only GSAP chapter)
**File:** `src/components/v2/ChapterReveal.tsx` (client).
- Outer `<section class="relative h-[220vh]">`; inner `sticky top-0 h-[100dvh] flex items-center justify-center overflow-hidden`.
- Layers inside the sticky frame, bottom→top: (1) dark `#0d0d0d` layer with `<V2Silk />` breathing slowly behind the text and the promise line in cream serif; (2) cream `var(--v2-cream)` layer with the SAME line in `#171412`, hidden via `clipPath: "circle(0% at 50% 55%)"`.
- Promise line (serif, centered manifesto, `text-[clamp(2rem,4.5vw,3.75rem)]`, ≤20ch): **"Not just an agency. A partnership building your legacy."**
- GSAP: register ScrollTrigger in the component, `gsap.context`, cleanup `ctx.revert()`. One tween: cream layer `clipPath → "circle(150% at 50% 55%)"`, `scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 1 }`. The read: light floods in; the page turns cream.
- A red story line runs vertically through the circle origin, present on both layers (crossing the threshold).
- Reduced-motion fallback (gate with `useReducedMotion()`, skip GSAP entirely): single static layer, `background: linear-gradient(180deg, #0d0d0d 0%, #0d0d0d 35%, var(--v2-cream) 65%)`, line centered in cream-on-dark upper half.
- All following cream sections declare `bg-[#f2ede3]` explicitly.

### Chapter 5 — The Brand World System (cream) · connected vertical rail · eyebrow 2/3
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

### Chapter 6 — Selected Work & Creative Directions (cream→dark) · asymmetric editorial grid · id="work"
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

### Chapter 7 — Experience Lab (dark) · full-bleed scene
**File:** `src/components/v2/ChapterLab.tsx` (client).
- `relative min-h-[90vh] bg-[#0d0d0d] flex items-end overflow-hidden`.
- Backdrop: `/videos/v2/lab-loop.mp4` if produced (lazy `<video muted loop playsInline preload="none">`, poster `123613.webp`, mounted only in-view and not reduced-motion), else `123613.webp` with a slow Ken Burns (scale 1→1.06 over 12s, ambient exception). Scrim `bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-[#0d0d0d]/30`.
- Copy bottom-left (max-w-[620px], `pb-24 px-6 md:px-12`):
  - Headline (serif, cream, masked reveal): **"Beyond screens. Beyond ordinary."**
  - Body (`text-white/70`): **"We explore brand presence in physical space: smart glass, transparent LED, projection, digital windows, immersive environments. Developed as creative direction and produced with specialist partners."**
  - Capability row (one Outfit line, `text-white/45 text-sm`): **"Smart glass, transparent LED, projection mapping, audiovisual spaces."**
- No CTA here (intent budget stays clean).

### Chapter 8 — Founder-Led (warm cream) · portrait split
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

## Out of scope (do not do)
No edits outside `src/app/v2/**`, `src/components/v2/**`, `docs/V2_REBRAND_MASTER_PLAN.md`. No new npm dependencies (incl. three.js) without explicit user approval. No i18n. No full navigation menu (HeaderV2 stays). One draft PR per branch max; if the GitHub connector is unauthenticated, pushing the branch is sufficient.
