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

/** Pin, fade, center, descend, then reveal. Scrolling back reverses the same route. */
export function processLionPose(g: JourneyGeometry) {
  const progress = clamp(g.progress);
  const center = phase(progress, .08, .4);
  const descend = phase(progress, .4, .72);
  const arrival = phase(progress, .08, .72);
  const centerY = mix(g.originY, g.viewportHeight * .45, center);
  const dockY = g.dockTop + g.dockSize / 2;
  return {
    progress,
    arrival,
    // White arrives during travel; the copy waits until the model is settled.
    backgroundReveal: phase(progress, .22, .72),
    reveal: phase(progress, .8, .96),
    processOpacity: 1 - phase(progress, 0, .28),
    x: mix(g.originX, g.dockX, center),
    y: mix(centerY, dockY, descend),
    size: mix(g.railSize * .88, g.dockSize * .88, arrival),
    turn: mix(.24, .08, arrival),
    pitch: -.02,
  };
}

export function stepPassIntensity(numberY: number, lionY: number, rowHeight: number) {
  const reach = Math.max(72, Math.min(180, rowHeight * .62));
  return ease(clamp(1 - Math.abs(numberY - lionY) / reach));
}
