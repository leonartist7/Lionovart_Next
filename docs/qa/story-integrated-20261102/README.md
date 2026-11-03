# Phase 5 — integrated review and remaining release gates

Reviewed 2 November 2026 on `codex/services-world-phase1-20261019`.

**Status:** implementation and the available automated/cloud-browser review are complete. **Release acceptance is still open** for the hardware/browser gates below. This record does not certify all devices or claim smooth GPU performance. No master merge or production promotion was performed.

## Exact sources

- Phase 4 product baseline: `847244bcddc9653641bc32a3c7373922bad2bde5`; evidence head `53de7a7c956c394a833a19b46044b24591f1b428`.
- Initial Phase 5 instrumentation: `2702b79eb083a75f1df2a84a2da26ea5f1d8e7ef`, preview https://lionovartnext-nptydfoax-lionovart.vercel.app/qa/story-responsive.html, deployment `dpl_4dg1YJvPvZuGu2fVvomHcyNM9wFj`, READY, preview target. Product runtime unchanged from Phase 4 at this point.
- Final product source: `c717d907eb578c906bb7ab49a0c35df932d26c02`, preview https://lionovartnext-r5pzcxjjq-lionovart.vercel.app/qa/story-responsive.html, deployment `dpl_3wdxGTUEzK11W9cJ7etocVsNRcGt`, READY, exact SHA, preview target.

## Confirmed defect and fix

At 320×568, French, 200% root text and expanded text spacing, the static gallery invitation's long word extended beyond its reading column and was clipped by the stage. Document `scrollWidth` alone did not detect this. The before screenshot preserves that failure.

Static gallery/partnership headings and paragraphs now use `min-width: 0`, `max-width: 100%`, and `overflow-wrap: anywhere`. Normal text still breaks at ordinary opportunities; oversized words can use additional lines instead of losing letters. The rule is limited to the static reading surface. Animated composition, timing, fonts, spring values and scroll ownership are unchanged.

The final French 320px check measured 241px text columns, equal client/scroll widths, all four invitation/ending text nodes inside the viewport, ten projects, and no document overflow. The 768px French enlarged-text check likewise found no clipped heading. Emergency wrapping at extreme user spacing is intentional; user text preferences are not reduced to force the original design onto one line.

## Final viewport matrix

Cloud Chrome; real iframe viewport dimensions and media queries. These are not physical devices or browser zoom. `final-matrix.json` records both gallery and partnership poses on the final product source.

| Viewport | Layout | Gallery axis | Copy-to-action gap at ending | Document overflow |
| --- | --- | --- | ---: | --- |
| 320×568 | Content-fit static | Vertical | 32px | None |
| 360×800 | Animated | Vertical | 114.02px | None |
| 390×844 | Animated | Vertical | 127.47px | None |
| 768×1024 | Animated | Vertical | 164.83px | None |
| 1023×768 | Animated | Vertical | 55.64px | None |
| 1024×768 | Animated | Vertical | 55.52px | None |
| 1025×768 | Animated | Horizontal | 55.41px | None |
| 1280×720 | Animated | Horizontal | 54.63px | None |
| 1440×900 | Animated | Horizontal | 53.30px | None |
| 1920×1080 | Animated | Horizontal | 90.42px | None |
| 2560×1440 | Animated | Horizontal | 205.63px | None |
| 844×390 | Short-height static | Vertical | 32px | None |

All sampled final endings had zero playing gallery videos. The first 360px gallery observation landed at the restored fourth-world position during the static-to-animated resize; the explicit subsequent reading-stop check reached travel .2601. This is kept as a separate sample, not silently overwritten.

`initial-transition-samples.json` includes immediate observations made while scroll/layout changes were still settling. Its handoff/portal geometry must not be used as proof of their requested target poses. The later settled samples establish the following:

- Statement hold at p=.350: clearance of 91.88px at 360×800, 84.15px at 390×844, 284.29px at 768×1024, 68.76px at 1023×768, 71.91px at 1024×768, 67.77px at 1025×768. Final desktop recheck at 1280×720: 24.43px. The lead/main/necessity beats are visible while the brand beat is hidden. Two intermediate desktop records in `handoff-rechecks.json` are unsettled; use `en-desktop-statement` for the final desktop assertion.
- Doorway hold: p=.450 phone / .449 desktop, one invitation heading, opacity 1; phone fill opacity 1. The earlier 1920/2560 samples also reached p=.450. Detailed transfer geometry, reverse poses and inherited floor matching remain in the unchanged Phase 3 evidence.
- French normal tablet re-entry: animated vertical mode, travel .2604, ten projects. French 200% + expanded spacing was checked at phone, tablet and desktop; English enlargement received a final phone regression check. This is a representative typography matrix, not every locale × size × preference combination.

## Interactions, loading and lifecycle evidence

