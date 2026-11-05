// The binary-preserved ACTY pass stays out of the initial homepage bundle.
const entry = "/acty/hex/renderer.js";
type Scene = HTMLImageElement | HTMLCanvasElement;
type Options = { signal: AbortSignal; duration?: number; onFrame?: (progress: number) => void };
type Renderer = {
  backend: "webgl1" | "webgl2";
  resize(width: number, height: number): void;
  setSource(index: 0 | 1, source: Scene): void;
  draw(progress: number, seconds: number): boolean;
  dispose(): void;
};
type Module = { createHexRenderer(canvas: HTMLCanvasElement): Promise<Renderer> };

/** Both artwork frames occupy the same authored rectangle. The DOM owns the
 * settled image; the GPU is needed only between the two stills. */
export function revealWithHex(canvas: HTMLCanvasElement, from: Scene, to: Scene, {
  signal, duration = 620, onFrame,
}: Options): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: Renderer | undefined;
    let finished = false, frame = 0, start = 0, timeout = 0;
    const release = (pass: Renderer) => {
      pass.dispose();
      // Each reveal owns a fresh temporary canvas. Repeated taps must not
      // compete with the site's other contexts while waiting for GC.
      const gl = canvas.getContext(pass.backend === "webgl2" ? "webgl2" : "webgl");
      (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    };
    const finish = (error?: unknown) => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
      document.removeEventListener("visibilitychange", skip);
      reduced.removeEventListener("change", skip);
      if (renderer) release(renderer);
      if (error) reject(error); else resolve();
    };
    const abort = () => finish(new DOMException("Transition closed", "AbortError"));
    const skip = () => { if (document.hidden || reduced.matches) finish(); };
    if (signal.aborted) { abort(); return; }
    if (document.hidden || reduced.matches) { finish(); return; }
    signal.addEventListener("abort", abort, { once: true });
    document.addEventListener("visibilitychange", skip);
    reduced.addEventListener("change", skip);
    // A slow module or GPU must never hold the visitor on the overview.
    timeout = window.setTimeout(() => finish(), 2400);
    const draw = (now: number) => {
      if (finished || !renderer) return;
      try {
        const p = Math.min(1, Math.max(0, (now - start) / Math.max(1, duration)));
        if (!renderer.draw(p, now / 1000)) { finish(); return; }
        onFrame?.(p);
        if (p === 1) finish();
        else frame = requestAnimationFrame(draw);
      } catch (error) { finish(error); }
    };
    void (async () => {
      const mod = await import(/* webpackIgnore: true */ entry) as Module;
      if (finished) return;
      const pass = await mod.createHexRenderer(canvas);
      if (finished) { release(pass); return; }
      renderer = pass;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) { finish(); return; }
      const dpr = Math.min(window.devicePixelRatio || 1, 2, 1600 / Math.max(rect.width, rect.height));
      pass.resize(Math.round(rect.width * dpr), Math.round(rect.height * dpr));
      pass.setSource(0, from); pass.setSource(1, to);
      clearTimeout(timeout);
      start = performance.now();
      draw(start);
    })().catch(finish);
  });
}
