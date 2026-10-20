# One continuous pinned scene

Review branch: codex/services-world-phase1-20261019
Verified preview: https://lionovartnext-5z8vm0d80-lionovart.vercel.app/#imagine
Gallery: https://lionovartnext-5z8vm0d80-lionovart.vercel.app/#selected-work
Runtime commit: 08c8bec31e778519561baf0bc85f1cc7c48b18f4

## Current journey — 21 October 2026

Hero → studio film → three divided cards with the paw reveal → shaping message → services → scroll-through work gallery → logo / One partnership / Designing your legacy → About. The seasonal invitation follows About, then client results.

PinnedScene owns one sticky viewport and the stationary environment. ScenePortal places chapter surfaces into that viewport. Document runways measure ordinary native scroll; visible chapter surfaces never rise with their runways. The room releases only after About.

SHAPING-JOURNEY.md and earlier verification entries describe superseded implementations. The separate partnership image/tile animation has now been deliberately removed from PageBuilder. The partnership message belongs to the ending of the work gallery.

## Opening cards and services

- Keep the paw and pulling cover animation: that is an intentional highlight. Only the site-wide scroll-driven word fading was rejected. Card text and the gallery portal stage opt out with data-scroll-title-skip.
- Pointer activation runs the original paw entrance, cover pull and returning animation. Keyboard and reduced-motion activation remains immediate. Benefits fit inside their original well without internal scrolling. Plus/minus controls and accessible labels remain; Tap to reveal/close copy is removed.
- The film fits larger before dividing. The desktop fit can reach 1024 × 576, giving three approximately 341.33 × 576 straight panels. Phone width allowance is min(88vw, 21.5rem). Film crops retain their source geometry during the initial split.
- During the subsequent service handoff, a portrait panel turns 90 degrees on its own plane to arrive horizontally. Already-horizontal panels do not turn. Translation and uniform scale fit the turned outline into the service positions. The middle original panel stays above both side panels throughout.
- The old caption retires before the shaping message. The same reversible timeline carries the room from dark to warm ivory.
- Exactly three service tags remain, with the default in the middle. Side-tag selection brings its actual media into the center without angular rotation. Wrappers stay transparent and the understated podium/upper horizontal frames remain.
- Pause previews is removed from the media-first service controls. The prompt is now Imagine the possibilities. in Playfair italic, with a French equivalent.
- Default scrolling remains free flow. A released gesture within min(80px, 10vh) of the opening card resting point can finish locally in that direction. This never advances another chapter.

## Work gallery

GalleryWalkthrough and gallery-journey.ts replace the pinned project pager with a native-scroll depth journey. All 40 currently curated works appear in 20 left/right pairs; browsing filters still use WorkBrowseProvider.

The scroll timeline translates the project surfaces through CSS perspective. Posters retain their actual colors/aspect ratios. Only nearby surfaces mount media, and only the nearest pair's left exhibit is eligible to play a silent preview. Inactive chapters, hidden pages, reduced motion, save-data mode and an open preview dialog pause playback.

The logo approaches from the far end. After the last pair passes, One partnership and the italic Designing your legacy appear, followed by Meet the studio (#about) and See our results (#client-experience). These links are inert until the ending is visible. No duplicate partnership imagery or tile transition follows the gallery.

Project activation uses the existing Base UI preview dialog, including previous/next projects and keyboard navigation. Separate gallery arrows provide explicit pair-by-pair navigation; native forward/reverse scroll owns the story. The arrows sit above the existing industry/style filter bar. The transparent perspective container does not intercept project clicks.

Reduced motion and viewports at or below 560px tall use a static, unpinned project list with the same preview dialog and partnership ending.

## Verification

- TypeScript, scoped ESLint and 66 focused timeline/layout/service-world tests passed; the Vercel production build for this preview is READY.
- Desktop, phone 390 × 844 and small phone 320 × 568 reviewed; the 844 × 390 landscape path is unpinned. System reduced-motion emulation was not run.
- The paw reached its revealed endpoint with its pull transform. Desktop benefit wells measured 341 × 184 client/scroll dimensions with no internal overflow. Keyboard project opening and closing preserved focus through the existing dialog.
- Portrait handoff panels reached a 90-degree turn: the center measured 576 × 341.34 and kept z-index 3; both outer panels retained z-index 1. Service controls exposed exactly the three tags and the italic prompt.
- Gallery entrance, midpoint, logo arrival and ending reviewed. Gallery/partnership headings had no global word-reveal spans. Native travel changed exhibit depth while the common viewport remained at top 0.
- The small-phone ending fit entirely in 568px, with its bottom at approximately 465px. Both onward CTAs were usable; Meet the studio activated About inside the same room, while See our results reached the client-results section beyond it.
- Project pointer activation, preview close, gallery arrow navigation and inactive playback checked on the final runtime.

The cloud browser review covers the CSS/media fallback and CSS perspective gallery. Physical-device shader performance and touch feel remain unverified. No master merge or production promotion was performed.
