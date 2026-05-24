/**
 * BackgroundTexture — LIONOVART global depth layer
 * ------------------------------------------------
 * Stacks four cheap, static layers behind the page:
 *   1. Soft golden hairlines (repeating linear-gradient, mix-blend: screen)
 *   2. Crossing fainter golden hairlines for woven richness
 *   3. Subtle film-grain noise (inline SVG turbulence, mix-blend: overlay)
 *   4. Two large radial gold/red glow vignettes
 *
 * All intensities are tuned through CSS variables defined in globals.css
 * (`--texture-line-opacity`, `--texture-grain-opacity`, etc.) so designers
 * can dial it in live without touching this component.
 *
 * Renders ONCE in the root layout — sits behind <main> via z-index: 0
 * (main is z-10 in page.tsx). No JS, no animation, no event listeners.
 */
export default function BackgroundTexture() {
  return (
    <div className="bg-texture-root" aria-hidden="true">
      <div className="bg-texture-glow-a" />
      <div className="bg-texture-glow-b" />
      <div className="bg-texture-lines" />
      <div className="bg-texture-lines-cross" />
      <div className="bg-texture-grain" />
    </div>
  );
}
