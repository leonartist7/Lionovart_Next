@AGENTS.md

# Client portal work — read the handoff first

Before touching `src/app/(app)/portal`, `src/app/api/portal`, `src/components/portal`
or `src/lib/portal`, read `PORTAL_HANDOFF.md`. It carries the architecture, the patterns
to copy, the rules that must not break (agency gating is server-side; a client's browser
must never *receive* agency controls), how to run the Firebase emulators, and which model
should take which task.

Verify with `node scripts/portal-verify/verify.mjs` before pushing portal changes.

# PR monitoring — off by default

Never auto-subscribe to PR activity (`subscribe_pr_activity`), never create check-in
Routines/triggers (`create_trigger`, `send_later`), and never schedule follow-up wakeups
for a PR, unless the user explicitly asks for it in that conversation. Opening or pushing
to a PR is not, by itself, a request to watch it. If asked to watch a PR, confirm the
Routine's cadence with the user before creating it, and stop it as soon as they say so.

# Coding rules (Karpathy)

Behavioral guidelines to reduce common LLM coding mistakes. These apply to every edit in this repo.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

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