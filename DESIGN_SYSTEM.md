# LIONOVART — Next.js & Tailwind Design System

This document outlines the design tokens required to rebuild the LIONOVART agency website. Map these directly into `tailwind.config.ts`.

## 1. Colors
Configure these in the `theme.extend.colors` object in Tailwind:

*   **Backgrounds:**
    *   `bg-dark`: `#0d0d0d` (Main site background)
    *   `bg-brand-black`: `#0a0a0a` (Slightly darker sections)
    *   `bg-off-white`: `#f5f0eb` (Warm cream for light sections)
*   **Brand Accents:**
    *   `brand-red`: `#e5192a` (Primary CTA red, Slanted marquee red)
    *   `brand-red-secondary`: `#db0000` (Used for the 'About' section background)
    *   `brand-gold`: `#f0c917` (Used for Benefit cards text and glow)
*   **Text & UI:**
    *   `text-main`: `#ffffff`
    *   `text-muted`: `rgba(255, 255, 255, 0.8)`
    *   `border-dark`: `rgba(38, 38, 38, 0.3)` (#2626264d)
    *   `nav-glass`: `rgba(0, 0, 0, 0.7)` (Used with backdrop-blur for the scrolled navbar)

## 2. Typography
We use **Clash Display** for both Headings and Body text.
*Set up a custom font family in Tailwind (e.g., `font-clash`).*

*   **h1**: `text-[130px] leading-none font-bold uppercase`
*   **h2**: `text-[78px] leading-none font-bold uppercase`
*   **h3**: `text-[72px] leading-none font-bold uppercase`
*   **h4**: `text-[26px] leading-tight font-bold uppercase`
*   **Hero Subtitle**: `text-[3rem] leading-none font-medium` (e.g., "We build premium brands...")
*   **Body Large (p1)**: `text-[20px] leading-[132%] font-medium`
*   **Body Base (p2)**: `text-[16px] leading-[160%] font-normal text-white`

## 3. Spacing & Layout
*   **Container**: Max-width `1200px`, centered (`mx-auto`), with `px-4` or `px-6` padding.
*   **Section Padding Large**: `py-[180px]` (Desktop) -> `py-[80px]` (Mobile)
*   **Section Padding Small**: `py-[90px]` (Desktop) -> `py-[40px]` (Mobile)
*   **Border Radius**: `rounded-[20px]` for all cards, video slots, and standard buttons. `rounded-full` for avatars and play buttons.

## 4. UI Patterns
*   **Card Hover (Dark)**: Base `bg-[#161616] border border-border-dark`. On hover: `bg-white/10 backdrop-blur-sm transform -translate-y-1`.
*   **Drop Shadow (Floating Elements)**: `shadow-[0_15px_40px_rgba(0,0,0,0.35)]` (Used on the red slanted marquee).
