/** Hold the invitation in the upper third; copy and action follow beneath. */
export function partnershipLayout(width: number, height: number) {
  const compact = height <= 740;
  const markSize = Math.min(width * .55, compact ? 176 : 240);
  return {
    markSize,
    markCenter: height * .32,
    copyTop: height * (compact ? .58 : .60),
    ctaBottom: Math.max(32, height * .08),
  };
}

/** A contained disc leaves separate space for its subtitle and action. */
export function partnershipDiscLayout(width: number, height: number, rem = 16) {
  const diameter = Math.min(width - 3 * rem, height * .66, 48 * rem);
  const center = height * .40;
  return { diameter, center, subtitleTop: center + diameter * .76 / 2 + 1.5 * rem };
}
