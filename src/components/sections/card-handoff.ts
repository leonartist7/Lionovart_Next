const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
/** One reversible timeline drives transport, copy, light and the final dissolve. */
export function cardHandoff(top: number, height: number, viewport: number) {
  const progress = clamp((viewport - top) / Math.max(1, height));
  return {
    progress,
    move: smooth((progress - .04) / .44),
    copy: smooth((progress - .22) / .18) * (1 - smooth((progress - .56) / .22)),
    content: 1 - smooth((progress - .25) / .3),
    intro: 1 - smooth((progress - .57) / .35),
    light: smooth((progress - .56) / .38),
    proof: 1 - smooth(progress / .16),
  };
}
