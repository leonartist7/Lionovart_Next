# Hero background composer
Open the homepage with `?heroEditor=1` to compose the background.

- The editor starts as a fixed bottom-corner pill with previous/next image arrows. Selecting an image previews it immediately, showing one image at a time for the current screen size.
- Open the gear for image thumbnails and an inclusion checkbox per image. Excluded images are skipped by the arrows; at least one must remain. The shortlist is included in saved/exported layouts, and older layouts default to all images included.
- Adjust size, rotation, and opacity in settings. Move on canvas exposes a drag handle; arrow keys nudge it and Shift moves five units. Horizontal and vertical position fields are removed.
- Desktop and mobile (below 768px) store separate placements. Resize the browser to edit each.
- Settings start closed. The floating pill and panel do not occupy document space. Save in browser persists editor-only settings. Normal visitors always see the defaults.
- Export/import transfers validated JSON. To publish a choice, apply its placements to DEFAULT_COMPOSITION in src/components/sections/hero-background/config.ts.
- Hero scene controls: Show 3D lion, Ray color, and Rays come from (Top/Bottom). These settings apply to both screen sizes and are included in Save, Export, Import, and Reset. Older image-only layouts receive the original scene defaults.
- There is no server write endpoint.

The default open ribbon stays fixed behind the dark opening and fades across the last 45% of a viewport before #stronger-together enters the screen. All seven WebP assets preserve alpha and total approximately 1.9 MB; the default image is approximately 397 KB.

The hero retains its trust line and a visible preview of the film below. The three client-brand metrics have been removed. The original client-experience badge (portraits, five gold stars, and laurels) now sits between Proven Results and Creative Excellence beneath the 3D cards.

Verification: TypeScript and targeted ESLint passed. Inspected 1440×900, 1440×1000, 390×844, and 360×640. Confirmed no mobile horizontal overflow, loaded background, keyboard movement 50→51, save/reload at 51, and normal-route default at 50 with no editor. Fade sampled at 900px viewport: opacity 1 with boundary top 1350; ~0.5 at 1103; 0/hidden at 900 and below.

Also guarded SplashScreen's animationName lookup against non-CSS animations after a runtime crash. An existing body-style hydration warning remains in development; this change does not modify body styles.


## Hero light rays

The hero uses the unmodified React Bits JS-CSS registry source from https://reactbits.dev/r/LightRays-JS-CSS.json in src/components/ui/light-rays, with ogl@^1.0.11. HeroLightRays.tsx supplies the requested cyan configuration in a full-viewport decorative layer behind the transparent lion canvas and hero content. The rays live outside the moving headline mask, so it cannot punch a dark circle into the light. A soft fade at the edge opposite the ray origin avoids a hard cutoff.

The rays fade with the hero and unmount when the hero is inactive or the tab is hidden. Reduced-motion preferences use a static glow matching the chosen ray color and origin. The editor controls ray color and top/bottom origin. Its Show 3D lion toggle hides the model, both poster fallbacks, and its decorative trail without interrupting scroll progress. The headline mask is cleared while the lion is hidden.

Verification: registry source comparison, TypeScript, and targeted ESLint passed. Browser checks at 1440x900 and 390x844 confirmed the canvas renders with no horizontal overflow, is removed after scrolling past the hero, and returns at the top.


Editor revision verification: TypeScript and targeted ESLint passed. Browser checks at 1440x900, 390x844, and 360x640 confirmed the film preview and three-badge layout, no horizontal overflow, and visible proof on short phones. Verified lion hiding clears the headline mask, ray color/origin update live, settings persist across editor reloads, and the normal homepage retains default settings. No browser runtime errors were reported; the existing development hydration warning remains.
