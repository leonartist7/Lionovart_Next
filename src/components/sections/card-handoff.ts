const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
/** One reversible timeline drives transport, copy, light and the final dissolve. */
export function cardHandoff(top: number, height: number, viewport: number) {
  const progress = clamp((viewport - top) / Math.max(1, height + viewport));
  return {
    progress,
    move: smooth((progress - .04) / .24),
    // The whole message fades together only after transport settles at 28%.
    copy: smooth((progress - .28) / .14) * (1 - smooth((progress - .72) / .12)),
    serviceReveal: smooth((progress - .66) / .24),
    serviceCopy: smooth((progress - .86) / .14),
    serviceSides: smooth((progress - .86) / .14),
    rear: 1 - smooth((progress - .64) / .16),
    // Read first, then clear the painted face before changing its aspect ratio.
    // The independent sculpture carries the pillar into the filled service frame.
    fit: smooth((progress - .46) / .22),
    dissolve: smooth((progress - .30) / .16),
    focus: smooth((progress - .14) / .28),
    sculpture: 1 - smooth((progress - .62) / .14),
    glass: smooth((progress - .10) / .18),
    intro: 1 - smooth((progress - .66) / .24),
    light: smooth((progress - .82) / .18),
    proof: 1 - smooth(progress / .05),
  };
}
