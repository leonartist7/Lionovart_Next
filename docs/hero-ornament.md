# Pearl & Gold hero ornament

## CTA, footer and scroll refinement — 12 October 2026

Both the hero and closing designs now extend their lower boundaries at nonzero width past the composition and use a shared alpha-gradient mask to blend every material layer into the background. No lower point or rectangular cap remains visible. Cubic silhouettes stay sharp; masks and the closing satin blur effects are rasterized internally by browsers. The original material palette remains unchanged.

The closing SVG is generated inline with a unique prefix for every side/profile/React instance. `ClosingRibbonOrnament` exposes `revealStart=.5`, `revealEnd=.92` (fractions of the process handoff), `stagger=.025` (fraction per layer) and `drift=12` (pixels, capped at 6 on mobile). The process publishes its handoff through `ClosingRevealContext`; isolated use defaults to the completed ornament. All faces, trim, highlights, shadow casters and receiving surfaces use the same cubic reveal. Motion reverses with scrolling, respects reduced motion and schedules only changed, visible frames. The centered lion also stops rendering at idle.

The handoff lasts 1.5 viewport heights. The lion settles once at 68% of viewport height and stays there while chapter text transitions into the CTA. When the sticky scene releases, it scrolls away with the CTA. The footer uses its own static emblem, a centered wordmark/subtitle and a vertical red-to-burgundy gradient. Completed step numbers stay bright for the mounted page visit, independently of temporary passing shimmer and lateral row motion.

Services now own their ivory arrival background; retiring the carousel no longer exposes the black page beneath dark text. The optional carousel-preview mode keeps its transparent overlay. Service rails and the scaling red-circle rim use the approved gold edge palette; the rim compensates for the changing diameter to stay approximately three screen pixels wide.

Regenerate closing exports/runtime with `node scripts/pearl-gold/build-closing.mjs`, and hero exports/runtime with `node scripts/pearl-gold/build.mjs`. The closing builder constructs its editable designs, so preserve custom changes before running it. The new shared build helper is `scripts/pearl-gold/artwork.mjs`. Review closing material and formation at `/demo/ornaments/closing`, including 100%, 400%, 800% zoom and three backgrounds. Its settings scroll independently of the inspection area.

Earlier revision notes below describe the previous render modes; current hero exports include a lower blend mask, but still contain no blur filters.

## Open side arcs revision — 11 October 2026

Replaces the inward-pointing bottom tails with open arcs inspired by the user’s sketch. Each side flares outward at the top and tapers vertically beside the content. Nothing joins or crosses the bottom center. The desktop silhouette stays within the outer 10% of the design; narrower mobile/tablet contours leave the reading area open. Desktop uses proportional cover framing to keep the sides near the viewport edges; portrait profiles use proportional contain framing to keep their delicate tips visible. Formation now grows from the two lower side tips, still taking nine seconds. The material, path count and filter-free rendering are unchanged.

Verified at the desktop headline and the service-card/trust-badge section, plus mobile and portrait tablet. Seven geometry/timing tests pass. Production build and physical-device frame rates remain unverified.

## Previous simplification — 11 October 2026

The hero now uses one broad pearl S-curve plus a small obsidian underfold per side on desktop, and just one pearl ribbon per side on mobile and portrait tablets. A dedicated tablet design avoids placing the wide desktop frame too low in a tall viewport. Separate filaments and the extra crossing ribbon were removed. Fewer width changes and longer sweeping spans make the silhouette calmer.

The hero selects `effects: 'vector'` in the reusable engine. This retains the approved palette and attached gold bands while using gradients, curved shading and a shallow clipped contact shadow without Gaussian blur. Formation uses a tapered cubic clip path instead of a raster mask. The original satin renderer remains available as the engine's default for other compositions.

Measured on the rendered ornament, including all responsive profiles: 268 → 95 paths, 17 → 0 filters, 7 → 0 masks, 26 → 7 paths with animation bindings, and 196,389 → 76,206 markup characters. Only the currently visible profile's paths are updated while forming. The generated geometry/material bundle fell from 264,027 to 106,371 bytes (about 60% smaller), despite adding a third responsive composition. These are complexity reductions, not claims of a measured frame-rate gain on every device.

Mobile and tablet paints are capped at 30 per second and desktop at 60; timing remains nine seconds. Hidden/offscreen animation cancellation and reduced motion remain in place. Actual review playback showed active animation at 455 ms and idle at completion (9,000 ms). Desktop 1280×720, mobile 390×844 and tablet 768×1024 were visually checked. The ornament was idle with its backdrop hidden at the page footer. Seven geometry/timing tests, TypeScript, targeted lint and whitespace checks passed. No physical low-end phone or Safari hardware was available for testing. Existing page shaders, video and other site animations are outside this ornament-specific optimization.

Implemented on `codex/latest-unified-20261008`, based on `f2ddd04f6a42a6e35b0de554a0b7f872769cffde`, in `leonartist7/Lionovart_Next`.

Working checkout: `C:\Users\leona\Documents\Codex\2026-10-09\i-need-you-to-help-me-4\work\Lionovart_Next`. The requested Documents/ChatGPT checkout was inspected with permission, proved to be a different uninitialized project, and was left untouched. This implementation is local, uncommitted and not pushed. The handoff patch contains the implementation; apply it to a clean checkout of the stated base after `git apply --check hero-ornament.patch`.

## Preview

Run `npm ci`, then `npm run dev -- --port 8771`. The homepage uses the new ornament. `/demo/ornaments` provides replay, fixed timeline positions, 100/400/800% vector inspection, and dark/ivory/checkerboard backgrounds. Scroll within the artwork when enlarged; controls remain at the top. The review route is marked noindex.

