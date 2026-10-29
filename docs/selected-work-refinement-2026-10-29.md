# Selected Work and service-heading refinement

29 October 2026. Same review branch, based on `98cbbf7d6fc1dbdc6a71d7dc914f12902c344348`.

The supplied desktop reference shows a central lane between large side exhibits, with enough room for the studio mark. The previous initial gallery had a roughly 40px panel gap in the 1348px content viewport and hid every upcoming row.

## Resulting behavior

- Upcoming project pairs remain visible at low opacity deeper in the corridor. Background posters stay mounted; only the current row is interactive and eligible for video playback. Eight projects / four rows remain the limit.
- The four-row runway increases from 8.3 to 10.3 viewports. Cards approach a bounded front reading position, remain opaque longer, then fade across a longer interval. Additional sideways displacement is limited to 20px and additional rotation to 2 degrees.
- Desktop geometry reserves a central lane of approximately 17% of the content width, bounded for wide screens. Mobile/tablet retain the vertical pair arrangement. The shared service-to-gallery gather still uses the same layout calculation.
- Project names are removed visually; service tags remain below each card. Accessible buttons retain project names for identification.
- The centred gallery title recedes through perspective as the reader scrolls; its position reverses with scrolling. Reduced-motion / short-screen static layout keeps a stationary heading.
- Style/Industry controls are temporarily disabled via `ENABLE_WORK_FILTERS`; the service category rail still works and fades before Selected Work. Gallery arrows move into the space freed by the filter dock.
- Large service headings are restored with a crossfade and reserved title area. Visual outgoing title copies are hidden from assistive technology; the current service retains its semantic heading.
- Imagine: “To lead in today’s digital era…” with the old supporting sentence removed, in both normal and fallback render paths.
- Shaping message: “Innovation is not an option.” / “It’s a necessity.”, with equivalent French copy and explicit desktop line separation.

## Verification

98 deterministic checks pass. New coverage checks quiet background depth, a larger readable state before fading, continuous opacity/depth, the desktop logo lane, and reversible title retreat. The former no-overlap-between-rows assertion is replaced because overlapping depth previews are now intentional; same-row frame separation, mobile bounds, shared handoff alignment, navigation interruption and poster failure/retry checks remain.

Targeted ESLint, TypeScript, whitespace validation and the production build are required before publication. Live preview review covers reading and enlarged states, arrows, background playback gating, the hidden filter dock, restored service title bounds, new copy and the partnership ending. Physical phone and GPU performance claims remain outside the available browser's capabilities.
