# One continuous pinned scene

Review branch: codex/services-world-phase1-20261019
Verified preview: https://lionovartnext-f9j4j7e41-lionovart.vercel.app/#imagine
Gallery: https://lionovartnext-f9j4j7e41-lionovart.vercel.app/#selected-work
Runtime commit: 08e03c372caad9fb38a38e6451461b23299b8385

## Current journey — 22 October 2026

Hero → studio film → three divided cards with the paw reveal → shaping message → services → scroll-through work gallery → logo / One partnership / Designing your legacy → About. The seasonal invitation follows About, then client results.

PinnedScene owns one sticky viewport and the stationary environment. ScenePortal places chapter surfaces into that viewport. Document runways measure ordinary native scroll; visible chapter surfaces never rise with their runways. The room releases only after About.

SHAPING-JOURNEY.md and earlier verification entries describe superseded implementations. The separate partnership image/tile animation has now been deliberately removed from PageBuilder. The partnership message belongs to the ending of the work gallery.

## Opening cards and services

- Keep the paw and pulling cover animation: that is an intentional highlight. Only the site-wide scroll-driven word fading was rejected. Card text and the gallery portal stage opt out with data-scroll-title-skip.
- Pointer activation runs the original paw entrance, cover pull and returning animation. Keyboard and reduced-motion activation remains immediate. Benefits fit inside their original well without internal scrolling. Plus/minus controls and accessible labels remain; Tap to reveal/close copy is removed.
- The film fits larger before dividing. The desktop fit can reach 1024 × 576, giving three approximately 341.33 × 576 straight panels. Phone width allowance is min(88vw, 21.5rem). Film crops retain their source geometry during the initial split.
- During the opening-to-service handoff, the original panels first travel into a staggered composition. Both side panels sit up to 80px / 9vh higher, with the middle at z-index 3 and sides at 1. Their solid benefit titles hold from roughly 28–46% of the exit runway. Phone side titles wrap compactly and receive small inward offsets. Only at 46–68% does the existing shader dissolve start, simultaneously fitting the outlines to the actual service-media bounds. Portrait panels turn 90 degrees during that fit; already-horizontal panels remain horizontal. The initial film and split dimensions are unchanged.
- The complete painted opening face (artwork, paw/cover, text, floating accent, tinted backing and colored bevel) dissolves through the same deterministic SVG turbulence field after the reading hold, during the service-frame fit. A narrow pearl edge follows the dissolve. A separate transparent, neutral glass outline survives underneath; by the end of transport the panels are empty frames, before the dark shaping beat and warm-room transition. There is no added backing or service media in these travelling frames.
- The dissolve scrubs in both directions on the existing RAF-batched scroll listener. Its static noise field has no clock/idle loop. Filters are removed at both endpoints; reduced-motion and short-height fallback cards retain their full content and no dissolve. The original paw remains independent and unchanged at rest.
- The old caption retires by 5% of the exit runway. Shaping copy starts at 6% and reaches full opacity at 18%, during the cards’ initial positioning; the room remains dark until 76% of the handoff before warming to ivory.
- Exactly three service tags remain, with the default in the middle. Side-tag selection brings its actual media into the center without angular rotation. Wrappers stay transparent and the understated podium/upper horizontal frames remain.
- Pause previews is removed from the media-first service controls. The prompt is now Imagine the possibilities. in Playfair italic, with a French equivalent.
- Default scrolling remains free flow. A released gesture within min(80px, 10vh) of the opening card resting point can finish locally in that direction. This never advances another chapter.

## Work gallery

GalleryWalkthrough and gallery-journey.ts replace the pinned project pager with a native-scroll depth journey. All 40 currently curated works appear in 20 left/right pairs; browsing filters still use WorkBrowseProvider.

service-gallery-handoff.ts coordinates the boundary before the gallery runway reaches the viewport top. The last service's three original media cards gather on the same center axis, with both side cards behind the selected front card at translateZ(-70px). The service media retain scale 1 during the gather. Their fitted media center is measured directly, and the first incoming gallery surface starts at the same projected width. Original service surfaces continue toward the gallery’s left/right positions while the new work fades in. Service copy, labels and local atmosphere retire first; the shared navigation pill stays visible. Selected work appears above the held stack before gallery media crossfades in and the nearby project pairs fan from its center to their wall positions. Captions and pair arrows wait for the fan-out. The inherited gather state survives the final service's React media update and reverses with native scrolling.

Phone gallery walls use a 35vw offset, 62vw panels and 12-degree wall angle, bringing both sides almost entirely into view with a modest center gap. Desktop walls use a 33vw offset. The same gallery continues into the logo/partnership ending.

