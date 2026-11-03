import type { cardHandoff } from './card-handoff';
export type CardRect = { x: number; y: number; width: number; height: number };
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const blend = (a: CardRect, b: CardRect, p: number): CardRect => ({
  x: mix(a.x,b.x,p), y: mix(a.y,b.y,p), width: mix(a.width,b.width,p), height: mix(a.height,b.height,p),
});
/** The original frames gather first, reshape while stacked, then spread to the live service orbit. */
export function cardTransportRect(source: CardRect, sourceCenter: CardRect, service: CardRect,
  serviceCenter: CardRect, index: number, selected: boolean, pose: ReturnType<typeof cardHandoff>) {
  const gathered = { ...sourceCenter };
  const stacked = { ...serviceCenter };
  return blend(blend(blend(source,gathered,pose.gather),stacked,pose.reshape),service,pose.spread);
}

