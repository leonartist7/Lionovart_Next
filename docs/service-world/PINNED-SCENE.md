# One continuous pinned scene

Preview: https://lionovartnext-nknetfw4u-lionovart.vercel.app/#imagine
Runtime commit: f128a13f1ef07124cc38f9d4ee4f29cdb4d390de
Review branch: codex/services-world-phase1-20261019

This replaces the independent chapter pinning described in SHAPING-JOURNEY.md. The previous behavior was rejected; that document is historical.

## Implemented journey

Hero → studio film → three straight divided panels → shaping message → services → Selected Work → One Partnership → About. The seasonal invitation follows About before client results.

PinnedScene owns one sticky viewport and its stationary environment. ScenePortal places the opening, service media, project gallery, partnership and About surfaces in that same containing block. Document runways provide native scroll coordinates; they do not carry visible content past the screen. Chapter surfaces use absolute positioning. One controller updates chapter opacity, input ownership, inert state and playback eligibility.

The original panel faces move into the service exhibit positions with uniform scale and translation. Their original caption fades before the shaping message. The dark room becomes ivory on the same reversible timeline. Services and work dissolve in place. The room releases only after About.

Project pagination is inside the gallery stage. The duplicate scrolling project grid is retained only in the simplified layout. Service selection retains three tags and moves the selected card into the center without rotation. Default scrolling uses free flow, with no automatic settling between chapters.

## Verification

- TypeScript and ESLint passed for the changed components.
- Sixteen focused tests passed, including adjacent-chapter complementary fades, exclusive interaction ownership, reversal, viewport scaling and opening/card handoff geometry.
- Vercel runtime deployment is READY.
- Desktop browser review: hero, playing film, divided cards, shaping message and services. The common viewport remained at top 0 during native forward and reverse scrolling once the initial announcement bar passed.
- Desktop film measured 768 × 432; the three original faces measured 256 × 432 each. Reversing the handoff restored those dimensions and positions.
- Phone 390 × 844, small phone 320 × 568 and tablet 768 × 1024 layouts inspected. The corrected small-phone gallery header begins at 90.7px, its pager ends at 453.3px, and the stage remains 568px tall with no content overflow.
- Gallery pagination changed the displayed range from 1–3 to 4–6 while the stage stayed at top 0.
- A side service tag selected its corresponding center card. Settled transforms retained identity rotation and translation-only depth.
- The 844 × 390 landscape viewport uses the simplified layout. Reduced motion uses that same unpinned fallback path; system-level reduced-motion emulation was not run in the cloud browser.
- About remains in the room. Long copy on the shortest portrait viewport is locally scrollable so the full content stays accessible.

The cloud browser cannot initialize WebGL, so the CSS environment fallback was reviewed. GPU shader performance and touch feel still need physical-device review. No master merge was performed.
