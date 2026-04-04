# LIONOVART — Next.js Project Handoff Document
> Last updated: Apr 4 2026  
> Project path: `C:\Users\Leonartist\Documents\WEB DEV\LIONOVART_NEXTJS-TAILWIND`  
> Dev command: `npm run dev` (uses `--webpack` flag, NOT turbopack)

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
<AbouUsHalf />
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
- Velocity-based scroll marquee with 2 rows of project images
- Large heading with image overlay on blank underscores ("BRAND ____")
- Email capture form + trust badges (Imgur-hosted PNGs)
- Bottom gradient blends into `AboutUsHalf`

### `AboutUsHalf.tsx`
- Short snap-scroll section, `h-[30vh] md:h-[40vh]`
- Uses GSAP ScrollTrigger with `snap`
- Placeholder copy — **needs real About Us content**

### `LumaShowcase.tsx`
- Complex GSAP scroll-pinned section (`h-[300vh] md:h-[400vh]`)
- Lion cutout rises from bottom, video pill shrinks into a pill nav
- 5 services as interactive pills (WEB, A/V, LIONOVART, BRANDING, PRINTING)
- Auto-cycles through services after scroll completes
- Sound toggle (bass ambient + cinematic hit audio)
- **Do not touch the GSAP timeline without careful testing**

### `MarqueeSlanted.tsx`
- Simple decorative text marquee, likely slanted/styled ticker

### `ProblemsSolvedSection.tsx`
- Dark bg (`bg-bg-dark`), `py-12 lg:py-24`
- 2×2 grid of flip-cards — click to reveal solution under problem
- Lion Paw animation swipes across on reveal (Cloudinary PNG asset)
- Hard cut at bottom — goes directly into off-white Services
- **No gradient bleed** (was tried and removed — user preferred hard cut)

### `Services.tsx` ← RECENTLY REDESIGNED
- **Background:** `bg-[#F5F0EB]` (off-white), `pt-[100px] pb-[100px] md:pt-[120px] md:pb-[120px]`
- Section header sits above the glass panel on the off-white bg
- **Glass Panel:** single large container wrapping accordion + sticky image
  - `bg-white/70 backdrop-blur-xl border border-white/60`
  - `shadow-[0_8px_48px_-8px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]`
  - `rounded-[24px] p-6 md:p-10 lg:p-14`
- **Accordion** (left column): Base UI accordion, first item open by default via `defaultValue={[SERVICES[0].id]}`
  - Title text: `text-[#111111]`, hover → `text-brand-red`
  - Description: `text-[#4A4A4A]`
  - Dividers: `border-black/8`
- **Deliverable tags:** `bg-brand-red/6 border border-brand-red/20 text-brand-red` — subtle red tint
- **Sticky image** (right column, desktop only): `aspect-[3/4]` portrait, `rounded-[20px]`
  - True crossfade via `AnimatePresence mode="sync"` — single img + single label in DOM
  - Image scales from `1.05` → `1` on enter, `1` → `0.97` on exit
  - Label overlay crossfades simultaneously
- **Mobile:** image shown inside each accordion item when expanded

### `Portfolio.tsx` ← RECENTLY REDESIGNED
- **Background:** `bg-[#F5F0EB]` (off-white), `py-[80px] md:py-[120px]`
- Header: charcoal `text-[#111111]`, eyebrow `text-brand-red`
- **5 cards only** (down from 7). Layout:
  ```
  [ Card 1 — 4col × 2row TALL ] [ Card 2 — 4col × 1row      ] [ Card 3 — 4col × 2row TALL ]
  [ Card 1 — continues        ] [ Card 4 — 4col × 1row      ] [ Card 3 — continues        ]
  [ Card 5 — 12col × 1row FULL-WIDTH BANNER                                               ]
  ```
- Grid: `lg:grid-cols-12 lg:grid-rows-[270px_270px_200px]`
- **Hover effect:** Gold glow shadow (`brand-gold #f0c917`) + soft inner gold bloom
  - `boxShadow: "0 20px 48px -12px rgba(240,201,23,0.55), 0 0 20px -4px rgba(240,201,23,0.35), inset 0 0 40px rgba(240,201,23,0.07)"`
- **3D tilt** on hover (max 4° rotation via Framer Motion spring)
- **Click → modal slideshow** with keyboard nav (Arrow keys, Escape)
- Cards: dark (`bg-[#161616]`) with gradient overlay — they look great on off-white bg

### `Process.tsx`
- Dark bg (`bg-bg-brand-black`), `py-[90px] lg:py-[180px]`
- Alternating left/right timeline with vertical center line (desktop)
- 4 steps: Discovery, Creative Concepts, Build & Refine, Launch & Scale
- Uses `useInView` from Framer Motion for entrance animations

### `Testimonials.tsx`
- Current state unknown — not modified in this session

### `FAQ.tsx`
- Current state unknown — not modified in this session

### `Footer.tsx`
- Current state unknown — not modified in this session

---

## Known Issues / Things To Do Next

