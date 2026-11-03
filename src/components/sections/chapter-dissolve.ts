const smooth = (n: number) => { const t = Math.min(1, Math.max(0, n)); return t * t * (3 - 2 * t); };
/** Adjacent chapters share the same boundary and complementary dissolve. */
export function chapterOpacity(top: number, bottom: number, height: number) {
  const incoming = smooth((height * .75 - top) / Math.max(1, height * .5));
  const outgoing = 1 - smooth((height * .75 - bottom) / Math.max(1, height * .5));
  return incoming * outgoing;
}
