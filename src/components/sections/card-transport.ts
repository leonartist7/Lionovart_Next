import type { cardHandoff } from './card-handoff';
export type CardRect = { x: number; y: number; width: number; height: number };
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const blend = (a: CardRect, b: CardRect, p: number): CardRect => ({
  x: mix(a.x,b.x,p), y: mix(a.y,b.y,p), width: mix(a.width,b.width,p), height: mix(a.height,b.height,p),
});
/** The original frames meet at the service anchor, then spread to the live service orbit. */
export function cardTransportRect(source: CardRect, sourceCenter: CardRect, service: CardRect,
  serviceCenter: CardRect, pose: ReturnType<typeof cardHandoff>, portrait = false) {
  if (portrait) {
    const gathered = { ...sourceCenter, x: serviceCenter.x, y: serviceCenter.y };
    return blend(blend(blend(source, gathered, pose.gather), serviceCenter, pose.reshape), service, pose.spread);
  }
  // Convergence follows the source row while the shared center and shape ease
  // toward Services. This removes the separate narrow, upright pause.
  const collected = blend(source, sourceCenter, pose.gather);
  const anchor = blend(sourceCenter, serviceCenter, pose.settle);
  const frame = {
    x: anchor.x + collected.x - sourceCenter.x,
    y: anchor.y + collected.y - sourceCenter.y,
    width: mix(collected.width, serviceCenter.width, pose.settle),
    height: mix(collected.height, serviceCenter.height, pose.settle),
  };
  return blend(frame, service, pose.spread);
}


/** Fit the portrait reading stack above its own statement, preserving every aspect ratio. */
export function cardReadingStack(sources: readonly CardRect[], statementTop: number, viewportWidth: number, safeTop = 72, gap = 24) {
  const top = Math.min(...sources.map(r => r.y - r.height / 2));
  const bottom = Math.max(...sources.map(r => r.y + r.height / 2));
  const scale = Math.min(1, Math.max(1, statementTop - gap - safeTop) / Math.max(1, bottom - top));
  const y = Math.max(safeTop, Math.min(top, statementTop - gap - (bottom - top) * scale));
  return sources.map(r => ({
    x: viewportWidth / 2 + (r.x - viewportWidth / 2) * scale,
    y: y + (r.y - top) * scale, width: r.width * scale, height: r.height * scale,
  }));
}

