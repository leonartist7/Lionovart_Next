> ⚠️ **SUPERSEDED by `MASTERPLAN.md`.** STALE AND MISLEADING: describes a homepage section order that no longer exists. The current assembly is `src/components/sections/PageBuilder.tsx`.
> Read this file for history only, never for direction.

# LIONOVART — Next.js Project Handoff Document
> Last updated: Apr 5 2026
> Project path: `C:\Users\Leonartist\Documents\WEB DEV\LIONOVART_NEXTJS-TAILWIND`
> Dev command: `npm run dev` (uses `--webpack` flag, NOT turbopack)
> Dev server usually starts on port 3000 or 3001 if 3000 is taken

---

## Tech Stack

| Tool | Version |
|---|---|
| Next.js | 16.2.1 |
| React | 19.2.4 |
| Tailwind CSS | v4.2.2 (note: v4 syntax — uses `@theme inline`, NOT `tailwind.config.js`) |
| Framer Motion | 12.38.0 |
| GSAP + @gsap/react | 3.14.2 |
| Base UI (accordion) | @base-ui/react ^1.3.0 |
| Lucide React | icons |
| Font | Clash Display (custom, loaded in `layout.tsx`) |

---

## Brand Design Tokens (`src/app/globals.css`)

```
--color-bg-dark:         #0d0d0d       ← main dark background
--color-bg-brand-black:  #0a0a0a       ← deeper black (Services/Process bg)
--color-bg-off-white:    #f5f0eb       ← warm off-white (Services, Portfolio)
--color-brand-red:       #e5192a       ← primary accent
--color-brand-gold:      #f0c917       ← secondary accent (used in Portfolio hover)
--color-text-main:       #ffffff
--color-text-muted:      rgba(255,255,255,0.8)
--color-border-dark:     rgba(38,38,38,0.3)
```

**Light section text colors (used when bg is off-white):**
- Headings: `text-[#111111]`
- Body/muted: `text-[#4A4A4A]`

---

## Page Section Order (`src/app/page.tsx`)

```
<Navbar />
<HeroTop />
<AboutUsHalf />
<LumaShowcase />
<MarqueeSlanted />
<ProblemsSolvedSection />   ← dark bg, ends with hard cut
<Services />                ← OFF-WHITE bg starts here
<Portfolio />               ← OFF-WHITE bg continues
<Process />                 ← returns to dark
<Testimonials />
<FAQ />
<Footer />
```

---

## Section-by-Section Status

### `HeroTop.tsx`
- Velocity-based scroll marquee with 2 rows of Cloudinary project images
- Large heading with image overlay on blank underscores ("BRAND ____")
- Email capture form + trust badges (Imgur-hosted PNGs — move to Cloudinary)
- Count-up stat counters (50+, 20+, 20+) via `useCountUp` hook, triggered on `useInView`
- Floating Founder Card bottom-right: glass morphism, avatar placeholder (`L` initial — swap for real photo)
- CTA label: **"Connect Now"**
- Bottom gradient blends into `AboutUsHalf`

### `AboutUsHalf.tsx`
- Short section, `h-[35vh] sm:h-[42vh] md:h-[50vh]`
- **No snap** — snap was removed (Session 3). Now plain scroll.
- Real content: paragraph + 2 stat cards (20 Years / 7 Languages)
- Card bg images: Unsplash (replace with Cloudinary when ready)

### `LumaShowcase.tsx` ← HEAVILY MODIFIED (Session 3)
See full architecture notes below.

### `MarqueeSlanted.tsx`
- Simple decorative text marquee, slanted/styled ticker
- Sits directly below LumaShowcase — the glow from LumaShowcase bleeds into it intentionally

### `ProblemsSolvedSection.tsx`
- Dark bg (`bg-bg-dark`), `py-12 lg:py-24`
- 2×2 grid of flip-cards — click to reveal solution under problem
- Lion Paw animation swipes across on reveal (Cloudinary PNG asset)
- Hard cut at bottom — goes directly into off-white Services
- **No gradient bleed** (user preferred hard cut)

### `Services.tsx`
- **Background:** `bg-[#F5F0EB]` (off-white)
- Glass Panel: `bg-white/75 backdrop-blur-2xl rounded-[28px]`
- Accordion (Base UI, NOT radix) — first item open by default via `defaultValue={[SERVICES[0].id]}`
- Sticky image right column (desktop), inside accordion on mobile
- Progress dots below sticky image (clickable, dot stretches to pill when active)
- Numbers: 42px font-black, animate from `rgba(0,0,0,0.10)` → `#e5192a` when active

