# Compact hero and continuous gold journey

## Final behavior

The opening pairs a left-hand lion with **MAKE / YOUR BRAND** and the existing
cycling word artwork. Translated headings remain live text. The description,
136×44px CTA and trust sentence span the phone layout below the pair. The closing
CTA retains its original wording.

The exposed website pill, helper text and audit shortcut are removed from the
hero. **Have a look** opens the existing Base UI dialog: a desktop panel or phone
bottom sheet. Input, loading, errors, result and the prefilled audit link stay
inside. Opening makes no request; closing preserves input/results. The existing
`/api/strategist/peek` endpoint and funnel events are retained. The gold renderer
and hero word cycle pause while the dialog is open.

The exact English trust sentence is: “Trusted by 50+ ambitious brands globally
across 20+ industries.” The laurel badges are a compact row after the discipline
cards, before the partnership statement.

## Scene contract

One decorative Three.js canvas spans the hero, discipline cards, proof row,
recognition statement and Stronger Together. DOM controls and text remain above
it; no pointer handling, scroll interception, new pinning or backend changes.

- Lion: follows the first section of the shared route, turns toward the next
  heading, and passes behind the joined video. It is hidden before card splitting
  and cannot reappear through gaps. Its size is maintained until the final entry
  into the video instead of shrinking to avoid text.
- Gold: continues independently after lion concealment. It follows a reverse-S
  document route from left hero to right introduction, left card exit, right
  recognition statement and left reveal entrance.
- Reveal: the existing white SVG bloom physically covers the gold. Its GSAP
  coverage value stops the renderer once complete; reverse scroll restores it.
  Cursor tubes remain suppressed until this extended sequence ends.
- Reduced motion/loading failure: a rendered lion poster and matching static
  document-space gold lines keep the composition available without a GPU.

`motion.ts` defines a bounded, shape-preserving cubic Hermite spline with
continuous tangents and monotonic document Y. The lion, GPU stream and SVG
fallback share this route. Bounds refresh through ResizeObserver, font readiness,
resize and pageshow. Sticky video displacement is removed when measuring at
restored scroll depth.

## Rendering and assets

The existing WebGPURenderer prefers WebGPU and retries WebGL2. A 512×2 floating
point texture stores sampled route positions and tangents, updated only on layout
changes. GPU uniforms animate folds and particle travel; no particle positions
are uploaded per frame.

Two batched stream meshes use antique gold `#8b6026`, champagne `#f7dba3`, physical
specular/clearcoat response, tapered thickness and reduced opacity near the
partnership statement. Desktop uses 36 strands/240 particles; below 1024px uses
18 strands/80 particles. Runtime breakpoint changes rebuild decorative geometry.
DPR is capped at 1.5 desktop/1.25 mobile and can decrease after sustained slow
frames. Rendering pauses for hidden tabs, the dialog, reduced motion and completed
concealment. Textures, geometry, materials, listeners and loaders are disposed.

The original `C:\Users\leona\Documents\LIONHEAD.glb` remains untouched.
Previously verified derivatives are retained:

| Asset | Triangles | Bytes |
| --- | ---: | ---: |
| Desktop | 144,998 | 1,620,316 |
| Mobile | 54,999 | 1,248,444 |

The original includes an enclosing default cube excluded from derivatives.
`scripts/prepare-lion.py` and comparison renders remain available. Facial detail
and mane silhouette were compared during asset preparation. No new asset download
or external renderer dependency was added.

## Verification

- Nine motion tests pass: 320, 390, 430, 768, 1024, 1440 and 1920px routes,
  shared lion/stream positions, forward/reverse determinism, maintained lion
  scale, video containment, translated-layout changes and continuous tangents.
- TypeScript and lint checks cover the changed scene, hero, dialog and section
  integration. Existing badge `<img>` performance warnings remain.
- Browser layout measurements at all seven widths: no horizontal overflow;
  lion slot, headline and CTA visible in the opening viewport.
- Desktop WebGPU: inspected hero, right-side lion, video/card concealment,
  persistent gold behind cards, recognition statement and complete white reveal.
  Reverse reveal restores the stream.
- Tablet WebGL2: shader rendered successfully; sampled warm frame cadence was
  6.0ms median in the desktop browser. This is not a real-mobile FPS benchmark.
- Phone: paired lion/title, full-width introduction, compact proof row and French
  copy inspected. 845×390 landscape has no horizontal overflow.
- Reload at approximately 2253px retained scroll depth, concealed the lion and
  restored the gold renderer. Resize between story beats remeasures the scene.
- Dialog: keyboard opening, focused input, focus containment, Escape, focus
  restoration, retained input, retained result, empty-field error, loading state,
  returned result/audit URL and invalid-URL request error checked. The test used
  example.com and an invalid URL; no audit lead form was submitted.
- `?lionFailAsset`: zero remaining GPU canvases, visible poster/static stream,
  working form. `?lionStill`: static scene branch with zero GPU canvases.
- Physical mobile performance, virtual-keyboard behavior on a real phone and
  actual 200% browser zoom remain unverified. The available embedded browser
  controls did not expose zoom emulation. Viewport tests are not substitutes for
  those device checks.

Development-only switches: `?lionWebGL`, `?lionStill`, `?lionFailAsset`.
The still switch exercises the scene's reduced-motion path without altering the
operating-system preference.

## Production build limitation

The production build was attempted but failed with **ENOSPC: no space left on
device**. The C: drive reported zero free bytes. About 724 MB of this project's
generated production cache was removed; other disk activity reduced available
space again. A successful full production build is not claimed. Earlier builds
also encountered the separate `/demo/pillars` prerender issue; that route was not
changed here.

An existing root-body hydration attribute warning and a GSAP target warning may
appear in development. No deployment was performed.

## Silk refinement — September 11

Three interwoven strand families use wider curls, a slower secondary wave, and varying tubular thickness. Smooth champagne-gold beads replace the faint additive motes. The lowest 18% of the mane fades with a world-space shader while the face and original PBR maps remain intact; the source GLB is unchanged. The poster has a corresponding lower-edge mask, and the static fallback uses 18 separately curled paths. Geometry remains batched and animation remains uniform-driven.

Desktop and 390px phone layouts were inspected with WebGPU, and the mobile asset rendered with WebGL2. Both shaders compiled and the static path rendered without a GPU canvas. Desktop-browser warm cadence was approximately 6ms median; physical-mobile performance remains unverified. TypeScript, scoped lint and all nine motion tests passed.

The September 11 production build compiled and passed TypeScript, then failed prerendering /demo/pillars and /services/print with a null useContext error outside this refinement. Full production-build success is not claimed.
