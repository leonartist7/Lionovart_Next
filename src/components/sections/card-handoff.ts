const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };
/** Named intervals share one native scroll coordinate in both directions. */
export const CARD_POSES = {
  read: [0.28, 0.815],
  gather: [0.585, 0.695],
  resolve: [0.695, 0.77],
  hold: [0.77, 0.815],
  services: [0.845, 0.965],
} as const;
const interval = (p: number, [start, end]: readonly [number, number]) => smooth((p - start) / (end - start));
/** One reversible story: conviction, signature, expertise. No timer owns a beat. */
export function cardHandoff(top: number, height: number, viewport: number) {
  const progress = clamp((viewport - top) / Math.max(1, height + viewport));
  const statement = 1 - smooth((progress - CARD_POSES.read[1]) / .08);
  // Keep the printed card faces intact until the signature has been read.
  const gather = interval(progress, CARD_POSES.gather);
  const reshape = interval(progress, CARD_POSES.resolve);
  const spread = interval(progress, CARD_POSES.services);
  const reveal = smooth((progress - .83) / .09);
  return {
    progress,
    gather, reshape, spread,
    reading: smooth(progress / .18),
    identity: 1 - reveal,
    objects: 1 - reveal,
    white: smooth((progress - .53) / .105),
    assembly: smooth((progress - .60) / .11),
    material: 1 - smooth((progress - .635) / .06),
    wordmark: smooth((progress - .69) / .06) * (1 - smooth((progress - .815) / .055)),
    benefit: 1 - smooth((progress - .575) / .055),
    lead: smooth((progress - .04) / .08) * statement,
    main: smooth((progress - .12) / .10) * statement,
    strike: smooth((progress - .23) / .07),
    claim: smooth((progress - .30) / .10),
    necessity: smooth((progress - .30) / .10) * statement,
    copy: smooth((progress - .04) / .08) * statement,
    brand: 0,
    expertise: smooth((progress - .905) / .045),
    serviceReveal: reveal,
    serviceCopy: smooth((progress - .95) / .05),
    serviceSides: spread,
    focus: smooth((progress - .12) / .18),
    sculpture: 1 - smooth((progress - .53) / .055),
    pointer: 1 - smooth((progress - .53) / .055),
    intro: 1,
    light: smooth((progress - .62) / .30),
    proof: 1 - smooth(progress / .05),
  };
}



