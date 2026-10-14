export type JourneyGeometry = {
  viewportHeight: number;
  progress: number;
  dockTop: number;
  dockSize: number;
  dockX: number;
  originX: number;
  originY: number;
  railSize: number;
};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const phase = (p: number, start: number, end: number) => ease(clamp((p - start) / (end - start)));

/** Finish step four, settle once beneath the chapter, then hold for the CTA. */
export function processLionPose(g: JourneyGeometry) {
  const progress = clamp(g.progress);
  const center = phase(progress, .16, .46);
  const arrival = center;
  const centerY = mix(g.originY, g.viewportHeight * .28, center);
  return {
    progress,
    arrival,
    // White arrives during travel; the copy waits until the model is settled.
    backgroundReveal: phase(progress, .22, .46),
    chapterOpacity: phase(progress, .38, .46) * (1 - phase(progress, .54, .64)),
    reveal: phase(progress, .64, .76),
    footerProgress: 0,
    processOpacity: 1 - phase(progress, .16, .34),
    x: mix(g.originX, g.dockX, center),
    y: centerY,
    size: mix(g.railSize * 1.02, g.dockSize * .96, arrival),
    turn: mix(.65, 0, center),
    pitch: mix(-.02, -.14, center),
    opacity: mix(.8, 1, center),
  };
}

/** A ring turns into place, holds at the highlight, then resumes after passing. */
export function stepRingRotation(numberY: number, lionY: number, rowHeight: number) {
  const reach = Math.max(72, Math.min(180, rowHeight * .62));
  const distance = numberY - lionY;
  const hold = reach * .28;
  if (Math.abs(distance) <= hold) return 0;
  return -Math.sign(distance) * 28 * ease(clamp((Math.abs(distance) - hold) / (reach * 1.5)));
}

export function stepPassIntensity(numberY: number, lionY: number, rowHeight: number) {
  const reach = Math.max(72, Math.min(180, rowHeight * .62));
  return ease(clamp(1 - Math.abs(numberY - lionY) / reach));
}

/** Complete on reaching the reading line, including skipped scroll positions. */
export function stepHasPassed(numberY: number, lionY: number, rowHeight: number, progress: number) {
  const reach = Math.max(72, Math.min(180, rowHeight * .62));
  return progress >= .16 || numberY <= lionY + reach * .28;
}
