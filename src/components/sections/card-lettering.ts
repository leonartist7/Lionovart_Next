const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Measured glyph widths, in ems, keep the three surviving segments on one baseline.
 * The departing N/A tails are absolute and never change the segment's advance. */
export function cardLettering(width: number, height: number, segments: readonly number[], index: number, assembly: number, portrait = false) {
  const total = segments.reduce((sum, segment) => sum + segment, 0);
  const readingSize = Math.min(72, width * .17);
  const joinedSize = Math.min(72, width * (portrait ? .80 : .48) / Math.max(1, total));
  const size = mix(readingSize, joinedSize, assembly);
  const before = segments.slice(0, index).reduce((sum, segment) => sum + segment, 0);
  const joined = width * .08 + before * size;
  return { size, x: mix(width * .08, joined, assembly), y: mix(height * (portrait ? .78 : .16), height * (portrait ? .78 : .24), assembly) };
}

/** Retire a duplicate only as its actual projected origin meets the next N/A.
 * A scroll reversal restores it along the same path, without a scale collapse. */
export function cardTailOpacity(distance: number, size: number, assembly: number) {
  if (assembly < .9) return 1;
  const p = Math.max(0, Math.min(1, (distance - .5) / Math.max(1, size * .10)));
  return p * p * (3 - 2 * p);
}

