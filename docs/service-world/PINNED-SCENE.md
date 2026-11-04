# White card to portfolio: one continuous homepage

Review branch: `review/white-card-to-portfolio`.
Starting branch/head: `codex/services-world-phase1-20261019` / `2456aabc4c3a3046e06dd3529ccc47ccec14922b`.
This record supersedes the earlier cream-card/pair-gallery description. The review branch already contained compatible work; it has been continued without resetting it.

## Ownership

| Responsibility | Owner |
| --- | --- |
| Single sticky viewport and chapter visibility | PinnedScene / ScenePortal |
| Native card-exit progress and frame geometry | CardsServicesTransition / card-handoff / card-transport |
| Original three frame nodes and benefit interactions | DisciplineSplit3D / PawRevealStack |
| Ordered services, selection, arrows, keyboard | HomepageServicesChapter / ServicesWorkNavigation |
| Persistent service artwork | ScreeningMedia portals into the original card slots |
| Service disc, aperture, invitation | ServicePortal / service-gallery-handoff |
| Carried first artwork and ten sequential projects | galleryWithCarry / GalleryWalkthrough |
| Partnership disc | galleryEnding / GalleryWalkthrough |
| Real About surface and normal-flow release | AboutScene |
| Four process steps and independent closing CTA | ProcessLionJourney / ClosingCTA |

## Opening: five reversible poses

English copy remains “To lead today,” / “innovation isn’t optional.” / “It’s a necessity.” The last line is red Playfair italic. French copy stays paired in CardsServicesTransition.

The exit runway is 230svh. Progress uses the runway plus one viewport. `CARD_POSES` names the intervals:

| Pose | Progress | Result |
| --- | --- | --- |
| Read | .28–.53 | All three statement lines remain fully opaque; no fade consumes this hold. |
| Gather | .585–.695 | Original rear frames converge on the leading frame, with visible edges during approach. |
| Resolve | .695–.77 | The stack fits the destination frame proportions while remaining centered. |
| Hold | .77–.815 | One white outline; existing identity spans assemble LIO + NOV + ART on one baseline. |
| Become Services | .845–.965 | The same original frames unfold into measured service positions. |

The artwork stays stationary. White wipes upward from the existing well on desktop and leftward on phones, covering the full masked face before material ownership changes. Identity lettering remains outline-only; measured segment advances and absolute departing tails form LIONOVART on one baseline. On portrait phones, the reading stack fits above the bottom statement and gathers into the original top card. Benefit text clears independently. The wordmark's counter-scaling preserves proportions while the outer frame changes aspect. Services places the card media above its reading hierarchy; its colored atmosphere/reflection layers are removed. A visible incoming disc has opacity 1, with transparency restricted to its circular iris. The service slot becomes interactive only after the service-copy gate and active chapter agree. No fourth card or extra below-card logo is rendered.

Our expertise / Notre expertise is a single smaller Playfair line above the stable uppercase bold active title. Service IDs, translation indices, media and navigation stay in the same ordered array:

1. Brand & Graphic Design — `branding`
2. Content & Campaigns — `content-studio`
3. Digital Experiences — `web`
4. Smart Business Systems — `smart-systems`
5. Transparent LED Experiences — `led`
6. Spaces & Events — `print`

## Doorway and tunnel

ServicePortal retains the disc face. Its centered radial mask opens at .68–.84 of the doorway handoff. The first selected artwork is already behind it. At .76 the hole is half open; the outer disc remains opaque. The stationary artwork transfer is .56–.72; project separation follows at .72–1. The invitation is held before the opening and is not a whole-disc opacity fade.

Ten unique projects follow the existing galleryWithCarry order, with the selected service artwork first. Project travel remains native-scroll based with sinusoidal modulation .35, and the existing focus spring and navigation controller remain. Erosion begins slightly earlier at advance .74 and spans .38. Geometry screenshots are required to judge the half-passed threshold, since projection differs by viewport.

Gallery typography is cached between geometry/font changes; erosion cutoff nodes are cached. The gallery-only SVG filter uses a static one-octave field and four passes, without allocating halo/blur/merge layers for an enlarged outgoing image. Service filters retain their existing treatment. Atelier light stops moving after Services. Only active eligible media decode/play.

The red final project ring carries the repository logo asset from its first appearance. The contained partnership disc reveals only “One Partnership” and “Designing your legacy.” About then opens through a separate red circular edge. The actual About section reserves at least a viewport during this reveal and subsequently scrolls in normal flow. There is no second About component.

A named anchor outside the gallery is excluded from gallery restoration. Process and closing direct anchors settle after the intro/layout gates rather than being mistaken for gallery resize restoration.

## Closing and public surfaces

Process mounts no lion canvas, poster, origin, destination or reserved lion rail. Four semantic ordered steps remain readable without animation. Cached row centers drive restrained emphasis; the CTA has no dependency on a lion ref.

The closing ring is 78svh desktop / 88vw phone, capped by available viewport height. Black is retained across its parent and footer seam. Copy can use natural height when enlarged. Start retains the native glass intake; invalid contact/website validation remains. Nova now takes keyboard focus when opened and returns focus to its origin on dismissal.

The shared gold-dot tokens paint actual exposed backgrounds, including the story environment, Process, closing CTA, About and footer. There is no fixed dot overlay or pointer repaint. The ring's dark radial center stays above the texture, and imagery/forms/white card retain their own clear surfaces.

## Verification and reproduction

See [the review record](../qa/white-card-to-portfolio/README.md) and the branch's White card homepage review workflow.
The real deployed homepage is the acceptance route. The fixture `/qa/story-responsive.html` additionally exposes:

- Handoff 64%: gather; 78%: white wordmark hold; 90%: separation.
- Doorway 76%: centered aperture half open with the carried artwork visible.
- Finale 84%: partnership hold.
- About reveal 50%: passage into the actual About surface.
- Reading stop Closing CTA at 390×844: full phone ring.

The content-fit, short-height and reduced-motion paths keep content/actions in normal document order. Cloud Chromium viewports/touch emulation are not physical-device, WebKit/Firefox or live microphone acceptance. Comparative software-renderer timings must not be presented as physical-device frame rates.
