# Services world — Phase 3 hardening

Same persistent hall, six exhibits and actual selected-project gallery as Phase 2. No new rendering library, assets or production release. This branch remains a review candidate.

## Changes
- Pointer parallax uses the last measured layout. Scroll/resize measure the room; pointer events do not force section measurement. Skip pointer movement when paused, hidden or reduced-motion.
- The frame budget samples consecutive animation frames only. Demand-render idle gaps do not lower resolution. First 90 samples warm up; sustained slow frames lower DPR to 1. Existing mobile 1.25 / desktop 1.5 caps remain.
- Guard asynchronous renderer initialization and failure callbacks after teardown. Retry mounts a fresh canvas while preserving service, variant and pause state.
- Detect a usable WebGPU adapter before backend initialization, then preflight WebGL 2. An exposed API with no GPU now enters the designed fallback directly.
- Short-height/reduced-motion service content participates in normal document flow, including its controls. Preserve the selected service when an active chapter changes viewport width or crosses the short-height breakpoint.
- `/demo/services-world` preserves the iframe document across viewport changes. Explicit reload and backend switches reset it. Review-only failure/retry controls exercise fallback handling without affecting production UI.
- Review diagnostics expose initialization reason, visibility, motion mode and, only after a successful GPU frame, backend, DPR, quality, draw calls, triangles, texture count, rolling frame intervals and CPU submit duration. Updates are throttled; no per-frame diagnostic DOM writes on the public page.

## Measurement contract
Frame p50/p95 is the rolling last 180 consecutive animation intervals, not a GPU execution timer or a device benchmark. CPU submit is the latest synchronous render submission time. Textures is a count, not GPU byte allocation. Poster mode has no GPU measurements; do not interpret missing values as zero-cost rendering. Actual GPU memory, shader compilation, transfer and physical-device profiles require a supported device.

## Review controls
Open `/demo/services-world`, choose a viewport and service, select a variant, then change viewport without reloading. The scene and control selection should persist. Test the 844×390 normal-flow layout by scrolling to controls and onward into Selected Work. Simulate failure: the same selected interactive poster remains usable. Retry renderer: a fresh context is attempted; unsupported devices remain in fallback with the capability reason. Simulation is not proof of actual device/context-loss recovery.

## Outstanding release gate
The available cloud browser does not provide a usable WebGPU adapter or WebGL 2 context. GPU appearance, real context loss/restoration, frame-time/thermal/memory trends, OS reduced-motion transitions, physical touch and Safari/Firefox compatibility must be checked on supported hardware before promotion. Do not claim universal-device or 60 fps sign-off from viewport tests.