- [ ] `AboutUsHalf` has placeholder copy — needs real About Us content written
- [ ] `Testimonials` section needs review — not audited
- [ ] `FAQ` section needs review — not audited
- [ ] Portfolio modal: the image dock thumbnails wrap on mobile — could clip
- [ ] Services accordion: `defaultValue` opens first item but the Base UI accordion `onClick` on trigger and `defaultValue` may conflict — test that switching items correctly updates `activeId` state
- [ ] Consider adding a CTA / contact section before the footer
- [ ] Real project images needed — all images are currently Unsplash placeholders
- [ ] Real copy throughout — all descriptions are placeholder/demo text
- [ ] `LumaShowcase` mobile experience needs testing — complex GSAP pinned section
- [ ] `HeroTop` trust badge images are hosted on Imgur — move to Cloudinary or `/public`

---

## Assets & Hosting

| Asset | URL |
|---|---|
| Lion Paw PNG | `https://res.cloudinary.com/dgio9uutc/image/upload/v1775085187/Untitled_design_4_muu53f.png` |
| Lion Cutout PNG | `https://i.imgur.com/2PGbCnR.png` |
| Brand fill image (hero) | `https://imgur.com/8czAkK3.png` |
| Trust badges image | `https://imgur.com/L6zJMEm.png` |
| Showcase video (LumaShowcase) | `https://i.imgur.com/x9yWTNn.mp4` |

---

## Important Notes for Next Chat

1. **Tailwind v4** — no `tailwind.config.js`. All tokens live in `src/app/globals.css` under `@theme inline {}`. Use `--color-*` tokens directly as class names like `bg-brand-red`, `text-text-main`, etc.
2. **Dev server** — run with `npm run dev` (uses `--webpack`). Do NOT use turbopack.
3. **Accordion component** — uses `@base-ui/react/accordion`, NOT shadcn's radix accordion. Props and behavior differ. `defaultValue` expects an array `string[]`.
4. **GSAP ScrollTrigger** — registered globally in each component that uses it. The `LumaShowcase` scroll timeline is very sensitive — avoid modifying without reading the full component first.
5. **`bg-white/70` glass effect** — only looks like frosted glass if there's visual complexity behind it. The off-white bg is flat, so the blur is invisible. This is acceptable for now — the white panel still reads as a "floating panel" from the shadow alone.
6. **Font** — Clash Display is loaded via `next/font/local` in `layout.tsx` and mapped to `--font-clash`. All text defaults to this font via `body { font-family: var(--font-clash) }`.

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

## Session 2 Changes
> Date: Apr 4 2026

### LumaShowcase — GSAP Timeline Rebuilt (3-Stage Cinematic Snap)

**Problem:** The old timeline had two duplicate `fromTo` blocks for `videoRef` and three conflicting animations on `oneVisionRef`, causing chaotic scrub behavior.

**Fix:** Complete timeline rewrite with a clean 3-stage architecture:

| Snap | Progress | What happens |
|------|----------|-------------|
| Stage 1 | `0.00` | Full-screen video, lion hidden below, "ONE VISION" visible |
| Stage 2 | `0.40` | Lion rises dramatically, "ONE VISION" drops + fades behind the video |
| Stage 3 | `0.75` | Video collapses to pill, pills row + 3-col layout reveal |
| Exit | `1.00` | Scroll continues past section |

Key changes:
- `scrub` increased from `1` to `1.2` for heavier cinematic feel
- `snapTo` changed from `[0, 0.22, 0.82, 1]` → `[0, 0.40, 0.75, 1]`
- `onUpdate` threshold for `isScrollComplete` changed from `0.80` to `0.73`
- "ONE VISION" text: single clean `y: 60vh + scale: 0.15 + opacity: 0` drop, starting at `0.10`, finishes well before the Stage 2 snap
- Lion `y: 0` animation unchanged; only width shrinks at Stage 2→3 (`0.42`)
- Video `fromTo` exists exactly once (was duplicated before)

---

### AboutUsHalf — Real Content Added

- **Paragraph:** "We are a creative agency obsessed with one thing — building brands that move people. From strategy to screen, every decision is made with intention."
- **20 Years card:**
  - Title: "Combined Experience"
  - Description: "Two decades of craft across branding, digital, and production."
  - Background image: `https://images.unsplash.com/photo-1600880292203-757bb62b4baf` (40% opacity)
- **7 Languages card:**
  - Title: "Global Reach"
  - Description: "A multilingual team serving clients across 4 continents."
  - Background image: `https://images.unsplash.com/photo-1529156069898-49953e39b3ac` (40% opacity)

---

### Services — Polish Pass

- Heading: larger (`6rem` desktop), tighter letter-spacing (`-0.02em`), bolder tracking on eyebrow (`0.3em`)
- Numbers: now **42px / font-black** — become the visual anchor; animate from `rgba(0,0,0,0.10)` → `#e5192a` when active
- Description text indented to align with the title (not the number), using `pl-[calc(42px+1.75rem)]`
- Image label: updated to `01 / 05` counter format with y-slide entrance animation
- Red accent line added: `w-8 h-[3px]` in top-right corner of the sticky image
- Progress dots added below the sticky image (dot stretches to pill when active, clickable)
- Glass panel: upgraded to `rounded-[28px]`, `bg-white/75 backdrop-blur-2xl`, stronger shadow

