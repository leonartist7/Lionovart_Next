# LIONOVART — Scroll Lag at `WhatWeDo` (Handoff Brief)

> Self-contained brief for a fresh chat. Don't re-investigate items
> already ruled out below.

---

## Symptom

Mouse-wheel scroll is **smooth** from page load through hero, curtain,
and marquee. **The moment scroll enters `<WhatWeDo />`, the page becomes
laggy and stays laggy through every section below it.**

Critical clue: **scrollbar-drag scrolling stays smooth.** Only wheel
(and likely touchpad) is laggy. That means the cost is **per-Lenis-tick**,
not per-scroll-pixel — Lenis only intercepts `wheel` + `touch`, not the
scrollbar handle. So the fault lies in whatever fires on every Lenis
tick once `WhatWeDo` is in view.

---

## Stack

- **Next.js 16** (App Router, Turbopack), React 19, TypeScript.
- **Lenis** (`@studio-freight/react-lenis`) smooth-scroll driven by the
  **GSAP ticker** via `src/components/providers/SmoothScrollProvider.tsx`.
  The bridge calls `ScrollTrigger.update()` on every Lenis `scroll`
  event (line 28). `lerp: 0.1, duration: 1.2, smoothWheel: true`.
- **GSAP** + `@gsap/react` + `ScrollTrigger` + `SplitText`.
- **Framer Motion 12**. Multiple `useLenis` callbacks in sections.
- Hardware: Razer i9 12-core + RTX 4070 Super. Lag reproduces in
  Chrome, Edge, and the in-browser preview. Not a GPU bottleneck.

---

## What has ALREADY been fixed — do NOT re-investigate

1. **37 MB of uncompressed hero PNGs → 1.6 MB WebP** in
   `public/images/hero_img/`. Sizes confirmed via `ls -la`.
2. **`gsap.ticker.lagSmoothing(0)` restored to default**
   (`lagSmoothing(500, 33)`) in `SmoothScrollProvider.tsx:43` — was
   forcing every queued tick to fully execute, turning any 20ms hiccup
   into multi-frame snowballed stutters.
3. Three demo components (`CustomCursor`, `BackgroundTexture`,
   `SplashScreen`) are commented out in `src/app/layout.tsx` — currently
   inert.
4. **Hero image cycler moved** from the Navbar to a new
   `HeroImageCycler` component inside the hero (visible all devices).
   The Navbar no longer subscribes to `useHeroImageStore`.
5. **`HeroFocalPicker` gated** behind `process.env.NODE_ENV !== "production"`
   so the dev tool and its handler are dead-code-eliminated in prod.
6. A dev-only **`PerfHud`** is mounted at
   `src/components/dev/PerfHud.tsx`. Bottom-left pill shows live `fps`
   + `max frame-ms` (over last 60 frames) + active ScrollTrigger
   `ST` count, with three live toggles:
   - `no backdrop-blur` — strips every `backdrop-filter` via `body.no-bdblur`.
   - `no ScrollTriggers` — calls `ScrollTrigger.disable()` globally.
   - `no hero bg image` — hides the hero CSS-background layer via
     `body.no-herobg .hero-bg-layer`.
   Use these BEFORE proposing code changes.

---

## Prime suspect — `WhatWeDo`'s pin-with-scrub + `pinSpacing: false`

File: `src/components/sections/WhatWeDo.tsx` lines **57–71**:

```ts
gsap
  .timeline({
    scrollTrigger: {
      trigger: sectionRef.current,
      start: "top top",
      end: "+=85%",
      scrub: true,
      pin: true,
      pinSpacing: false,   // ← suspicious — document height doesn't grow during pin
    },
  })
  .to(sectionRef.current, { opacity: 1, duration: 0.5 })
  .to(sectionRef.current, { opacity: 0, ease: "power1.in", duration: 0.5 });
```

Plus a **second scrub** (gold parallax) on lines 80–95
(`scrub: 1` driving `yPercent: -12 → 12` on `goldRef`).

