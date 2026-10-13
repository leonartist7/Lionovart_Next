# Pearl & Gold — continuous SVG ribbon system

Open http://127.0.0.1:8770/ while the local workshop is running. Otherwise run START-WORKSHOP.cmd (requires Node.js). The service only listens on this computer.

This is a reusable, art-directed 2D material system. The supplied image is a visual benchmark, displayed separately in the editor. It is never read by the generator, traced, or embedded in exported artwork.

## What is delivered

- engine.js: geometry, material palettes, lighting recipe, validation and standalone SVG generation, without dependencies.
- study-design.json: pearl ribbon crossing an obsidian ribbon, the foundational material study.
- frame-design.json, wave-design.json, petal-design.json: three additional compositions using exactly the same recipe.
- study.svg, frame.svg, wave.svg, petal.svg: transparent-background, standalone vector exports.
- study-motion.svg: restrained breathing motion with a reduced-motion fallback.
- material-recipe.json: editable settings and palette documentation.
- index.html / app.js / style.css: editable local workshop, with independent settings scrolling and persistent inspection/export controls.
- test.mjs and verification.json: structural checks and explicit limitations.
- Reference and zoom screenshots: visual review evidence, not artwork dependencies.

The previous patch-based workshop is preserved separately in pearl-gold-system-previous.zip.

## Using the workshop

Start with Two-ribbon material study. Select a ribbon, turn on Show boundary handles, and drag its points. The two colors identify the two edges. Tangents are automatically kept continuous between curve spans. Joined tips remain joined when dragged. The width and taper controls reshape those same boundaries; editing handles follow the resulting surface.

Add ribbon creates another editable pearl ribbon. Face switches between pearl, obsidian and solid gold. Bring forward / Send backward change overlap order. A narrow solid-gold ribbon is an intentional independent accent. Gold edging on pearl/obsidian is automatic and always attached.

Use 100%, 400% and 800% to inspect the actual SVG. 100% means fit-to-panel, not one design unit per screen pixel. Zoom changes the SVG viewBox; it does not scale a screenshot, canvas or CSS-cached preview. Drag the background to pan, use the wheel to zoom under the pointer, or use arrow keys when the artwork has keyboard focus. Plus/minus zoom; zero fits. Start tip / End tip centers the selected ribbon's tip at the current zoom.

Settings scroll independently. On narrow screens they sit below the fixed preview and keep their own scrolling area. Essential controls stay next to the preview. Reference beside artwork is a separate comparison image; exported SVGs contain no reference pixels.

Save design stores editable geometry and settings. Load design accepts version 2 documents and approximately migrates version 1 documents with a visible explanation. Invalid edits restore the previous valid geometry. Intersection rejection uses sampled checks; extremely small intersections between samples are a known limit.

## Geometry formula

A ribbon has paired arrays A and B of editable 2D knots, and an overlap position given by its order in ribbons. At each knot, width/taper modify A and B around their midpoint. A small reflection-sweep-dependent width variation adds a restrained sense of turning. This is art direction, not a physical cloth model.

Every boundary span is a cubic Bézier. For a span from P_i to P_(i+1), use controls:

    C1 = P_i + (P_(i+1) - P_(i-1)) / 6
    C2 = P_(i+1) - (P_(i+2) - P_i) / 6

Endpoint neighbors are clamped. Adjacent spans share matching tangents. Each visible outline consists only of M, C and Z commands. There are no polygon patches or line-segment chains in artwork. A few straight guide lines may appear in the editing overlay; these are not exported.

The transverse surface coordinate is S(t,v) = (1-v) A(t) + v B(t). Because both edges use the same cubic basis, constant-v curves remain cubic. Gold bands occupy v in [0, trim] and [1-trim, 1]. The face occupies [trim, 1-trim]. All boundaries therefore stay attached mathematically. The gold's shallow bevel is made from narrower curved bands inside the same interval, not cylindrical strokes. Tips converge to a point.

## Material and lighting formula

Geometry and material are independent. Pearl, dark and gold palettes are exported as materials in engine.js. The defaults and palette values are also recorded in material-recipe.json. To use a modified recipe, set design.style to its settings and call renderSVG(design, {palette: recipe.materials}). This changes the finish without editing the geometry. The build command regenerates the bundled recipe from the engine defaults; keep custom recipes under separate filenames. Each ribbon gets:

