# Immersive story verification — 31 October 2026

Base: `5819aa0f01e9de4fd3f83d8c29b1d85dfb634162`. Review branch: `codex/services-world-phase1-20261019`.

## Completed checks

- All 171 Node tests passed, including responsive gallery axes, close navigation stops, late erosion, ring attachment/enclosure, reversible copy cues, frame matching and selection interruption helpers.
- TypeScript `--noEmit --incremental false` passed.
- Scoped ESLint passed. `git diff --check` passed.
- Actual Edge rendering through the browser connector covered desktop 1440×900, phone 390×844, small phone 320×568 and tablet 768×1024. The French doorway was checked at 390×844. These scenarios reported no page errors or horizontal overflow.
- Native clicks revealed the center benefit during the early desktop handoff (4%) and the gathered phone hold (37%). Both exposed the benefit content and retained the close control.
- Small-phone and phone tags occupied at most two layout rows; tablet tags occupied one. “Motion” was absent. (Bounding-box top coordinates alone cannot count rows on a rotated desktop card; the final probe uses `offsetTop`.)
- Desktop projects remained horizontal. Phone/tablet projects shared a centered X axis. The doorway framed the single invitation and the service disc became ring zero.
- Sampled gallery views contained seven or eight canvases, with one video playing. This is a bounded observation, not a long-session memory or frame-rate certification.

## Evidence and limits

The PNGs and `browser-measurements.json` in this directory record the inspected development iterations. After inspection, desktop reading gaps were widened slightly, far-preview opacity was lowered, and the disc fill was softened. The phone paw capture includes the tightened final statement spacing. The red development badge is not product UI; the local development page reported an existing body-style hydration mismatch.

The Windows WebKit build was excluded from 3D visual judgments: a 100px fixture translated halfway toward a 1000px perspective plane still measured 100px instead of 200px. Edge provided actual perspective rendering. The browser connector disconnected during later navigation/reduced-motion scenarios; those checks must not be described as completed from that run.

Local production compilation encountered environment filesystem errors creating directories under `.next`; the Vercel review build passed. No source error was reported by the failed local build. Physical touch hardware, device GPU performance and long-session heap behavior remain unmeasured.

## Verified deployed revision

- Runtime: `4ba2927f56a8ad04f9684c823b13844ed6a55380`.
- Preview: https://lionovartnext-l7apg04r6-lionovart.vercel.app/
- Vercel deployment `dpl_6yDUuoqyX5HswEMuE6wrQBoCQVjo` reached READY. This is a review deployment; production was not promoted.
- The deployed browser check caught and fixed Safari/WebKit pointer-selection focus: project activation now focuses its own button without scrolling, so Escape reaches the gallery handler.
- All eight follow-up checks passed on this exact preview: five rows/five rings with a red final ring and no Motion tags; rapid double-next landing at z=60.575 with opacity 1; focus/Escape; native-wheel interruption; complete frame retirement at the ending; stable canvas count during the bounded idle sample; reduced-motion fallback at 390×844; and short landscape fallback at 844×390.
- Both static fallbacks showed all ten projects, readable narrative copy, no moving portal and no horizontal overflow. No page errors were captured.
- `preview-checks.json` contains the recorded results. These input, DOM and static-layout checks used WebKit; actual perspective visual judgments remain based on the earlier Edge captures.
