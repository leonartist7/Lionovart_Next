# Shaping journey — 20 October 2026

Preview: https://lionovartnext-myyimhuot-lionovart.vercel.app/#imagine
Runtime commit: `63cf3cbe7dd3b939c21f5f9fb5b1fc72d8ca9f62`.

## Journey

Hero → studio film → three straight panels → shaping message → services → Selected Work → One Partnership → seasonal invitation → About.

The studio film now divides at its fitted size. Its crop surfaces no longer expand into a second, larger card outline. Pointer tilt, individual panel lean and hover depth enlargement are removed. Service and project side previews retain spatial depth through translation and perspective distance, without angular tilting.

The original opening panels move toward the three service exhibit slots using translation and uniform scale. Their content dissolves, followed by an aligned crossfade to the service media. “Shaping what comes next for your business” appears on the dark room before the shared environment becomes ivory. This is a visual handoff between the original panels and the existing accessible media gallery, rather than a new canvas-only interface.

Incoming service opacity and outgoing intro opacity are complementary, based on the same viewport geometry. Scrolling backward reverses the sequence. Reduced motion and short landscape viewports keep the static section layout. The fixed-size panels no longer need the previous tall-card reading offset; expanded benefits remain scrollable within each card.

The podium is lower and shallower. Background frames sit higher and no longer scale between chapters. Media backgrounds remain transparent; original colors inside videos and artwork are preserved.

## Verification

- TypeScript and scoped ESLint passed; Vercel preview is READY.
- Eleven focused timeline/opening tests passed, including reversal, viewport scaling, clamping and the no-empty-frame crossfade.
- Desktop, 390×844 phone, 320×568 phone and 768×1024 tablet reviewed. The small-phone first card clears the header after removing the obsolete reading offset.
- On tablet, the hidden joined film measured 492×276.75 pixels; the three separated faces totaled approximately 491.52 pixels in width with a height of 277.22 pixels. The tiny rounding difference is subpixel layout, not an animated expansion.
- 844×390 landscape selects the non-pinned layout and has no horizontal document overflow.
- Service/exhibit switching verified. Settled transforms have identity rotation; depth is translation only.
- Phone crossfade at 85% measured intro opacity 0.598624 and service opacity 0.401376, with the shaping message retired.
- Selected Work precedes One Partnership in the DOM and visually. About retains the same ivory surface.

The cloud review browser cannot initialize WebGL. The CSS fallback is verified; appearance and performance of the existing Paper Shaders light field still require a GPU-enabled device. No physical-device frame-rate claim is made.
