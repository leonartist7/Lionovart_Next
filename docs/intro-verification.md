# Readiness-driven intro verification

Built from remote master `093ec8520264cbc4d1ab05b0dc52043e589ded87`; the Cloud Build/Cloud Run deployment repair is unchanged.

## Behavior

The server emits a black overlay. Header/hero mount markers, the fonts used by those elements, decoded logo/poster images, and two measured animation frames determine homepage readiness. Player code and JSON load concurrently. A paused seek plus an opaque canvas-pixel check prevents a downloaded-but-unrendered frame from becoming visible (the installed player can omit a render event on a paused seek).

Preparation is bounded at three seconds from the CSS clock. Playback begins after a 350 ms fade-in, uses speed 1, and reveals on the player's completion event with a 450 ms opacity fade. JavaScript and independent CSS nine-second watchdogs release stalled/failed hydration paths. Completion is guarded once per document, including reduced-motion remounts. Once-per-session behavior remains.

Rotation keeps the old canvas while rendering the replacement at the same frame, then swaps and disposes the old player. The stage extends the original background and circular wipes without stretching artwork or changing colors. Canvas backing resolution remains capped at 1600 pixels on its longest side and DPR 1.5.

The lion can prepare a frame but cannot schedule its continuous loop until release. Cursor engines, heading reveals, menu animation, and decorative button shaders wait for release; CSS motion under main is paused. Reduced-motion and save-data paths do not request intro JSON or WASM.

## Checks

- Production build and TypeScript: passed (55 generated pages).
- `node --test scripts/intro-scene.test.mjs scripts/intro-readiness.test.mjs scripts/lion-motion.test.mjs`: 20 passed.
- Full repository lint executed: 62 existing errors / 192 warnings. Comparing modified tracked files with HEAD retained the same two existing errors (menu state effect and liquid button `any`), without adding a new rule violation. New intro modules pass targeted lint.
- Browser: production Next server through a local-only fault-injection proxy, controlled with Codex in-app browser. Dedicated agent-browser CLI failed to launch (CDP channel closed). Proxy/probe files are outside the release worktree and are not deployed.
- Normal playback measured approximately 4994–5006 ms; reveal approximately 450 ms. One completion event; zero remaining intro canvases and no overflow lock after release.
- Cached session bypass: no intro asset requests, one completion.
- Missing JSON, delayed JSON (>3 seconds), rejected image decode, blocked storage, reduced motion, save data, delayed hydration (4 seconds), and stalled RAF paths exercised. All released; reduced-motion/save-data had no intro asset requests.
- Hydration disabled: CSS animation finished at 9000 ms and computed visibility became hidden, with no body scroll lock. The clock uses a full nine-second step animation; a one-millisecond animation after a fractional delay failed this browser check and was replaced.
- Escape and Skip exercised during playback; both removed the intro and restored scrolling.
- Layout/coverage unit checks: 320x568, 390x844, 844x390, 768x1024, 1024x768, 1440x900, and 3840x2160. Browser views covered small-phone, portrait, landscape rotation, tablet, desktop, and 4K.
- 4K canvas measured 1600x900; rendered first-frame artwork center measured (0.4994, 0.5000), confirming centering independent of screenshot DPI scaling.
- During playback, lion reported `data-animation-active=false` after preparation. Instrumented WebGL draw calls from background owners were zero. WebGPU loop cancellation was also checked in source. Sampled intro draw interval p95 was around 25–27 ms on this machine; occasional longer intervals occurred under local load. This is not a physical-device FPS guarantee.

Visibility changes are injected locally to exercise pause/deadline logic; physical mobile browser background throttling and GPU behavior are not exhaustively reproduced by desktop emulation.