### Hypotheses for the next chat to test

- **H1.** `pinSpacing: false` is causing document-height instability —
  every Lenis tick the pinned section recomputes positions and downstream
  ScrollTriggers in `AboutUsHalf.tsx:201` and `:215` (also scrub+pin) get
  refreshed. **Try `pinSpacing: true`** and see whether wheel-scroll
  smooths out on entering WhatWeDo.

- **H2.** Combined cost: `scrub: true` on a pinned section running
  alongside the gold-parallax scrub on the same section, multiplied by
  Lenis's 60+ ticks per wheel notch. **Try `scrub: 0.4`** on the section
  pin and **remove the gold parallax scrub entirely** (convert to a
  once-on-enter `gsap.from`).

- **H3.** The expensive part isn't the scrub itself but
  `ScrollTrigger.update()` cascading through the whole tree on each
  Lenis tick. In `SmoothScrollProvider.tsx:28`, the `onScroll = () =>
  ScrollTrigger.update()` runs every tick. Try detaching that listener
  via the PerfHud's `no ScrollTriggers` toggle (which calls
  `ScrollTrigger.disable()`) and see if wheel-scroll becomes smooth.

---

## Other inventory you may need

### `useLenis` subscribers (each runs every tick)
- `src/components/sections/HeroRevealWrapper.tsx:71` —
  `scrollY.set(lenis.scroll ?? 0)` → drives `heroOpacity` + `heroY`
  `useTransform`s.
- `src/components/sections/VideoCurtainReveal.tsx:13` — drives
  `curtainY` + `cardScale` + `backdropOpacity`. A duplicate fixed
  full-viewport backdrop motion.div was recently added (uncommitted).
- `src/components/sections/ProblemsSolvedSection.tsx:12` — section
  progress motion value.

### Other scrubbed / pinned ScrollTriggers
- `src/components/sections/AboutUsHalf.tsx:201` (`scrub: 1.2`)
- `src/components/sections/AboutUsHalf.tsx:215` (`scrub: 1.5, pin: true`)

### `useMotionValueEvent` handlers (fire on every scroll change)
- `src/components/sections/Navbar.tsx:71` — delta + isPastHero.
- `src/components/sections/Process.tsx:99` — lineProgress.
- `src/components/sections/Services.tsx:50` — **fires per scroll pixel**;
  `Math.floor` to pick active tab.

### Always-on compositor cost
- **`Navbar.tsx:136`** has `backdrop-blur-xl` on an always-visible fixed
  element. Known to be heavy on Chrome/Windows during continuous scroll.
  Can A/B with the PerfHud `no backdrop-blur` toggle without code change.

---

## Hard constraints for the next chat

1. **READ-ONLY exploration first.** Use the `PerfHud` to gather
   evidence — flip one toggle at a time while wheel-scrolling through
   `WhatWeDo`, record `fps` and `max ms` for each.
2. **One root cause at a time.** When proposing a fix, target ONE
   suspect and explain why. Don't combine changes.
3. **Do NOT pull from `origin`** or alter git state. The user has
   unmerged cloud work across multiple `claude/*` branches. Use only
   read-only git inspection (`git status`, `git log`, `git diff`).
4. Do not strip the brand's `backdrop-filter` look as a fix without
   confirming via PerfHud that it's the dominant cost AND asking the
   user — that's a visual change to the brand.
5. Smallest possible diffs. Prefer adjusting ScrollTrigger options
   over rewriting components.

---

## Suggested first move

Open the dev server, scroll into `WhatWeDo` with the **mouse wheel**,
watch the **`max ms`** number on the PerfHud — that's the worst single
frame in the last second and surfaces stutters that the average `fps`
hides. Note the baseline number. Then flip `no ScrollTriggers` ON,
scroll through WhatWeDo again, note the new number. The delta tells
you immediately whether the cost is in the ScrollTrigger update
cascade or elsewhere.
