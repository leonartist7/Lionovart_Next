const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const p = clamp(n); return p * p * (3 - 2 * p); };
export const GALLERY_DEPTH_STEP = 1600;
export const GALLERY_WALK_END = .76;
export const GALLERY_MAX_PROJECTS = 10;

/** The last viewed service is the first exhibit, with no duplicate across five rows. */
export function galleryWithCarry<T extends { slug: string }>(projects: readonly T[], carry: T) {
  return [carry, ...projects.filter(project => project.slug !== carry.slug)].slice(0, GALLERY_MAX_PROJECTS);
}

/** Other artwork enters only after the carried frame has started opening out. */
export const galleryCompanionPresence = (spread: number) => smooth((spread - .94) / .06);

export function galleryTravel(progress: number, pairs: number) {
  const stops = Math.max(1, pairs);
  const linear = clamp(progress / GALLERY_WALK_END) * (stops + .5);
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
  const dissolve = smooth((advance - .86) / .36);
  const opacity = arrival * (1 - dissolve);
  return {
    // Approach the viewer continuously, then ease into a large reading hold.
    // An asymptote keeps the cards safely behind the perspective plane.
    z: advance <= 0 ? -350 + advance * GALLERY_DEPTH_STEP : -350 + 1100 * (1 - Math.exp(-advance * 1.8)),
    opacity, dissolve, advance,
    surfaceOpacity: arrival * (1 - smooth((advance - 1.10) / .12)),
    visible: advance < 1.22 && arrival > .001,
    // Approach inward, hold the closer pair, then recover the full logo lane.
    preview: smooth((advance + .95) / .8) * (1 - smooth((advance - .60) / .50)),
    background: smooth(-advance / .9),
    outward: smooth((advance - .60) / .50),
    caption: smooth((advance + .25) / .15) * (1 - smooth((advance - .60) / .14)),
  };
}
/** Intro progress belongs to the service/gallery arrival, before row travel. */
export function galleryTitlePose(arrival: number, travel = 0) {
  return {
    z: 0,
    y: 8 * (1 - smooth(arrival / .18)),
    opacity: smooth((arrival - .02) / .16) * (1 - smooth((travel - .045) / .065)),
  };
}
/** Glass thresholds pass around the viewer; the fifth carries the studio red. */
export function galleryRingPose(progress: number, row: number, pairs: number) {
  const advance = galleryTravel(progress, pairs) / GALLERY_DEPTH_STEP - row;
  return {
    z: Math.min(890, -950 + advance * 1700),
    opacity: (.12 + .15 * smooth((advance + .7) / 1.1)) * (1 - smooth((advance - .78) / .3)),
  };
}
export function galleryEnding(progress: number) {
  const departure = 1 - smooth((progress - .64) / .08);
  return {
    logoZ: 2800 * smooth(progress / GALLERY_WALK_END) - 2800,
    logo: smooth((progress - .72) / .08),
    markSettle: smooth((progress - .76) / .1),
    ring: smooth((progress - .73) / .08),
    copy: smooth((progress - .77) / .09),
    links: smooth((progress - .85) / .06),
    header: departure, dock: departure, navigation: departure,
  };
}
export function galleryPairProgress(pair: number, pairs: number) {
  // Land at a close, fully opaque view, rather than the distant entry plane.
  const target = Math.max(0, Math.min(Math.max(1, pairs) - 1, pair)) + .26;
  let low = 0, high = GALLERY_WALK_END;
  for (let step = 0; step < 40; step++) {
    const middle = (low + high) / 2;
    if (galleryTravel(middle, pairs) / GALLERY_DEPTH_STEP < target) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
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
