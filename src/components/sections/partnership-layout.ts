/** The ending keeps its title, invitation and result action in separate reading areas. */
export function partnershipLayout(width: number, height: number) {
  const compact = height <= 740;
  const markSize = Math.min(width * .55, compact ? 176 : 240);
  return {
    markSize,
    markDrop: height * .24,
    copyTop: height * (compact ? .18 : .24),
    ctaBottom: Math.max(32, height * .08),
  };
}
