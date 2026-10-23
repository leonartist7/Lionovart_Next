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

## Refined preview evidence
Runtime 837d03f43d21c12dd2fb5c2e585495d9b76b2f1e (lionovartnext-fn4ex1vrb-lionovart.vercel.app) confirmed direct #services landing at stage top=0. Screenshots saved here are its CSS fallback: phase2-digital-desktop.jpg, phase2-systems-phone.jpg (390×844 iframe), and phase2-spaces-tablet.jpg (768×1024 iframe, browser screenshot shows the visible portion). Final follow-up keeps initial service landing from repeating on orientation changes, makes the signage specimen legible in a portrait frame, and places workflow connections between the room and dashboard depth layers. These small source corrections retain the same scene compositions; GPU validation remains outstanding.

# Phase 3 review — 19 October 2026

Runtime reviewed: d52a7b00b58e540347db9bd6f244d44a03cf532b, READY preview https://lionovartnext-jd0546zbe-lionovart.vercel.app/#services. The final evidence-only commit does not alter this runtime.

## Verified in this pass
- Production build, TypeScript and scoped ESLint passed; 50 targeted tests passed. Added behavioral coverage for startup warmup, isolated stalls, sustained slow animation and idle/invalid frame samples.
- Live diagnosis confirmed an exposed WebGPU API without a usable adapter or WebGL 2 context. Automatic and forced-WebGL modes now report the explicit capability reason and retain usable service content. Explicit poster mode reports `poster`; it does not fabricate GPU measurements.
- Reproduced the previous orientation jump out of Services, then verified the correction. Selected Systems → AI Workflows (variant 2), resized 390×844 → 844×390 → 390×844 → 320×568 → 768×1024 → 1440×900 without remounting the iframe. The selected service/variant remained. Returning to portrait and tablet placed the service stage at top=0.
- Landscape normal-flow stage measured 744px tall inside a 390px viewport. Native scrolling exposed the title, four example controls and pause control, then continued into Selected Work without clipping the section.
- At 320×568: document width 305px (15px scrollbar); all five Systems controls were 44px high; final control bottom 483px. No horizontal overflow. Saved `phase3-small-phone.jpg`.
- Keyboard Enter selected Dashboards and set aria-pressed=true. Keyboard Enter on Pause set data-paused=true. Resizing to desktop retained the chosen variant.
- Review failure simulation produced the explicit simulated reason and kept Systems/AI Workflows selected and usable. Retry mounted a new canvas and returned to the actual unsupported-GPU reason, with variant 2 preserved. Saved `phase3-landscape-recovery.jpg`. This is fallback simulation, not actual GPU context-loss proof.
- Main homepage LED switch set data-led-enabled=false and returned to ON. Window Campaigns selected variant 2. Saved `phase3-led-desktop.jpg` at the cloud browser's desktop viewport (1363×936).
- Reverse scroll from Services showed ivory, an intermediate light value 0.3217 with light text, then black (0) around the original video/card chapter. Native keyboard End reached the footer (top 725.8, bottom 936.3 in the 936px viewport). These journey checks used the initial Phase 3 c47846d runtime; the later correction changes viewport restoration and the GPU capability check, not the light choreography.
- Sampled final browser error logs contained extension metadata errors. This does not certify the entire site's console as error-free.

## Release gate still open
All saved screenshots are the interactive CSS perspective fallback. No supported GPU exists in this test browser, so live Three.js visuals, hardware frame times, real context-loss/recovery, GPU memory trends, shader compilation, transfer profiling, physical touch, OS reduced-motion changes and cross-browser hardware results remain unverified. Review diagnostics make supported-device measurement available. Keep the PR in draft and do not promote to production on the basis of these viewport checks.
