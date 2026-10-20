# Repeatable performance verification

These tools are isolated from the application dependency tree. Install with
`npm ci --prefix scripts/performance`; Node 24 is used for the recorded runs.
The lockfile pins Lighthouse CI 0.15.1, Lighthouse 12.6.1, Chromium package
153.0.0 and Puppeteer Core 25.15.0. The actual browser version is recorded in
each Lighthouse report.

## Lighthouse CI

From this directory:

```sh
PERF_URLS='https://lionovartnext-pmq4r6yv5-lionovart.vercel.app/,https://lionovartnext-ln8ouhpg9-lionovart.vercel.app/' \
  npm run collect
node summarize.mjs ../../reports/performance/<run-directory>
```

Default: three cold-browser runs per URL, 390 x 844 CSS pixels, DPR 2,
simulated 150ms RTT / 1638.4 Kbps throughput / 4x CPU slowdown. The normal
page motion is retained. Use identical settings, browser and host when
comparing; keep other CPU-heavy jobs stopped. Browser/storage caches reset
per audit, but CDN caches and internet conditions are not controlled.
`PERF_RUNS` and `PERF_OUTPUT` override the run count and output directory.
Use exact immutable deployment URLs; do not measure a moving branch alias.

`CHROME_PATH` can select an installed browser. Otherwise the npm-packaged
headless Chromium and SwiftShader are extracted outside the repository.
This Linux runner uses software graphics, not a phone GPU. It does not
establish real-device FPS or interaction latency.

For a managed environment with an existing trusted proxy CA, set
`PERF_CA_FILE` to that CA and `PERF_CERTUTIL` to the NSS `certutil` executable.
The tool imports it into a separate test-only NSS database under its browser
cache and sets that browser process's XDG data directory. It does not disable
TLS validation, import credentials, or modify the user's existing trust DB.
Do not commit CA files, browser profiles, proxy settings or authentication data.
Normal CI environments generally need neither option. A credential-free
`HTTPS_PROXY`/`HTTP_PROXY`, if configured by the host, is used for requests.

Raw local LHRs/HTML and JSON summaries live under ignored
`reports/performance/`. Reviewed measurements and compressed LHR evidence
are saved under `docs/performance/`. No report is uploaded to public
Lighthouse temporary storage by these scripts.

## Viewports, image fallback and media gates

```sh
PERF_VERIFY_URL='https://your-exact-preview.vercel.app/' \
  node verify-images.mjs
```

The matrix checks homepage, About and services at 390px/DPR 2,
768px/DPR 2 and 1440px/DPR 1, both normally and with the DevTools
`Emulation.setDisabledImageTypes` AVIF override. This tests actual WebP
source selection, rather than just opening a WebP file. It records image
sources, decode failures, overflow, gallery state, videos and page errors.
It also records cumulative long tasks and sampled animation ownership/visibility
while visiting the opening film, partnership, work, process and closing gallery.
These snapshots scope further profiling; they do not measure scrolling FPS or
prove that every offscreen requestAnimationFrame loop has stopped.
Set `PERF_EXPECT_DEFERRED_FILM=1` for previews with the film-request gate.
Screenshots and JSON are saved to `PERF_VERIFY_OUTPUT` or the local reports
directory. These are device emulations, not Safari or real-device evidence.

Official references:

- https://googlechrome.github.io/lighthouse-ci/docs/configuration.html
- https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md
- https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setDisabledImageTypes
- https://github.com/Sparticuz/chromium

## Phase 3 regression matrix

Install the pinned Playwright browsers with `npx playwright install chromium webkit`
from this directory (Linux CI also uses `--with-deps`). Then run:

```sh
PERF_VERIFY_URL='https://your-exact-lionovart-preview.vercel.app/' node validate.mjs
PERF_VERIFY_URL='https://your-exact-lionovart-preview.vercel.app/' PERF_ENGINE=webkit node validate.mjs
node assert-budgets.mjs ../../reports/performance/<run-directory>/summary.json
```

The runner requires an immutable `lionovartnext-*-lionovart.vercel.app` URL.
Chromium covers 360/390/768/1024/1440 widths, service detail pages, careers,
contact, pricing, WebP fallback, reduced motion, menu/service navigation, back
navigation, three bounded SPA route cycles and a ten-second idle sample.
WebKit covers mobile/desktop, the same detail routes and reduced motion.
Chromium also checks a cold and repeat visit with 150 ms latency, 1.6 Mbps
download and 750 Kbps upload; this is browser network emulation, not a phone.
It verifies immutable headers and observed browser-cache reuse. `PERF_CASES`
accepts comma-separated case IDs for a targeted rerun. `PERF_VERIFY_OUTPUT`
selects the evidence directory. Host-configured credential-free HTTP proxies
are used without disabling TLS validation. No booking or chat is submitted.

The GitHub workflow runs image/motion/delivery unit tests on the review branch
and relevant master PRs. Its manual preview job runs both browser matrices,
three Lighthouse runs and budgets, retaining artifacts for fourteen days.
It does not deploy or promote production and needs no Vercel token.

Hard median homepage ceilings: total transfer 3,000,000 bytes, images 900,000
bytes and initial video transfer zero, with at least three valid Lighthouse
runs and no runtime error. Timing targets (LCP 6500 ms, TBT 1300 ms, CLS 0.1)
produce advisory warnings because CI machines differ. These are regression
limits against the Phase 2 delivery improvement, not a claim of optimal speed.

The local cursor bundle retains upstream threejs-components 0.0.19 and all
its visual code. Two `typeof VideoFrame` guards fix unsupported-browser errors.
`cursor-compatibility.test.mjs` reverses those exact changes and verifies the
original published source hash. Source metadata and licenses are under
`public/vendor/`; only the content-hashed module receives immutable caching.

The Phase 3 runner also verifies branding copy visibility through reduced-motion hydration and a live motion-preference toggle. Screenshot capture timeouts are retained as capture warnings; functional page/image failures still fail validation. The dedicated visual-evidence job captures bounded review screenshots independently. One-off Phase 3 workflows pin an immutable deployment and assert its runtime source; their URL/SHA must be updated together for a new candidate. The generic manual regression workflow accepts an exact preview URL once registered by GitHub.
