# Closing CTA: mobile diagnosis and implementation

## Integration base

Base: `1129fea637d1cce238fa7684217503e4b7b3e48f`, the latest unified branch and latest deployment visible at the start of this task. Included the two additional partnership configuration commits through `af0f3d57e6ae14682f580930747cbb858f9e1988`: authenticated registry configuration and the owner's Tile Reveal media/settings. These are configuration, not a claim that the licensed Tile Reveal implementation was installed.

The older FameEstate branch explicitly describes itself as an isolated alternative preview. It is not substituted for the current unified page sequence. No newer deployed revision was visible when work began; branch heads must be checked again before updating the unified branch.

## Diagnosis

The scene contains three requested visual layers and a fourth GPU effect in its button. Reducing only the lion's polygon count would not address all of their costs.

| Layer | Existing behavior / cost | Implemented budget |
| --- | --- | --- |
| Gallery | 12 visible phone planes; all use 480px thumbnails. A requestAnimationFrame loop wakes at display cadence and writes the wall transform about 30 times/second, even on touch devices. Many phone planes sit outside the viewport. | Eight closer phone planes; 320px images (480px desktop); one 24-second alternating CSS parent transform. No gallery RAF or per-frame style mutations on compact/coarse-pointer devices. 18 desktop planes and pointer parallax retained. |
| Lion | Dedicated Draco mobile asset: approximately 804 KiB, 55,000 triangles, one material and two textures. Desktop: approximately 2.1 MiB, 145,000 triangles. Mobile DPR was capped at 1.25. Existing scroll choreography already stops once the lion settles. | Keep mobile geometry, gold materials and antialiasing. Use DPR 1 for this process/CTA journey, including a desktop-to-mobile resize. This reduces the maximum mobile drawing-buffer area by 36% (1 / 1.25²); it is not a claimed 36% total speedup. Keep rendering on demand at rest, and immediately pause on tab hiding. |
| Cycling words | Timer already pauses offscreen, but can run while the sticky CTA is visually covered. Warm-up downloads every original word image. `next/image` is globally unoptimized, so `sizes` alone cannot reduce source bytes. | Wait for the handoff reveal; keep the single entering layer and reserved layout. Cloudinary caps closing word art at 800px. Prepare/decode only the next image during the 4.2-second hold. Cancel pending swaps when paused or unmounted. |
| Action button | Separate WebGL shader context, even on a phone; pausing its speed still creates the context. | Compact/coarse-pointer, reduced-motion and data-saving paths use the existing button with a CSS metallic edge and no shader context. Tap/press feedback and the real Nova action remain. Desktop shader loads only when revealed and in view. |

## Visual and lifecycle decisions

The eight phone panels frame the lion and the reading lane; their small shared movement is deliberately slower than the word cadence. Perspective, angled planes, shadows and gold rules preserve the reference character. Animate the parent transform only, not layout coordinates, masks, shadows or eight independent timelines. Keep the central mask and a soft mobile copy backdrop to protect text and word art at every phase.

The lion should not rotate continuously while the user reads. Its journey and short scroll nod remain interactive, then the renderer sleeps. Further geometry reduction would require an additional authored/validated LOD and visual comparison; the supplied mobile asset already has 62% fewer triangles than desktop. No unverified decimation or new 3D dependency was introduced.

Reduced motion stops gallery movement and cycling, uses the existing static lion render, and skips the button shader. Explicit data saving follows the same economical path and skips loading this journey's 3D model. Short landscape screens and oversized translations retain normal document flow. Phones do not register a gallery gesture handler that prevents scrolling. Decorative media remains hidden from assistive technology; headings and the button remain semantic HTML.

Gallery visibility, tab visibility, reveal, media-query changes, and connection preference changes control animation. Cleanup removes listeners, observers, progress subscriptions and RAF callbacks. CSS drift pauses in place offscreen and resumes without resetting phase. Decode promises cannot commit a word after cleanup. The renderer retains its existing disposal and context-loss poster fallback.

## Verification and limits

Target checks: 320, 360, 390 and 430px phones; 844×390 landscape; tablet/laptop layouts; Chromium and WebKit; reduced motion; explicit data saving; word changes; slow touch drift; zero per-frame gallery style writes on touch; zero CTA button canvases in constrained modes; offscreen pausing; settled lion inactivity when WebGL is available; and keyboard activation of the actual Nova dialog.

Source counts and drawing-buffer budgets are deterministic. Browser emulation verifies behavior and layout, not a physical iPhone's thermal, battery or GPU performance. Do not turn headless/software-renderer timings into real-device FPS claims. Actual image transfer sizes also vary with Cloudinary format negotiation and caching. Build and browser results are recorded after verification below.
