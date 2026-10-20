# Three service exhibits — 20 October 2026

Each homepage service has exactly three exhibits. Index 1 opens in the center. Selecting a side card or tag retargets the same three mounted cards into left, center and right positions, while the selected tag follows into the middle. The fixed room and existing chapter dissolves remain unchanged.

The stage uses CSS perspective and HTML video, with a transparent glass-effect frame, elliptical podium, two restrained gold rim lines and a single 1.4-second light pulse on selection. Panel transforms use an interruptible 850ms ease-out; reduced motion removes the spatial transition and pulse. This is not a new Three.js renderer.

Ambient lighting uses curated palette colors for the media, crossfaded over 900ms. It does not sample live video frames. Only the centered active exhibit is allowed to play; side previews retain posters. Existing hidden-tab, pause, reduced-motion and save-data behavior is retained.

| Service | Left | Opening center | Right |
| --- | --- | --- | --- |
| Brand | Graphic Design | Brand Identity | Packaging & Print |
| Digital | Apps & Platforms | Websites | E-Commerce |
| Content | Promotional Films | Seasonal Campaigns | Content Calendar |
| Spaces | Signage & Displays | Events & Spaces | Spatial Branding |
| Systems | Workflow Automation | Custom AOS | Business Platforms |
| LED | Retail Windows | Transparent LED | Event Installations |

Labels are supplied in English, French and Spanish. Existing gallery films illustrate the categories; they are not new case-study claims. Seasonal-specific footage still needs curation. All three LED contexts use the explicitly labeled display concept until real installation footage is supplied.

Validation: TypeScript and scoped ESLint passed. All 18 exhibit entries were checked for valid gallery IDs and unique left/center/right positions. The first Vercel build passed. Browser review confirmed tag and direct-card selection, center-only playback, and layouts at desktop, 390×844 and 320×568. Final polish centers the wider stage within its padded mobile parent and makes the ambient gradient fully transparent at its boundaries. No physical-device performance benchmark was performed.

Final runtime: `cbb4710bdbe2d4057f0210c95b49ce73ed05b834`, deployed successfully at `https://lionovartnext-ol529ozpv-lionovart.vercel.app/#services`. Browser verification measured the center panel midpoint at 187.48px in a 375px content viewport. Landscape uses the existing scrollable static layout. `glass-exhibits-desktop.jpg` captures the final deployment with Brand Identity selected and playing.

## Lower podium and spacious framing

The podium now belongs to the three-tag control group, below the service description. Its gold rim, softer reflected palette and selection pulse follow those controls instead of sitting underneath the upper media cards. The cards retain their upper placement and existing interaction. Wider horizontal architectural frames replace the tall nested frames, while responsive gaps separate the media, copy and controls. Compact-height and reduced-motion layouts retain their existing flow behavior.

Runtime commits: `9e098389980c46c881636a90ad00587839f299b9` and `075b9a00c2e50e195121e665796de932abee0077`. TypeScript, scoped ESLint and whitespace checks passed. The second pass increases clearance between the instruction and the podium rim after browser review.

Final preview: `https://lionovartnext-e84zr7ey3-lionovart.vercel.app/#services`. Vercel deployment completed. Browser review covered desktop, 390×844 and 320×568; the instruction clears the podium rim at desktop and compact sizes. Selecting Packaging & Print centered its Soda exhibit and left the two other videos paused. `podium-layout-desktop.jpg` shows the final layout. These are browser viewport checks, not physical-device benchmarks.
