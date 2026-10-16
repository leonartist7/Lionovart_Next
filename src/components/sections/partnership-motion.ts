export const PARTNERSHIP_REST = 0.64;

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const phase = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** The cards dissolve into the tile flight, then a clear partnership reading hold. */
export function partnershipPose(progress: number) {
  return {
    introOpacity: 1 - phase(progress, 0, .27),
    chapterOpacity: phase(progress, .13, .34) * (1 - phase(progress, .76, .98)),
    introInteractive: progress < .27,
  };
}
