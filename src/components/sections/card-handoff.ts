const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
/** One reversible timeline drives transport, copy, light and the final dissolve. */
export function cardHandoff(top: number, height: number, viewport: number) {
  const progress = clamp((viewport - top) / Math.max(1, height + viewport));
  return {
    progress,
    move: smooth((progress - .04) / .24),
    // The whole message fades together only after transport settles at 28%.
    copy: smooth((progress - .28) / .14) * (1 - smooth((progress - .66) / .12)),
    serviceReveal: smooth((progress - .66) / .24),
    serviceCopy: smooth((progress - .80) / .16),
    serviceSides: smooth((progress - .86) / .14),
    rear: 1 - smooth((progress - .64) / .16),
    // Gather first, hold the benefit titles, then dissolve while fitting the service outline.
    fit: smooth((progress - .46) / .22),
    dissolve: smooth((progress - .46) / .22),
    glass: smooth((progress - .46) / .18),
    intro: 1 - smooth((progress - .66) / .24),
    light: smooth((progress - .76) / .24),
    proof: 1 - smooth(progress / .05),
  };
}
