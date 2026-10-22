# One continuous pinned scene

Review branch: codex/services-world-phase1-20261019
Verified preview: https://lionovartnext-i5zzovw0w-lionovart.vercel.app/#imagine
Gallery: https://lionovartnext-i5zzovw0w-lionovart.vercel.app/#selected-work
Runtime commit: 62896f4875d27454a09ffec0fe626a91ec6e5964

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
- The old caption retires before the shaping message. The shaping copy arrives as the fit finishes; the room remains dark until 76% of the handoff before warming to ivory.
- Exactly three service tags remain, with the default in the middle. Side-tag selection brings its actual media into the center without angular rotation. Wrappers stay transparent and the understated podium/upper horizontal frames remain.
- Pause previews is removed from the media-first service controls. The prompt is now Imagine the possibilities. in Playfair italic, with a French equivalent.
- Default scrolling remains free flow. A released gesture within min(80px, 10vh) of the opening card resting point can finish locally in that direction. This never advances another chapter.

## Work gallery

GalleryWalkthrough and gallery-journey.ts replace the pinned project pager with a native-scroll depth journey. All 40 currently curated works appear in 20 left/right pairs; browsing filters still use WorkBrowseProvider.

service-gallery-handoff.ts coordinates the boundary before the gallery runway reaches the viewport top. The last service's three original media cards gather on the same center axis, with both side cards behind the selected front card at translateZ(-70px). Service copy, labels and local atmosphere retire first; the shared navigation pill stays visible. Selected work appears above the held stack before gallery media crossfades in and the nearby project pairs fan from its center to their wall positions. Captions and pair arrows wait for the fan-out. The inherited gather state survives the final service's React media update and reverses with native scrolling.

Phone gallery walls use a 35vw offset, 62vw panels and 12-degree wall angle, bringing both sides almost entirely into view with a modest center gap. Desktop walls use a 33vw offset. The same gallery continues into the logo/partnership ending.

The scroll timeline translates the project surfaces through CSS perspective. Posters retain their actual colors/aspect ratios. Only nearby surfaces mount media, and only the nearest pair's left exhibit is eligible to play a silent preview. Inactive chapters, hidden pages, reduced motion, save-data mode and an open preview dialog pause playback.

The logo approaches from the far end. After the last pair passes, One partnership and the italic Designing your legacy appear, followed by Meet the studio (#about) and See our results (#client-experience). These links are inert until the ending is visible. Ordinary activation explicitly scrolls to the About runway or the client-results anchor in the same document; propagation is stopped so the root Lenis anchor listener cannot replace the intended destination. No duplicate partnership imagery or tile transition follows the gallery.

Project activation uses the existing Base UI preview dialog, including previous/next projects and keyboard navigation. Separate gallery arrows provide explicit pair-by-pair navigation; native forward/reverse scroll owns the story. The arrows sit above the existing industry/style filter bar. The transparent perspective container does not intercept project clicks.

Reduced motion and viewports at or below 560px tall use a static, unpinned project list with the same preview dialog and partnership ending.

## Verification

Latest transition review (22 October): 69 focused timeline/layout/service-world tests, TypeScript and scoped ESLint passed. The Vercel runtime build is READY. Desktop 1440 × 900, phone 390 × 844 and small phone 320 × 568 were visually reviewed. At the phone reading hold the two side benefit headings measured fully inside the viewport, approximately x16–144 and x219–347; the middle retained its larger title. The 844 × 390 landscape path was confirmed unpinned. In the service stack, all three card center axes matched to within .001px; the side cards were at depth -70 with z-index 1 while the front retained z-index 3. Native desktop scrolling advanced arrival progress from .500 to .878 and reversed to .500; the shared viewport stayed at top 0 and the navigation pill remained opacity 1. The mobile first pair measured approximately 179px wide per panel with a 27px center gap in the 375px content viewport. The benefit-title hold, later procedural dissolve and fitting endpoints were reviewed. Meet the studio activated About with opacity 1 and gallery opacity 0; See our results reached its same-page anchor at about 64px below the top. The review harness exposes Work arrival 0/30/50/70/100% and opening Handoff 35/55/70% checkpoints.

System reduced-motion emulation and physical-device shader/touch checks were not run. The simplified reduced-motion / ≤560px-height path is retained.

Earlier gallery/layout checks remain the baseline below:

- TypeScript, scoped ESLint and 69 focused timeline/layout/service-world tests passed; the Vercel production build for this preview is READY.
- Desktop, phone 390 × 844 and small phone 320 × 568 reviewed; the 844 × 390 landscape path is unpinned. System reduced-motion emulation was not run.
- The paw reached its revealed endpoint with its pull transform. Desktop benefit wells measured 341 × 184 client/scroll dimensions with no internal overflow. Keyboard project opening and closing preserved focus through the existing dialog.
- Portrait handoff panels reached a 90-degree turn: the center measured 576 × 341.34 and kept z-index 3; both outer panels retained z-index 1. Service controls exposed exactly the three tags and the italic prompt.
- Gallery entrance, midpoint, logo arrival and ending reviewed. Gallery/partnership headings had no global word-reveal spans. Native travel changed exhibit depth while the common viewport remained at top 0.
- The small-phone ending fit entirely in 568px, with its bottom at approximately 465px. Both onward CTAs were usable; Meet the studio activated About inside the same room, while See our results reached the client-results section beyond it.
- Project pointer activation, preview close, gallery arrow navigation and inactive playback checked on the final runtime.

The cloud browser review covers the CSS/media fallback and CSS perspective gallery. Physical-device shader performance and touch feel remain unverified. No master merge or production promotion was performed.
