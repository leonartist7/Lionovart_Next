const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
/** One reversible story: conviction, signature, expertise. No timer owns a beat. */
export function cardHandoff(top: number, height: number, viewport: number) {
  const progress = clamp((viewport - top) / Math.max(1, height + viewport));
  const statement = 1 - smooth((progress - .46) / .08);
  const reveal = smooth((progress - .76) / .20);
  return {
    progress,
    move: smooth(progress / .28),
    lead: smooth(progress / .08) * statement,
    main: smooth((progress - .08) / .10) * statement,
    necessity: smooth((progress - .18) / .10) * statement,
    copy: smooth(progress / .08) * statement,
    brand: smooth((progress - .48) / .10) * (1 - smooth((progress - .68) / .08)),
    expertise: smooth((progress - .76) / .10),
    serviceReveal: reveal,
    serviceCopy: smooth((progress - .86) / .14),
    serviceSides: reveal,
    rear: 1,
    // The same artwork fills the face before reshaping; its pixels never stretch.
    artwork: smooth((progress - .58) / .10),
    fit: smooth((progress - .68) / .24),
    dissolve: reveal,
    focus: smooth((progress - .12) / .18),
    sculpture: 1 - smooth((progress - .12) / .18),
    pointer: 1 - smooth((progress - .68) / .14),
    intro: 1 - reveal,
    light: smooth((progress - .54) / .38),
    proof: 1 - smooth(progress / .05),
  };
}
