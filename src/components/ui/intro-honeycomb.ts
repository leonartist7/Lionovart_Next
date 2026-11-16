const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * t * (10 + t * (-15 + 6 * t));
};

export const INTRO_MIN_MS = 950;
export const INTRO_EXIT_MS = 1520;
export const INTRO_FALLBACK_EXIT_MS = 560;
export const INTRO_DEADLINE_MS = 8500;

// A slow frame or waking tab can extend the transition, without skipping its camera poses.
export function introFrameStep(now: number, previous: number | undefined) {
  return previous === undefined ? 0 : Math.min(32, Math.max(0, now - previous));
}

export function introHoneycombPose(elapsed: number, departure: number) {
  const drift = smooth(elapsed / 4400);
  const forward = smooth(departure);
  const fade = smooth((departure - .13) / .87);
  return {
    arrival: .82 + .18 * smooth(elapsed / 1700),
    // The drift continues through the lift. A fixed exit direction avoids
    // switching to a different tile as the camera crosses the grid.
    panX: -.37 + drift * .68 + forward * .60,
    panY: .13 - drift * .34 + forward * .24,
    lift: smooth(departure / .88),
    push: forward,
    opacity: 1,
    cover: 1 - fade,
    wordmark: 1 - smooth((departure - .04) / .76),
    wordmarkY: -10 * smooth(departure),
  };
}
