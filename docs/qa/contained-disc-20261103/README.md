# Centered entrance and contained partnership disc

Runtime: `672213b322c2ff27dfbaac038b08f2a59aa4fb59` on `codex/services-world-phase1-20261019`.
Preview: https://lionovartnext-gxhd8k7av-lionovart.vercel.app/?story=animated

## Revised behavior

The selected-work entrance defaults to a centered depth approach. The circle begins small and distant at the tunnel vanishing point, grows to its reading position, then opens and passes beyond the viewport. The services pedestal remains visible before that entrance begins. The hidden entrance test button cycles centered/above/below modes, with centered as the default on every mount.

The ending now holds a contained red disc with One partnership in its center. Further scroll contracts the disc to 76% of that size and shifts the title down to make room for the white emblem. The emblem and the Designing your legacy subtitle appear after contraction. The subtitle stays below the disc on the cream scene; the red never fills the viewport. All stages derive from scroll and reverse with it. The title font uses rem bounds and the disc's container width, including short desktop screens.

## Evidence

- Local production build, TypeScript and scoped ESLint passed. All 179 unit checks passed, including centered depth/projection monotonicity, title reading hold, contained disc geometry, delayed logo/subtitle, and reversible motion.
- Initial runtime 77d7deb: desktop 1280×720 entrance at 20%, 50%, 90% remained on the same vanishing point and grew from ~96px to 512px to ~1479px. Phone 320×568 entrance title and final composition checked; tablet 768×1024 spacing checked.
- Short desktop 1366×520 exposed an oversized title inside the smaller disc. Final runtime sizes the title from the disc itself. The corrected title box is 219.08×65.10px, fully inside the 260.82px disc. Subtitle begins at 362.41px and the action at 426.41px, with no overlap.
- Final runtime: French 390×844 disc/title/emblem/subtitle/action checked. At 200% root type with expanded spacing, the existing content-fit fallback retains all 10 projects and has no horizontal overflow.
- Full browser on final runtime: native Work navigation reached project 01/10; native reverse/forward wheel restored the centered entrance and then enlarged it beyond the frame. Reversing from the partnership restored a full-size contained disc with title opacity 1, logo 0 and subtitle 0. Forward wheel returned to the smaller signature disc.
- Native results-button click updated the URL to #client-results and placed the results section at 64.09px from the viewport top.
- partnership-disc.jpg shows the final runtime in the full browser. browser-checks.json retains initial and final samples; entries marked short-desktop-finale precede the title-fit correction, while short-desktop-fixed is the corrected sample.

The cloud Chrome checks cover viewport geometry and native browser navigation, not physical mobile hardware or cross-engine GPU performance. Existing unsupported-WebGL fallbacks remain in use in this browser.
