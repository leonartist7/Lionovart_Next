/** CSS pixels at the DOM boundary; text and spacing remain in rem/em. */
export const STORY_GALLERY_BREAKPOINT = 1024;
export const STORY_SHORT_HEIGHT = 560;
export const STORY_STATIC_QUERY = `(prefers-reduced-motion: reduce), (max-height: ${STORY_SHORT_HEIGHT}px)`;
export const storyGalleryVertical = (width: number) => width <= STORY_GALLERY_BREAKPOINT;

/** A readable pair needs room for captions as well as the projected artwork. */
export function storyGalleryFits({ height, center, separation, cardHeight, captionHeight, rem, navHeight }: {
  height: number; center: number; separation: number; cardHeight: number;
  captionHeight: number; rem: number; navHeight: number;
}) {
  const projection = 1000 / (1000 - (-350 + 1100 * (1 - Math.exp(-.26 * 1.8))));
  const top = center - (separation + cardHeight / 2) * projection;
  const bottom = center + (separation + cardHeight / 2 + captionHeight + .75 * rem) * projection;
  return Number.isFinite(top + bottom) && top >= navHeight + .5 * rem && bottom <= height - 5.75 * rem;
}

/** Shared geometry keeps the departing services and incoming exhibits on one axis. */
export const GALLERY_ENTRY_PROJECTION = 1.35; // perspective 1000px at translateZ(-350px)
export function galleryLayout(viewportWidth: number, height: number, contentWidth = viewportWidth, rem = 16) {
  const vertical = storyGalleryVertical(viewportWidth);
  const compact = height <= 740 || vertical && height <= 840;
  const panelWidth = vertical ? Math.min(contentWidth * .82, height * (compact ? .36 : .46), 544) : Math.min(contentWidth * .37, height * .68, 720);
  const panelTop = vertical ? (compact ? 40 : 43) : 40;
  const centerGap = Math.min(260, Math.max(160, contentWidth * .17));
  const x = vertical ? 0 : panelWidth * .5 + centerGap * GALLERY_ENTRY_PROJECTION / 2;
  const previewInset = vertical ? 0 : centerGap * .55;
  const y = vertical ? Math.min(height * (compact ? .20 : .21), panelWidth * .375 + 40) : 0;
  return {
    vertical, compact, panelWidth, panelTop, centerGap: vertical ? 0 : centerGap,
    // Preview, reading and departure share the same axis on every device.
    backgroundX: 0,
    backgroundY: vertical ? height * .24 : 0,
    backgroundRise: 0,
    captionWidth: vertical ? Math.max(1, contentWidth - 2 * rem) * .9 : panelWidth,
    previewInset,
    entryX: x - previewInset,
    x,
    exitX: vertical ? 0 : x + Math.min(20, contentWidth * .012),
    // Cap the separation on very tall phones so the middle never becomes empty space.
    y,
    exitY: vertical ? y + Math.min(24, height * .035) : 0,
    // The incoming frame is projected around the corridor's 48% vanishing
    // point on both axes/layouts. Match its rendered center, not its CSS top.
    gatherY: height * (.48 + (panelTop / 100 - .48) / GALLERY_ENTRY_PROJECTION),
  };
}

/** One circle encloses a pair and its captions at the close navigation stop.
 * Compensate the ring's 80px setback so its projected edge clears the corners. */
export function galleryRingDiameter(layout: ReturnType<typeof galleryLayout>) {
  const depth = -350 + 1100 * (1 - Math.exp(-.26 * 1.8));
  const x = layout.x - layout.previewInset * (1000 - depth) / 1350 - (depth + 350) / 2000 * layout.centerGap;
  const width = layout.vertical ? Math.max(layout.panelWidth, layout.captionWidth) : 2 * x + layout.panelWidth;
  const height = 2 * layout.y + layout.panelWidth * (layout.vertical ? .75 : 11 / 16) + 50;
  return Math.hypot(width, height) * (1080 - depth) / (1000 - depth) + 48 * (1080 - depth) / 1000;
}
