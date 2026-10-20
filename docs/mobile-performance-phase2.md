# Phase 2 — measurements and targeted optimization

Date: 2026-10-20. Review branch only; no merge or production release.

## Initial matched deployments

- Baseline: `1135d1963b8f45a24f51696d4636061922048b1c`, https://lionovartnext-pmq4r6yv5-lionovart.vercel.app/
- Phase 1: `412d15d4bee49afbd88c70237aa2b38a70eb9ba4`, https://lionovartnext-ln8ouhpg9-lionovart.vercel.app/
- Both exact SHAs and READY builds were checked through Vercel before measurement.

Three Lighthouse CI homepage runs per deployment used Lighthouse 12.6.1,
HeadlessChrome 153.0.8010.0, 390 x 844 CSS pixels at DPR 2, simulated mobile
network/CPU throttling and software graphics. The same host, proxy, settings
and source page motion were used. These are laboratory observations; CDN,
internet and host variability remain. They are not real-phone measurements.

| Median metric | Baseline | Phase 1 |
| --- | ---: | ---: |
| Performance score / 100 | 42 | 43 |
| LCP | 7.338 s | 5.776 s |
| FCP | 1.536 s | 1.831 s |
| Total blocking time | 1158 ms | 1194 ms |
| CLS | 0.0233 | 0.0332 |
| Total transferred bytes | 6,928,156 | 5,636,670 |
| Image transferred bytes | 2,004,293 | 695,879 |
| Video transferred bytes | 3,244,924 | 3,244,828 |

Image transfer fell about 65.3%, and total transfer about 18.6%. LCP was
about 21.3% lower in these samples, but FCP and median blocking time did not
improve. Scores and CLS varied: the Phase 1 score range was 38–46 and one
CLS sample was 0.1648. Do not treat the one-point median score change as a
conclusive general speed gain. Per-run values, ranges and original compressed
LHRs are retained under `docs/performance/2026-10-20/`.

## Confirmed next bottleneck and change

The 3.24 MB mobile opening movie was downloaded during the initial homepage
audit, even with no scroll. Its section shares the pinned hero container,
so intersection alone did not prevent initial loading. The new request gate
retains the existing poster immediately and attaches the same video source
when the opening scroll sequence begins. After requesting it once, the
existing pause/resume, reversal, canvas crops and error fallback still own
playback. Non-pinned and reduced-motion layouts retain their original source
behavior. Encoding, resolution, video quality and choreography are unchanged.

The isolated measurement tooling is in `scripts/performance/`; the production
package files and image assets are unchanged. A clean TypeScript check,
targeted lint and production build passed for the checkpoint change.

## Image validation gaps closed by the test runner

On the Phase 1 preview, all 18 sampled combinations of three routes
(`/`, `/about`, `/services`), three viewport widths (390, 768, 1440) and two
codec modes passed the recorded broken-image/overflow/source-selection checks.
Disabling AVIF through the supported DevTools override selected and decoded
WebP picture sources. No page errors were captured in those samples. This
supersedes the cloud-browser capability limits in the Phase 1C report, but
does not constitute a real-phone, Safari or complete 40-item portfolio pass.

## Check status at implementation checkpoint

- Prior 59 image/motion checks pass; the broader run including opening-layout
  tests passed 65 of 66 checks.
- The additional failure is the existing `opening-layout.test.mjs` assertion
  expecting automatic movement from cards to partnership. Its test and imported
  opening-layout/scroll-policy sources are unchanged by this work; the current
  manual partnership policy returns no automatic stop. No motion policy was
  changed merely to satisfy that assertion.
- Fresh measurements and the stricter video-gate integration check on the new
  deployed change are pending before a final Phase 2 conclusion.
- Real-device scrolling/GPU/FPS, broader final validation and regression gates
  remain Phase 3. No custom rendering engine has been introduced.
