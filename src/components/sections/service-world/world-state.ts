export type Exhibit = 'arrival' | 'brand' | 'digital' | 'spaces' | 'systems' | 'content' | 'led' | 'work' | 'empty';
export type WorldInput = {
  exhibit: Exhibit; variant: number; enabled: boolean; paused: boolean;
  work: { id: string; poster: string } | null;
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

/** Contain portrait, square and wide project art without cropping or stretching. */
export function fitArtwork(aspect: number, width = 6.6, height = 3.71) {
  const ratio = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9;
  return ratio > width / height ? [width, width / ratio] as const : [height * ratio, height] as const;
}

/** Place foreground displays without ever moving the persistent room camera. */
export function exhibitPlacement(rect: WorldInput['rect'], viewportWidth: number, viewportHeight: number) {
  const distance = Math.hypot(24, 3.84);
  const viewHeight = 2 * distance * Math.tan(35 * Math.PI / 360);
  return {
    scale: distance / fitDistance(rect.width, rect.height, viewportWidth, viewportHeight),
    x: (rect.left + rect.width / 2 - viewportWidth / 2) * viewHeight / viewportHeight,
    y: (viewportHeight / 2 - rect.top - rect.height * .51) * viewHeight / viewportHeight,
  };
}
