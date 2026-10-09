export type JourneyGeometry = {
  viewportHeight: number;
  closingTop: number;
  dockTop: number;
  dockSize: number;
  dockX: number;
  originX: number;
  originY: number;
  railSize: number;
  actionBottom: number;
};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const phase = (p: number, start: number, end: number) => ease(clamp((p - start) / (end - start)));

/** Scroll forward/reverse along one route; the final pose matches the real CTA dock. */
export function processLionPose(g: JourneyGeometry) {
  const dockY = g.dockTop + g.dockSize / 2;
  const remaining = dockY - g.viewportHeight * .72;
  const elapsed = g.viewportHeight * .65 - g.closingTop;
  const runway = Math.max(1, elapsed + remaining);
  const progress = clamp(elapsed / runway);
  const travel = ease(progress);
  const y = progress >= 1 ? dockY : progress > 0
    ? mix(g.viewportHeight * .45, g.viewportHeight * .72, travel) : g.originY;
  // Stay in the left gutter until the CTA's action clears the model.
  // The lion never crosses readable copy or the project button.
  const finalSize = g.dockSize * .88;
  const clearance = ease(clamp((y - finalSize / 2 - g.actionBottom) / Math.max(64, g.dockSize * .6)));
  const arrival = travel * clearance;
  return {
    progress,
    arrival,
    reveal: phase(progress, 0, .6),
    processOpacity: 1 - phase(progress, 0, .4),
    x: mix(g.originX, g.dockX, arrival),
    y,
    size: mix(g.railSize * .88, finalSize, arrival),
    turn: mix(.24, .08, arrival),
    pitch: -.02,
  };
}

export function stepPassIntensity(numberY: number, lionY: number, rowHeight: number) {
  const reach = Math.max(72, Math.min(180, rowHeight * .62));
  return ease(clamp(1 - Math.abs(numberY - lionY) / reach));
}
