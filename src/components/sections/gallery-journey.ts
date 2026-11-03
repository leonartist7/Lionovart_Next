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
  // Slow through each reading position, accelerate between projects. The slope
  // stays continuous at every stop, in either direction and under retargeting.
  return (linear - .35 * Math.sin(linear * Math.PI * 2) / (Math.PI * 2)) * GALLERY_DEPTH_STEP;
}
export function galleryProgress(top: number, height: number, viewport: number) {
  return clamp(-top / Math.max(1, height - viewport * .85));
}
/** One readable exhibit at a time; departure travels through the viewing plane. */
export function galleryCardPose(progress: number, index: number, count: number) {
  const advance = galleryTravel(progress, count) / GALLERY_DEPTH_STEP - index;
  const approach = smooth((advance + .16) / .16);
  const hold = smooth(advance / .26);
  const departure = clamp((advance - .36) / .60);
  const forward = Math.expm1(3.5 * departure) / Math.expm1(3.5);
  const dissolve = smooth((advance - .82) / .36);
  const opacity = approach * (1 - smooth((advance - .99) / .20));
  const z = -350 - 480 * (1 - approach) + 350 * hold + 900 * forward;
  return { advance, z, forward, dissolve, opacity, visible: opacity > .001,
    caption: approach * (1 - smooth((advance - .34) / .18)) };
}

/** The next two rings remain ahead of the exhibit, on the same vanishing point. */
export function galleryRingPose(progress: number, index: number, count: number) {
  const pose = galleryCardPose(progress, index, count);
  const z = pose.advance < -.16 ? -830 + (pose.advance + .16) * GALLERY_DEPTH_STEP : pose.z;
  const opacity = .45 * smooth((pose.advance + 2.25) / .65) * (1 - smooth((pose.advance - .94) / .10));
  return { z, opacity, visible: opacity > .001 };
}

/** The title holds inside a contained red disc, then the disc contracts for the signature. */
export function galleryEnding(progress: number) {
  const departure = 1 - smooth((progress - .71) / .05);
  const approach = smooth((progress - .73) / .06);
  const settle = smooth((progress - .85) / .055);
  return {
    core: smooth((progress - .70) / .035),
    coreScale: .22 + .78 * approach - .24 * settle,
    title: smooth((progress - .79) / .025),
    markSettle: settle,
    logo: 1,
    copy: smooth((progress - .805) / .025),
    links: 0,
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

