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
