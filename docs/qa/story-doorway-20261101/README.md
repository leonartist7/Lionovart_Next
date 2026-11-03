# Phase 3 — podium to doorway

Completed 1 November 2026 on `codex/services-world-phase1-20261019`.
Tested source: `dee72434196ad29bcceea189b1e4c58ae9b7d973`.
Baseline: `37afa7435d3be6a06733573ee06b70e2b5771491`.
Verified preview: https://lionovartnext-hql0qxrck-lionovart.vercel.app/qa/story-responsive.html
Vercel deployment: `dpl_AoxB74ASPQUJgYVCnPNthYMen7u6`, READY, exact source SHA, preview target.

## Result and corrections

The branch already had a continuous podium/first-row ring. This phase fixes its floor projection and invitation layering, and verifies the existing stationary artwork transfer.

At 1280×720 the baseline podium anchor was 976×48px but the rendered disc was 1904.05×464.94px, extending outside the viewport. A nearly horizontal circle was being projected directly through corridor perspective. The new circular face rotates inside a flat carrier; corridor depth applies to that carrier. The rendered floor ellipse now matches the actual anchor within 0.002px on desktop and 0.004px on the sampled phone.

The doorway owns its single invitation above the rim and opaque central fill. Prepared artwork stays behind the fill during the reading hold, then emerges as it clears. The heading bypasses generic site title reveals so one narrative opacity timeline owns it. Static layouts retain the existing gallery heading in ordinary flow.

Podium lift and face progress run from 10–38%; the upright invitation holds through 55%. The fill clears from 55–78%, and the same rim becomes row zero. Existing service/gallery media transfer remains at 56–72%, stationary until project spread begins at 72%. Gallery renders only rings 1–4 while the podium owns ring 0. No new canvas, animation timer or independent spinning effect was added. Portal geometry changes through transforms and opacity on scroll; carrier width only updates when its computed viewport/type size changes. Existing observer/listener/RAF cleanup remains.

## Browser evidence

Cloud Chrome with actual iframe media queries. All recorded samples had no horizontal overflow.

| Case | Observed result |
| --- | --- |
| 1280×720 EN, floor | Rendered 975.9988×47.9999px; measured anchor 976×48px. |
| Desktop, 45% hold | Circular 503.9994px doorway, opaque fill, one heading, no playing gallery videos. Text is visually clear of artwork. |
| Desktop, 65% transfer | Incoming/outgoing media bounds differ by at most 0.033px. Posters loaded; both chapters inert during transfer; five ring owners total. |
| Desktop, 85% / 100% | Fill and invitation fully clear. At 100%, gallery interaction enabled and service interaction disabled. |
| Desktop reverse | Native wheel returns the same floor bounds. Settled 45% review restores exactly the initial doorway bounds and opacity. |
| 390×844 FR | 314.997px upright doorway, one readable French invitation. Floor anchor match within 0.004px; stationary transfer differs by at most 0.422px. |
| 768×1024 FR | 632.518px upright doorway after resize, centered invitation, stationary transfer differs by at most 0.384px. |
| 320×568 FR, 200%, expanded spacing | Content-fit fallback, no animated rings. One fully visible invitation followed by ten project buttons; first project starts 64px below invitation. No horizontal overflow. |
| 844×390 FR | Short-height fallback, one invitation, zero animated rings, no horizontal overflow. |

Pointer selection of the first project changed `aria-pressed` to true; Escape was exercised before returning to the doorway. The decorative portal ignores pointer input. The first reverse QA sample after project focus/Escape captured progress 0.351 before the final setpoint; it is retained in raw measurements and superseded by the settled 0.449 sample. Native reverse-to-floor and settled re-entry were both verified.

Use the fixture's **Doorway %** and **Review doorway** controls to inspect 0, 45, 65, 85 and 100. After changing viewport or locale, allow layout to settle before reviewing the next stop. The fixture uses native scrolling, not animation-state injection.

## Validation

- 193 Node tests passed, zero failures; new regression verifies the floor/lift/hold sequence and stationary ownership transfer.
- TypeScript check passed; final production build also completed TypeScript successfully.
- Scoped ESLint passed for all changed TypeScript source files.
- Production build passed, 67 routes generated.
- Diff whitespace check passed.

Saved logs, `baseline.json`, `measurements.json`, and screenshots accompany this record. The npm `http-proxy` configuration warning was non-fatal. Type/lint logs contain no error diagnostics.

## Limits and phase boundary

These checks cover viewport geometry, root text size, visible state and bounded interaction samples. They do not certify physical touch hardware, actual browser zoom, OS reduced-motion switching, or GPU/frame-rate performance. The shared short-height fallback was exercised; reduced-motion follows that same existing static route in source. Existing cloud WebGL limitations are unchanged. No full continuous-scroll performance trace was collected.

Phase 3 is complete on the review branch. Phase 4 is unstarted. No master merge or production promotion was performed.
