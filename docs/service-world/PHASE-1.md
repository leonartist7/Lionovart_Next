# Services world — Phase 1

Base: 90c24aa94002c286806a9e30bf8eb5d918adb7ff. Review branch only.

## World bible
Travel from the black film and LION/NOVA/ART cards into an illuminated ivory studio, explore campaign and transparent-display exhibits, then meet a real project in the same gallery.
Native scroll controls the journey; accessible HTML buttons select local examples. Existing opening and partnership choreography is retained.

Connected sets, one persistent renderer: the architecture remains while exhibits descend into their plinths between selections. 1 unit ≈ 1 metre. Ivory #f7f4ef, ink #08080a, brushed gold #b99a58, campaign vermilion #bc263a. Squared architectural columns, beveled product frames, circular gold accents. Soft directional light + hemisphere fill; no postprocessing, expensive transmission or dynamic shadow maps in this slice. Baked radial contact shadows. DOM owns text/navigation and project dialogs.

## Chapters and cameras
| Chapter | Composition | Camera | Loading/fallback |
|---|---|---|---|
| Film/cards | Existing black cinematic presentation | Existing authored choreography | Existing posters/video controls |
| Partnership | Architectural hall brightens after cards | [0,3.5,15], target [0,1.6,0], 35° | CSS black-to-ivory transition even without GPU |
| Content | Campaign screen, phone, product plinth, calendar | Camera fitted to stage rectangle, restrained variant angle | Procedural geometry/canvas artwork; existing service poster |
| LED | Transparent storefront, interior, animated LED matrix | Camera fitted to stage, variants show different viewing angles | Instanced LED dots; existing LED poster |
| Work | Framed real Rakbank project on gallery podium | Same camera/material family, wider screen | Existing project poster; original dialog retained |

Desktop DPR cap 1.5; phone 1.25; downgrade to 1 after sustained slow frames. No pointer movement on touch. Paused when offscreen/hidden; one owned video, active only for motion example. Reduced motion uses still compositions/posters and retains all button interactions. One renderer/scene lifecycle, cleanup of media, observers, geometry, textures, materials and GPU resources.

## Interaction matrix
Content tags: seasonal/red, promotional/gold product, video/motion film, content-calendar editorial panels. LED tags: transparent display, custom motion, window campaign, side/site view. LED switch turns pixels off to expose the interior. Motion pause preserves the selected composition. Tags remember selection by service. Work feature opens the existing project dialog. Normal scroll, keyboard focus and footer remain reachable.

## Asset ledger
Procedural room/props, 4 local canvas campaign textures, one contact-shadow texture, one lazily loaded Cloudinary project poster, one 720px showreel only after motion selection. Existing fallback posters retained. No new external 3D libraries or asset downloads.

## Execution gates
Phase 1: shared architecture and two service prototypes + project feature. Phase 2: other four service exhibits and richer portfolio staging. Phase 3: whole-journey device profiling and final polish. Do not represent emulator or cloud-browser evidence as physical-device performance.
