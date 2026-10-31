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

Local production compilation encountered an environment filesystem error creating a bracketed API-route directory under `.next`; the review deployment build is the release gate. No source error was reported by that failed local build. Physical touch hardware, device GPU performance and long-session heap behavior remain unmeasured.

Deployment status and any later preview checks will be appended after the review build completes.
