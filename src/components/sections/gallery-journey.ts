const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const p = clamp(n); return p * p * (3 - 2 * p); };
export const GALLERY_DEPTH_STEP = 1600;
export const GALLERY_WALK_END = .76;
export const GALLERY_MAX_PROJECTS = 8;

export function galleryTravel(progress: number, pairs: number) {
  const stops = Math.max(1, pairs);
  const linear = clamp(progress / GALLERY_WALK_END) * stops;
  // Slow through each reading position, accelerate between rows. The slope
  // stays continuous at every stop, in either direction and under retargeting.
  return (linear - .82 * Math.sin(linear * Math.PI * 2) / (Math.PI * 2)) * GALLERY_DEPTH_STEP;
}
export function galleryProgress(top: number, height: number, viewport: number) {
  return clamp(-top / Math.max(1, height - viewport * .85));
}
export function galleryCardPose(progress: number, pair: number, pairs: number) {
  const advance = galleryTravel(progress, pairs) / GALLERY_DEPTH_STEP - pair;
  // The corridor stays populated behind the current pair. Only the nearest
  // row becomes fully legible; distant previews remain quiet and never play.
  const preview = .18 / (1 + Math.max(0, -advance - .5) * .6);
  const arrival = preview + (1 - preview) * smooth((advance + .85) / .7);
  const dissolve = smooth((advance - .60) / .38);
  const opacity = arrival * (1 - smooth((advance - .60) / .38));
  return {
    // Approach the viewer continuously, then ease into a large reading hold.
    // An asymptote keeps the cards safely behind the perspective plane.
    z: advance <= 0 ? -350 + advance * GALLERY_DEPTH_STEP : -350 + 480 * (1 - Math.exp(-advance * GALLERY_DEPTH_STEP / 480)),
    opacity, dissolve, advance,
    surfaceOpacity: arrival * (1 - smooth((advance - .88) / .1)),
    visible: advance < .98 && arrival > .001,
    background: smooth(-advance / .9),
    outward: smooth((advance - .60) / .38),
    caption: smooth((advance + .25) / .15) * (1 - smooth((advance - .54) / .18)),
  };
}
/** Intro progress belongs to the service/gallery arrival, before row travel. */
export function galleryTitlePose(arrival: number) {
  const approach = smooth((arrival - .25) / .65);
  return {
    z: -360 + 740 * approach,
    y: 10 * (1 - approach),
    opacity: smooth((arrival - .23) / .18) * (1 - smooth((arrival - .62) / .28)),
  };
}
export function galleryEnding(progress: number) {
  const departure = 1 - smooth((progress - .64) / .08);
  return {
    logoZ: 2800 * smooth(progress / GALLERY_WALK_END) - 2800,
    logo: smooth((progress - .1) / .3),
    markSettle: smooth((progress - .76) / .1),
    ring: smooth((progress - .73) / .08),
    copy: smooth((progress - .77) / .09),
    links: smooth((progress - .85) / .06),
    header: departure, dock: departure, navigation: departure,
  };
}
export function galleryPairProgress(pair: number, pairs: number) {
  return Math.max(0, Math.min(Math.max(1, pairs) - 1, pair)) / Math.max(1, pairs) * GALLERY_WALK_END;
}
export function galleryRunwayScreens(pairs: number) {
  return Math.max(5.4, Math.max(1, pairs) * 2.25 + 2.5);
}

export function galleryStepTarget(current: number, requested: number | null, direction: number, pairs: number) {
  return Math.max(0, Math.min(pairs, (requested ?? current) + direction));
}
export function galleryNavigationDuration(distance: number, viewport: number) {
  return Math.max(1.05, Math.min(1.6, .95 + Math.abs(distance) / Math.max(1, viewport) * .16));
}
/** Hermite easing carries existing forward velocity when an arrow is retargeted. */
export function galleryNavigationEase(velocity: number, distance: number, duration: number) {
  const slope = distance ? Math.max(0, Math.min(2.5, velocity * duration / distance)) : 0;
  return (t: number) => {
    const p = clamp(t);
    return (slope - 2) * p ** 3 + (3 - 2 * slope) * p ** 2 + slope * p;
  };
}
