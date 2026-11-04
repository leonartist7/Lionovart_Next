const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Measured glyph widths, in ems, keep the three surviving segments on one baseline.
 * The departing N/A tails are absolute and never change the segment's advance. */
export function cardLettering(width: number, height: number, segments: readonly number[], index: number, assembly: number) {
  const total = segments.reduce((sum, segment) => sum + segment, 0);
  const size = Math.min(50, width * .11, width * .76 / Math.max(1, total));
  const before = segments.slice(0, index).reduce((sum, segment) => sum + segment, 0);
  const joined = (width - total * size) / 2 + before * size;
  return { size, x: mix(width * .12, joined, assembly), y: mix(height * .74, height * .50, assembly) };
}
