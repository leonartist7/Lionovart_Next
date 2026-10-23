const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const p = clamp(n); return p * p * (3 - 2 * p); };
export const GALLERY_DEPTH_STEP = 900;
export const GALLERY_WALK_END = .76;

export function galleryTravel(progress: number, pairs: number) {
  const length = Math.max(0, pairs - 1) * GALLERY_DEPTH_STEP + 1250;
  return clamp(progress / GALLERY_WALK_END) * length;
}
export function galleryProgress(top: number, height: number, viewport: number) {
  return clamp(-top / Math.max(1, height - viewport * .85));
}
export function galleryCardPose(progress: number, pair: number, pairs: number) {
  const z = -350 - pair * GALLERY_DEPTH_STEP + galleryTravel(progress, pairs);
  return { z, opacity: smooth((z + 3300) / 700) * (1 - smooth((z - 180) / 520)), visible: z > -3400 && z < 720 };
}
export function galleryEnding(progress: number) {
  return {
    logoZ: 2800 * smooth(progress / GALLERY_WALK_END) - 2800,
    logo: smooth((progress - .1) / .3),
    copy: smooth((progress - .77) / .09),
    links: smooth((progress - .85) / .06),
    header: 1 - smooth((progress - .08) / .16),
  };
}
export function galleryPairProgress(pair: number, pairs: number) {
  return Math.max(0, pair) * GALLERY_DEPTH_STEP / (Math.max(0, pairs - 1) * GALLERY_DEPTH_STEP + 1250) * GALLERY_WALK_END;
}
