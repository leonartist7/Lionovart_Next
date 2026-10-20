const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
/** One reversible timeline drives transport, copy, light and the final dissolve. */
export function cardHandoff(top: number, height: number, viewport: number) {
  const progress = clamp((viewport - top) / Math.max(1, height + viewport));
  return {
    progress,
    move: smooth((progress - .04) / .34),
    copy: smooth((progress - .28) / .16) * (1 - smooth((progress - .56) / .22)),
    content: 1 - smooth((progress - .4) / .35),
    intro: 1 - smooth((viewport * .65 - (top + height)) / Math.max(1, viewport * .6)),
    light: smooth((progress - .56) / .38),
    proof: 1 - smooth(progress / .16),
  };
}
