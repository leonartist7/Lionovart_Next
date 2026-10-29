const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };

/** One carried artwork changes owners while stationary; only then does the room open. */
export function serviceGalleryHandoff(galleryTop: number, viewport: number) {
  const progress = clamp((viewport * 1.1 - galleryTop) / Math.max(1, viewport * 1.1));
  const replace = smooth((progress - .50) / .20);
  return {
    progress,
    gather: smooth(progress / .45),
    serviceCopy: 1 - smooth(progress / .27),
    serviceRear: 1 - smooth(progress / .32),
    title: smooth((progress - .32) / .25),
    services: 1 - replace,
    gallery: replace,
    spread: smooth((progress - .72) / .28),
  };
}
