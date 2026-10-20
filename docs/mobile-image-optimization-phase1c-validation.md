# Phase 1C — preview image validation

Date: 2026-10-20. Status: desktop image-delivery checks passed; mobile/tablet and non-AVIF-browser validation remain open.

## Exact reviewed deployment

- Branch: `review/mobile-image-optimization`.
- Application commit tested: `b371c0212d4c74623251458a23fc29a3beab84ed`.
- Application tree: `3354cc52b24c9524487e01802dc5994f276e6ad2`.
- Preview: https://lionovartnext-nmasp4tbj-lionovart.vercel.app/
- Deployment: `dpl_5dMHwUaZDvX6sBu45kLzLDGGzZqW`, READY, preview environment, confirmed against that exact GitHub SHA through Vercel.
- Remote inventory rechecked: all 350 manifest derivatives are tracked, present locally in the remote checkout, and match their content-hash filenames. There are 32 originals. No asset regeneration or application changes were needed in this checkpoint.

## Live browser evidence

The available cloud browser reported a 1363 x 936 CSS-pixel viewport at DPR 1. These are desktop observations, not simulated-phone or real-device results.

| Flow | Observed result |
| --- | --- |
| Initial homepage | Navbar selects local `d366c48c2358f1e7-64.avif`; proof faces/stars/laurels decode. Partnership images are not mounted and all 18 closing-gallery image sources remain deferred at the top of the page. |
| Partnership reveal | Scrolling activates all nine posters. Each decoded and selected a Cloudinary AVIF variant; sampled URLs end in `c_limit,w_640,f_avif,q_95:444` after the original transformation chain. |
| Selected work | Rakbank, Blastup and FundOnion posters decoded as AVIF. Clicking **Next works** replaced them with Rise, OP and Fashion high-tech; all three new images decoded as AVIF. Visible artwork retained its cover cropping. |
| Process | All four `[data-process-ring]` elements remain `IMG` nodes inside `PICTURE`, retain their selector, decode, and select the 96px AVIF variant. The transparent lion poster is visible. |
| Closing reveal | Sources remain inactive until the reveal threshold. At reveal value 1, all 18 activate; 16 instances decoded in the sampled view, covering all six unique Cloudinary AVIF sources. Two instances remained lazy rather than reporting decode failures. The lion, text and surrounding gallery were visually inspected in the settled view. |
| About | All four content images decoded: lion-circle hero (640px AVIF), brand illustration (1024px AVIF), website illustration (640px AVIF), founder portrait (640px AVIF). The portrait loaded after scrolling to its section. |
| Services | `/services` and `/services/brand` rendered. The shared cycling word art selected AVIF, retained its `e_trim` transform, and decoded. |
| Selector ownership | All twelve proof images and all four process-ring selector matches remain actual decoded `IMG` elements with the new `PICTURE` parent. |
| Image preload inspection | The sampled homepage contained only the existing SVG-logo image preload; no separate WebP preload was present. |
| Broken images | No sampled image with a nonempty `currentSrc`, `complete === true` and `naturalWidth === 0` was found across the checked routes and gallery states. Offscreen lazy images and intentionally deferred sources were not classified as broken. |

Observed routes:

- https://lionovartnext-nmasp4tbj-lionovart.vercel.app/
- https://lionovartnext-nmasp4tbj-lionovart.vercel.app/about
- https://lionovartnext-nmasp4tbj-lionovart.vercel.app/services
- https://lionovartnext-nmasp4tbj-lionovart.vercel.app/services/brand

## HTTP format and cache checks

Direct requests to the deployed files returned HTTP 200:

| Asset | Content-Type | Cache-Control |
| --- | --- | --- |
| `/images/optimized/d366c48c2358f1e7-64.avif` | `image/avif` | `public, max-age=31536000, immutable` |
| `/images/optimized/f218f8dc9535392d-512.webp` | `image/webp` | `public, max-age=31536000, immutable` |
| `/models/lion/lion-poster.805b866b194de270.webp` | `image/webp` | `public, max-age=31536000, immutable` |

Opening the deployed WebP asset directly in the browser confirmed successful 512 x 512 decoding. This verifies delivery and decoding of the fallback asset; it does **not** verify automatic source selection in a browser lacking AVIF support. The Phase 1B tests separately establish the AVIF-first/WebP source order and deferred activation order.

## Limits and remaining acceptance checks

1. The available browser API exposes no viewport/device-emulation control. A narrower-frame fixture was blocked by the browser URL policy, and an ordinary browser zoom shortcut did not change the measured viewport. No mobile/tablet screenshots or high-DPR layout pass were obtained. Those checks remain open; they must be performed with supported viewport controls or a real device.
2. This browser supports AVIF and provides no supported capability to disable that codec or intercept image-source selection. Automatic WebP fallback under absent AVIF support remains unverified in a live browser. Direct WebP decoding and source-order unit tests are narrower evidence.
3. The cloud browser logged `unable to create webgl context`, a renderer initialization TypeError and WebGL2 extension-access errors. Static image/poster fallbacks were visible. This environment cannot establish correct 3D rendering or real-phone GPU/FPS behavior. No graphics-engine changes were made.
4. The broken-image scan covers sampled routes and interaction states, not every one of the 40 portfolio items or every localization.
5. No before/after speed, Lighthouse, layout-shift, blocking-time, scroll-FPS or real-device benchmark was run. Phase 2 has not begun. All code/build/test results remain those recorded in the Phase 1B report because this checkpoint adds documentation only.

The implementation is published and reviewable. Phase 1 acceptance is still conditional on the open mobile/tablet and live non-AVIF fallback checks. This report does not authorize a merge or a production deployment.
