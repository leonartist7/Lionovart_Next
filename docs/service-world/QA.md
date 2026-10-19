# Phase 1 review evidence — 19 October 2026

## Verified
- Production build and TypeScript pass. Forty camera-envelope, reversible-light, navigation and existing scroll/partnership tests pass.
- Live Vercel viewport review: 320×568, 390×844 and 768×1024 CSS viewports, plus the desktop browser viewport. These are viewport tests, not physical-device benchmarks.
- 320px Content layout: document width 305px within a 320px viewport (scrollbar included); all example and pause controls measured 44px high; controls end above navigation.
- Content calendar selection changes variant to 3. Motion selection changes variant to 2 and video reaches readyState 4, 720px wide, playing with no media error.
- LED switch changes both aria-checked and the visual-display state to false.
- Rakbank feature opens the existing project dialog with correct title and 1/40 position.
- Existing black card presentation remains. Native scroll reaches an intermediate grey then ivory; a follow-up fixes difference-blended text disappearing at mid-grey by explicitly selecting contrasting text colour.
- Mobile service names replace numeric-only labels; the rail scrolls horizontally and keeps its current selection visible.

## Important limitation
The available cloud browser has neither WebGPU nor WebGL contexts. It cannot provide visual or frame-time evidence for the GPU renderer. The screenshots are explicitly the interactive CSS perspective fallback. The Three.js renderer, WebGPU/WebGL backend paths, hardware performance, memory trend, physical touch behavior and reduced-motion GPU output require supported-device verification before promotion. Do not claim this review proves 60fps or cross-browser GPU compatibility.

A WebGL context preflight avoids the Three.js backend initialization error in unsupported environments. Posters remain until the first successful GPU frame. The fallback still supports campaign changes, video playback and LED on/off.

## Evidence
- content-fallback.jpg: desktop campaign composition.
- phone-fallback.jpg: 390×844 iframe with actual responsive CSS and mobile navigation.
- /demo/services-world: review-only viewport harness, noindex; phone/tablet/desktop/landscape and renderer-fallback choices.

## Remaining phases
Phase 2: the other four service exhibits, richer assets and full gallery staging. Phase 3: supported GPU/browser profiling, physical devices, orientation/restoration, context loss and end-to-end polish. Production remains unchanged; the Phase 1 branch is for review.

# Phase 2 review — 20 October 2026 (Europe/Paris)

Initial Phase 2 runtime: 10d8f913507d542be5738ddf72a9a2714594c6ab, Vercel lionovartnext-bdt0ngq92-lionovart.vercel.app. Four new service exhibits and the dynamic gallery feature were exercised in the live browser.

- Local production build, TypeScript and scoped ESLint passed. 48 deterministic camera, image-containment, navigation and scroll tests passed.
- Desktop fallback compositions reviewed for Brand, Digital, Spaces and Systems. Brand Packaging selected variant 2; Digital Apps selected variant 1; Spaces Retail selected variant 2; Systems AI Workflows selected variant 2 and Pause set data-paused=true.
- 390×844 phone layout visually reviewed for Systems. At 320×568, Systems had document width 305px (including a 15px browser scrollbar in the 320px viewport), no horizontal overflow, five 44px controls, final control bottom 483px within the 568px viewport.
- Gallery selection changed data-project-id from rakbank to blastup. The feature opened the Blastup dialog at position 2/40. Next page showed 4–6/40 and the feature changed to Rise.
- Follow-up corrections from visual review: direct #services landing must settle inside the sticky chapter, fallback interfaces use contained artwork to avoid clipping, the decorative arch uses a relative SVG arc, system connections sit behind the dashboard, and portfolio side panels show left/right details while the main frame preserves the complete image.
- Runtime remained in fallback mode (data-world-ready=false). Captured error-log sample contained browser-extension metadata errors, not app errors; this is not a claim that the entire site's console is clean.

GPU appearance, backend compatibility, frame-time/memory profiling and physical-device touch/orientation testing are still Phase 3 gates. Viewport harness screenshots represent CSS perspective fallbacks, not live GPU renders.
