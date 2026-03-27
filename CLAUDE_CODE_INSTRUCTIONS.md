# LIONOVART — Next.js Rebuild Master Plan

## Context
You are an expert Next.js (App Router), React, and Tailwind CSS developer. We are migrating the LIONOVART creative agency website from a messy, static Webflow export into a pristine, modular Next.js application. 

**CRITICAL RULE:** Do NOT use Webflow classes (e.g., `w-container`, `w-inline-block`). You must write clean, semantic React components using standard Tailwind utility classes based on `DESIGN_SYSTEM.md`. 

## Tech Stack
*   **Framework:** Next.js 14/15 (App Router) + TypeScript
*   **Styling:** Tailwind CSS + `clsx` + `tailwind-merge`
*   **UI Components:** Shadcn UI (Radix Primitives)
*   **Animations:** Framer Motion (for UI interactions, flip cards, drag-and-drop) & GSAP (for infinite scrolling marquees and complex timelines).
*   **Smooth Scroll:** `@studio-freight/react-lenis`

## Architecture & Workflow
1. Build modular components in `src/components/ui` (buttons, cards) and `src/components/sections` (Hero, About, Portfolio).
2. Work section by section, top to bottom. Do not move to the next section until the current one is fully responsive and animated.
3. Mobile responsiveness is non-negotiable. Use Tailwind's `sm:`, `md:`, `lg:` prefixes properly.

---

## Page Structure & Requirements (Build in this order)

### 1. Navbar (`<Navbar />`)
*   Fixed to top, `z-index: 50`.
*   Transparent on load. When scrolled past 60px, smoothly animate to `bg-nav-glass backdrop-blur-md` using Framer Motion `useScroll`.
*   Desktop: Logo left, center links (Work, Services, Process, Proof), right red CTA button ("Book a Call").
*   Mobile: Hamburger menu (Lucide React icon) opening a full-screen or dropdown menu.

### 2. Top Hero (`<HeroTop />`)
*   Perfectly centered layout (Flex column, justify-center, items-center).
*   Height: `min-h-[50vh] md:min-h-[60vh]`.
*   Content: H1/Large text ("We build premium brands..."), followed by a row of overlapping avatar images (flags) and a Lottie/SVG globe, perfectly centered.

### 3. Slanted Red Marquee (`<MarqueeSlanted />`)
*   A red banner (`bg-brand-red`) rotated `-1.5deg` spanning `105vw` to hide edges.
*   Contains an infinite scrolling text track (GSAP or Tailwind animate) moving right-to-left.
*   Text: "Branding & Identity • Web Design & Dev • Video Production • ..."
*   Must have a deep drop shadow casting onto the section below it. Negative bottom margin to eliminate black gaps.

### 4. About Section (`<About />`)
*   Background: `bg-brand-red-secondary` (`#db0000`).
*   Text: "Innovating in today's digital era is not a choice. IT'S NEEDED."

### 5. Lion Background Hero (`<HeroLion />`)
*   Background image of a lion (opacity 0.12, dark gradient overlay).
*   Contains two seamlessly infinite text marquees at the bottom (GSAP timeScale controlled for Lenis velocity boost).
    *   Top track: "FREE TIME • BRAND SUCCESS • TRUSTED REPUTATION" (Scrolls Left).
    *   Bottom track: "IMPROVED PRESENCE • MORE SALES • PREMIUM IMAGE" (Scrolls Right).

### 6. Benefits Grid (`<Benefits />`)
*   Title: "What Happens When You Work With Us" ("Us" in red).
*   2x2 CSS Grid. Cards have a gold tint: `bg-[#f0c917]/10 border border-[#f0c917]/15`.
*   Hover effect: Slight scale up, border opacity increases.

### 7. Bento Portfolio Gallery (`<Portfolio />`)
*   **CRITICAL:** Install and use the `interactive-bento-gallery` component from 21st.dev (`npx shadcn@latest add https://21st.dev/r/anurag-mishra22/interactive-bento-gallery`).
*   Feed it the portfolio media items. Ensure the Framer Motion drag-to-reorder and click-to-expand modal works perfectly.

### 8. Problem/Solution Flip Cards (`<Reality />`)
*   2x2 grid of premium 3D flip cards.
*   Use Framer Motion for 3D rotation (`rotateY`).
*   Front (Problem): Dark red gradient, pulsing red dot.
*   Back (Solution): Dark gold gradient, checkmark.

### 9. Services Accordion (`<Services />`)
*   Use Shadcn `<Accordion>`.
*   On desktop, split layout: Left side is the accordion list, Right side is a dynamic Video/Image slot that changes based on the currently hovered/active accordion item.

### 10. Process, Testimonials, FAQ, Footer
*   Build out remaining static sections using standard Tailwind grid/flex layouts based on the design system.
*   FAQ uses Shadcn `<Accordion>`.
