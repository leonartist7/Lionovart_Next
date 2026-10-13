# Pearl and gold ROAR

The English hero uses real shallow-extruded Playfair Display Italic 500 glyphs. Other languages and closing words are unchanged. `HeroRoar3D` keeps semantic ROAR text in the heading and reserves its dimensions before loading. The transparent lossless WebP poster was exported from the same renderer at neutral tilt.

## Editable inputs and rebuilding

`src/lib/hero-roar/outlines.json` contains actual normalized font commands, kerning and -0.04em tracking. Overlapping glyph contours were unioned before beveling, preserving all four counters. `scripts/hero-roar/build.mjs` controls extrusion, bevel, surface crown and adaptive curve tolerance. Rebuild with:

```sh
node scripts/hero-roar/build.mjs
node --test scripts/hero-roar/roar.test.mjs
```

The generator writes both GLBs, model metadata/cache hashes and an editable outline SVG. Regeneration from the stored outlines needs the project's existing Node dependencies only. To replace the source font, install build-only `fonttools[woff]` and `skia-pathops`, run `prepare-font.py <italic-woff2> <static-ttf>`, then `extract.mjs <static-ttf>` before rebuilding. The original source was the site's existing Latin Playfair Display Italic variable font, frozen at 500. Do not feed its overlapping raw contours straight into extrusion.

After geometry or lighting changes, visit `/demo/ornaments/roar`, export the neutral poster, and save a lossless WebP as `public/models/roar/roar-poster.webp`. The review's 400% mode resizes and redraws the canvas; it does not enlarge a cached preview.

## Material and controls

`engine.ts` derives ivory and champagne-gold colors from `src/lib/pearl-gold/material-recipe.json`. Pearl uses a broad satin physical material; bevels and sides use metallic gold. Shared geometry keeps the trim attached, including counters. A shallow crown gives the face mild curvature. Room reflections and warm studio lights stay stationary. This intentionally restrained finish is less textured and less dramatic than the raster reference; it is not a pixel-perfect reproduction.

Component controls: `quality="auto"` (or `desktop`/`mobile`), `maxTiltX={3}`, `maxTiltY={4}`, `responseMs={180}`. X and Y caps are degrees. Default automatic quality uses the simplified model below 768px or on coarse-pointer devices. Mobile stays still even when inspected with a desktop mouse.

Desktop: 14,800 triangles, 912,492 bytes. Mobile: 5,952 triangles, 338,984 bytes. Both use two material meshes; the observed complete render uses three draw calls including the renderer pass. DPR caps are 1.5 and 1.25 respectively. True 3D uses finite mesh contours and a pixel canvas, not infinitely detailed SVG geometry.

## Lifecycle and fallbacks

The renderer loads after the intro releases and the word is visible. Fine-pointer hover uses damped tilt; the loop stops when settled, offscreen or document-hidden. Listeners, observers and graphics resources dispose on unmount. WebGPU falls back to WebGL2. SaveData and graphics failure retain the rendered poster. Reduced motion uses a stationary word.

Development review URLs: `/demo/ornaments/roar?roarWebGL` forces the WebGL path; `?roarFail` exercises failure. `/demo/ornaments/devices` provides actual iframe viewport checks.

## Verification, 13 October 2026

TypeScript, scoped ESLint, diff whitespace checks and 30 focused geometry/motion/process/SVG tests passed. The GLBs have finite vertices, valid indices and open counter centers. Browser checks observed WebGPU and forced WebGL2 rendering, settled hover motion, one initialization across scrolling, a stationary simplified mobile word and confirmed renderer-failure poster retention.

Comparison layout was checked at 999, 1000, 1001 and 1440px. The `width > 1000px` range handles fractional viewport sizes correctly. Desktop and 390px footer checks found no duplicate lion or overflow, with the email at the footer's true center. The CTA lion remains unchanged.

Physical mobile hardware, Safari, OS reduced-motion and SaveData were not directly tested. Their branches were reviewed and the relevant motion helpers tested. The production build was not run because the C drive repeatedly ran out of free space; development routes compiled successfully. No deployment is implied by a GitHub push.
