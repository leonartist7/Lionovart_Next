# Media-led screening room — 20 October 2026

## Story and visual direction
Cards → Services → One Partnership → project corridor → browsable work.

The persistent ivory architecture stays in the viewport. Services and the gallery introduction use native-scroll opacity with fixed stages: neither rises from below. One Partnership retains the existing manually scrubbed tile choreography, now after Services. Its exit reveals a central film screen and two angled neighbouring project screens. The background opens slightly in depth at the gallery entrance, without vertical movement.

This direction uses CSS perspective and real HTML video rather than representative Three.js props. The old model renderer is retained in source but not initialized on the media-led homepage. It does not require WebGPU/WebGL.

## Media and interaction
- Service tags switch curated existing project films/posters; portrait-side compositions for content, wide screens for web and platforms.
- Website/platform/branding footage comes from the existing gallery manifest. Do not treat these selections as evidence of specific seasonal deliverables.
- LED keeps the explicit display-concept illustration; no verified real installation film was available in the connected manifest.
- Selected Work: side screens and named project buttons change the central film. The title opens the original case-study dialog with video controls. Existing filters, grid and pagination remain.
- One silent decoder in each active fixed stage, lazy source assignment, responsive 640/1280px H.264 delivery. Pause offstage, on hidden tabs and on user pause. Reduced motion/save-data keep posters. Side screens remain stills.
- Inactive stages are hidden and inert. Short landscape and reduced motion restore ordinary document flow.

## Curation recommendation
Use authored media collections: website walkthroughs, identity films, campaign loops and platform demos. Add seasonal-specific footage in a second curation pass. Use 3D only where physical context helps: storefront glass, an event set or packaging. Keep videos on the hero screens rather than encoding every film as a WebGL texture.

## Validation
Native-scroll dissolve tests cover 568/844/900/1024px viewport heights, invisible boundaries, readable holds and reverse determinism. Full targeted suite: 55 tests. Browser observations and build status are recorded in the delivery notes.
