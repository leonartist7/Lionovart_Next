export type Placement = { x: number; y: number; width: number; rotation: number; opacity: number; visible: boolean };
export type Layer = { id: string; name: string; src: string; inCycle?: boolean; desktop: Placement; mobile: Placement };
export type SceneSettings = { lionVisible: boolean; raysColor: string; raysOrigin: "top-center" | "bottom-center" };
export const DEFAULT_SCENE: SceneSettings = { lionVisible: true, raysColor: "#ffe14a", raysOrigin: "top-center" };
export type Composition = { version: 1; layers: Layer[]; scene: SceneSettings };
export const HERO_FRAME_SRC = "https://res.cloudinary.com/dgio9uutc/image/upload/v1791411672/hero_frame_1_soy84j.avif";
export const DEFAULT_COMPOSITION: Composition = {
  version: 1,
  scene: DEFAULT_SCENE,
  layers: [{
    id: "hero-frame",
    name: "Hero frame",
    src: HERO_FRAME_SRC,
    desktop: { x: 50, y: 50, width: 100, rotation: 0, opacity: 80, visible: true },
    mobile: { x: 50, y: 50, width: 100, rotation: 0, opacity: 80, visible: true },
  }],
};
export const STORAGE_KEY = "lionovart.hero-composition.v1";
export function parseComposition(value: unknown): Composition | null {
  if (!value || typeof value !== "object") return null;
  const config = value as Composition;
  if (config.version !== 1 || !Array.isArray(config.layers) || config.layers.length !== DEFAULT_COMPOSITION.layers.length) return null;
  const ranges = { x: [-100, 200], y: [-100, 200], width: [20, 400], rotation: [-180, 180], opacity: [0, 100] } as const;
  for (const [i, layer] of config.layers.entries()) {
    const original = DEFAULT_COMPOSITION.layers[i];
    if (!layer || layer.id !== original.id || layer.src !== original.src) return null;
    if (layer.inCycle !== undefined && typeof layer.inCycle !== "boolean") return null;
    for (const profile of ["desktop", "mobile"] as const) {
      const p = layer[profile];
      if (!p || typeof p.visible !== "boolean") return null;
      for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
        if (!Number.isFinite(p[key]) || p[key] < ranges[key][0] || p[key] > ranges[key][1]) return null;
      }
    }
  }
  // Older exported layouts keep the default lion and gold rays.
  const scene = config.scene ?? DEFAULT_SCENE;
  if (typeof scene.lionVisible !== "boolean" || typeof scene.raysColor !== "string"
    || !/^#[0-9a-f]{6}$/i.test(scene.raysColor)
    || !["top-center", "bottom-center"].includes(scene.raysOrigin)) return null;
  return { version: 1, scene: { lionVisible: scene.lionVisible, raysColor: scene.raysColor, raysOrigin: scene.raysOrigin }, layers: config.layers.map((layer, i) => ({ ...layer, name: DEFAULT_COMPOSITION.layers[i].name })) };
}