1. A longitudinal multi-stop tonal gradient, with its axis influenced by light direction.
2. A low-opacity cross-surface gradient for gentle asymmetric curvature.
3. A broad reflection card, expressed as a curved band in surface coordinates. Its center moves along the face with the reflection sweep setting.
4. A narrower shoulder reflection and a restrained fold shadow, clipped inside the face.
5. Optional very low-contrast directional curves for satin grain. They cannot alter the silhouette.
6. Gold edge bands with separate tonal and bright-bevel gradients.

Overlap shadows come from the front ribbon's actual shape, offset according to light direction, blurred according to the depth setting, and clipped to lower ribbon surfaces. No shadows are drawn into empty transparent space. This is a 2D compositing approximation: it does not solve 3D occlusion, bounce light or cloth thickness. Decorative bloom is absent.

## What remains vector; what the browser rasterizes

Silhouettes, gold bands, reflection footprints and texture curves are cubic vector paths. Gradients are recalculated when painted at a new scale. The browser ultimately paints all content to screen pixels.

Satin feathering and contact shadows use feGaussianBlur. SVG filters operate through intermediate raster buffers; these effects are not infinitely detailed vector shading. Filter regions have generous bounds derived from Bézier control hulls, and the result is clipped to the receiving surface. The silhouette itself is never blurred. No fixed filter resolution or low-resolution cached preview is used. Browsers and GPUs may impose limits at extreme zoom.

See the [W3C SVG filter specification](https://www.w3.org/TR/SVG11/filters.html) for filter regions and raster-based primitives.

## Website integration

For a static decorative SVG:

    <img src="/art/frame.svg" alt="" aria-hidden="true"
         style="display:block;width:100%;height:auto;pointer-events:none">

Use study-motion.svg the same way for its built-in subtle animation. The SVG contains a reduced-motion media query. Motion translates the entire group by two design units over 18 seconds, so shading, trim and shadows stay together. It is not independent waving or cloth simulation. Test animated SVG-as-image support in your target browsers; inline SVG gives you direct animation control.

Generate a new design in JavaScript:

    import { preset, renderSVG, boundaries } from './engine.js';
    const design = preset('study');
    design.ribbons[1] = {
      id: 'custom-pearl', name: 'Custom pearl', material: 'pearl',
      phase: 0.2, depth: 0,
      ...boundaries(
        [[120,240], [420,320], [850,580], [1260,340]],
        [0,80,110,0]
      )
    };
    design.style.trim = 0.024;
    const svg = renderSVG(design, { namespace: 'hero-ornament' });
    document.querySelector('#ornament').innerHTML = svg;

Use a unique namespace for every independently generated SVG inserted inline into the same document. Exported SVGs are self-contained; they do not require engine.js on the website. Do not load arbitrary untrusted SVG markup into innerHTML.

For shape animation, update the design and regenerate all geometry together. The editor's gentle motion deliberately avoids per-frame geometry regeneration. Heavy live morphing needs separate profiling; no frame-rate guarantee is claimed. Pausing animation out of view is sensible for multiple ornaments.

## Visual review and limits

The two-ribbon study was inspected at fit, 400% and 800%, including a tapered tip on checkerboard and the overlap on ivory. In those inspected views, there were no patch seams, polygon facets, square tips or detached trim. The same finish was checked on the frame, divider and asymmetric petals. The UI was checked at desktop and narrow widths.

The comparison with image 2 is not pixel perfect. The SVG has fewer folds, softer reflections and less complex gold illumination. It also does not reproduce the reference's very fine metallic weave. Geometry is intentionally original and reusable. The screenshot evidence and side-by-side mode let you judge whether the simpler SVG finish is suitable for your website.

Run `node test.mjs` to verify and regenerate the bundled designs and exports. Tests cover cubic-only paths, tangent continuity, export references, deterministic saved-design reload, width/taper extremes, editing transforms, invalid geometry rejection, migration, shadow receivers and reduced-motion markup. These checks do not establish visual fidelity.
