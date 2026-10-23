# Services world — Phase 2

Extends Phase 1 commit f81b88a on the same review branch. Production is not changed.

## World and scene ledger
One persistent ivory architectural hall, gold-edged dais, restrained directional light and contact shadows. Native scroll remains the conductor. Six service exhibits share the existing fitted 9.6 × 5.6 world-unit camera envelope, 35° lens, 1.25 mobile / 1.5 desktop DPR caps. No added libraries, model downloads, dynamic shadows or postprocessing.

| Exhibit | Landmark and interaction | Materials / assets | Responsive composition |
| --- | --- | --- | --- |
| Brand | Identity board and stationery; graphic posters; packaging boxes; open guidelines spread | Oxblood paper, ivory stock, gold edges; shared vector artwork | Keep primary board and side objects inside the camera envelope; CSS perspective fallback |
| Digital | Desktop/laptop, tablet and phone; tags foreground website, platform, shop or UI system | Ink device shells, cobalt interface panels; shared vector artwork | All devices fit, phone emphasis for app state; fallback mirrors geometry |
| Spaces | Architectural portal, presentation wall, reception desk, sign and display plinths | Terracotta panel, chalk architecture, gold trim | Retail and print layouts rearrange props; no small copy required to understand scene |
| Smart AOS | Central operating dashboard surrounded by four connected modules | Deep teal, luminous gold links; local vector panels | Selected module highlights and connections carry a restrained pulse; static under pause/reduced motion |
| Content / LED | Existing interactive campaign studio and transparent window | Existing Phase 1 assets | Preserved |
| Selected Work | Main framed project plus two angled supporting panels on gallery plinth | Actual selected project poster; correct aspect containment; bounded texture cache | Accessible project selectors follow current filtered page; dialog retains selected project |

## Interaction and loading contract
All six services expose four real HTML buttons, selected state, keyboard focus and remembered per-service selection. Illustrations are explicitly concepts. SVG artwork is shared between CSS fallback and GPU textures; only selected variants are decoded. All geometry uses registered, disposable resources. Optional scene movement pauses offscreen, when hidden, on user pause and under reduced motion. The GPU gallery uses a maximum three-poster cache and request identities so late responses cannot show the wrong project. The DOM poster remains until that exact project texture is ready. Filtering/paging resets the feature to a valid project. Modal media keeps its original controls.

## Validation scope
Build, type checks, relevant deterministic state/camera tests and browser viewport/interaction review. Phase 1 cloud browser lacked GPU contexts; GPU output and real-device performance must be labelled unverified unless new evidence proves otherwise. Phase 3 remains hardware/browser profiling, whole-journey context-loss/orientation checks and final visual polish.
