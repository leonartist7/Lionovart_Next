# Phase 2 — measurements and targeted optimization

Date: 2026-10-20. Review branch only; no merge or production release.

## Exact deployments and method

- Baseline: `1135d1963b8f45a24f51696d4636061922048b1c`, https://lionovartnext-pmq4r6yv5-lionovart.vercel.app/
- Phase 1: `412d15d4bee49afbd88c70237aa2b38a70eb9ba4`, https://lionovartnext-ln8ouhpg9-lionovart.vercel.app/
- Film gate: `4776d8563aa91180ea10aa4ee172a8a1c2f59b27`, https://lionovartnext-ff74w6gcd-lionovart.vercel.app/
- All three exact SHAs and READY builds were verified through Vercel.

Three Lighthouse CI homepage runs per deployment used Lighthouse 12.6.1,
HeadlessChrome 153.0.8010.0, 390 x 844 CSS pixels at DPR 2, simulated mobile
network/CPU throttling (150 ms RTT, 1638.4 Kbps, 4x CPU slowdown) and software
graphics. The same host, proxy and settings were used, with normal page motion.
Browser/storage caches reset per run; deployment groups ran sequentially.
CDN, internet and host variability remain. These are laboratory observations,
not real-phone measurements. The scripts and lockfile are isolated in
`scripts/performance/`; reproduction instructions are in its README.

## Results

| Median metric, three runs | Baseline | Phase 1 images | Film gate |
| --- | ---: | ---: | ---: |
| Performance score / 100 | 42 | 43 | 48 |
| LCP | 7.338 s | 5.776 s | 5.159 s |
| FCP | 1.536 s | 1.831 s | 1.776 s |
| Total blocking time | 1158 ms | 1194 ms | 944 ms |
| CLS | 0.0233 | 0.0332 | 0.0332 |
| Speed Index | 19.869 s | 19.438 s | 18.568 s |
| Total transferred bytes | 6,928,156 | 5,636,670 | 2,391,187 |
| Image transferred bytes | 2,004,293 | 695,879 | 695,762 |
| Video transferred bytes | 3,244,924 | 3,244,828 | 0 |

Against the baseline, final median transfer fell 65.5%, image transfer 65.3%,
LCP 29.7% and blocking time 18.5%. Against Phase 1, the film gate removed the
3.24 MB initial movie request. This defers the download until opening scroll;
it does not reduce that movie's eventual size or lower its quality.

Results are mixed: FCP and median CLS remain worse than baseline, and a
performance score of 48 still leaves substantial work. Baseline scores ranged
39–43, Phase 1 38–46 and film gate 47–49. LCP ranges were 7.030–7.708 s,
5.271–5.859 s and 5.135–5.514 s respectively. One Phase 1 CLS sample was
0.1648; final CLS ranged 0.0232–0.0332. All nine reports had no runtime errors
or Lighthouse warnings. Do not interpret three samples as universal speed gains.
Per-run metrics, ranges and all nine compressed original LHRs are retained in
`docs/performance/2026-10-20/`.

## Confirmed bottleneck and change

The 3.24 MB mobile opening movie downloaded during the initial homepage
audit, even without scroll. Its section shares the pinned hero container,
so intersection alone did not prevent initial loading. The new request gate
retains the existing poster immediately and attaches the same video source
when the opening scroll sequence begins. After requesting it once, the
existing pause/resume, reversal, canvas crops and error fallback still own
playback. Non-pinned and reduced-motion layouts retain their original source
behavior. Encoding, resolution, video quality and choreography are unchanged.
Production dependency files and image assets are unchanged by Phase 2.

The initial-source gate passed at 390, 768 and 1440 pixels in both codec modes.
A separate 390-pixel playback smoke test confirmed no initial source, followed
by H.264 playback after opening scroll (`readyState=4`, `paused=false`,
`currentTime=1.696749`, no video error). That test waited up to 30 seconds;
it is not a buffering-latency measurement. Evidence is in
`film-playback-smoke.json`.

## Images, scrolling and remaining CPU work

All 18 final combinations of routes (`/`, `/about`, `/services`), viewport
widths (390, 768, 1440) and codec modes passed broken-image, overflow and
source-selection checks on the film-gate deployment. Disabling AVIF through
the supported DevTools override selected and decoded actual WebP picture
sources. No page errors were recorded. Homepage checkpoints visited film,
partnership, selected work, process and the revealed closing gallery.
Sampled mobile closing galleries attached and decoded eight images; wider
layouts attached 18, with edge images still following native lazy loading.
Selected screenshots of the mobile closing scene, tablet About portrait and
desktop services were visually inspected without obvious clipping or broken
media. This closes the emulation and fallback gaps from Phase 1C; it does not
constitute Safari, real-device or complete portfolio validation.

Full sampled image/video/animation states and long-task observations are
retained in `final-image-profiles.json.gz`, with compact pass results in
`final-image-checks.json`. These unthrottled snapshots do not establish FPS,
GPU cost or that every offscreen animation loop has stopped. Scroll checkpoints
include 3D/canvas scenes, but software graphics cannot certify phone rendering.

A final Lighthouse report still recorded about 8.8 seconds of main-thread
work, including approximately 3.5 seconds script evaluation and 2.5 seconds
style/layout. The LCP element was the hero subtitle text, not an image.
A roughly 617 KB dotLottie WASM request also remains among the largest
initial resources. These diagnostics identify follow-up investigation areas;
this change does not claim to resolve them. No custom engine was introduced.

## Verification and handoff

- 66 image/motion/opening-layout checks passed. The wider suite exposed a stale
  test expecting automatic advancement into partnership; its assertions now
  match the existing manual-scroll policy. App scroll policy was unchanged.
- Targeted ESLint, clean TypeScript, `git diff --check` and production build
  passed. The build generated all 65 static pages.
- Three final Lighthouse runs and all 18 final viewport/codec checks passed
  their recorded checks. Lighthouse score is reported, not used as a blanket
  pass criterion.
- Main Phase 3 has not started. Real-phone scrolling/GPU/FPS, Safari,
  interaction/connection/repeat-visit coverage and regression gates remain.
  No merge or production promotion was performed.
