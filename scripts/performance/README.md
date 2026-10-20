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
