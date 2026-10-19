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
