---
name: LIONOVART
description: Bold creative agency. Where ambitious founders come to become impossible to ignore.
colors:
  lacquer-red: "#e5192a"
  lacquer-red-deep: "#db0000"
  sovereign-gold: "#f0c917"
  void: "#000000"
  obsidian: "#0d0d0d"
  carbon: "#161616"
  charcoal: "#1a1a1a"
  light-steel: "#eceff3"
  warm-ivory: "#f5f0eb"
  signal-white: "#ffffff"
  ghost-white: "#cccccc"
  ink: "#111111"
  ash: "#555555"
  stone: "#999999"
typography:
  display:
    fontFamily: "Clash Display, sans-serif"
    fontSize: "clamp(2.8rem, 11vw, 11rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Clash Display, sans-serif"
    fontSize: "clamp(2rem, 6vw, 7rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Clash Display, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  body:
    fontFamily: "Clash Display, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Clash Display, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.15em"
rounded:
  pill: "9999px"
  card: "28px"
  lg: "20px"
  md: "12px"
  sm: "4px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "80px"
  section: "100px"
components:
  button-primary:
    backgroundColor: "{colors.lacquer-red}"
    textColor: "{colors.signal-white}"
    rounded: "{rounded.pill}"
    padding: "12px 32px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.signal-white}"
    textColor: "{colors.lacquer-red}"
    rounded: "{rounded.pill}"
    padding: "12px 32px"
  button-white:
    backgroundColor: "{colors.signal-white}"
    textColor: "{colors.lacquer-red}"
    rounded: "{rounded.pill}"
    padding: "12px 32px"
    typography: "{typography.label}"
  nav-pill-hero:
    backgroundColor: "{colors.lacquer-red}"
    textColor: "{colors.signal-white}"
    rounded: "{rounded.md}"
    padding: "8px 28px"
  nav-pill-scrolled:
    backgroundColor: "rgba(0,0,0,0.20)"
    textColor: "{colors.signal-white}"
    rounded: "{rounded.md}"
    padding: "8px 28px"
---

# Design System: LIONOVART

## 1. Overview

**Creative North Star: "The Creative King"**