### `Portfolio.tsx`
- **Background:** `bg-[#F5F0EB]` (off-white)
- 5 cards, CSS grid layout: `lg:grid-cols-12 lg:grid-rows-[270px_270px_200px]`
- Gold glow on hover, 3D tilt (max 4°), click → modal slideshow with keyboard nav
- All images still Unsplash placeholders — **needs real project images**

### `Process.tsx`
- Dark bg (`bg-bg-brand-black`)
- Alternating left/right timeline, 4 steps
- Framer Motion `useInView` entrance animations

### `Testimonials.tsx`
- Infinite scrolling horizontal marquee (2 rows, opposite directions)
- Cloudinary avatars — see SERVICES array in `Testimonials.tsx`
- 8 testimonial cards total

### `FAQ.tsx`
- Not audited — current state unknown

### `Footer.tsx`
- Not audited — current state unknown

---

## LumaShowcase — Full Architecture (Session 3 — Major Rebuild)

### Section height
```
h-[600vh] md:h-[800vh]
```
More scroll distance creates a deliberate, weighted feel.

### GSAP ScrollTrigger config
```js
scrub: 2.5           // Heavy — feels like dragging through resistance
snapTo: [0, 0.55, 1] // Only 3 points — no mid-stage pause
duration: { min: 0.4, max: 1.0 }
ease: "power4.inOut" // Aggressive pull into snap points
```

### Timeline — Single Fluid Sweep (0.00 → 0.55)
All animations overlap into one continuous cinematic motion. NO staged pauses:

| Progress | What happens |
|---|---|
| `0.02–0.20` | "ONE VISION" drops away fast (`y: 60vh, scale: 0.15, opacity: 0`) |
| `0.05–0.33` | Lion rises from below (`y: 100vh → 0`) |
| `0.30–0.46` | Lion width shrinks AND video simultaneously collapses to pill |
| `0.36–0.50` | Glow blooms, video fades out, pills row fades in |
| `0.42–0.70` | Side pills cascade, center pill expands, label fades in |
| `0.42–0.70` | Content (text + images) zooms in from behind (`scale: 0.55 → 1, blur: 20px → 0`) |

### Dwell zone (0.55 → 1.00)
Full luma view is locked. Timeline anchor at `tl.set({}, {}, 2.2)` — user must scroll ~40% of total section height to exit. This is intentional: creates a "drag out of" feeling.

### `isScrollComplete` threshold
Set at `progress >= 0.50`. Once reached: pills become interactive, auto-cycle starts, Framer per-column animations trigger.

### Center Anchor (critical — DO NOT MOVE)
`centerAnchorRef` is a **sibling** of `pillsRowRef`, NOT a child. It lives directly under the sticky container. This guarantees the video-to-pill GSAP delta calculation is never corrupted by any transforms on the pills row itself.

Both the anchor and pills row share **identical** `bottom` values:
```
bottom-[280px] md:bottom-[320px] lg:bottom-[290px] 2xl:bottom-[275px]
```

### Pill sizes
```js
getPillSize():         clamp(44px, 5vw, 64px)
getExpandedPillWidth(): clamp(160px, 22vw, 280px)
```

### Glow layer
- `z-[0]` — behind all content
- `h-[90vh] w-[110vw]`, `blur-xl`
- Gradient: `radial-gradient(ellipse 80% 60% at 50% 100%, accent 0%, accent 25%, transparent 70%)`
- Bleeds past section bottom into MarqueeSlanted below (sticky container has **no** `overflow-hidden`)
- GSAP animates opacity `0 → 1.0` at progress `0.36`

### Lion image sizes (1:1 PNG — width = height)
| Breakpoint | CSS width | GSAP lionRestW | GSAP lionShrinkW |
|---|---|---|---|
| Mobile `<768px` | `537px` | `442` | `253` |
| Tablet `md:` | `644px` | `493` | `265` |
| Desktop `lg:` | `581px` | `445` | `258` |
| Large `2xl:` | `564px` | `432` | `239` |

### Service cards — Cloudinary images
All 5 service cards now use `res.cloudinary.com/dgio9uutc/image/upload/`:

| Service | Left | Right |
|---|---|---|
| WEB / APP | `1_1_bv3shm.avif` | `Thumb_2_p6ksrb.avif` |
| A/V PRODUCTION | `Frame_1_zhyago.avif` | `freepik_luxury-car_zglhcb.avif` |
| LIONOVART | `freepik_from-this-brand_0001_1_u6hnjz.avif` | `freepik_from-this-brand_0001_2_cd1gee.avif` |
| BRANDING | `freepik_brand-identity_bnk4us.avif` | `freepik_corporate-we_qukgx3.avif` |
| PRINTING | `freepik_luxury-car-dealership_zglhcb.avif` | `freepik_brand-identity_bnk4us.avif` |

