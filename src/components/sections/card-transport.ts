import type { cardHandoff } from './card-handoff';
export type CardRect = { x: number; y: number; width: number; height: number };
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const blend = (a: CardRect, b: CardRect, p: number): CardRect => ({
  x: mix(a.x,b.x,p), y: mix(a.y,b.y,p), width: mix(a.width,b.width,p), height: mix(a.height,b.height,p),
});
/** The original frames gather first, reshape while stacked, then spread to the live service orbit. */
export function cardTransportRect(source: CardRect, sourceCenter: CardRect, service: CardRect,
  serviceCenter: CardRect, index: number, selected: boolean, pose: ReturnType<typeof cardHandoff>) {
  const rear = index === 1 ? 0 : 1;
  const gathered = { x:sourceCenter.x, y:sourceCenter.y+rear*8,
    width:sourceCenter.width*(1-rear*.04), height:sourceCenter.height*(1-rear*.04) };
  const stacked = { x:serviceCenter.x, y:serviceCenter.y+(selected?0:8),
    width:serviceCenter.width*(selected?1:.96), height:serviceCenter.height*(selected?1:.96) };
  return blend(blend(blend(source,gathered,pose.gather),stacked,pose.reshape),service,pose.spread);
}
