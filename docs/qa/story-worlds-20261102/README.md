# Phase 4 — five worlds and a complete ending

Completed 2 November 2026 on `codex/services-world-phase1-20261019`.
Tested source: `847244bcddc9653641bc32a3c7373922bad2bde5`.
Baseline source: `dee72434196ad29bcceea189b1e4c58ae9b7d973`.
Verified preview: https://lionovartnext-qazzp0psk-lionovart.vercel.app/qa/story-responsive.html
Vercel deployment `dpl_CBaFjT6dLZzsagUrgxWHJy51K9dJ`: READY, exact source SHA, preview target.

## Changes and retained behavior

The existing shared row depth, 80px ring setback, five pairs, close arrow stop, delayed erosion and partnership sequence already implemented much of the plan. This phase fixes focus fit and refines ring framing/visual weight without replacing those systems.

- A selected approaching project could remain larger than its viewport. The recorded baseline showed a 588.997px frame and 591.272px caption lane inside a 390px viewport. Focus now caps depth using the actual layout, measured caption bounds, REM gutters and vertical reading space. The limit is cached on viewport/type/content resizing; spring frames perform no new DOM measurement. The original stiffness 180 / damping 30 / mass 1 spring remains.
- Ring diameter and center now reserve 3.25rem of caption height plus a .75rem gap instead of a fixed 50px/25px allowance. The same geometry is shared by the carried podium and remaining gallery rings.
- The current ring holds at .18 opacity, the immediate upcoming ring near .062, and farther rings fade close to zero. Row five retains the red material. The carried row-zero ring also derives its final material from the row count for a single-world dataset.
- The QA fixture adds World / Row advance controls that drive native scrolling to reproducible row poses. They do not inject animation state.

## Browser verification

Cloud Chrome with real iframe media queries. Every recorded sample had no document horizontal overflow.

| Case | Observed result |
| --- | --- |
| 390×844 EN, native focus at row advance .599 | Focused frame 341.335px wide, left 16.833px; caption width 342.653px, left 16.173px. Complete frame/caption fit, zero offscreen area, interaction remains enabled. |
| Phone worlds 1–5 | Each landed at row + .26 with the correct 01–05 counter. Ten unique projects; only row 4 has final/red styling. Logo opacity remains zero during browsing. |
| Ring hierarchy, first world | Current .18; upcoming .0619; next .00096; remaining zero. |
| 1280×720 EN | Horizontal pairs, readable captions and complete red final world. Rapid Next / Next / Previous settled at world 2, advance 1.260. Wheel input interrupted a subsequent arrow move before its 2.26 target. |
| Erosion onset | At advance .86, phone upper/lower panels were about 71% / 49% outside the viewport; desktop panels about 56% / 54%. The existing threshold was retained: both projects have substantially passed before erosion, with another row available. The asymmetry on the phone reflects its upper/lower arrangement. |
| Desktop partnership | All ten panels hidden; all five ring opacities zero; logo fully visible. Copy ends at y=539.78, action begins at y=610.41. |
| Onward action | “See our results” reached `#client-results`, whose top settled at 63.75px. |
| 768×1024 FR | Vertical pair and captions fit; about 29px separates the first caption from the second project. 125% text retained animated mode without overflow. |
| 320×568 FR, 200%, expanded spacing | Content-fit static layout retains ten projects. Ending and onward action remain in normal reading order, with 96px between copy and action. No horizontal overflow. |
| Inherited podium check | At 1280×720 the 976×48px anchor still matches the projected floor disc within 0.01px. |

The first candidate focus sample used a locator click that scrolled a partially clipped element into view and advanced the row; it is preserved as `phone-late-focus`. The decisive follow-up used a native coordinate click, retained advance .599, and confirmed the focused panel was not inert. The intermediate native toggle sample with no focused panel is also retained. Screenshots and raw samples distinguish these states rather than discarding them.

## Automated checks

- 195 Node tests passed, zero failures. New regressions check focused frame/caption fit on both axes and at 16/20/24px root text sizes, plus REM ring framing and ring opacity hierarchy.
- TypeScript passed.
- Scoped ESLint passed on the four changed TypeScript source files.
- Production build passed, including TypeScript and all 67 generated routes.
- Diff whitespace check passed.

Existing tests continue to cover five-world ordering/uniqueness, reversible bounded depth, retirement, delayed erosion, navigation curves and retargeting. Source inspection confirms per-project media still uses the existing active/near/readable gate. Empty lint output and the npm proxy / Node module-type warnings are non-fatal.

## Limits and next phase

This is bounded browser/geometry verification, not physical touch-device certification, actual browser zoom, or a GPU/frame-rate benchmark. OS reduced-motion switching was not re-tested here; enlarged-text content-fit exercises the existing static reading path. Single-world red styling was corrected in source but not exercised through a live filter in this phase. Existing cloud WebGL limitations remain. A full end-to-end performance/device pass belongs to Phase 5.

Phase 4 is complete on the review branch. Phase 5 is unstarted. No master merge or production promotion was performed.
