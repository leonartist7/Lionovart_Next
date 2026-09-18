/** Document-space route shared by the lion, GPU stream and static fallback. */
export const SILK_LAG = 0.08;
export const CLEARANCE = 32;
export const SPLIT_START = 0.08;
export const SPLIT_END = 0.58;
export type Rect = { left: number; top: number; width: number; height: number };
export type Point = { x: number; y: number };
export type Anchors = { slot: Rect; cta?: Rect; copy: Rect; intro: Rect; video: Rect; hero: Rect; videoSection: Rect; proof: Rect; bridge: Rect; reveal: Rect; start?: number; end: number; mobile: boolean };
export type Pose = Point & { size: number; turn: number; pitch?: number };
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
export function journeyProgress(scroll: number, a: Anchors) {
  const start = a.start ?? a.hero.top;
  return clamp((scroll - start) / Math.max(1, a.end - start));
}
/** Leave a quiet entrance before the partnership statement. */
export const streamEnd = (a: Anchors) => a.bridge.top - (a.mobile ? 64 : 96);
export function journeyRoute(a: Anchors): Point[] {
  const w = a.hero.width, left = a.hero.left;
  return [
    { x: a.slot.left + a.slot.width / 2, y: a.slot.top + a.slot.height / 2 },
    { x: left + w * (a.mobile ? 0.8 : 0.79), y: a.intro.top + a.intro.height * 0.24 },
    // The lion moves from its right-side profile into the visual centre of
    // the film before it disappears, rather than slipping off-axis.
    { x: a.video.left + a.video.width * 0.5, y: a.video.top + a.video.height * 0.48 },
    { x: left + w * 0.16, y: a.videoSection.top + a.videoSection.height * 0.72 },
    { x: left + w * 0.25, y: streamEnd(a) },
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
  const size = Math.min(a.slot.height * 0.86, a.slot.width * .96, 760);
  const endSize = Math.min(size * 0.82, a.video.height * 0.75, a.video.width * 0.4);
  // Treat orientation as three intentional visual beats, instead of a single
  // interpolation: profile right in the hero, profile left by the title, then
  // forward and slightly upward as the lion sinks into the film.
  const titleBeat = 0.48;
  const turn = p <= titleBeat
    ? mix(0.4, -0.42, ease(clamp(p / titleBeat)))
    : mix(-0.42, 0, ease(clamp((p - titleBeat) / (1 - titleBeat))));
  return {
    ...routePoint(points, p * 2 / (points.length - 1)),
    size: mix(size, endSize, ease(clamp((p - 0.72)/0.28))),
    turn,
    // A small negative X rotation lifts the muzzle toward the viewer while
    // keeping the face front-on when it passes behind the video.
    pitch: mix(0, -0.13, ease(clamp((p - 0.58) / 0.42))),
  };
}

/** Gold begins at the invitation; the lion retains its independent route. */
export function goldRoute(a: Anchors): Point[] {
  const points = journeyRoute(a);
  const cta = a.cta ?? a.slot;
  points[0] = { x: cta.left + cta.width / 2, y: cta.top + cta.height };
  points[points.length - 1] = { x: a.hero.left + a.hero.width / 2, y: streamEnd(a) };
  return points;
}

export type OpeningMode = "current" | "pause" | "pinned";
/** A scroll hold, so reversing direction follows the same route. */
export function pauseProgress(progress: number) {
  const p = clamp(progress);
  return p < .42 ? p / .42 * .5 : p <= .58 ? .5 : .5 + (p - .58) / .42 * .5;
}

export function openingPose(scroll: number, anchors: Anchors, opening: Rect, stageHeight: number): Pose {
  const runway = Math.max(1, opening.height - stageHeight);
  const local = clamp((scroll - opening.top) / runway);
  const travel = ease(clamp((local - .2) / .44));
  const initial = journeyPose(0, anchors);
  const points = journeyRoute(anchors);
  const offset = clamp(scroll - opening.top, 0, runway);
  const settled = { x: points[1].x, y: points[1].y + runway, size: initial.size * .72, turn: -0.42, pitch: 0 };
  if (scroll <= opening.top + runway) return {
    x: mix(initial.x, points[1].x, travel),
    y: mix(initial.y, points[1].y, travel) + offset,
    size: mix(initial.size, settled.size, travel),
    turn: mix(initial.turn, settled.turn, travel),
    pitch: mix(initial.pitch ?? 0, settled.pitch, travel),
  };
  const remaining = ease(clamp((scroll - opening.top - runway) / Math.max(1, anchors.end - opening.top - runway)));
  const end = journeyPose(1, anchors);
  return {
    x: mix(settled.x, end.x, remaining),
    y: mix(settled.y, end.y, remaining),
    size: mix(settled.size, end.size, remaining),
    turn: mix(settled.turn, end.turn, remaining),
    pitch: mix(settled.pitch, end.pitch ?? 0, remaining),
  };
}

/** Separate copy beats: outgoing text is gone before the next title enters. */
export function openingCopyState(progress: number) {
  return { hero: 1 - ease(clamp((progress - .16) / .2)), intro: ease(clamp((progress - .44) / .2)) };
}
