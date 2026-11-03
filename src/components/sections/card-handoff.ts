const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
/** One reversible story: conviction, signature, expertise. No timer owns a beat. */
export function cardHandoff(top: number, height: number, viewport: number) {
  const progress = clamp((viewport - top) / Math.max(1, height + viewport));
  const statement = 1 - smooth((progress - .46) / .08);
  // Keep the printed card faces intact until the signature has been read.
  const gather = smooth((progress - .52) / .14);
  const reshape = smooth((progress - .70) / .10);
  const spread = smooth((progress - .85) / .11);
  const reveal = smooth((progress - .80) / .05);
  return {
    progress,
    gather, reshape, spread,
    benefit: 1 - smooth((progress - .62) / .08),
    lead: smooth(progress / .08) * statement,
    main: smooth((progress - .08) / .10) * statement,
    necessity: smooth((progress - .18) / .10) * statement,
    copy: smooth(progress / .08) * statement,
    brand: smooth((progress - .48) / .10) * (1 - smooth((progress - .68) / .08)),
    expertise: smooth((progress - .86) / .06),
    serviceReveal: reveal,
    serviceCopy: smooth((progress - .94) / .06),
    serviceSides: spread,
    focus: smooth((progress - .12) / .18),
    sculpture: 1 - smooth((progress - .12) / .18),
    pointer: 1 - smooth((progress - .46) / .06),
    intro: 1,
    light: smooth((progress - .54) / .38),
    proof: 1 - smooth(progress / .05),
  };
}
