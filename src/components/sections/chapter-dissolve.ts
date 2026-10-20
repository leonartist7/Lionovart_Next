/** Native-scroll opacity: the viewport stage never translates on entry or exit. */
export function chapterOpacity(top: number, bottom: number, height: number) {
  const ease = (n: number) => { const t = Math.min(1, Math.max(0, n)); return t * t * (3 - 2 * t); };
  return ease((height * .65 - top) / (height * .6)) * ease((bottom - height * .35) / (height * .65));
}