In development only, `/?ornamentTime=0.25` freezes the real hero at 25% elapsed time; use `0.5`, `0.75`, or `1` for later states. Remove the parameter for real playback. These are time fractions, not equal amounts of visible ribbon, because the motion eases.

## Integration and timing

`src/components/sections/hero-background/HeroRibbonOrnament.tsx` is mounted in `HeroBackground.tsx`. It inherits the existing background's position and scroll fade. The existing light rays and page content are unchanged. The legacy raster composition editor remains available through `?heroEditor=1`; that mode intentionally shows the legacy image instead of the SVG.

```tsx
<HeroRibbonOrnament durationMs={9000} staggerMs={100} startDelayMs={0} />
```

- Duration includes the overlapping layer stagger: all layers finish at 9 seconds.
- Each side uses the same clock. The later layers begin 100 ms apart.
- The entrance waits for the existing splash release and a visible hero. It does not add a content lock or delay the CTA.
- Hidden tabs and an offscreen hero pause the formation. Returning resumes; completed ornaments remain complete for that mounted instance.
- Reduced-motion preference displays the completed ornament immediately, including an initial CSS fallback before hydration.
- `progress` is an optional controlled time fraction for review. The review Replay button remounts the instance to start again.
- `formationEase()` contains the movement curve: cubic-bezier(.77,0,.175,1). Change that function to tune pacing independently of geometry.

No animation library or rendering dependency was added. Geometry is prepared at build time. Runtime work updates path attributes only for the active responsive profile; there are no React state updates per frame. Animation stops after completion and the formation clips are then disabled.

## Editable design and reusable material

Edit `src/lib/pearl-gold/designs/hero-desktop.json`, `hero-tablet.json` or `hero-mobile.json`. Each ribbon has paired boundary knots `a`/`b`, a face material, and a reflection phase. The approved engine derives continuous cubic boundaries, face, gold bands, and shading from these knots. The right side is a mirror of the left.

The JSON `style` controls width, taper, twist, trim, light, softness, depth and texture. This hero uses trim 0.032 on desktop and 0.045 on mobile, and no fine texture. `material-recipe.json` supplies the unchanged approved pearl, dark and gold palettes. `engine.mjs` extends the approved engine with an optional filter-free vector finish. `MATERIAL-SOURCE.md` is the original formula documentation; its blur discussion describes the retained satin mode, not the simplified hero.

Regenerate after changing geometry or material:

```sh
node scripts/pearl-gold/build.mjs
node --test scripts/pearl-gold/formation.test.mjs
```

This writes the runtime SVG bundle and the standalone final SVGs in `public/ornaments/`. The seed script is only a record of the original composition construction: running it replaces the editable design JSON, so do not run it after making custom edits.

`formation.mjs` reverses the paired cubic boundaries to start at the lower-center tip. A distance lookup controls speed, but visible outlines use cubic subdivision, never polygon samples. A tapered leading section forms the advancing surface without a blur pass. The same partial boundary updates desktop shadow casters and the receiving lower ribbon, avoiding shadows on unrevealed surfaces. All inline definition IDs receive a React instance prefix.

## SVG exports and limits

`public/ornaments/hero-desktop.svg`, `hero-tablet.svg` and `hero-mobile.svg` are transparent, self-contained final compositions. Use them as images for a static ornament. Use the React component for the curved formation effect; the standalone exports intentionally contain no JavaScript or formation animation.

Contours and gold bands are resolution-independent cubic vectors. The simplified hero and its exports contain no SVG filter or mask elements; they use curves, clip paths and gradients. The browser still rasterizes the final screen image at the display resolution. The optional original satin mode uses rasterized blur surfaces and costs more at high zoom.

The result preserves the approved palette and gold-band construction with a deliberately simpler finish. It has quieter reflections, fewer folds, and less microscopic metallic texture than the photographic reference. It is not a pixel-perfect reproduction or a physically rendered material. The reference image is not traced, embedded, or converted into pixel-shaped patches.

The existing hero's website preview card overlaps part of the bottom ornament, especially on mobile. The complete design can be inspected independently in the review route and SVG exports. The original hero content and its interactions remain in front.

## Routing correction

The fresh checkout's English homepage returned a 307 redirect to itself. Its locale middleware rewrote an existing unprefixed English route to `/en`, which canonicalized back to the same URL. `src/proxy.ts` now serves those existing English routes directly with the English locale request header, preserving the middleware's alternate-language links and cookies. Explicit locale prefixes still use next-intl. The ornament review route is excluded from locale rewriting alongside the existing demo routes.

## Verification

The geometry/timing suite covers both designs, continuous cubic reveal paths, finite coordinates, empty and complete states, ID references, coherent shadow wiring, absence of embedded raster images, monotonic timing, stagger and nine-second completion. TypeScript and targeted component/proxy lint checks passed during implementation.

Observed actual replay advancing from 333 ms to the completed 9000 ms state. Confirmed the homepage opens, `/en` redirects to `/`, and `/fr` returns 200. Desktop 1440×950 and mobile 390×844 had no horizontal document overflow. Reduced-motion behavior was reviewed in code; OS preference emulation was not available in the browser tool.

Desktop and mobile final views, intermediate states and magnified contours are supplied with the handoff screenshots. These establish visual observations, not a claim of identical photographic lighting. A production build was attempted but stopped in compilation without a usable diagnostic while C: had approximately 400 MB free; a successful production build remains outstanding. The existing site also reports a body-background hydration warning outside the ornament component.
