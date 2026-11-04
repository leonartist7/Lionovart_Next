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
| Read through the merge | .28–.815 | The complete statement remains fully opaque through gather, white assembly and the wordmark hold, then clears by .895. |
| Gather | .585–.695 | Original rear frames converge on the leading frame, with visible edges during approach. |
| Resolve | .695–.77 | The stack fits the destination frame proportions while remaining centered. |
| Hold | .77–.815 | One white outline; existing identity spans assemble LIO + NOV + ART on one baseline. |
| Become Services | .845–.965 | The same original frames unfold into measured service positions. |

The artwork stays stationary. White wipes upward from the existing well on desktop and leftward on phones, covering the full masked face before material ownership changes. Identity lettering remains outline-only; measured segment advances and absolute departing tails form LIONOVART on one baseline. On portrait phones, the reading stack fits above the bottom statement and gathers into the original top card. The original three floating artworks remain visible and settle into a small corner composition during the white hold. The revealed face and wipe share the same #fffaf1 paper token. Opening face shadows are removed; benefit text clears independently. The wordmark's counter-scaling preserves proportions while the outer frame changes aspect. Services places the card media above its reading hierarchy; its colored atmosphere/reflection layers are removed. The inherited 130% blurred opening-film poster also fades with the white wipe and is hidden before Services. A visible incoming disc has opacity 1, with transparency restricted to its circular iris. The selected service is fully opaque and has a unique z-index above both rear frames; no equal z-index can place a rear image over it. The service slot becomes interactive only after the service-copy gate and active chapter agree. No fourth card or extra below-card logo is rendered.

Our expertise / Notre expertise is a single smaller Playfair line below the description, directly above the rotating exhibit labels. The active title remains stable uppercase bold. Service IDs, translation indices, media and navigation stay in the same ordered array:

1. Brand & Graphic Design — `branding`
2. Content & Campaigns — `content-studio`
3. Digital Experiences — `web`
4. Smart Business Systems — `smart-systems`
5. Transparent LED Experiences — `led`
6. Spaces & Events — `print`

## Doorway and tunnel

ServicePortal retains an opaque disc face. The default entrance lifts from the service podium and turns toward the viewer. “Step inside” appears on the face during its lift (.06–.20); “our selected work” enters as it faces forward (.38–.46). Both hold through .60 and clear by .68. They travel with the disc rather than floating on the viewport.

The centered radial mask opens at .68–.84 of the doorway handoff, while positive depth continues increasing to +850px. The disc grows and passes around the viewer as its iris opens. The first selected artwork is already behind it; its stationary ownership transfer remains .56–.72. At .76 the aperture is half open. Alternate entrance directions retain the same forward depth during the opening.

Ten unique projects keep the existing galleryWithCarry order and selected service artwork first. One native scroll coordinate drives linear tunnel distance; the existing Lenis provider supplies wheel settling. The project depth curve starts departure at advance .26, removing the former .26–.36 motion plateau. Erosion starts at .74 and spans .38. The same shared depth curve carries the red branded exhibit after the tenth project.

The shared scene, gallery and portal cache their document origins and viewport geometry; type and caption sizes refresh on actual layout, font, locale, asset metadata or content changes. Scene reads are batched before writes, with no chapter or service-frame measurements on ordinary scroll frames. The gallery no longer observes its own scroll-animated media width, reads that width after style writes, or dispatches unchanged reading flags on every scroll frame. The matched aspect transition applies only to the carried first artwork. Non-visual geometryReads counters support verification. Gallery erosion remains the existing static one-octave four-pass filter; inactive media stays paused. A lightweight SVG floor guide and receding rings share the tunnel's vanishing point, with no added WebGL context or idle animation.

The old red ring behind the last project and the separate stationary logo composition are replaced by one branded exhibit in the corridor. Its real logo is centered from first visibility; the disc advances from depth on the project curve. The logo clears before “One Partnership” appears around .733–.743, followed by “Designing your legacy.” The red silhouette stays contained and fades by about .78, leaving the copy readable without a logo. The actual About section then opens through a separate circular edge and continues in normal document flow. Reduced-motion/content-fit flow renders the logo exhibit before the partnership copy.

A named anchor outside the gallery is excluded from gallery restoration. Process and closing direct anchors settle after the intro/layout gates rather than being mistaken for gallery resize restoration.

## Closing and public surfaces

Process mounts no lion canvas, poster, origin, destination or reserved lion rail. Four semantic ordered steps remain readable without animation. Cached row centers drive restrained emphasis; the CTA has no dependency on a lion ref.

The closing ring is 78svh desktop / 88vw phone, capped by available viewport height. Black is retained across its parent and footer seam. Copy can use natural height when enlarged. Start retains the native glass intake; invalid contact/website validation remains. Nova now takes keyboard focus when opened and returns focus to its origin on dismissal.

The shared gold-dot tokens paint actual exposed backgrounds, including the story environment, Process, closing CTA, About and footer. There is no fixed dot overlay or pointer repaint. The ring's dark radial center stays above the texture, and imagery/forms/white card retain their own clear surfaces.

## Verification and reproduction

See [the review record](../qa/white-card-to-portfolio/README.md) and the branch's White card homepage review workflow.
The real deployed homepage is the acceptance route. The fixture `/qa/story-responsive.html` additionally exposes:

- Handoff 64%: gather; 78%: white wordmark hold; 90%: separation.
- Doorway 22%: Step inside on the lifting face; 50%: front-facing two-line invitation; 76%: half-open iris.
- Finale 71.6–72.5%: approaching logo exhibit; 75%: early partnership copy without a logo; 84%: copy hold after the disc clears.
- About reveal 50%: passage into the actual About surface.
- Reading stop Closing CTA at 390×844: full phone ring.

The content-fit, short-height and reduced-motion paths keep content/actions in normal document order. Cloud Chromium viewports/touch emulation are not physical-device, WebKit/Firefox or live microphone acceptance. Comparative software-renderer timings must not be presented as physical-device frame rates.


The statement portal settles before the opening owner returns early outside its visible range. A fast jump from the white hold into the iris must hide all statement beats; reverse scroll restores their existing pose.

The retained statement inherits the scene ink as the field lightens, preserving its red italic emphasis; the static black reading surface keeps light text.

Corner images fill their counter-projected boxes during transport: contain would letterbox before the pane applies its unequal X/Y scale and visibly flatten desktop artwork.
