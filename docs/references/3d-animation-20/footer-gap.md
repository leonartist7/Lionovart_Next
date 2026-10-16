# Closing CTA → footer gap

## Cause and correction

The process/CTA journey pins a scene while a separate runway supplies the handoff's scroll distance. Its viewport box and scene minimum height used `100svh`. That is the small viewport, with mobile browser controls expanded. When those controls retract, the visible viewport grows but the scene still ends at the smaller height. The dark runway becomes visible between the CTA and the incoming footer, then disappears as scrolling reaches the release point.

`ProcessLionJourney.module.css` now uses `100dvh` for the scene minimum height and the lion viewport. The existing resize observer measures that viewport for the sticky offset, release calculation, and renderer dimensions, keeping them consistent. The footer remains in normal document flow. No compensating negative margin, extra overlay, footer animation, or background-color workaround is added. The gallery, word cadence, mobile mesh/DPR budget, and reduced-motion flow remain unchanged.

## Regression verification

`scripts/verify-closing-footer-gap.mjs` measures the visible distance between the CTA's lower edge and either the footer or the viewport edge, whichever comes first. It samples the end of the pin and the release in both scroll directions. Ordinary device emulation makes `svh` and `dvh` equal and cannot reproduce this issue.

Chromium verification uses Chrome's small-viewport-height override **after navigation**, followed by a real synthesized touch scroll to retract browser controls. It asserts the measured `svh`/`dvh` difference before testing the seam. This uses full Chromium (`channel: "chromium"`), not the headless shell. The initial harness did not produce distinct heights and was rejected; it was not counted as a passing regression test.

The optional baseline mode (`CTA_EXPECT_GAP=1`, with `CTA_BASE_URL` set to the previous deployment) requires a visible band over 40px. The fixed mode requires no visible gap over 1 CSS pixel. Screenshots are captured in Chromium; WebKit tests geometry and interactions without screenshot compositing.

Run against a production build with a current Playwright/Chromium installation:

```sh
npm run build
node scripts/verify-closing-footer-gap.mjs
CTA_WEBKIT=1 node scripts/verify-closing-footer-gap.mjs
```

For an existing deployment, set `CTA_BASE_URL` instead of starting the local server. This is browser emulation, not a physical-phone certification.

## Recorded results — 15 October 2026

- [Chromium comparison](https://github.com/leonartist7/Lionovart_Next/actions/runs/38812679369): passed. At 390×844, the old deployment exposed a maximum **95.859375px** band with a measured 748px small viewport and 844px dynamic viewport. The corrected deployment measured **0px** in the same configuration.
- Fixed Chromium configurations: 320×568 (64px browser controls), 360×800 (96px), 390×844 (96px), 430×932 (112px), 390×844 reduced motion, 844×390 landscape, and 1440×900 desktop. All passed down/up seam sampling. Browser bars returning/retracting, landscape, and portrait restoration also passed. Maximum residual across these samples was **0.328125 CSS pixels**, from fractional layout rounding; no visible band.
- [WebKit job](https://github.com/leonartist7/Lionovart_Next/actions/runs/38812040654/job/116687391400): passed phone scrolling, reduced motion, landscape, portrait restoration and the real Nova button. This engine does not emulate collapsing browser controls in this test.
- The Nova dialog opened and closed in both engines; no uncaught page errors. Before/after 390px and corrected 320px screenshots were visually inspected. The original dark seam is reproduced in the baseline capture and absent from the corrected captures.
- Production build/type checking, local TypeScript and diff checks passed. Application changes are only the two CSS viewport rules in `7dfcbc2`; subsequent commits contain the verification harness and this report. The temporary branch CI workflow was removed after verification.

Chromium 156 was used for the browser-control regression. The first harness attempt used headless-shell emulation before navigation and failed the viewport-difference assertion (0 instead of 96); the corrected full-Chromium harness proved distinct viewport sizes before accepting any results.
