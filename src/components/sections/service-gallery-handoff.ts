const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const p = clamp(value); return p * p * (3 - 2 * p); };

/** The last service's original triptych gathers, holds, then opens into the gallery. */
export function serviceGalleryHandoff(galleryTop: number, viewport: number) {
  const progress = clamp((viewport * 1.1 - galleryTop) / Math.max(1, viewport * 1.1));
  const replace = smooth((progress - .55) / .18);
  return {
    progress,
    gather: smooth(progress / .45),
    serviceCopy: 1 - smooth(progress / .27),
    title: smooth((progress - .32) / .25),
    services: 1 - replace,
    gallery: replace,
    spread: smooth((progress - .67) / .33),
  };
}