### Pill switch animation
- Flood blob replaced with radial bloom pulse: white core → accent color → transparent, expands from center, fades over `0.65s`
- Center pill background uses Framer `layoutId="center-pill-bg"` for smooth accent color morph
- Auto-cycle triggers pulse too (not just manual clicks)
- Progress bar below center pill colored with `var(--luma-accent)`

### Mobile layout (final state)
Flex column, top → bottom:
1. Hook text (`minHeight: clamp(2.8rem, 7vw, 5rem)`)
2. Stat number + label (`minHeight: clamp(4rem, 10vw, 8rem)`)
3. Single image (thin cinematic strip: `aspectRatio: 16/7`, `maxHeight: 14vh`)
4. Pills row (above lion, fixed bottom position)
5. Lion (bottom-0)

### Desktop layout (final state)
Flex row: `[left image 20%] [center column flex-1] [right image 20%]`
- Images: `aspectRatio: 3/4`, `maxHeight: 36vh`
- Center: hook text + stat number/label (no overflow-hidden, uses minHeight)

---

## Assets & Hosting

| Asset | URL |
|---|---|
| Lion Paw PNG | `https://res.cloudinary.com/dgio9uutc/image/upload/v1775085187/Untitled_design_4_muu53f.png` |
| Lion Cutout PNG | `https://i.imgur.com/2PGbCnR.png` ← **move to Cloudinary** |
| Brand fill image (hero) | `https://imgur.com/8czAkK3.png` ← **move to Cloudinary** |
| Trust badges image | `https://imgur.com/L6zJMEm.png` ← **move to Cloudinary** |
| Showcase video (LumaShowcase entry) | `https://i.imgur.com/x9yWTNn.mp4` ← **move to Cloudinary** |
| Cloudinary CDN base | `https://res.cloudinary.com/dgio9uutc/image/upload/` |

---

## Important Notes for Next Chat

1. **Tailwind v4** — no `tailwind.config.js`. All tokens live in `src/app/globals.css` under `@theme inline {}`. Use `--color-*` tokens directly as class names like `bg-brand-red`, `text-text-main`, etc.
2. **Dev server** — run with `npm run dev` (uses `--webpack`). Do NOT use turbopack. Port is usually 3001 if 3000 is taken.
3. **Accordion component** — uses `@base-ui/react/accordion`, NOT shadcn's radix accordion. Props and behavior differ. `defaultValue` expects an array `string[]`.
4. **GSAP ScrollTrigger** — `LumaShowcase` has a completely rebuilt timeline (Session 3). Read the full component before touching anything. The `centerAnchorRef` being OUTSIDE `pillsRowRef` is intentional and critical.
5. **`overflow-hidden` removed** from LumaShowcase sticky container — intentional, allows glow to bleed into Marquee below.
6. **Font** — Clash Display is loaded via `next/font/local` in `layout.tsx` and mapped to `--font-clash`. All text defaults to this font via `body { font-family: var(--font-clash) }`.
7. **LumaShowcase CSS variables** — GSAP animates `--pill-0-scale`, `--pill-1-scale`, etc. on `pillsRowRef`. These are non-standard CSS vars animated via GSAP's `fromTo`. Do not rename them.
8. **Framer Motion CSS var workaround** — `initial/animate` props on the sticky `motion.div` use `as any` cast for `--luma-accent`. This is the documented Framer workaround for animating CSS variables. Not a bug.

---

## Color Zones (Light vs Dark)

| Sections | Background | Text style |
|---|---|---|
| Hero, About, LumaShowcase, Marquee | `#0d0d0d` dark | white text |
| Problems/Solutions | `#0d0d0d` dark | white text |
| **Services** | `#F5F0EB` off-white | dark text `#111111` / `#4A4A4A` |
| **Portfolio** | `#F5F0EB` off-white | dark text `#111111`, cards stay dark |
| Process | `#0a0a0a` brand-black | white text |
| Testimonials, FAQ, Footer | unknown — check components |

---

## Known Issues / To-Do Next