The scroll timeline translates the project surfaces through CSS perspective. Posters retain their actual colors/aspect ratios. Only nearby surfaces mount media, and the nearest pair’s left exhibit is eligible to play by default; selecting either work transfers playback eligibility to that work. Inactive chapters, hidden pages, reduced motion and save-data mode pause playback.

The logo approaches from the far end. After the last pair passes, One partnership and the italic Designing your legacy appear, followed by Meet the studio (#about) and See our results (#client-experience). These links are inert until the ending is visible. Ordinary activation explicitly scrolls to the About runway or the client-results anchor in the same document; propagation is stopped so the root Lenis anchor listener cannot replace the intended destination. No duplicate partnership imagery or tile transition follows the gallery.

Project activation stays inside the gallery. A native button centers and brings the selected card forward with a spring; its opposite member fades to 35%. The same button toggles back; Escape clears focus. Moving to another pair or the partnership ending clears selection. Service tags from GALLERY_SERVICE_LABELS are visible beneath every card before activation. There is no project modal or new-page navigation in CompactWork.

Separate gallery arrows still provide pair-by-pair navigation; native forward/reverse scrolling owns the story. They sit above the existing industry/style filter bar, and the transparent perspective container does not intercept project clicks. Reduced motion and viewports at or below 560px tall retain a static, unpinned list with inline selection, service tags and the partnership ending.

## Verification

[Published inline-focus screenshot](verification/inline-focus-20261022.jpg).

Latest inline-gallery review (22 October): 69 focused timeline/layout/service-world tests, TypeScript and scoped ESLint passed. Runtime 08e03c3 is READY. The earlier shaping cue is fully opaque at handoff 20%; its desktop heading starts at y612 in the 900px viewport, below the original card titles. The old caption retires before shaping starts, and the later shader timing remains unchanged.

The front service media stays at 259.875px width before gathering and at arrival 50% on phone; its scale property is empty. After resizing the published preview to desktop and allowing media to load, the original service media measured 573.516px wide and the incoming gallery media 572.666px at arrival 50% (fan-out has already started slightly). Their center axes differed by .102px. ResizeObserver tracks the fitted source and incoming media; a child-list observer reconnects when service media changes, so the match refreshes even while resting.

Phone 390 × 844 inline selection was reviewed on the final runtime: Rakbank centered exactly at x187.5 in the 375px content viewport, retained opacity 1, and Blastup softened to .35 with its caption hidden to avoid overlap. Tags were present before selection and no dialog existed. Escape cleared focus; keyboard Enter could focus the opposite card. Native forward scrolling advanced to the next pair and cleared selection while the common stage stayed at top 0 and navigation opacity 1. The short-height 844 × 390 fallback retains unpinned inline buttons and tags. The review harness exposes Work arrival 0/30/50/70/100% and opening handoff checkpoints.

Previous transition review (same date): desktop, phone and small phone layouts, side-title reading hold, later procedural dissolve, gathered depth ordering, native forward/reverse arrival scrolling, mobile wall gap and both onward same-page CTAs were reviewed. Meet the studio activated About in the same room; See our results reached the same-document client-results anchor.
System reduced-motion emulation and physical-device shader/touch checks were not run. The simplified reduced-motion / ≤560px-height path is retained.

Earlier gallery/layout checks are historical; modal checks below predate the current inline selection:

- TypeScript, scoped ESLint and 69 focused timeline/layout/service-world tests passed; the Vercel production build for this preview is READY.
- Desktop, phone 390 × 844 and small phone 320 × 568 reviewed; the 844 × 390 landscape path is unpinned. System reduced-motion emulation was not run.
- The paw reached its revealed endpoint with its pull transform. Desktop benefit wells measured 341 × 184 client/scroll dimensions with no internal overflow. Keyboard project opening and closing preserved focus through the existing dialog.
- Portrait handoff panels reached a 90-degree turn: the center measured 576 × 341.34 and kept z-index 3; both outer panels retained z-index 1. Service controls exposed exactly the three tags and the italic prompt.
- Gallery entrance, midpoint, logo arrival and ending reviewed. Gallery/partnership headings had no global word-reveal spans. Native travel changed exhibit depth while the common viewport remained at top 0.
- The small-phone ending fit entirely in 568px, with its bottom at approximately 465px. Both onward CTAs were usable; Meet the studio activated About inside the same room, while See our results reached the client-results section beyond it.
- Project pointer activation, preview close, gallery arrow navigation and inactive playback checked on the final runtime.

The cloud browser review covers the CSS/media fallback and CSS perspective gallery. Physical-device shader performance and touch feel remain unverified. No master merge or production promotion was performed.
