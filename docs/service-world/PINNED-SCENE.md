# One continuous pinned scene

Review branch: codex/services-world-phase1-20261019
Verified preview: https://lionovartnext-5vr0hmxwr-lionovart.vercel.app/#imagine
Gallery: https://lionovartnext-5vr0hmxwr-lionovart.vercel.app/#selected-work
Runtime commit: 937641c4112e115f05d8798b051f187bc7cebe74

## Current journey — 23 October 2026

Hero → studio film → three divided cards with the paw reveal → shaping message → services → scroll-through work gallery → logo / One partnership / Designing your legacy → About. The seasonal invitation follows About, then client results.

PinnedScene owns one sticky viewport and the stationary environment. ScenePortal places chapter surfaces into that viewport. Document runways measure ordinary native scroll; visible chapter surfaces never rise with their runways. The room releases only after About.

SHAPING-JOURNEY.md and earlier verification entries describe superseded implementations. The separate partnership image/tile animation has now been deliberately removed from PageBuilder. The partnership message belongs to the ending of the work gallery.

## Opening cards and services

- Keep the paw and pulling cover animation: that is an intentional highlight. Only the site-wide scroll-driven word fading was rejected. Card text and the gallery portal stage opt out with data-scroll-title-skip.
- Pointer activation runs the original paw entrance, cover pull and returning animation. Keyboard and reduced-motion activation remains immediate. Benefits fit inside their original well without internal scrolling. Plus/minus controls and accessible labels remain; Tap to reveal/close copy is removed.
- The film fits larger before dividing. The desktop fit can reach 1024 × 576, giving three approximately 341.33 × 576 straight panels. Phone width allowance is min(88vw, 21.5rem). Film crops retain their source geometry during the initial split.
- During the opening-to-service handoff, the original panels first travel into a staggered composition. Both side panels sit up to 80px / 9vh higher, with the middle at z-index 3 and sides at 1. Their solid benefit titles hold from roughly 28–46% of the exit runway. Phone side titles wrap compactly and receive small inward offsets. Only at 46–68% does the existing shader dissolve start, simultaneously fitting the outlines to the actual service-media bounds. Portrait panels turn 90 degrees during that fit; already-horizontal panels remain horizontal. The initial film and split dimensions are unchanged.
- The complete painted opening face (artwork, paw/cover, text, floating accent, tinted backing and colored bevel) dissolves through the same deterministic SVG turbulence field after the reading hold, during the service-frame fit. A narrow pearl edge follows the dissolve. A separate transparent, neutral glass outline survives underneath; the outlines are empty after the painted faces dissolve. The middle outline then merges into the first service media as described below. No backing is added to the travelling frames.
- The dissolve scrubs in both directions on the existing RAF-batched scroll listener. Its static noise field has no clock/idle loop. Filters are removed at both endpoints; reduced-motion and short-height fallback cards retain their full content and no dissolve. The original paw remains independent and unchanged at rest.
- The old caption retires by 5% of the exit runway. Card transport settles at 28%; only then does the whole shaping message fade in together, reaching full opacity at 42%. It holds through 66% and clears by 78%. Service copy, labels and local atmosphere stay completely hidden until 80%, then enter through 96%. These intervals do not overlap, including reverse scrolling. The room remains dark until 76% before warming to ivory.
- Both rear painted faces retain the 46–68% procedural dissolve and their remaining glass frames retire by 80%. The middle frame stays at the exact first-service bounds, filling with real service media through the same turbulence field in reverse at 66–90%. Incoming side media waits until 86–100%. HandoffDissolveFilter shares the field definition; only thresholds change, and the incoming filter is removed at opaque/clear endpoints. PinnedScene lets the incoming media own this entrance instead of multiplying it by another chapter fade. Services remain inert until their copy is readable. Only the upcoming first-service center video prepares metadata in advance; reduced motion, hidden pages and save-data suppress preparation, and playback still waits for the active chapter.
- Exactly three service tags remain, with the default in the middle. Side-tag selection brings its actual media into the center without angular rotation. Wrappers stay transparent and the understated podium/upper horizontal frames remain.
- Pause previews is removed from the media-first service controls. The prompt is now Imagine the possibilities. in Playfair italic, with a French equivalent.
- Default scrolling remains free flow. A released gesture within min(80px, 10vh) of the opening card resting point can finish locally in that direction. This never advances another chapter.

