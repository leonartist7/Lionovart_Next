# Hero background composer
Open the homepage with `?heroEditor=1` to compose the background.

- Choose among the seven supplied images and toggle each layer.
- Adjust position, size, rotation, and opacity. Move on canvas exposes a drag handle; arrow keys nudge it and Shift moves five units.
- Desktop and mobile (below 768px) store separate placements. Resize the browser to edit each.
- Preview hides the panel. Save in browser persists editor-only settings. Normal visitors always see the defaults.
- Export/import transfers validated JSON. To publish a choice, apply its placements to DEFAULT_COMPOSITION in src/components/sections/hero-background/config.ts.
- There is no server write endpoint.

The default open ribbon stays fixed behind the dark opening and fades across the last 45% of a viewport before #stronger-together enters the screen. All seven WebP assets preserve alpha and total approximately 1.9 MB; the default image is approximately 397 KB.

The three client metrics reuse existing testimonial data, not independently verified results. Lumura remains labeled as an estimate. The film is invisible/inert at the top and enters after scrolling starts; its movement and the lion lighting are unchanged.

Verification: TypeScript and targeted ESLint passed. Inspected 1440×900, 1440×1000, 390×844, and 360×640. Confirmed no mobile horizontal overflow, loaded logos/background, keyboard movement 50→51, save/reload at 51, and normal-route default at 50 with no editor. Fade sampled at 900px viewport: opacity 1 with boundary top 1350; ~0.5 at 1103; 0/hidden at 900 and below.

Also guarded SplashScreen's animationName lookup against non-CSS animations after a runtime crash. An existing body-style hydration warning remains in development; this change does not modify body styles.
