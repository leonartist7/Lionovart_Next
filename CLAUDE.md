@AGENTS.md

# LIONOVART — Session State & Handoff

## Project Location
`C:\Users\Leonartist\Documents\WEB DEV\LIONOVART_NEXTJS-TAILWIND`

## Tech Stack
- Next.js 16.2.1 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4 (tokens defined in `src/app/globals.css` via `@theme inline`)
- Framer Motion (UI animations)
- GSAP (marquees, scroll velocity)
- Shadcn UI (Radix primitives)
- `@studio-freight/react-lenis` (smooth scroll)
- Clash Display font (local woff2 files in `src/fonts/`)

## Build Order & Status

| # | Component | File | Status |
|---|-----------|------|--------|
| 1 | `<Navbar />` | `src/components/sections/Navbar.tsx` | ✅ DONE |
| 2 | `<HeroTop />` | `src/components/sections/HeroTop.tsx` | ✅ DONE |
| 3 | `<MarqueeSlanted />` | `src/components/sections/MarqueeSlanted.tsx` | ✅ DONE |
| 4 | `<About />` | `src/components/sections/About.tsx` | ✅ DONE |
| 5 | `<HeroLion />` | `src/components/sections/HeroLion.tsx` | ✅ DONE |
| 6 | `<Benefits />` | `src/components/sections/Benefits.tsx` | ✅ DONE |
| 7 | `<Portfolio />` | `src/components/sections/Portfolio.tsx` | ✅ DONE |
| 8 | `<Reality />` | `src/components/sections/Reality.tsx` | ✅ DONE |
| 9 | `<Services />` | `src/components/sections/Services.tsx` | ✅ DONE |
| 10 | Process, Testimonials, FAQ, Footer | various | ⏳ NEXT |

## page.tsx current state
All done sections are wired in `src/app/page.tsx` in order:
Navbar → HeroTop → MarqueeSlanted → About → HeroLion → Benefits → Portfolio → Reality → Services → Process → Testimonials → FAQ → Footer

## Build Order & Status (Updated)
Phase 10 (Process, Testimonials, FAQ, Footer) is now ✅ DONE and integrated into `page.tsx`.

## Recent Fixes & Progress Context
- **Phase 7 (Portfolio):** Used `interactive-bento-gallery` from 21st.dev. Currently using `picsum.photos` placeholders to avoid loading massive external Unsplash images, which was crashing network speeds.
- **Phase 8 (Reality):** 3D flip problem/solution cards built with Framer Motion `rotateY` and GSAP-like spring entrances. Fully responsive grid.
- **Turbopack Issue:** Next 15 Turbopack choked on `@import "shadcn/tailwind.css"` in `globals.css` due to bare specifiers. The `shadcn/tailwind.css` contents and variants have been **inlined directly into `globals.css`** to fix the dev server crash.

## Important Notes
- Tailwind tokens are in `globals.css` NOT `tailwind.config.ts` (project uses Tailwind v4 CSS-first config).
- Lion background image is still missing — needs to be placed at `public/images/lion-bg.jpg`.
- The `SmoothScrollProvider` has a known minor TS type workaround for the Lenis children prop.
- Design tokens reference: `DESIGN_SYSTEM.md`
- Full build instructions: `CLAUDE_CODE_INSTRUCTIONS.md`