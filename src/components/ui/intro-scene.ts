/** Extend the stage and circular wipes while keeping the original artwork centered. */
export function fitScene(source: Record<string, unknown>, width: number, height: number) {
  const scene = structuredClone(source);
  const w = Math.max(800, 600 * width / height);
  const h = Math.max(600, 800 * height / width);
  scene.w = w;
  scene.h = h;
  // IDs belong to the supplied Jitter export, not arbitrary Lottie scenes.
  const layers = scene.layers as Array<{
    ind: number;
    ks: Record<string, unknown>;
    shapes?: Array<{ ty: string; s?: { k: number[] } }>;
  }>;
  layers.find(layer => layer.ind === 0)!.ks.p = { a: 0, k: [(w - 800) / 2, (h - 600) / 2] };
  layers.find(layer => layer.ind === 77)!.shapes![0].s!.k = [w, h];
  const diameter = Math.max(1080, Math.hypot(w, h) * 1.08);
  for (const layer of layers) {
    if ([60, 62, 64, 66, 68, 70].includes(layer.ind)) layer.shapes![0].s!.k = [diameter, diameter];
  }
  return scene;
}
