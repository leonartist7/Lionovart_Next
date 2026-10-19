export type Exhibit = 'arrival' | 'content' | 'led' | 'work' | 'empty';
export type WorldInput = {
  exhibit: Exhibit; variant: number; enabled: boolean; paused: boolean;
  light: number; rect: { left: number; top: number; width: number; height: number };
  visible: boolean; reduced: boolean; pointer: [number, number];
};
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export const smooth = (n: number) => { const t = clamp01(n); return t * t * (3 - 2 * t); };
export function worldLight(top: number, height: number) {
  return smooth((-top / Math.max(1, height)) / .22);
}
export function fitDistance(width: number, height: number, viewportWidth: number, viewportHeight: number) {
  const vertical = 5.6 * viewportHeight / Math.max(100, height);
  const horizontal = 9.6 * viewportHeight / Math.max(160, width);
  return Math.max(vertical, horizontal) / (2 * Math.tan(35 * Math.PI / 360));
}
