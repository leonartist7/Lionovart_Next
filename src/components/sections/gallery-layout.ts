/** CSS pixels at the DOM boundary; text and spacing remain in rem/em. */
export const STORY_GALLERY_BREAKPOINT = 1024;
export const STORY_SHORT_HEIGHT = 560;
// Short windows use document flow so the statement, cards and controls
// retain readable sizes instead of competing inside one pinned viewport.
export const STORY_SHORT_QUERY = `(max-height: ${STORY_SHORT_HEIGHT}px)`;
export const STORY_STATIC_QUERY = `(prefers-reduced-motion: reduce), ${STORY_SHORT_QUERY}`;
export const storyGalleryVertical = (width: number) => width <= STORY_GALLERY_BREAKPOINT;

/** A readable pair needs room for captions as well as the projected artwork. */
export function storyGalleryFits({ height, center, separation, cardHeight, captionHeight, rem, navHeight }: {
  height: number; center: number; separation: number; cardHeight: number;
  captionHeight: number; rem: number; navHeight: number;
}) {
  const projection = 1000 / (1000 - (-350 + 1100 * (1 - Math.exp(-.26 * 1.8))));
  const top = center - (separation + cardHeight / 2) * projection;
  const bottom = center + (separation + cardHeight / 2 + captionHeight + .75 * rem) * projection;
  return Number.isFinite(top + bottom) && top >= navHeight + .5 * rem - .5 && bottom <= height - 5.75 * rem + .5;
}

/** Shared geometry keeps the departing services and incoming exhibits on one axis. */
export const GALLERY_ENTRY_PROJECTION = 1.35; // perspective 1000px at translateZ(-350px)
export function galleryLayout(viewportWidth: number, height: number, contentWidth = viewportWidth, rem = 16) {
  const vertical = storyGalleryVertical(viewportWidth);
  const compact = height <= 740 || vertical && height <= 840;
  const captionAllowance = 3.25 * rem, captionGap = .75 * rem;
  const available = Math.max(8 * rem, Math.min(contentWidth - rem, height - 5 * rem));
  const ratio = vertical ? .75 : 11 / 16;
  // Fit the four corners of a single artwork and its caption inside its circle.
  const textHeight = captionAllowance + captionGap;
  const diagonal = Math.max(textHeight, available - 1.5 * rem);
  const panelWidth = Math.min(54 * rem, Math.max(5 * rem,
    (Math.sqrt((1 + ratio ** 2) * diagonal ** 2 - textHeight ** 2) - ratio * textHeight) / (1 + ratio ** 2)));
  const panelTop = 48 - textHeight / 2 / height * 100;
  const gatherY = height * .48 + (height * panelTop / 100 - height * .48) / GALLERY_ENTRY_PROJECTION;
  return { vertical, compact, panelWidth, panelTop, captionAllowance, captionGap,
    captionWidth: panelWidth, gatherY, y: 0 };
}

export function galleryRingDiameter(layout: ReturnType<typeof galleryLayout>, captionHeight = layout.captionAllowance) {
  const height = layout.panelWidth * (layout.vertical ? .75 : 11 / 16) + layout.captionGap + captionHeight;
  return Math.hypot(layout.panelWidth, height) + 2 * layout.captionGap;
}

export const galleryRingCenterOffset = (layout: ReturnType<typeof galleryLayout>, captionHeight = layout.captionAllowance) =>
  (captionHeight + layout.captionGap) / 2;

/** Focus keeps the complete artwork and caption inside the reading viewport.
 * Cache this limit when layout/type changes; scroll and spring frames only interpolate. */
export function galleryFocusDepth(layout: ReturnType<typeof galleryLayout>, width: number, height: number,
  rem: number, captionHeight = layout.captionAllowance, captionWidth = layout.captionWidth) {
  const halfHeight = layout.panelWidth * (layout.vertical ? .75 : 11 / 16) / 2;
  const vanishingY = height * .48;
  const offsetY = height * layout.panelTop / 100 - vanishingY;
  const topReach = halfHeight - offsetY;
  const bottomReach = halfHeight + offsetY + layout.captionGap + captionHeight;
  const projection = Math.max(.1, Math.min(
    (width - 2 * rem) / Math.max(layout.panelWidth, captionWidth),
    (vanishingY - 5.25 * rem) / Math.max(1, topReach),
    (height - 5.75 * rem - vanishingY) / Math.max(1, bottomReach),
  ));
  return Math.min(750, 1000 - 1000 / projection);
}
