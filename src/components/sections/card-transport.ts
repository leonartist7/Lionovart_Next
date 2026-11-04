import type { cardHandoff } from './card-handoff';
export type CardRect = { x: number; y: number; width: number; height: number };
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const blend = (a: CardRect, b: CardRect, p: number): CardRect => ({
  x: mix(a.x,b.x,p), y: mix(a.y,b.y,p), width: mix(a.width,b.width,p), height: mix(a.height,b.height,p),
});
/** The original frames gather first, reshape while stacked, then spread to the live service orbit. */
export function cardTransportRect(source: CardRect, sourceCenter: CardRect, service: CardRect,
  serviceCenter: CardRect, index: number, selected: boolean, pose: ReturnType<typeof cardHandoff>) {
  // Rise into the live service anchor during collection. Reshaping and opening
  // then share that same center; the front frame cannot drift during the reveal.
  const gathered = { ...sourceCenter, x: serviceCenter.x, y: serviceCenter.y };
  const stacked = { ...serviceCenter };
  return blend(blend(blend(source,gathered,pose.gather),stacked,pose.reshape),service,pose.spread);
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

