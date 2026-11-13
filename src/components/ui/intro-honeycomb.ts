const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

export const INTRO_MIN_MS = 950;
export const INTRO_EXIT_MS = 800;
export const INTRO_DEADLINE_MS = 8500;

export function introHoneycombPose(elapsed: number, departure: number) {
  const drift = smooth(elapsed / 5000);
  const lift = smooth(departure / .72);
  const push = smooth((departure - .26) / .74);
  return {
    arrival: .5 + .5 * smooth(elapsed / 950),
    lift,
    push,
    opacity: 1,
    panX: -.48 + drift * 1.15,
    panY: .25 - drift * .52,
    cover: 1 - smooth((departure - .45) / .55),
    wordmark: 1 - smooth(departure / .52),
  };
}
