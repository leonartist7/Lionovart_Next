/** Shared scroll geometry for the hero, lion, and head orbit. */
export const SPLIT_START = 0.48;
export const SPLIT_END = 0.8;
export type Rect = { left: number; top: number; width: number; height: number };
export type Point = { x: number; y: number };
export type Anchors = { slot: Rect; cta?: Rect; copy: Rect; video: Rect; hero: Rect; videoSection: Rect; proof: Rect; bridge: Rect; reveal: Rect; end: number; mobile: boolean };
export type Pose = Point & { size: number; turn: number; pitch?: number };
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

export function journeyProgress(scroll: number, a: Anchors) {
  return clamp((scroll - a.hero.top) / Math.max(1, a.end - a.hero.top));
}

export function journeyRoute(a: Anchors): Point[] {
  const start = { x: a.slot.left + a.slot.width / 2, y: a.slot.top + a.slot.height / 2 };
  // The lion crosses the hero at its opening height; the expanding film
  // overtakes it instead of the lion dropping toward the film.
  const target = { x: a.video.left + a.video.width / 2, y: start.y - Math.min(24, a.hero.height * .025) };
  return [
    start,
    { x: mix(start.x, target.x, .55), y: mix(start.y, target.y, .55) },
    target,
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
  const p = ease(clamp(progress));
  const size = Math.min(a.slot.height * .86, a.slot.width * .96, 760);
  const endSize = Math.min(size * 1.2, a.video.height * .98, a.video.width * .5);
  return {
    ...routePoint(journeyRoute(a), p),
    size: mix(size, endSize, ease(clamp((progress - .38) / .62))),
    turn: mix(.4, 0, p),
    pitch: mix(0, -.1, p),
  };
}

/** True only after the opaque joined film covers the visible mane. */
export function lionCoveredByFrame(lion: Pose, scroll: number, frame: Rect) {
  const radius = lion.size * .45;
  const screenY = lion.y - scroll;
  return frame.left <= lion.x - radius && frame.left + frame.width >= lion.x + radius
    && frame.top <= screenY - radius && frame.top + frame.height >= screenY + radius;
}

/** A single tilted orbit around the mane, clear of the headline and CTA. */
export function goldRoute(a: Anchors): Point[] {
  const lion = journeyPose(0, a);
  const radiusX = Math.min(lion.size * .49, lion.x - 12, a.hero.left + a.hero.width - lion.x - 12);
  const centerY = lion.y + lion.size * .22;
  const radiusY = Math.min(lion.size * .27, Math.max(12, (a.cta?.top ?? a.hero.top + a.hero.height) - centerY - 22));
  const tilt = a.mobile ? .1 : .13;
  return Array.from({ length: 17 }, (_, index) => {
    const angle = (index / 16) * Math.PI * 2 + Math.PI * .75;
    return {
      x: lion.x + Math.cos(angle) * radiusX,
      y: centerY + Math.sin(angle) * radiusY + Math.cos(angle) * radiusX * tilt,
    };
  });
}

/** Sticky screen position becomes a document position by adding the pin offset. */
export function openingPose(scroll: number, anchors: Anchors, opening: Rect, stageHeight: number): Pose {
  const runway = Math.max(1, opening.height - stageHeight);
  const local = clamp((scroll - opening.top) / runway);
  const travel = clamp(local / .49);
  const pose = journeyPose(travel, anchors);
  return { ...pose, y: pose.y + clamp(scroll - opening.top, 0, runway) };
}
