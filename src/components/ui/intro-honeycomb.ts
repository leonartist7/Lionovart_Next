const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * t * (10 + t * (-15 + 6 * t));
};

export const INTRO_MIN_MS = 950;
export const INTRO_EXIT_MS = 1520;
export const INTRO_FALLBACK_EXIT_MS = 560;
export const INTRO_DEADLINE_MS = 8500;

export function introExitFrame(departure: number) {
  const forward = smooth(departure);
  const fade = smooth((departure - .13) / .87);
  return {
    camera: `translate3d(${forward * 2.4}%, ${forward * -1.7}%, 0) scale(${1 + forward * .56})`,
    cover: 1 - fade,
    wordmarkOpacity: 1 - smooth((departure - .04) / .76),
    wordmarkPosition: `0 ${-10 * forward}px`,
  };
}

export const INTRO_EXIT_FRAMES = Array.from({ length: 25 }, (_, i) => introExitFrame(i / 24));
