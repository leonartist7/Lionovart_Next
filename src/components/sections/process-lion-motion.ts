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

/** Finish step four, center with the chapter title, descend, then reveal. */
export function processLionPose(g: JourneyGeometry) {
  const progress = clamp(g.progress);
  const center = phase(progress, .16, .46);
  const descend = phase(progress, .54, .7);
  const arrival = phase(progress, .16, .7);
  const centerY = mix(g.originY, g.viewportHeight * .68, center);
  const dockY = g.dockTop + g.dockSize / 2;
  return {
    progress,
    arrival,
    // White arrives during travel; the copy waits until the model is settled.
    backgroundReveal: phase(progress, .22, .46),
    chapterOpacity: phase(progress, .38, .46) * (1 - phase(progress, .56, .66)),
    reveal: phase(progress, .76, .88),
    footerProgress: 0,
    processOpacity: 1 - phase(progress, .16, .34),
    x: mix(g.originX, g.dockX, center),
    y: mix(centerY, dockY, descend),
    size: mix(g.railSize * .88, g.dockSize * .88, arrival),
    turn: mix(.65, 0, center),
    pitch: -.02,
  };
}

/** Continue the same mesh into the footer, turning gently toward its copy. */
export function footerLionPose(pose: ReturnType<typeof processLionPose>, footer: {
  progress: number; x: number; y: number; size: number;
}) {
  const progress = clamp(footer.progress);
  const travel = ease(progress);
  return {
    ...pose,
    footerProgress: progress,
    x: mix(pose.x, footer.x, travel),
    y: mix(pose.y, footer.y, travel),
    size: mix(pose.size, footer.size * .88, travel),
    turn: mix(pose.turn, -.32, travel),
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
