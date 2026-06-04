# Performance Audit — Phase 1 Report (READ-ONLY)

> Site: LIONOVART. Analysis only. No code changed.
> Diagnostic frame: your clue ("OS animations OFF = buttery, ON = laggy") means the browser maps the
> Windows "Show animations" toggle to `prefers-reduced-motion: reduce`. So the true cost is whatever
> runs in the **motion-enabled** path and is **removed/disabled under reduced-motion**. That single
> fact is the strongest pointer in this audit, and it lands squarely on the fixed `backdrop-filter`
> layers. Everything below is ranked by per-frame paint cost during Lenis scroll.

---

## Ruled out (you asked specifically)

- **`remotion`:** NOT in `package.json`, not imported anywhere, not bundled. Nothing to remove. Your suspicion is cleared.
- **Canvas stars / parallax RAF loop:** does not exist on the live site. `BackgroundTexture` is commented out of `layout.tsx:10-12, 69` (and even when mounted it is pure static CSS, zero JS/RAF). The only parallax lives in an unused `/hero-fx-preview` route. Rule it out.
- **Lenis + RAF architecture:** correctly built. `SmoothScrollProvider.tsx` uses a **single** RAF driver (`gsap.ticker` drives `lenis.raf`), `autoRaf:false`, and `lagSmoothing(500, 33)` is restored (good). This is not a problem; leave it.

---

## 🔴 Load-bearing (the actual cause)

### 1. BottomBlur — three stacked, fixed `backdrop-filter` layers
- **What:** A fixed frosted strip pinned to the viewport bottom, built from 3 stacked `backdrop-filter: blur()` layers (4px / 10px / 22px) with upward mask gradients.
- **Where:** `src/components/ui/BottomBlur.tsx` (mounted globally at `src/app/layout.tsx:81`); CSS at `src/app/globals.css:581-599`.
- **Why it costs frames:** The strip is `fixed inset-x-0 bottom-0`, up to `clamp(90px,16vh,240px)` tall, and always on screen. `backdrop-filter` re-samples and Gaussian-blurs the live content behind it; when that content scrolls (and it includes the moving `SceneVideoBackdrop` video), the blur **cannot be cached** and fully repaints **every frame, times three**. Stacked blurs are super-linear in cost.
- **The clincher (matches your clue exactly):** layers 2 and 3 are `display:none` under `@media (prefers-reduced-motion: reduce)` (`globals.css:609-614`). Windows animations OFF → `reduced-motion` → the two heavy blur layers vanish → buttery. This reproduces your on/off toggle precisely. **This is almost certainly the dominant cost.**
- **Fix (same look, cheaper):**
  - **(a, recommended)** Collapse 3 layers → **1** masked layer at `blur(~16px)` with the same upward mask. The 3-layer radius ramp is a refinement most eyes can't separate from one well-masked layer. ~70% of the cost gone.
  - **(b)** Or replace the live blur with a **static pre-blurred scrim / gradient overlay** (PNG or layered semi-opaque dark gradient). Over the dark footage at the bottom edge the visual delta is near zero, and per-frame blur cost drops to zero.
  - Either way: add `contain: paint` and isolate it on its own layer.
- **Effort:** S (a) / M (b).

### 2. Navbar glass — fixed `backdrop-blur-xl` (24px), always on after hero
- **What:** The scrolled-mode glass nav bar; plus two hover/menu panels at `blur(28px) saturate(1.8)`.
- **Where:** `src/components/sections/Navbar.tsx:252` (`backdrop-blur-xl` = 24px); hover/mobile panels at `Navbar.tsx:402-403` and `446-447`.
- **Why it costs frames:** The bar is fixed and visible after the hero; its 24px backdrop-filter re-blurs the scrolling page beneath it every frame. It is **not** gated by reduced-motion, so it adds a constant baseline even in your "smooth" case (the GPU tolerates it alone, but it stacks with BottomBlur). The `:402/:446` panels only mount while the Expertise/mobile menu is open, so they cost only during interaction (but `blur(28px)+saturate(1.8)` is heavy while open).
- **Fix (same look):** Cap to `backdrop-blur-md` (12px) — visually near-identical for a thin bar; drop `saturate` on the always-on bar (keep it on the hover panel if wanted); give it `contain: paint` + its own layer. Important: the glass `motion.div` still computes its filter while at `opacity:0` in hero mode (`Navbar.tsx:250-259`) — gate it so `backdrop-filter` is `none` (or the node unmounts) until `isPastHero`.
- **Effort:** S.

