# Phase 3 — mobile performance validation

Date: 2026-10-20. Branch: `review/mobile-image-optimization`.

**Functional and image-delivery checks pass. Overall performance sign-off remains open:** the matched CI comparison reports higher blocking time, a lower performance score and an intermittent opening-card layout shift. Nothing was merged or promoted to production.

## Exact runtime and fixes

Final runtime: `6b9303089f2b742e0501feb4fe15a4db5c54d532`.
Tested READY preview: https://lionovartnext-5v5ozlgn8-lionovart.vercel.app/
Vercel built all 65 static pages, including TypeScript checks. Later tooling/report commits preserve this runtime source.

- **WebKit cursor errors:** the existing threejs-components 0.0.19 CDN bundle referenced an unavailable `VideoFrame` constructor. The content-hashed local copy changes exactly two constructor guards. A test reverses both changes and matches the published original SHA-256; rendering code, colors, geometry and cursor options are retained. Metadata and licenses are in `public/vendor/`.
- **Careers logo fallback:** its bare AVIF now uses the existing responsive image component with WebP fallback, preserving dimensions and CSS.
- **Touch navigation:** synthesized hover events closed the mobile Expertise list while a tap opened it. Hover changes now require a hover-capable fine pointer; the tap control works in Chromium and WebKit.
- **Reduced-motion branding:** differing SVG children caused hydration errors, and server animation styles left text/cards transparent. The affected sections reuse the project's hydration-safe motion hook. Motion owners reset cleanly when preferences change, and GSAP reverts its prior context.

Image originals/derivatives, production dependency files, copy and service designs are unchanged by Phase 3. No custom engine was built.

## Browser validation

The first hosted matrix covered **55 scenarios** across ten routes: homepage, About, services, brand/web/print/content-studio details, careers, contact and pricing. Main-page widths were 360, 390, 768, 1024 and 1440 pixels in Chromium; WebKit sampled 390 and 1440. Additional modes tested reduced motion and actual WebP selection with AVIF disabled.

After fixes, **22 affected scenarios passed** on the final runtime: 12 Chromium and 10 WebKit, including two WebKit retries after fixing a test-runner race with the disappearing intro. The runner now waits for the intro to finish naturally.

Checks covered sampled image decoding/selected formats, overflow, visible headings, film request gates, touch menus, service/back navigation, reduced-motion reading and live preference changes. No page errors were recorded in those final scenarios.

The cold/repeat check used 150 ms latency, 1.6 Mbps down and 750 Kbps up. It confirmed immutable image headers, **browser-memory cache reuse** and no early film request. Disk-cache reuse was not observed in that sample.

Three bounded SPA cycles and ten seconds idle returned to stable counts:
Chromium 239 elements / 4 images / 3 canvases / 0 iframes;
WebKit 254 / 4 / 3 / 0. This is bounded cleanup evidence, not proof of no heap leak or stopped offscreen RAF loops.

Two Chromium desktop PNG captures timed out under software graphics. They are retained as capture warnings; their functional states passed. Four separate JPEG captures succeeded and were visually inspected: mobile homepage, careers, reduced-motion branding and desktop About. They recorded no page errors. Screenshots and compact browser evidence are saved alongside this report.

## Matched before/after measurements

[Six-audit comparison and original reports](https://github.com/leonartist7/Lionovart_Next/actions/runs/39462416218).
Three cold-browser runs per deployment on one GitHub Linux runner, Lighthouse 12.6.1 / HeadlessChrome 153.0.8010.0, 390 × 844 at DPR 2, simulated 150 ms RTT / 1638.4 Kbps / 4× CPU slowdown, normal animations and software graphics. Baseline ran first; browser storage reset per audit. CDN/internet variability remains.

| Median metric | Base `1135d19` | Final `6b93030` |
| --- | ---: | ---: |
| Homepage transfer | 6,926,803 bytes | 2,390,601 bytes |
| Image transfer | 2,003,962 bytes | 695,572 bytes |
| Initial video transfer | 3,244,867 bytes | 0 |
| LCP | 12.654 s | 10.002 s |
| FCP | 2.128 s | 2.275 s |
| Total blocking time | 783 ms | 1,394 ms |
| CLS | 0.0239 | 0.0241 |
| Performance score / 100 | 46 | 39 |

Transfer fell **65.5%**, image transfer **65.3%** and LCP **21.0%**. Blocking time rose **78.1%** in this batch. Final TBT ranged 1150–1489 ms versus baseline 752–837 ms.

The final median CLS was low, but one run reached **0.1557**. Its largest recorded shift (~0.1317) belonged to `.opening-video-anchor`. Other shifts included hero text and web-font loading. All six LCP-element records selected the opening film's CSS crop background (`data-opening-crop`), with substantial load delay. These diagnostics identify investigation targets; they do not isolate the cause of increased blocking time.

An earlier candidate-only CI batch reported LCP 11.419 s, CLS 0.1400 and score 42. It is preserved separately. The earlier Phase 2 host reported different timing/score values; those values should not be combined with this CI batch. All six matched audits had no runtime errors or Lighthouse warnings.

## Checks and regression gates

- **102 regression tests passed**, with tool lint passing in [the final delivery workflow](https://github.com/leonartist7/Lionovart_Next/actions/runs/39463676962). Detailed CI references are recorded in `validation.json`.
- Targeted lint passed with **0 errors and 1 existing unused ScrollTrigger import warning**.
- The final runtime's Vercel production build passed. Two local Windows builds hit sandbox `EPERM` errors; command/browser tools later stopped accepting launches because of malformed sandbox paths. Hosted runners completed the remaining checks.
- Hard median delivery ceilings: 3,000,000 total bytes, 900,000 image bytes, zero initial video bytes, three valid audits and no runtime errors. The final preview meets them.
- LCP 6500 ms, TBT 1300 ms and CLS 0.1 are advisory thresholds. Individual CLS outliers also produce warnings. A green delivery job does **not** constitute overall performance approval.
- CI retains full JSON/HTML audit artifacts for 90 days (through 2027-01-18). Hidden `.lighthouseci` reports are included. Compact metrics, diagnostics and screenshots are committed permanently here.

## Remaining acceptance work

Investigate the blocking-time regression and stabilize opening-card layout before performance sign-off. Validate actual phone scrolling, thermal/GPU/FPS behavior and Safari/iOS. Cloud/Linux WebKit is compatibility evidence, not an iPhone test. Samples do not cover every portfolio route, localization, orientation transition or live booking/chat submission.

Master was left untouched. Merge still requires Leonardo's explicit approval.
