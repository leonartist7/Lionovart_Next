# Media atelier refinement — 20 October 2026

Preview: https://lionovartnext-6lpanuts2-lionovart.vercel.app/#services

Runtime commits: `f17cbcb5e1489326583044766c189b3fd1abc41d`, `20d3679741732cc768cbf34f8183b65aeaab5b54`.

## Changes

- Preview frames derive their aspect ratio from the loaded poster and video metadata. Container-relative sizing preserves the complete media without painted letterboxing or forced cropping. Screening wrappers, grid previews and the full-project media backing are transparent. Colors baked into the source artwork remain unchanged.
- Thin glass edge highlights replace the thick double frames. Side exhibits remain in perspective and the selected card still moves into the center.
- The podium remains behind the three tags, with softer translucent shading and one restrained rim. Gold-filled buttons, extra rings and the repeated pulse are removed; an underline marks selection.
- Sentence-case Clash Display headings use a lighter weight, with quieter descriptions, labels and navigation. All six service tabs fit the compact phone rail.
- Two faint horizontal architectural frames retain the continuous room. A single dynamically loaded Paper Shaders light field adds slow neutral/champagne lighting. No new dependency was installed.

## Graphics behavior

The shader is capped at 260,000 pixels on initial mobile viewports and 600,000 on desktop. It starts when the lit room is visible, stops off-screen or when paused/hidden, respects reduced motion and initial save-data preference, and disposes on unmount. Context failure leaves the static CSS room intact. The canvas is decorative and never blocks the media or controls.

## Validation

- TypeScript, scoped ESLint, whitespace checks and Vercel deployment passed.
- Browser visual review at desktop, 390×844 and 320×568.
- Service and exhibit selection, center-only video playback and the persistent room through One Partnership were checked.
- Selected Work switching to Blastup played its video with a measured frame ratio of 1.33332 versus the video's 1.33333, and a transparent computed background.
- The review browser reports `Paper Shaders: WebGL is not supported in this browser`. The graphics fallback is verified; live shader appearance and GPU performance require a GPU-enabled browser/device review. No physical-device performance claim is made.

Screenshots: `atelier-services-desktop.jpg` and `atelier-work-desktop.jpg`.