### 3. CustomCursor — per-frame `elementFromPoint` + `mix-blend-mode: difference`
- **What:** Custom cursor (dot + ring) driven by a continuous RAF; auto-inverts via blend mode.
- **Where:** `src/components/ui/CustomCursor.tsx:91-130` (RAF loop; mounted `layout.tsx:79`); blend mode at `globals.css:406` and `423`.
- **Why it costs frames:** (a) `document.elementFromPoint()` runs **every frame** the pointer moves, forcing a synchronous hit-test (style/layout read) on the main thread. (b) `mix-blend-mode: difference` on two fixed elements forces the compositor to read the backdrop and **blend + repaint** the region under the cursor every frame it moves over scrolling content. Neither is gated by reduced-motion.
- **Fix (same look):** (a) Replace per-frame `elementFromPoint` with `pointerover`/`pointerout` event delegation on `INTERACTIVE_SELECTOR` — identical hover labels, zero per-frame hit-test. (b) Confine `mix-blend-mode: difference` to the small dot only (drop it on the ring, give the ring a plain semi-opaque white border) to shrink the blended/repainted area.
- **Effort:** S (throttle hit-test) → M (full event-delegation refactor).

---

## 🟡 Secondary

- **SceneVideoBackdrop is a cost *multiplier*, not a cost.** `src/components/sections/SceneVideoBackdrop.tsx:84` — fixed full-viewport `<video>` (z-0). It composites fine on its own and correctly pauses + fades once About covers it. But while playing, it is the moving content the blurs above must re-sample each frame. Fixing the blurs (🔴 1-2) removes most of this. No change to the video itself. (3 clips `preload="auto"` = heavy load-time network, but per your scope network is out of bounds.)
- **LiquidMetalButton — live WebGL shader.** `src/components/ui/liquid-metal-button.tsx:91` runs a WebGL fragment shader on canvas. On its own layer it won't force page repaint, but a perpetual shader loop competes for GPU with the blurs. **Verify in DevTools** that it pauses when idle / off-screen; if it animates continuously, gate it to hover + on-screen. Effort: S.
- **`filter: blur()` entrance animations.** `src/components/sections/LumaShowcase.tsx` (e.g. `395-396, 503-531, 596-602`) and `src/components/sections/WhatWeDo.tsx:48-51` animate `filter: blur()`. Animating blur repaints every frame for the animation's duration — transient, so lower priority, but they spike while scrolling through those sections. LumaShowcase also runs its own RAF (`LumaShowcase.tsx:240`) — confirm it's paused off-screen. Fix: swap blur-in for `opacity` + small `scale` (transform/opacity only); the reveal feel survives. Effort: M.
- **Navbar red layer animates `clipPath`** (`Navbar.tsx:236-247`): repaints, but it's a one-shot 0.75s transition on hero exit, not steady-state. Acceptable, no action.

---

## ⚪ Not reported as problems (per your scope)
- File / component count — irrelevant after bundling.
- `remotion` — not installed.
- `BackgroundTexture` — removed from layout; static CSS regardless.
- Lenis / `gsap.ticker` single-RAF — correctly architected; leave it.

---

## If you only fix three things, fix these
1. **BottomBlur:** collapse the 3 fixed `backdrop-filter` layers to one masked layer (or a static pre-blurred scrim). This is the change most consistent with your exact OS-animations clue and should recover most of the frame budget on its own.
2. **Navbar glass:** cap blur 24→12px, drop the always-on `saturate`, contain it on its own layer, and disable its `backdrop-filter` while it sits at `opacity:0` in hero mode.
3. **CustomCursor:** stop calling `elementFromPoint` every frame (switch to `pointerover`/`pointerout` delegation) and confine `mix-blend-mode: difference` to the dot.

All three target the always-on, per-frame paint costs that the GPU chokes on whenever the OS is **not** forcing reduced-motion. Each is independently revertible, which fits the one-fix-per-commit Phase 2 plan.

---

## Awaiting your go-ahead for Phase 2
On approval I will: create branch `perf/audit-fixes`, apply **one fix per commit** (starting with BottomBlur), preserve the look on each, flag any change that can't keep the exact look as an "optional tradeoff" for your call, and finish with a Chrome DevTools → Performance verification checklist (what to record while scrolling, and which metric each fix should move).
