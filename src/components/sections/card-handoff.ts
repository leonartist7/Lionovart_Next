const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
/** One reversible timeline drives transport, copy, light and the final dissolve. */
export function cardHandoff(top: number, height: number, viewport: number) {
  const progress = clamp((viewport - top) / Math.max(1, height + viewport));
  return {
    progress,
    move: smooth((progress - .04) / .34),
    copy: smooth((progress - .28) / .16) * (1 - smooth((progress - .56) / .22)),
    // Clear the interior during transport; leave empty glass for the shaping beat.
    dissolve: smooth((progress - .06) / .30),
    glass: smooth((progress - .04) / .22),
    intro: 1 - smooth((viewport * .75 - (top + height)) / Math.max(1, viewport * .5)),
    light: smooth((progress - .56) / .38),
    proof: 1 - smooth(progress / .16),
  };
}