## Work gallery

GalleryWalkthrough and gallery-journey.ts replace the pinned project pager with a native-scroll depth journey. All 40 currently curated works appear in 20 left/right pairs; browsing filters still use WorkBrowseProvider.

service-gallery-handoff.ts coordinates the boundary before the gallery runway reaches the viewport top. The last service's three original media cards gather on the same center axis, with both side cards behind the selected front card at translateZ(-70px). The service media retain scale 1 during the gather. Their fitted media center is measured directly, and the first incoming gallery surface starts at the same projected width. Original service surfaces continue toward the gallery positions while the new work fades in: above/below on phones and tablets, left/right on desktop. Service copy, labels and local atmosphere retire first; the shared navigation pill stays visible. Selected work appears above the held stack before gallery media crossfades in and the nearby project pairs fan from its center to their wall positions. Captions and pair arrows wait for the fan-out. The inherited gather state survives the final service's React media update and reverses with native scrolling.

gallery-layout.ts shares the responsive axis and fitted entrance geometry between PinnedScene and GalleryWalkthrough. At widths up to 1024px, the gathered cards fan vertically into upper/lower exhibits on one center line, with no angular tilt. The original service surfaces follow the same vertical release while fading into the gallery. Panel width is limited by both viewport width and height; the separation is capped on tall phones to avoid a large central gap. Screens up to 840px tall use a compact reading area above the navigation. Gallery arrows point up/down in this layout. Desktop retains its 33vw left/right gallery and perspective angle. The same gallery continues into the logo/partnership ending.

The scroll timeline translates the project surfaces through CSS perspective. Posters retain their actual colors/aspect ratios. Only nearby surfaces mount media, and the nearest pair’s first exhibit (upper on phones/tablets, left on desktop) is eligible to play by default; selecting either work transfers playback eligibility to that work. Inactive chapters, hidden pages, reduced motion and save-data mode pause playback.