This is the design language of a studio that has already decided it is the best. Not cocky — sovereign. The black canvas is not chosen for atmosphere; it is the absolute baseline that makes the Lacquer Red (#e5192a) land with the force of a decree. Every surface, every animation, every typographic choice answers one question: does this prove we are world-class, or does it waste the frame?

The type is Clash Display, used exclusively, at every size. There is no body font and no serif contrast — this is a monolingual typographic system, which is unusual and correct. The voice is singular. The spacing is deliberate: sections breathe; headings compress. The ratio between a label at 11px and a display line at 11rem is not a scale — it is a canyon, and that canyon is the hierarchy.

Motion is cinematic, not decorative. The curtain card that slides away on scroll, the sticky hero that sections scroll over, the 3D carousel spinning the portfolio on loop: these are not features, they are demonstrations. The site is the pitch. Every interaction is proof.

This system explicitly rejects: generic SaaS floating-card layouts, pastel gradients, hero-metric dashboards, overcrowded agency visual noise, safe corporate blue/white, and trend-chasing aesthetics (brutalism, Y2K, Behance-frontpage minimalism).

**Key Characteristics:**
- Single font family, entire scale from 11px to 11rem
- Pure black canvas; color is signal, never decoration
- Lacquer Red deployed with precision: CTAs, accents, cycling words, trust numbers
- Sovereign Gold held in reserve: used rarely to mark a moment of triumph or distinction
- Cinematic scroll architecture over conventional section stacking
- Motion vocabulary: exponential ease-out, never bounce or elastic
- Bold and ceremonial interactions: every button, badge, and transition is a statement

---

## 2. Colors: The Predator's Palette

A three-tier palette. Black is the stage. Red is the signal. Gold is the crown. Everything else is tonal variation of the stage.

### Primary
- **Lacquer Red** (`#e5192a`): The primary signal. Used on the navbar (hero mode), the CTA button ring, cycling headline words, count-up stat numbers, trust badge numerals, active/hover states, and the orb pulse glow. It is the color of a decision made with full commitment. Not warm, not cool — precise.
- **Lacquer Red Deep** (`#db0000`): The pressed and hover depth state for Lacquer Red. Never used independently; always in relation to its surface.

### Secondary
- **Sovereign Gold** (`#f0c917`): Defined and reserved. Does not appear in most sections. Deploy only for moments of genuine distinction: awards, milestones, or contrast moments where red would create visual collision. Its rarity is the point.

### Neutral
- **Void** (`#000000`): The primary background. The main stage. Not "dark" — absent.
- **Obsidian** (`#0d0d0d`): The Shadcn semantic `--background`. Slightly elevated; used for the root document surface, giving the pure Void a perceivable edge.
- **Carbon** (`#161616`): Card and popover surface. The first tonal lift above the stage.
- **Charcoal** (`#1a1a1a`): Secondary/muted/accent surfaces. The second tonal lift.
- **Light Steel** (`#eceff3`): The only light surface in the system. Used exclusively for the Services section and the outward ImageMarquee row. Not white — slightly cool grey, grounding. The contrast against the surrounding black sections is architectural, not accidental.
- **Warm Ivory** (`#f5f0eb`): The warm off-white reference. Used as a softer alternative to Light Steel in off-black contexts.
- **Signal White** (`#ffffff`): Primary text on dark backgrounds, button text, logo wordmark. Never used as a background surface.
- **Ghost White** (`#cccccc`): `text-muted` equivalent (rgba 255,255,255,0.8 resolved). Secondary text, subtitles, supporting copy.
- **Ink** (`#111111`): Primary text on light surfaces (Services section).
- **Ash** (`#555555`): Secondary text on light surfaces.
- **Stone** (`#999999`): Tertiary text, placeholders, disabled states on light surfaces.

### Named Rules
**The Lacquer Rule.** Red is a statement, not a tint. It appears where the eye should land next. Every other instance of red asks: is this the most important thing on screen right now? If not, remove it.

**The Gold Reserve Rule.** Sovereign Gold is forbidden in default content. It exists for one purpose: to mark the extraordinary. Treat it the way a general treats a medal — issue it rarely so it retains meaning.

**The One Light Surface Rule.** The Light Steel surface (`#eceff3`) exists for one architectural purpose: to create a register break between dense dark sections. It is not a general-purpose background. Never place it adjacent to another light surface.

---

## 3. Typography

**Display Font:** Clash Display (local woff2, all weights)
**Body Font:** Clash Display (same family, lower weight)
**Label/Mono Font:** Clash Display / Geist Mono (terminal/code contexts only)

**Character:** A single-voice typographic system. The authority comes from the scale differential, not from contrasting families. Clash Display's geometric weight with tight letter-spacing at large sizes reads as architectural; at small sizes it reads as confident and legible. The choice to use one font at every level is a design statement: LIONOVART does not need variety to communicate hierarchy.

### Hierarchy
- **Display** (900, `clamp(2.8rem, 11vw, 11rem)`, line-height 0.9, uppercase): The cycling headline word in the hero. One word at a time. Appears nowhere else at this size. Maximum presence.
- **Headline** (700–900, `clamp(2rem, 6vw, 7rem)`, line-height 0.9, tracking tight, uppercase): Section headings, hero static lines, footer CTA heading. Compressed leading, tight tracking. The page breathes through spacing, not letterforms.
- **Title** (700, `clamp(1.5rem, 3vw, 2.5rem)`, line-height 1.1): Sub-section headings, service titles, process step headings.
- **Body** (400–500, `18px`, line-height 1.6, max 65ch): Subtitles, descriptions, supporting copy. The only place in the system where lines run long — always capped at 65–75ch.
- **Label** (600–700, `10px–13px`, line-height 1.2, letter-spacing 0.12–0.15em, uppercase): Nav links, eyebrow tags, stat labels, badge copy, button text. All caps. Extended tracking for readability at small size.

### Named Rules
**The Single Voice Rule.** Clash Display is the only typeface. Never introduce a second family for body contrast, pull quotes, or code. Use weight and scale differential to create hierarchy. Geist Mono is permitted only for terminal or code contexts where a monospaced literal is semantically required.

**The Canyon Rule.** The display-to-label size ratio is not a comfortable scale — it is a canyon. Do not introduce intermediate sizes that would fill the gap. The contrast between 11rem and 11px is the hierarchy. Protect it.

---

## 4. Elevation

This system is tonal by default. Surfaces lift through background color, not drop shadows. The four dark neutrals (Void, Obsidian, Carbon, Charcoal) form the tonal stack; a component on Carbon reads as elevated above a Void surface without any shadow.

Three exception modes are used:

**Ambient Blur (navigation and panel contexts).** The navbar in scrolled mode and the AI Strategist panel use `backdrop-filter: blur(xl) saturate(1.8)` with a 1px white/10% border to float above content. This is not decorative glassmorphism — it is a functional layer indicator. Used only for elements that must remain legible over any section background.

**Chromatic Glow (primary accent only).** The red orb pulse uses `box-shadow: 0 0 60–80px rgba(229, 25, 42, 0.4–0.6)`. This is the only warm glow in the system. It is tied to the primary CTA and the Nova AI agent. Nowhere else.

**Inset Shadow (bounded containers).** The footer uses `inset 4px 4px 16px rgba(0,0,0,0.5), inset -4px -4px 16px rgba(255,255,255,0.04)` to create perceived depth within a bounded container. The inset prevents it from floating — it carves.

### Shadow Vocabulary
- **Ambient float** (`box-shadow: 0 4px 30px rgba(0,0,0,0.1)`): Navbar glass layer hover state. Diffuse, almost invisible.
- **Deep float** (`box-shadow: 0 8px 32px rgba(0,0,0,0.18)`): Mobile dropdown panel. Grounds it against the scrolled page.
- **Chromatic pulse** (`box-shadow: 0 0 60px rgba(229,25,42,0.4)` → `0 0 80px rgba(229,25,42,0.6)`): Nova orb animation. Alive, pulsing. Red only.
- **Inset depth** (`inset 4px 4px 16px rgba(0,0,0,0.5), inset -4px -4px 16px rgba(255,255,255,0.04)`): Footer container edge. Carves, doesn't float.
- **Glass panel deep** (`0 25px 50px -12px rgba(0,0,0,0.5)`): AI Strategist panel ambient. Long tail, very dark.

### Named Rules
**The Tonal Canvas Rule.** Surfaces are flat at rest. Depth is expressed through background tonal lift (Void → Obsidian → Carbon → Charcoal), not drop shadows. Drop shadows appear only in three defined contexts: ambient blur (nav/panel), chromatic glow (Nova orb only), and inset carving (bounded containers).

**The No Decorative Glow Rule.** Chromatic glow is reserved for the primary accent — the Nova orb and active CTA states. Never apply colored glows to section backgrounds, cards, or text elements. If it looks like a gaming PC, it's wrong.

---

## 5. Components

### Buttons

The flagship button is the **LiquidMetalButton**: a WebGL fragment shader rendered on canvas, producing a live metallic liquid surface. It is the system's signature interaction — bold and ceremonial. Two variants:

- **Primary (Red variant):** Dark red interior, metallic sheen, white label. Height 46px, pill-shaped (`border-radius: 100px`), label `11px font-weight 700 uppercase tracking-[0.15em]`. Ripple on click (radial scale-out at pointer position). Hover drives shader speed/intensity.
- **White variant:** White metallic interior, red label (`#ff0000`). Used in the navbar "Get Started" CTA when placed over the red hero background (inversion for legibility).

**Standard CTA Button (Footer):** Solid fill `#e5192a`, `border-2 border-brand-red`, `rounded-full`, `h-16 px-10`, label `16px font-bold uppercase tracking-widest`. Hover: `bg-white text-brand-red scale-105`. Transition 200ms. Focus: `ring-4 ring-brand-red/30`.

- **Shape:** Fully rounded pill (100px) for hero CTAs; full circle (rounded-full) for footer CTA.
- **No flat or squared buttons.** The only square-cornered surfaces in this system are section containers.

### Navigation

**Hero mode (top of page):** Full Lacquer Red background (`#e5192a`), pill-shaped (`rounded-xl`, 12px), white wordmark + links + language switcher. Links: `13px font-semibold uppercase tracking-[0.15em]`, underline-scale hover. CTA: LiquidMetalButton white variant.

**Scrolled mode:** Clip-path circle transition (0.75s cubic-bezier(0.4,0,0.2,1)) reveals glass layer: `backdrop-blur-xl bg-black/20 border border-white/10`. Nav links collapse; burger appears. The transition is the interaction — not a swap, a reveal.

**Mobile dropdown:** Slides from behind the nav pill (y: -100% → 0), `bg-white/75 backdrop-blur-[28px] saturate-[1.8]`, rounded-xl, white glass with black text.

### Trust Badges

Laurel-framed count-up badges. Three variants: large number + label (brands count, countries count), and center star + avatar stack. Laurel images (`laurel-L.webp`, `laurel-R.webp`) flank a content zone. Numbers animate via `requestAnimationFrame` count-up. Stars scale-in with `[0.34, 1.56, 0.64, 1]` spring ease (the only spring-overshoot in the system). All text in Lacquer Red.

- **Not cards.** The laurel frame is the affordance — no background, no border-radius, no surface.
- Label size is proportional to content zone width (`contentWidth * 0.18`).

### 3D Carousel (ImageMarquee)

CSS `rotateY` 3D carousel: 20 images arranged on a cylinder (`transform-style: preserve-3d`), auto-spinning via CSS `animation: carousel-spin`. Radius calculated dynamically from card width and item count. Two modes: inward (hero context, 20 items at 18° steps) and outward (light surface context, 40 items at 9° steps, full dome coverage). No JS scroll dependency — it runs on CSS alone.

### Signature Component: VideoCurtainReveal

A fixed-position "card" overlaid at page load, z-49. On scroll, it slides up via transform, revealing the sticky hero group below. This is not a loader or splash screen — it is the scroll entry sequence. The card contains a video or static brand image. Once it exits the viewport, the hero is pinned and sections scroll over it as z-[2] layers.

---

## 6. Do's and Don'ts

### Do:
- **Do** use Lacquer Red (`#e5192a`) only where the eye should land next. It is a directive, not a tint.
- **Do** let the black canvas breathe. Negative space is not empty — it is the stage.
- **Do** use exponential ease-out curves (`cubic-bezier(0.4, 0, 0.2, 1)` or tighter) for all state transitions. The motion should feel like a confident decision, not a performance.
- **Do** introduce the Light Steel surface (`#eceff3`) only as an architectural register break — one section at a time, never adjacent to another light surface.
- **Do** keep body copy capped at 65–75ch and `18px`. Founders read fast; give them a clean line.
- **Do** hold the Sovereign Gold (`#f0c917`) in reserve for singular moments of distinction. If you're using it in a list, you're using it wrong.
- **Do** make every interaction statement-level. Buttons are ceremonial. The LiquidMetalButton is the archetype.
- **Do** respect `prefers-reduced-motion` — disable the orb pulse, carousel spin, and entrance stagger sequences; preserve the visual hierarchy without them.
- **Do** use uppercase Clash Display with tracking 0.12–0.15em for all labels, eyebrows, and nav text. The extended tracking at small size is the system's typographic signature.

### Don't:
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent on any surface. Side-stripe borders are prohibited. Use full borders, background tints, or leading numbers.
- **Don't** use `background-clip: text` with any gradient. No gradient text. Emphasis through weight or size.
- **Don't** use glassmorphism decoratively. Blur is reserved for functional layers: navigation and the AI panel. A blurred card behind static content is immediately wrong.
- **Don't** build identical card grids. Icon + heading + text, repeated in a 3-column grid, is the single most reliable way to produce "AI made that" output. If you're reaching for cards, find a better structure.
- **Don't** use the hero-metric template: big stat number, small label, supporting copy row, gradient accent. The trust badges already do this correctly (laurel-framed, ceremonial). A plain metric block is the SaaS cliché this system rejects.
- **Don't** introduce a second typeface. Clash Display is the only voice. Resist the reflex to add a serif for body contrast.
- **Don't** add a colored drop shadow to anything that isn't the Nova orb. Chromatic glow is a reserved signature.
- **Don't** place the Sovereign Gold adjacent to Lacquer Red in the same visual element. They compete; neither wins.
- **Don't** make the light-steel section feel like a separate website. It is a breathing room inside the black canvas, not an exit from it.
- **Don't** design for "creative agency" as a category. The first-order reflex for a creative agency is: dark, dramatic, big type, red accents. That IS this system. The work that prevents it from becoming cliché is the precision of deployment — not the choice of colors.
