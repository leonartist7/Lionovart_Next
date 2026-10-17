export const PARTNERSHIP_SCROLL_LENGTH = 6;
export const PARTNERSHIP_REST = 0.76;

// Fractions of the user-controlled runway, never elapsed seconds.
export const PARTNERSHIP_TIMING = {
  introEnd: 0.12,
  headlineInStart: 0.025,
  headlineInEnd: 0.12,
  tilesStart: 0.28,
  tileFlight: 0.11,
  imageHoldEnd: 0.57,
  zoomEnd: 0.69,
  exitStart: 0.585,
  exitEnd: 0.69,
  tileFadeStart: 0.70,
  tileFadeEnd: 0.72,
  headlineOutStart: 0.84,
  headlineOutEnd: 0.98,
} as const;

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const phase = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Read the headline, browse the assembled tiles, then read the clear headline. */
export function partnershipPose(progress: number) {
  return {
    introOpacity: 1 - phase(progress, 0, PARTNERSHIP_TIMING.introEnd),
    chapterOpacity: phase(progress, PARTNERSHIP_TIMING.headlineInStart, PARTNERSHIP_TIMING.headlineInEnd)
      * (1 - phase(progress, PARTNERSHIP_TIMING.headlineOutStart, PARTNERSHIP_TIMING.headlineOutEnd)),
    introInteractive: progress < PARTNERSHIP_TIMING.introEnd,
  };
}