The logo approaches from the far end. After the last pair passes, One partnership and the italic Designing your legacy appear, followed by Meet the studio (#about) and See our results (#client-experience). These links are inert until the ending is visible. Ordinary activation explicitly scrolls to the About runway or the client-results anchor in the same document; propagation is stopped so the root Lenis anchor listener cannot replace the intended destination. No duplicate partnership imagery or tile transition follows the gallery.

Project activation stays inside the gallery. A native button centers and brings the selected card forward with a spring; its opposite member fades to 35%. The same button toggles back; Escape clears focus. Moving to another pair or the partnership ending clears selection. Service tags from GALLERY_SERVICE_LABELS are visible beneath every card before activation. There is no project modal or new-page navigation in CompactWork.

Separate gallery arrows still provide pair-by-pair navigation; native forward/reverse scrolling owns the story. They sit above the existing industry/style filter bar, and the transparent perspective container does not intercept project clicks. Reduced motion and viewports at or below 560px tall retain a static, unpinned list with inline selection, service tags and the partnership ending.

## Verification

Latest vertical-gallery review (23 October): runtime 937641c is READY. TypeScript, scoped ESLint and all 70 focused timeline/layout/service-world tests passed. The new layout test covers phones, a tall phone, portrait tablet, 1024px tablet, and the preserved desktop horizontal axis. Published phone 390 × 844, small phone 320 × 568, tablet 768 × 1024, desktop 1440 × 900 and landscape 844 × 390 paths were inspected. Reduced-motion system emulation and physical touch/shader checks remain unperformed.

The service front card and first incoming work share x187.484/187.500 and vertical centers within .009px on phone during the release (arrival 70%). The original service media remains 259.875px wide while the incoming work gradually fits its final exhibit size; no gather scale is introduced. A fitted-media ResizeObserver and replacement observer keep the gathered center current when the last service changes. The front card's release is removed from the measurement before recentering, so its upward motion is preserved.

At the phone gallery entrance the upper/lower panels share x187.5 and fit at approximately y199–370 and y441–612; lower tags end at y669 before the gallery controls at y696. Small-phone tags end at y440.912, before controls at y444; its header ends at y105.188 before upper media begins at y110.532. Tablet panels share x376.5 and occupy y201–463 and y520–782, with tags ending at y822 before controls at y868. Desktop keeps its horizontal centers x348.238/x1076.762 at the same y489.004. Distant vertical exhibit captions are hidden to keep the current pair legible; current tags remain visible before activation.

Native forward/reverse phone scrolling changed arrival .700 → .850 → .700 with the stationary stage at top 0. Keyboard Enter on the lower work centered it at x187.5/y405.109; its counterpart softened to .35, and Escape restored the pair. The short-height landscape gallery remains unpinned. [Published vertical-gallery screenshot](verification/vertical-gallery-20261023.jpg).

Earlier verification below describes the preceding runtime and layout. The historical horizontal phone dimensions are superseded by the vertical layout above.

[Published inline-focus screenshot](verification/inline-focus-20261022.jpg).

Latest shaping/merge review (22 October): runtime 654fded is READY. TypeScript, scoped ESLint and all 69 focused timeline/layout/service-world tests passed. The timeline test checks 1,001 samples across four viewport heights for zero simultaneous shaping/service-copy opacity and complementary center-frame/media handoff progress. The actual published phone 390 × 844, small phone 320 × 568, desktop 1440 × 900 and tablet 768 × 1024 paths were reviewed. At 20% the shaping title is hidden; at 42% it is fully visible, with its desktop top at y612, below the middle card bottom y521.41. The small-phone subtitle ends at y447.94, inside its 568px height; tablet subtitle ends at y812.31, inside 1024px. At 78% both shaping and service copy are hidden while the middle media is procedurally filling; at 85% shaping remains hidden and service copy is entering at opacity .233.

At the phone merge midpoint, the source middle frame and incoming service media both measured 259.875px wide, with matching x187.484 center and less than .175px vertical-center difference. Desktop matched at 429.594px wide with less than .319px vertical difference. Rear source frames had only .0265 local opacity by 78% and retire entirely by 80%. The upcoming first-service video prepares metadata while paused (640 × 480 observed); it played only after the service was readable (1280 × 960 desktop observed), retaining the same fitted width. Poster onLoad cannot overwrite an already known video ratio. A ResizeObserver follows the fitted target so late metadata or resizing updates the source outline.

Native phone forward scrolling advanced handoff progress .780 → .887; reverse returned to .780. The shared viewport stayed at top 0 throughout. The 844 × 390 landscape path was confirmed unpinned with fully visible, unfiltered service copy/media. Filters are removed at the complete service endpoint. System reduced-motion emulation and physical-device shader/touch checks remain unperformed.

[Published shader-merge screenshot](verification/shaping-merge-20261022.jpg).

Previous inline-gallery verification:
The front service media stays at 259.875px width before gathering and at arrival 50% on phone; its scale property is empty. After resizing the published preview to desktop and allowing media to load, the original service media measured 573.516px wide and the incoming gallery media 572.666px at arrival 50% (fan-out has already started slightly). Their center axes differed by .102px. ResizeObserver tracks the fitted source and incoming media; a child-list observer reconnects when service media changes, so the match refreshes even while resting.

Phone 390 × 844 inline selection was reviewed on the previous runtime: Rakbank centered exactly at x187.5 in the 375px content viewport, retained opacity 1, and Blastup softened to .35 with its caption hidden to avoid overlap. Tags were present before selection and no dialog existed. Escape cleared focus; keyboard Enter could focus the opposite card. Native forward scrolling advanced to the next pair and cleared selection while the common stage stayed at top 0 and navigation opacity 1. The short-height 844 × 390 fallback retains unpinned inline buttons and tags. The review harness exposes Work arrival 0/30/50/70/100% and opening handoff checkpoints.

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