### High Priority
- [ ] **Founder photo** — swap `<div>` avatar placeholder in `HeroTop.tsx` (~line 175) with `<Image src="CLOUDINARY_URL" />` once URL is ready
- [ ] **Lion Cutout PNG** — still on Imgur (`i.imgur.com/2PGbCnR.png`), move to Cloudinary. When done, swap `<img>` in `LumaShowcase.tsx` to `<Image>` from `next/image`
- [ ] **LumaShowcase mobile** — pills position bottom values are empirically tuned (`bottom-[280px]`). Test on real device — may need adjusting per exact phone model
- [ ] **Showcase video** — `https://i.imgur.com/x9yWTNn.mp4` still on Imgur, move to Cloudinary

### Medium Priority
- [ ] `Testimonials` section needs review — not audited in Session 3
- [ ] `FAQ` section needs review — not audited
- [ ] `Footer` section needs review — not audited
- [ ] Real portfolio images needed in `Portfolio.tsx` — still using Unsplash
- [ ] `AboutUsHalf` card bg images still Unsplash — replace with Cloudinary
- [ ] `HeroTop` trust badge PNG still on Imgur — move to Cloudinary
- [ ] Real copy throughout — all descriptions are still placeholder/demo text

### Low Priority
- [ ] Portfolio modal: image dock thumbnails may wrap on mobile
- [ ] Services accordion: test that `defaultValue` + manual `onClick` interaction correctly updates `activeId` state
- [ ] Consider adding a CTA / contact section before the footer

---

## Session 3 / 4 Changes Summary
> Date: Apr 5 2026

### LumaShowcase — Complete Overhaul

**Scroll & snap:**
- Section height: `h-[300vh]` → `h-[600vh]` (mobile), `h-[400vh]` → `h-[800vh]` (desktop)
- `scrub`: `1.2` → `2.5` — heavy resistance feel
- Snap points: `[0, 0.40, 0.75, 1]` → `[0.55, 1]` — removed the `0` snap point and mid-stage pause, added large dwell zone. The `0` snap point was removed to prevent GSAP from aggressively pulling the user backward when pausing early in the section. Increased snap delay to `0.15`.
- Snap ease: `power3.inOut` → `power4.inOut`
- Timeline anchor: `1.6` → `2.2` — 38% longer dwell before exit

**Transition (single sweep):**
- Removed the 2-step jitter. All animations (lion rise, video shrink, pills cascade, content zoom) now overlap into one continuous cinematic sweep, completely finishing by progress `0.48` so the `0.55` snap point is always fully resolved.
- "ONE VISION" drops at `0.02`, lion rises `0.04`, video collapses at `0.22` simultaneously with lion width shrink, pills appear at `0.36`, content zooms from `0.28`.

**Images:**
- All service card images replaced with Cloudinary URLs (bucket `dgio9uutc`). Note: Some URLs are currently returning 404s and need verification.
- Removed all Unsplash and Pixabay video/image sources from LumaShowcase.

**Responsive layout (overlap fix):**
- The `finalContentRef` container holding the 3 columns is now **top-anchored** on both mobile and desktop. 
- Mobile: uses `pt-[8vh]` and `justify-start`
- Desktop: uses `md:items-start` and `md:pt-[18vh]`
- This guarantees the content flows downwards from the top and will *never* overlap the absolute-positioned pills at the bottom, even on very short screens.
- Mobile image strip: `aspectRatio: 16/9, maxHeight: 22vh` → `16/7, maxHeight: 14vh` (thinner)
- Desktop image columns: `w-[22%], aspectRatio: 4/5, maxHeight: 42vh` → `w-[20%], aspectRatio: 3/4, maxHeight: 36vh`
- Text containers: removed `overflow-hidden` + fixed `height` → `minHeight` only (text never clips)

**Glow:**
- Opacity: `0.7` → `1.0`
- Size: `h-[55vh] w-[80vw]` → `h-[90vh] w-[110vw]`
- Blur: `blur-3xl` → `blur-xl` (more concentrated)
- Gradient: solid accent for first 25%, transparent by 70% — no dark bottom ring
- Removed `overflow-hidden` from sticky container so glow bleeds into Marquee below

**Pill animation:**
- Removed fluid flood blob (looked off)
- New: radial bloom pulse from center pill — white core → accent → transparent, `0.65s` ease-out

**Lion sizes:**
- Mobile/tablet: +10% larger
- Desktop: -10% smaller
- Large (2xl): -20% smaller
- Pill/anchor bottom position tuned to sit above lion head

### AboutUsHalf — Snap Removed
- Removed GSAP `ScrollTrigger.create` with snap — section is now a plain scroll element
- All `gsap`, `ScrollTrigger`, `useGSAP` imports removed from the file
