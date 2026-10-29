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
