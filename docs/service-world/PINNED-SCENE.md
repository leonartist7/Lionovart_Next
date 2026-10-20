# One continuous pinned scene

Preview: https://lionovartnext-6yve173ln-lionovart.vercel.app/#imagine
Runtime commit: 65d68a4d820688332bd80ad38afbbf893b54fb1f
Review branch: codex/services-world-phase1-20261019

This replaces the independent chapter pinning described in SHAPING-JOURNEY.md. The previous behavior was rejected; that document is historical.

## Implemented journey

Hero → studio film → three straight divided panels → shaping message → services → Selected Work → One Partnership → About. The seasonal invitation follows About before client results.

PinnedScene owns one sticky viewport and its stationary environment. ScenePortal places the opening, service media, project gallery, partnership and About surfaces in that same containing block. Document runways provide native scroll coordinates; they do not carry visible content past the screen. Chapter surfaces use absolute positioning. One controller updates chapter opacity, input ownership, inert state and playback eligibility.

The original panel faces move into the service exhibit positions with uniform scale and translation. Their original caption fades before the shaping message. The dark room becomes ivory on the same reversible timeline. Services and work dissolve in place. The room releases only after About.

Project pagination is inside the gallery stage. The duplicate scrolling project grid is retained only in the simplified layout. Service selection retains three tags and moves the selected card into the center without rotation. Default scrolling uses free flow. A released gesture within min(80px, 10vh) of the card resting point can finish locally in the gesture direction; it never advances into another chapter or interrupts a reading runway. All other chapter transitions remain manual.

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


## Card refinements — 20 October 2026

- Card surfaces and their headings opt out of the site-wide word reveal. The integrated card face has no separate scroll opacity; only the source-film overlay and the existing chapter handoff dissolve remain.
- Integrated cards retain the plus/minus control and accessible labels, without “Tap to reveal/close” copy.
- Revealed benefits crossfade into the whole existing panel. Container queries lay out compact panels with points and metrics side by side. There are no internal scroll areas and opening does not resize the panel. The simplified standalone cards retain their existing paw interaction.
- The film is fitted larger before splitting: desktop up to 1024px wide; phone width allowance grows from min(84vw, 20rem) to min(88vw, 21.5rem). The original fixed source outline and straight panel crops remain unchanged during the split.
- The middle original panel has the highest stacking order throughout transport. The side panels approach the already projected service-slot bounds with uniform scale and a restrained opacity change. There is no added rotation or second perspective projection.

Verified on the runtime commit above:
- TypeScript, scoped ESLint and 63 focused timeline/layout/service-world tests passed. The production Vercel build is READY; its scoped error/fatal runtime query returned no entries.
- Desktop: fitted movie 1024 × 576; panels approximately 341.33 × 576. No title-reveal word spans inside any panel.
- Phone 390 × 844 and small phone 320 × 568 reviewed. All three detail regions had equal scroll/client sizes in both axes; the smallest phone's open middle benefit displayed its complete title, points and metric inside the fixed panel. Keyboard Enter closed it successfully.
- Tablet 768 × 1024 reviewed. Landscape 844 × 390 retained the simplified unpinned path. System reduced-motion emulation was not run.
- Native forward/reverse scrolling kept the shared sticky viewport at top 0. A native released reverse gesture near the cards settled at document Y=1367, with scrollStop=cards and a 0.55-second release, without advancing a chapter.
- The handoff retained a larger/brighter middle panel and straight side panels. Selecting Graphic Design moved exhibit 0 to the service center; the settled matrices contained identity rotation and translation-only depth for side exhibits.

Cloud-browser review covers the rendered media/CSS environment. Physical-device shader performance and touch feel remain unverified. No master update or merge was performed.
