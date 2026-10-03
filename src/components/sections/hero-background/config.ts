export type Placement = { x: number; y: number; width: number; rotation: number; opacity: number; visible: boolean };
export type Layer = { id: string; name: string; src: string; desktop: Placement; mobile: Placement };
export type SceneSettings = { lionVisible: boolean; raysColor: string; raysOrigin: "top-center" | "bottom-center" };
export const DEFAULT_SCENE: SceneSettings = { lionVisible: true, raysColor: "#00ffff", raysOrigin: "top-center" };
export type Composition = { version: 1; layers: Layer[]; scene: SceneSettings };
const names = ["Onyx & gold ring", "Ivory & gold ring", "Three-tone ring", "Flowing gold ribbon", "Open gold ribbon", "Fine gold ring", "Bold onyx ring"];
export const DEFAULT_COMPOSITION: Composition = {
  version: 1,
  scene: DEFAULT_SCENE,
  layers: names.map((name, i) => ({
    id: String(i + 1), name, src: `/images/hero-backgrounds/background-${i + 1}.webp`,
    desktop: { x: 50, y: 66, width: i === 4 ? 145 : 110, rotation: 0, opacity: 30, visible: i === 4 },
    mobile: { x: 50, y: 62, width: i === 4 ? 260 : 180, rotation: 0, opacity: 22, visible: i === 4 },
  })),
};
export const STORAGE_KEY = "lionovart.hero-composition.v1";
export function parseComposition(value: unknown): Composition | null {
  if (!value || typeof value !== "object") return null;
  const config = value as Composition;
  if (config.version !== 1 || !Array.isArray(config.layers) || config.layers.length !== 7) return null;
  const ranges = { x: [-100, 200], y: [-100, 200], width: [20, 400], rotation: [-180, 180], opacity: [0, 100] } as const;
  for (const [i, layer] of config.layers.entries()) {
    const original = DEFAULT_COMPOSITION.layers[i];
    if (!layer || layer.id !== original.id || layer.src !== original.src) return null;
    for (const profile of ["desktop", "mobile"] as const) {
      const p = layer[profile];
      if (!p || typeof p.visible !== "boolean") return null;
      for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
        if (!Number.isFinite(p[key]) || p[key] < ranges[key][0] || p[key] > ranges[key][1]) return null;
      }
    }
  }
  // Older exported layouts keep the original lion and cyan rays.
  const scene = config.scene ?? DEFAULT_SCENE;
  if (typeof scene.lionVisible !== "boolean" || typeof scene.raysColor !== "string"
    || !/^#[0-9a-f]{6}$/i.test(scene.raysColor)
    || !["top-center", "bottom-center"].includes(scene.raysOrigin)) return null;
  return { version: 1, scene: { lionVisible: scene.lionVisible, raysColor: scene.raysColor, raysOrigin: scene.raysOrigin }, layers: config.layers.map((layer, i) => ({ ...layer, name: names[i] })) };
}
