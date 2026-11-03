# Phase 2 — statement, signature and expertise

Completed 1 November 2026 on `codex/services-world-phase1-20261019`.
Tested source: `37afa7435d3be6a06733573ee06b70e2b5771491`.
Baseline runtime: `40424ca00a994ef9c9d24266a0eb9d1d1b4b0d48`.
Verified preview: https://lionovartnext-lnitxv841-lionovart.vercel.app/qa/story-responsive.html
Vercel deployment: `dpl_3ctH2P1oDzm2rFteiyJZaY3e8tDn`, READY, exact tested source SHA.

## Changes

The existing narrative sequence already implemented the planned statement and signature. Two visual defects needed correction:

- At 1280×720, the original cards extended to y=566.08 while the statement began at y=529.42: about 36.66px of overlap. Landscape film sizing now reserves measured statement space and a REM gap, using the larger of that reserve and the separate trust reserve. Font and locale resizing are observed without adding scroll-time layout reads.
- The original media crossfade began before the outgoing frames finished reshaping. At progress 0.875 the center outgoing frame was 316.40×207.13, versus incoming 320×180, with about 30px difference at the bottom. Fit now completes at 84%; the aligned frames crossfade from 84–96%. Expertise still enters from 76–86%, independently of the media opacity gate.

The original artwork, 160svh runway, reversible scroll poses, portrait arrangement and interaction gates remain. The QA fixture now exposes a handoff percentage control using native scrolling, and its Statement reading stop goes to the actual statement hold at 35%.

## Browser checks

Cloud Chrome, real iframe media queries; default 16px root unless specified. All recorded samples had no horizontal overflow.

| Case | Observed result |
| --- | --- |
| 1280×720 EN | Statement gap 24.43px at 35%; signature alone at 60%; expertise opacity 0.355 at 80%; full services and enabled interaction at 100%. Reverse to 35% restored the same gap and statement opacity. |
| 1280×720 EN, 90% | All three incoming/outgoing frame bounds differed by less than 0.001px. Center media opacity 0.501; opening opacity 0.499. All three incoming posters loaded. |
| 768×1024 EN | Resize followed by 90% review: frame bounds differed by less than 0.001px. Reverse to statement retained clear separation. |
| 390×844 FR | Statement gap 80.20px; French copy wrapped without collision. At 90%, all frame bounds differed by less than 0.001px. |
| 1440×900 FR | Settled statement gap 24.03px. Pointer opened the center benefit face; Enter closed it. |
| 320×568 FR, 200%, expanded spacing | Content-fit fallback. Statement, necessity, signature and expertise all opacity 1 in ordinary document order; no horizontal overflow or overlapping narrative blocks. |

The first large-desktop measurement was taken before the resize/scroll state settled (progress 1 rather than requested 0.35). It is retained in the raw samples for transparency and superseded by `large-desktop-FR-statement-settled`.

## Automated validation

- Node test suite: 192 passed, zero failures. Added focused regressions for measured reserve and fit-before-crossfade ordering; existing bounded/reversible tests retained.
- TypeScript: passed (`npx tsc --noEmit --incremental false`).
- Scoped ESLint: passed for the four changed TypeScript source files.
- Production build: passed with a fresh `.next-phase2` build directory; 67 routes generated.
- Diff whitespace check: passed.

See the saved logs, `measurements.json`, `baseline-transfer.json` and screenshots in this directory. Empty type/lint logs represent successful checks with no diagnostics.

## Limits and next boundary

These are viewport and root-text preference checks, not physical-device certification or actual browser zoom. Physical touch, OS reduced-motion switching and GPU performance were not re-certified in this phase. Previously recorded cloud WebGL limitations remain; no new claim is made about physical GPU behavior. Native QA jumps and reverse jumps were checked; no full continuous-scroll frame-rate trace was collected.

Only Phase 2 is completed here. Phase 3 remains unstarted. No master merge or production promotion was performed.