---

### Navbar — Red Hero Mode + Circular Transition

**New behavior:**
- **In hero (< 70% scroll):** solid `bg-brand-red` bar, white nav links, white outline `Connect Now` CTA button
- **Past 70% of hero:** red layer collapses inward via circular `clip-path` (`circle(150%) → circle(0%)`) while glass layer fades in simultaneously; logo slides to center
- **Transition:** `clipPath` 0.75s `[0.4, 0, 0.2, 1]` ease, `opacity` 0.5s with 0.15s delay
- Mobile burger icon uses `text-white` in hero mode
- CTA label changed from "Book a Call" → **"Connect Now"** everywhere (desktop, mobile overlay)
- Mobile overlay menu CTA also updated

**Architecture:** Two absolutely-positioned background layers (`<motion.div>`) stacked under the nav content — red layer on top (clips away), glass layer underneath (fades in). No conditional class swapping.

---

### HeroTop — Multiple Enhancements

**Marquee images:** All 10 Unsplash placeholders replaced with Cloudinary portfolio screenshots:
- `1_1_bv3shm.avif`, `Thumb_2_p6ksrb.avif`, `Frame_1_zhyago.avif`, `freepik_luxury-car-dealership_zglhcb.avif`, and 6 more brand/web mockups

**Count-up stats overlay:**
- Trust badge PNG opacity reduced to `opacity-60` (transparent feel)
- Below it: 3 animated stat counters (`50+`, `20+`, `20+`) using a custom `useCountUp` hook
- Animation: ease-out cubic, triggers once on `useInView`, counts over ~1.4–1.8s
- Labels: "Clients", "Industries", "Years Exp."

**Floating Founder Card (bottom-right):**
- Glass morphism: `bg-black/60 backdrop-blur-xl border border-white/10`
- Avatar placeholder: red initial `L` circle (swap for real photo — see below)
- Name: "Leo — Founder", sub-label: "LIONOVART Creative Agency"
- Pulsing green "Open" availability indicator (`animate-ping`)
- Entrance: `opacity: 0 → 1`, `y: 20 → 0`, delay `1.4s`

**To swap in real founder photo:**
In `HeroTop.tsx` around line 175, replace the `<div>` avatar with:
```tsx
<Image src="YOUR_CLOUDINARY_URL" alt="Leo" fill className="object-cover" sizes="44px" />
```

**CTA button label:** "Get Started" → **"Connect Now"**

---

### Testimonials — Animated Infinite Marquee

Replaced static masonry grid with two infinite scrolling horizontal rows.

**Architecture:**
- `TestimonialRow` component uses the same `useAnimationFrame` + `useVelocity` pattern as the hero marquee
- Row 1 moves left (`baseVelocity: -0.35`), Row 2 moves right (`0.35`)
- Cards pause on hover (`isPaused` ref)
- Edge masks: `linear-gradient(to right, transparent, black 8%, black 92%, transparent)`

**Cards:**
- Width: `320px` → `360px` → `400px` across breakpoints
- Stars, italic quote, bottom border + avatar + name/role
- Avatar: Cloudinary portfolio screenshot cropped to circle (`rounded-full overflow-hidden`)

**Testimonials expanded to 8** (added Priya Anand / Marcus Obi) to give both rows enough content for seamless looping.

**Cloudinary avatars used (in order):**
1. `1_1_bv3shm.avif`
2. `Frame_1_zhyago.avif`
3. `freepik_from-this-brand_0001_1_u6hnjz.avif`
4. `freepik_luxury-car_zglhcb.avif`
5. `Thumb_2_p6ksrb.avif`
6. `freepik_brand-identity_bnk4us.avif`
7. `freepik_corporate-we_qukgx3.avif`
8. `freepik_from-this-brand_0001_2_cd1gee.avif`

---

### Assets Added This Session

| Asset | URL |
|---|---|
| Portfolio marquee images (10) | Cloudinary `dgio9uutc` — see `MARQUEE_IMAGES` array in `HeroTop.tsx` |
| Testimonial avatar images (8) | Same Cloudinary bucket — see `TESTIMONIALS` array in `Testimonials.tsx` |
| Founder photo | **Placeholder** — `L` initial shown; needs real Cloudinary URL |

---

### Known Issues / Updated To-Do

- [ ] **Founder photo** — swap `<div>` avatar placeholder in `HeroTop.tsx` with real `<Image>` once URL is ready
- [ ] `LumaShowcase` mobile snap experience still needs live testing — complex GSAP pinned section
- [ ] `HeroTop` trust badge PNG still on Imgur — move to Cloudinary
- [ ] `Lion Cutout` PNG still on Imgur — move to Cloudinary
- [ ] `AboutUsHalf` card images are Unsplash — replace with real Cloudinary assets when available
- [ ] Real portfolio images needed in `Portfolio.tsx` — still using Unsplash
- [ ] Real copy throughout — all descriptions are still demo text
