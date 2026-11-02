const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };

export const doorwayTitleOpacity = (p: number) => smooth((p - .39) / .10) * (1 - smooth((p - .59) / .09));

/** One carried artwork changes owners while stationary; only then does the room open. */
export function serviceGalleryHandoff(galleryTop: number, viewport: number) {
  const progress = clamp((viewport * 1.1 - galleryTop) / Math.max(1, viewport * 1.1));
  const replace = smooth((progress - .56) / .16);
  return {
    progress,
    gather: smooth(progress / .45),
    serviceCopy: 1 - smooth(progress / .27),
    serviceRear: 1 - smooth(progress / .32),
    title: doorwayTitleOpacity(progress),
    podiumLift: smooth((progress - .10) / .28),
    podiumFace: smooth((progress - .10) / .28),
    portalOpen: smooth((progress - .68) / .16),
    portalPass: smooth((progress - .68) / .32),
    services: 1 - replace,
    gallery: replace,
    spread: smooth((progress - .72) / .28),
  };
}
