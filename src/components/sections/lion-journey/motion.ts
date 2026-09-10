/** Document-space route shared by the lion, GPU stream and static fallback. */
export const SILK_LAG = 0.08;
export const CLEARANCE = 32;
export const SPLIT_START = 0.08;
export const SPLIT_END = 0.58;
export type Rect = { left: number; top: number; width: number; height: number };
export type Point = { x: number; y: number };
export type Anchors = { slot: Rect; copy: Rect; intro: Rect; video: Rect; hero: Rect; videoSection: Rect; proof: Rect; bridge: Rect; reveal: Rect; start?: number; end: number; mobile: boolean };
export type Pose = Point & { size: number; turn: number };
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
export function journeyProgress(scroll: number, a: Anchors) {
  const start = a.start ?? a.hero.top;
  return clamp((scroll - start) / Math.max(1, a.end - start));
}
export function journeyRoute(a: Anchors): Point[] {
  const w = a.hero.width, left = a.hero.left;
  return [
    { x: a.slot.left + a.slot.width / 2, y: a.slot.top + a.slot.height / 2 },
    { x: left + w * (a.mobile ? 0.8 : 0.79), y: a.intro.top + a.intro.height * 0.24 },
    { x: a.video.left + a.video.width * 0.74, y: a.video.top + a.video.height * 0.48 },
    { x: left + w * 0.16, y: a.videoSection.top + a.videoSection.height * 0.72 },
    { x: left + w * 0.22, y: a.proof.top + a.proof.height * 0.5 },
    { x: left + w * 0.8, y: a.bridge.top + a.bridge.height * 0.48 },
    { x: left + w * 0.2, y: a.reveal.top + a.reveal.height * 0.68 },
  ];
}
/** Shape-preserving cubic Hermite spline: continuous tangents without overshoot. */
export function routePoint(points: Point[], progress: number): Point {
  const scaled = clamp(progress) * (points.length - 1), i = Math.min(points.length - 2, Math.floor(scaled)), t = scaled - i;
  const slope = (j: number, key: keyof Point) => {
    if (j === 0) return points[1][key] - points[0][key];
    if (j === points.length-1) return points[j][key] - points[j-1][key];
    const a = points[j][key]-points[j-1][key], b = points[j+1][key]-points[j][key];
    return a*b <= 0 ? 0 : 2*a*b/(a+b);
  };
  const coordinate = (key: keyof Point) => (2*t*t*t-3*t*t+1)*points[i][key]
    +(t*t*t-2*t*t+t)*slope(i,key)+(-2*t*t*t+3*t*t)*points[i+1][key]
    +(t*t*t-t*t)*slope(i+1,key);
  return { x: coordinate("x"), y: coordinate("y") };
}
export function journeyPose(progress: number, a: Anchors): Pose {
  const p = clamp(progress), points = journeyRoute(a);
  const size = Math.min(a.slot.height * 0.86, a.mobile ? a.slot.width * 1.05 : 430);
  const endSize = Math.min(size * 0.82, a.video.height * 0.75, a.video.width * 0.4);
  return { ...routePoint(points, p * 2 / (points.length - 1)), size: mix(size, endSize, ease(clamp((p - 0.72)/0.28))), turn: mix(0.4, -0.4, ease(clamp(p/0.52))) };
}
