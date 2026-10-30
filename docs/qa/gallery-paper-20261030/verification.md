# Gallery passage and paper transition

30 October 2026. Review branch `codex/services-world-phase1-20261019`. Runtime revision `64a5588afb1d98c3745c600f93b36cd213bc6d61`.

## Behavior

- Selected Work invitation begins with the service gather, holds through the entry, and fades during the first row’s forward travel. The invitation sits above the artwork, with Our selected work below.
- Ten unique projects make five rows, with the last-viewed service retained as the first exhibit.
- Arrow stops advance to a larger opaque view. Project focus also moves closer.
- Project erosion begins later and spans 50% more depth travel. At the tested desktop sizes, more than 40% of both side frames has passed beyond the viewport when erosion starts. The final row fully retires before the ending.
- Five lightweight CSS glass rings follow the depth progression. The final ring is red. The studio mark is reserved for the ending. No new render loop or WebGL renderer is introduced.
- Paw input is enabled from the film/card split, independently of film playback and cursor tilt. Tilt continues until the painted cards are fully covered. Pointer capture and interruptible reveal intent remain.
- Cream paper rises over the painted face before aspect-ratio reshaping. Floating sculptures move upward and fade before the paper transition; they no longer cross the pillar names. Service media crossfades into the same pale frame as the room brightens.

## Automated checks

174 tests passed, including reversible travel, closer arrow stops, projected desktop edge crossing, five-row uniqueness, ring bounds, early title hold/exit, and paper/sculpture sequencing. Changed-file ESLint, TypeScript, production build, and whitespace checks passed.

## Live verification

Desktop review at 1363 × 936. Final preview: https://lionovartnext-fqfysl54x-lionovart.vercel.app/

The earlier visual pass used the immediately preceding runtime commit; the final runtime changes only the transparent wrapper hit testing. Cards, paper frames, gallery entrance and rapid navigation to row 05/05 were rechecked on the final deployment.

Observed:

- Early split: all three buttons enabled and non-inert while the original film still had 0.31 opacity. Paw reveal and rapid reversal ran.
- Identified a real transparent-plane hit-test interception during pointer tilt; a follow-up removes the plane wrappers from pointer hit testing and leaves the semantic buttons active. Final retest passed: the right card’s former missed lower-edge click opened it; all three lower-edge clicks and rapid reversals worked. A pointer sweep produced rotateX(−1.85deg) / rotateY(3.38deg), and a subsequent lower-edge click still hit BUTTON and closed the card. Keyboard Enter reopened it immediately.
- Invitation visibly held at service/gallery entry 0.264, above the carried artwork, with Our selected work below.
- Arrow navigation settled at row 02/05: each projected panel was approximately 541px wide, fully inside the viewport, at depth +61px instead of the former −350px stop.
- Three rapid Next clicks reached 05/05. The final ring was red, and the central logo remained hidden. Project focus and Escape worked.
- Final row approached to 1067px-wide panels: 473px (44%) of each frame was already outside the window while fully opaque with no erosion filter. Erosion became active after further scrolling, while the logo remained hidden.
- At the ending, all ten gallery panels were hidden, navigation opacity was zero, and the partnership mark appeared.
- Seven canvases remained present across the sampled gallery cycle; no horizontal document overflow. This is not a GPU or long-session performance certification.

Physical mobile/tablet touch, Safari, preference-toggle and GPU/performance testing remain outside this desktop review.

## Captures

- `paws-64a5588.jpg`: three revealed benefit cards.
- `paper-64a5588.jpg`: pale paper frames with no sculpture over lettering; at progress 0.509 the frame bottom was 635px and innovation copy began at 725px.
- `gallery-64a5588.jpg`: early invitation and first project row.
- `final-ring-64a5588.jpg`: fifth row, closer stop and red ring.

Browser navigation stalled once after the earlier gallery review; a fresh tab loaded the final preview and completed the repeated interaction checks. Captured final console entries were browser-extension metadata errors. No physical-device or GPU performance conclusion is made.
