const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const p = clamp(n); return p * p * (3 - 2 * p); };
export const GALLERY_DEPTH_STEP = 1600;
export const GALLERY_WALK_END = .76;
export const GALLERY_MAX_PROJECTS = 10;

/** The last viewed service is the first exhibit, with no duplicate across the gallery. */
export function galleryWithCarry<T extends { slug: string }>(projects: readonly T[], carry: T) {
  return [carry, ...projects.filter(project => project.slug !== carry.slug)].slice(0, GALLERY_MAX_PROJECTS);
}

export function galleryTravel(progress: number, projectCount: number) {
  const stops = Math.max(1, projectCount);
  const linear = clamp(progress / GALLERY_WALK_END) * (stops + .5);
  // Slow through each reading position, accelerate between rows. The slope
  // stays continuous at every stop, in either direction and under retargeting.
  return (linear - .82 * Math.sin(linear * Math.PI * 2) / (Math.PI * 2)) * GALLERY_DEPTH_STEP;
}
export function galleryProgress(top: number, height: number, viewport: number) {
  return clamp(-top / Math.max(1, height - viewport * .85));
}
/** The next work enters only after the previous work and its ring have gone. */
export function galleryCardPose(progress: number, index: number, count: number) {
  const advance = galleryTravel(progress, count) / GALLERY_DEPTH_STEP - index;
  const approach = smooth((advance + .18) / .18);
  const hold = smooth(clamp(advance / .26));
  const departure = clamp((advance - .36) / .46);
  const outward = Math.expm1(3.5 * departure) / Math.expm1(3.5);
  const opacity = approach * (1 - smooth((advance - .70) / .12));
  const z = -350 - 480 * (1 - approach) + 350 * hold + 440 * outward;
  return { advance, z, outward, opacity, visible: opacity > .001,
    caption: approach * (1 - smooth((advance - .37) / .19)) };
}
export function galleryEnding(progress: number) {
  const departure = 1 - smooth((progress - .71) / .05);
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
export function galleryProjectProgress(index: number, projectCount: number) {
  // Land at a close, fully opaque view, rather than the distant entry plane.
  const target = Math.max(0, Math.min(Math.max(1, projectCount) - 1, index)) + .26;
  let low = 0, high = GALLERY_WALK_END;
  for (let step = 0; step < 40; step++) {
    const middle = (low + high) / 2;
    if (galleryTravel(middle, projectCount) / GALLERY_DEPTH_STEP < target) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}
export function galleryRunwayScreens(projectCount: number) {
  return Math.max(5.4, Math.max(1, projectCount) * 1.28 + 2.5);
}

export function galleryStepTarget(current: number, requested: number | null, direction: number, projectCount: number) {
  return Math.max(0, Math.min(projectCount, (requested ?? current) + direction));
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
