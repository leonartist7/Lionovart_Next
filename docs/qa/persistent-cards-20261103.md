# Original opening cards carried into Services

Runtime commit: `f8d849da11744847824b6527bcfd46ef2c8998f3`

Review preview: https://lionovartnext-iiru005m6-lionovart.vercel.app/?story=animated

## Behavior

The three opening pane elements persist through the full Services section. They gather behind the original middle pane, hold, reshape as a stack, reveal Services content inside the same frames, then spread into the measured Services orbit. The former rendered Services card set is replaced with unpainted geometry targets. React portals keep the existing Services media and selection buttons inside the original frames; there are three media surfaces and none inside the geometry targets.

Each frame counter-scales its inner media to preserve its aspect while the original parent film projection changes. Selection follows the live Services positions. Reverse scrolling restores the original face controls; the transparent source layer does not intercept the controls below. The original frames retire together with Services before the project tunnel.

## Verification

- Production build passed. TypeScript and scoped ESLint passed.
- 183 tests passed: 167 root script tests and 16 hero/formation tests. Four transport tests cover collection order, stack aspect before spread, projected destination geometry, and finite reversible input.
- Cloud browser: 1280×720, 390×844, 320×568, 768×1024, and 1366×520. No horizontal document overflow at any sampled viewport. Maximum measured endpoint deviation from the live geometry targets was below one CSS pixel (up to 0.90 px). Measurements are in `persistent-cards-measurements-20261103.json`.
- Frame IDs persisted across gather, reshape, spread, viewport changes, and selection within a single loaded page. A fresh preview navigation naturally generates fresh React IDs.
- Native pointer click on the phone viewport rotated original frame 0 into the center and the other two around it, without changing the handoff scroll progress. Native forward/reverse full-browser scrolling reached the gathered stack at progress 0.683, the outward spread at 0.895, and the final Services layout at 1.000.
- Reverse reading stop restored front-face controls and made Services slots inert.
- Preserved Services-to-selected-work disc, project 3 tunnel, and contained red partnership finale at 94%. Source opening and Services opacity both reach zero during the project tunnel.

These are viewport and pointer checks in the cloud browser, not physical-device or GPU performance certification.

## Captures

- `persistent-cards-stack-20261103.jpg`: original middle card in the gathered state.
- `persistent-cards-spread-20261103.jpg`: the same frames spreading into Services.
- `persistent-cards-services-20261103.jpg`: completed Services state.

The work is on the existing review branch only. Production was not promoted.
