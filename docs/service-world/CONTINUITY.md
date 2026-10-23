# Persistent environment correction — 20 October 2026

The room stays in the viewport across the card exit, partnership chapter, services and Selected Work. The existing card dissolve reveals the room. Lighting stays black through the first 12% of the partnership runway, then changes smoothly to ivory by 32%. The room never translates or zooms to follow a section.

## Changes
- Fixed camera at (0, 5.64, 24), target (0, 1.8, 0). No chapter-dependent view offset, distance, pointer movement or camera reset.
- A foreground group positions exhibits against their semantic DOM slots, independently of persistent architecture.
- Removed exhibit rise/scale entrance and binary room visibility threshold. Materials brighten continuously with the existing reversible light conductor.
- One fixed fallback architectural background and unconditional transparent chapter surfaces preserve continuity when the GPU is unavailable or loading.
- Outer journey clip prevents the fixed backdrop leaking into later sections. No clipping or remount at internal chapter boundaries.
- Gallery ownership lasts through its full section, rather than reverting to arrival as its featured image scrolls away.
- Short-screen/reduced-motion entry resolves directly to the readable light state.

## Validation
51 targeted tests pass, including foreground placement remaining scale-stable during scroll. TypeScript, lint, build and deployed browser checks are recorded with delivery. Actual GPU visuals and physical-device performance remain unverified in the GPU-disabled review browser. This correction addresses continuity, not the separately discussed replacement of the exhibit models with a fully art-directed environment.


### Observed deployment
- Runtime: `b3a04fe7c9338145dc21e193e156c6d0ae1d96b2`, Vercel READY: https://lionovartnext-9uz0kb209-lionovart.vercel.app/#services
- Desktop 1363×936 outer viewport: environment bounds top 0 / bottom 936 remained unchanged at services, gallery seam and reverse seam; transparent gallery surface. Card exit at runway top -468 kept light 0; at -1872 light 1. Native scroll controls the dissolve.
- Phone 390×844 harness (preceding `6bcd615` runtime, identical services/gallery code): environment bounds top 0 / bottom 844 remained unchanged across LED → Selected Work. Controls and gallery remain available. Final runtime changes only the earlier card lighting interval.
- `continuity-desktop.jpg` and `continuity-phone.jpg` show the actual CSS fallback, not GPU renders.
- Initial implementation build, TypeScript, scoped ESLint and all 51 targeted tests passed. The final timing change passed all 18 world tests and Vercel production build; fallback markup cleanup passed scoped ESLint.
- Full photoreal scene rebuild, actual GPU appearance and physical-device performance are outside this continuity correction and remain unverified.
