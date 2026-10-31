# Homepage refinement — final verification pass

29 October 2026 (Europe/Paris). Review branch: `codex/services-world-phase1-20261019`.

The four implementation phases are complete. This follow-up is the final verification pass, not an additional visual redesign or a production promotion.

## Findings and fixes

- Consecutive category changes exposed exiting and incoming dial labels in the same accessible button name during their crossfade. Each dial button now exposes only its current label; animated visual copies are hidden from assistive technology.
- The invisible Selected Work heading remained in the accessibility tree during the partnership ending. It now leaves that tree with the gallery navigation and returns on reverse scroll. The static gallery keeps its heading.
- In this browser, WebGL is unavailable. Paper ShaderMount inserts a canvas before its constructor throws, so entering the partnership repeatedly added empty canvases (7 at the initial homepage sample, 8 after first partnership entry, 9 after re-entry). The shared liquid-metal button now removes a partial failed canvas and retains its CSS metallic fallback without retrying on every visibility change. Successful GPU initialization and disposal retain their existing path.

## Verification evidence

Baseline reviewed: `20d85bb5c2930b2f08f18059dd9aa501d4a98831`, immutable preview `https://lionovartnext-nbfvijxeb-lionovart.vercel.app/`.

- Branch HEAD and newest branch deployment matched the baseline; no newer branch deployment was found before starting.
- Live desktop viewport: 1363 × 936; content width 1348.
- Service changes Digital → Content → Systems → LED settled on the requested category. Three artwork frames remained mounted. The sampled selected service had exactly one playing video.
- Service and Selected Work direct links landed in the correct chapter. Selected Work exposed eight project panels, four rows. Next navigation advanced 01/04 → 02/04 → 03/04; a native reverse gesture cleared the pending navigation (`aria-busy=false`). The sampled gallery row had one playing video.
- Partnership direct link showed the invitation and result action with the service/style dock hidden. At About, the ring and results shader were inactive, all videos were paused, and no offscreen infinite CSS animations were running in the sampled main content.
- Native reverse scrolling by 140px moved About and the campaign section by exactly 140px together. About computed position was `relative`, height 485.58px. No horizontal document overflow was observed.
- Campaign CTA navigated to `/services#seasonal`, with the existing “The next season starts now.” section rendered.
- Expanded the existing geometric regression cases to cover 360 × 640 and row separation at 320 × 568 / 1024 × 768. The deterministic suite passes 95 tests, including rapid intent changes, stale/failed media preparation, retry, interrupted navigation, continuity and reverse travel.

Local gates: targeted ESLint for changed components, TypeScript without incremental cache, production build and diff whitespace check. Deployment verification and post-fix canvas/accessible-name checks are performed on the resulting immutable preview and reported with the handoff.

## Limits and remaining device checks

The browser exposes no viewport emulation, media-preference emulation or network throttling. Geometry tests are not device runtime evidence. Live 360/390/768/1024/1440 widths, phone landscape/touch/orientation changes, reduced-motion/save-data toggling and slow/failed network requests still require a supported browser/device. Under 560px viewport height and reduced motion, the existing source selects the static ordinary-flow gallery; that path was source-reviewed, not emulated here.

GPU shader appearance and frame-time/heap performance cannot be qualified by this WebGL-disabled browser. No FPS, memory-leak-free or performance-improvement claim is made from screenshots or DOM counts. Existing shader-unavailable and browser-extension errors remain separate from the interaction checks. Production remains unchanged.

## Phase 6 — preference fallback hardening

29 October 2026. Base: `3cf2df3b36e1f910d27b02059bbd5c9cd3606888`.

Source review of the remaining fallback paths found two specific gaps:

- Data saver disabled campaign animation without applying the wrapped layout used for reduced motion. On narrow screens this left content frozen beyond the clipping boundary. The section now exposes whether decorative motion is available; when unavailable, a single copy of the heading/outcomes wraps within the section. Pausing a normal marquee still preserves its position, and scrolling offscreen still only pauses it.
- Service/gallery MediaLayer read `connection.saveData` only when another effect event ran. It now uses the existing reactive `useSaveData` subscription, so preference changes update video eligibility and pause playback without waiting for a tab visibility or service change. Poster imagery remains available.

Baseline desktop campaign sample on the Phase 5 immutable deployment: 1363 × 936 viewport, campaign height 337.23px, two running tracks, no document overflow, zero playing videos while About/campaign were in view. Existing reduced-motion CSS still handles first paint; the new state attribute also covers data saver after hydration. No new preferences, dependencies or public diagnostic controls were introduced.

The existing 95 deterministic checks, targeted lint, TypeScript and production build are rerun for this change. Post-deploy normal-motion/media verification is reported in the handoff. Live narrow viewports, preference toggles, phone orientation and GPU profiling remain open: the available browser does not expose those controls. These source fixes do not constitute physical-device acceptance.
