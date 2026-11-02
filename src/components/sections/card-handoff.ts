const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
/** One reversible story: conviction, signature, expertise. No timer owns a beat. */
export function cardHandoff(top: number, height: number, viewport: number) {
  const progress = clamp((viewport - top) / Math.max(1, height + viewport));
  const statement = 1 - smooth((progress - .46) / .08);
  // Keep the printed card faces intact until the signature has been read.
  const retreat = smooth((progress - .53) / .22);
  const intro = 1 - smooth((progress - .58) / .18);
  const reveal = smooth((progress - .70) / .16);
  return {
    progress,
    retreat,
    lead: smooth(progress / .08) * statement,
    main: smooth((progress - .08) / .10) * statement,
    necessity: smooth((progress - .18) / .10) * statement,
    copy: smooth(progress / .08) * statement,
    brand: smooth((progress - .48) / .10) * (1 - smooth((progress - .68) / .08)),
    expertise: smooth((progress - .76) / .10),
    serviceReveal: reveal,
    serviceCopy: smooth((progress - .86) / .14),
    serviceSides: smooth((progress - .75) / .15),
    focus: smooth((progress - .12) / .18),
    sculpture: 1 - smooth((progress - .12) / .18),
    pointer: 1 - smooth((progress - .52) / .10),
    intro,
    light: smooth((progress - .54) / .38),
    proof: 1 - smooth(progress / .05),
  };
}