- Early French benefit: Enter opened the first benefit, and rapid open/close of the second control completed. Inline benefits are toggles, not dialogs; Escape does not dismiss them. The stronger edge-hit and full phase timing checks remain in prior phase evidence; physical touch remains open.
- Desktop Next / Next / Previous settled at world 2, travel 1.26007, counter 02 / 05. A subsequent wheel interruption stopped short of the target at 2.08712.
- Keyboard focus on FundOnion stayed enabled and fit within the viewport: artwork x=372.47–892.53, y=102.83–460.37, caption bottom=494.13. Escape cleared selection.
- One leading gallery media layer was playing while the other gallery layers and all three service layers were paused. At the ending all service/gallery layers were paused. Thirteen service/gallery poster images were loaded in the recorded audit.
- Direct `#selected-work`, reload, `#partnership`, then browser Back restored the appropriate chapter. Gallery after Back was active at 01 / 05 with its stage at viewport top. Partnership showed 05 / 05 and all project panels hidden. These direct-route checks used the actual 1363×936 browser viewport.
- Seven canvas elements were observed after reload and locale re-entry. Stable DOM counts are not a heap, listener, or GPU-resource leak test.
- Source audit: PinnedScene, ServicePortal and gallery geometry observers/listeners/RAF callbacks are cleaned up; gallery media retains active/near/readable gating. ScreeningMedia pauses on deactivation/visibility change and retains its poster when video fails. Reduced-motion listeners and static fallback remain in source. No unsupported browser mutation was used to simulate media failures or reduced motion.

## Performance observations and limits

The fixture adds a user-started, bounded 30-second sampler and wide-screen option. It observes iframe RAF intervals, long tasks, and non-input layout shifts, and reports media/canvas counts. It does not drive animation state or change playback eligibility. It disconnects observers and cancels its sampler on stop/navigation. A delayed RAF can finish the nominal 30-second window on the next frame.

| Capture | Duration | Samples | Median interval | p95 | p99 | Long tasks | Sum of observed non-input shifts |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| FR 1280×720, native forward/reverse scrolling | 30.94s | 34 | 1016.4ms | 1016.5ms | 1016.5ms | 10 | .00508 |
| FR 390×844, service/gallery scrolling | 30.90s | 32 | 1016.4ms | 1016.5ms | 1066.5ms | 9 | 0 |

These results are **not a performance pass**. The cloud session produced near-one-second sampling intervals and pre-existing unavailable WebGL/WebGPU context errors. This environment cannot establish normal compositor/GPU behavior or diagnose the whole delay as a product regression. Exit-intent behavior also appeared when the pointer left the iframe; the phone window includes a reading-stop jump near its end. The shift sum is a bounded observation, **not a Core Web Vitals CLS score**.

The captures precede the static wrapping fix and provide a reproducible reference on otherwise Phase 4 product code. There is no controlled Phase 0-versus-final frame-time comparison. No claim of a performance improvement, 60fps, or zero rendering errors is made. Baseline/final console logs retain both app GPU-context failures and unrelated browser-extension errors for distinction.

## Automated verification

- Final source: 195 supported Node tests passed, zero failures/skips (`tests.log`).
- TypeScript and scoped ESLint passed on the 13 story implementation files before the CSS-only correction. No TypeScript changed after those checks.
- Final production build passed, including TypeScript and 67 generated routes (`build-final.log`). Generated tsconfig changes were restored.
- Review fixture script syntax and git whitespace checks passed.
- No implementation-mirroring test was added for the three-line CSS correction; the measured live before/after rendering is its regression evidence.

## Remaining release gates

These are required to close Phase 5 acceptance, not a new creative phase:

1. **Actual zoom:** run the final preview in a 1280px browser window at 400% browser zoom. Confirm complete narrative, controls, caption wrapping, gallery order and onward action. Native Ctrl-plus in this cloud session did not change viewport/DPR; `zoom-attempt.json` records the failed attempt. 200% root-font checks are not a substitute.
2. **OS preferences:** toggle reduced motion during a reading stop and during navigation; confirm static reading order, retained anchor/focus, paused effects and a clean return. Also test save-data/poster-only and a deliberately failed video request in a browser with supported network controls.
3. **Physical hardware and engines:** Safari/iOS touch, Android Chrome on modest hardware, Firefox desktop, WebKit desktop; portrait/landscape changes, touch interruption, browser toolbar/safe-area behavior, 1023/1024/1025 boundary and text enlargement.
4. **Comparable performance:** same hardware/browser, warm/cold state, exact scroll path and instrumentation on Phase 0 baseline and final source. Capture frame distribution, long tasks, paint/compositor traces and layout shifts; inspect current and hidden chapters, repeated route mount/unmount, memory and GPU resource disposal. Address reproducible regressions before promotion.
5. **Motion artifacts:** record bounded full forward/reverse clips and doorway/erosion transitions on a GPU-capable browser. This environment supplied stills and native interaction evidence, not video clips or a frame-by-frame GPU audit.

## Phase ledger

| Phase | Review-branch status |
| --- | --- |
| 0 — baseline | Recorded in prior checkpoint |
| 1 — responsive composition | Implemented and tested |
| 2 — narrative handoff | Implemented and tested |
| 3 — shared doorway | Implemented and tested |
| 4 — worlds and ending | Implemented and tested |
| 5 — integrated review | Available checks complete; five release gates above remain open |

Screenshots: `fr-320-200-expanded-before.jpg`, `fr-320-200-expanded-fixed.jpg`, and `final-world-reading-stop.jpg`. `final-world-review.jpg` preserves an intermediate native-scroll pose, not the reading stop. JSON records retain intermediate states and separate decisive rechecks by case name.
