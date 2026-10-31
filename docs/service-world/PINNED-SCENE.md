# One continuous pinned scene

Review branch: `codex/services-world-phase1-20261019`.
Verified runtime: `4ba2927f56a8ad04f9684c823b13844ed6a55380`.
Review preview: https://lionovartnext-l7apg04r6-lionovart.vercel.app/
Current implementation: 31 October 2026. This replaces the cream-card and floating-ring transitions documented in earlier revisions.

## Story and ownership

The sequence is hero → studio film → three interactive discipline cards → conviction → LIONOVART → expertise → services → circular doorway → five project worlds → partnership.

`PinnedScene` owns one sticky viewport. `ScenePortal` places visual chapters in that viewport; document runways measure native scrolling. The opening transition, service handoff and gallery all derive their poses from scroll progress, so a reverse gesture restores the same composition. No animation timer advances the story.

## Cards, statement and expertise

English copy: “To lead today,” / “innovation isn’t optional.” / “It’s a necessity.” / “LIONOVART” / “Our expertise”. The necessity line uses the red Playfair italic. French has the corresponding explicit copy in `CardsServicesTransition` and the public-copy dictionary.

The opening exit runway uses these cues:

| Progress | Cue |
| --- | --- |
| 0–28% | The trio gathers gently; lead, main statement and necessity enter in sequence. |
| 28–46% | Statement and intact benefit faces hold. |
| 46–58% | Statement gives way to the studio signature. |
| 58–68% | Original artwork fills the card faces; benefit copy clears. |
| 68–92% | Frames fit the measured service-media geometry without flipping. Artwork counter-scales uniformly inside its crop. |
| 76–96% | The same three frames crossfade into the compact service trio. |
| 76–86% | “Our expertise” introduces the service chapter. |
| 86–100% | Service heading, description and controls enter. |

The surrounding room brightens from 54–92%. No blank cream face or empty transparent intermediate card is introduced. Corner sculptures fade from their own corners early in the transition and cannot cover the statement. Desktop cards retain enough separation to read their copy; the actual service targets already put both rear cards at the same raised level.

Paw controls remain enabled from the existing early content-ready gate through the visible reading face. The moving wrapper does not intercept button hits. Pointer tilt persists through the hold and eases out during the late fit. A source face becomes inert only when its artwork replacement is complete; the opening scene becomes inert only once its crossfade is complete. Keyboard and reduced-motion behavior remain in `PawRevealStack`.

## The service disc becomes the doorway

`ServicePortal` is the single moving owner of the podium in the pinned media world. `WorldStageControls` retains an invisible measurement anchor in the original podium position. Static layouts retain the original podium.

During the service/gallery arrival, the disc lifts and turns upright from 8–38%, then holds around “Step inside / our selected work”. That invitation enters early and clears from 55–78%. Its French equivalent is “Entrez dans l’univers / de nos réalisations”. The disc opens from 55–78% and grows continuously into the first project's ring by 100%.

The carried artwork transfers owners while stationary from 56–72%; the project pair then opens from 72–100%. The original selected service is first in the gallery. There is one invitation and one first-row ring: the gallery renders the remaining four rings.

## Five project worlds

`galleryWithCarry` supplies ten unique projects in five pairs. Widths over 1024px retain horizontal left/right pairs. Phones and tablets use one centered X axis, with approach, hold and departure along the vertical axis. Desktop wall staggering is zero.

Every ring stays 80px behind its pair. `galleryRingDiameter` accounts for both artworks, captions, perspective and padding at the close navigation stop. The fifth world uses studio red. The studio mark remains hidden until the partnership ending.

Arrow navigation stops at row advance 0.26, approximately z=61px. Retargeting keeps the existing navigation controller and velocity-aware easing. Clicking a project brings it into focus; Escape restores the pair. Wheel, touch and keyboard interruption remain supported by the controller.

Erosion starts at advance 0.86 after the enlarged cards pass substantially beyond the viewport. It spans 0.36 row units and finishes at 1.22. Captions and hit targets retire before the frame finishes dissolving. Poster-only and save-data fallbacks use opacity without the shader. Distant previews remain deliberately faint to keep metadata legible.

Project labels omit the presentation-only “Motion” tag. Individual tags never break internally; the wider caption area accommodates at most two rows at the sampled small-phone, phone and tablet widths. Underlying project metadata remains intact.

## Motion and verification

Reduced motion and heights at or below 560px use normal document flow, static project lists and readable narrative copy. The shared portal is not mounted. Scroll handlers are RAF-batched; the portal has no idle loop. Listeners and observers are released on cleanup. Existing media eligibility still allows only the current selected/leading work to play.

See [the dated verification record](../qa/immersive-story-20261031/verification.md) for completed checks and limitations. Older screenshots and transition descriptions are historical evidence, not the current design contract.
