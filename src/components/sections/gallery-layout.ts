/** Shared geometry keeps the departing services and incoming exhibits on one axis. */
export const GALLERY_ENTRY_PROJECTION = 1.35; // perspective 1000px at translateZ(-350px)
export function galleryLayout(viewportWidth: number, height: number, contentWidth = viewportWidth) {
  const vertical = viewportWidth <= 1024;
  const compact = height <= 740 || vertical && height <= 840;
  const panelWidth = vertical ? Math.min(contentWidth * .82, height * (compact ? .36 : .46), 544) : Math.min(contentWidth * .44, height * .68, 640);
  const panelTop = vertical ? (compact ? 43 : 48) : 54;
  return {
    vertical, compact, panelWidth, panelTop,
    x: vertical ? 0 : panelWidth * .5 + Math.min(40, Math.max(20, contentWidth * .02)),
    exitX: vertical ? 0 : contentWidth * .33 * 1.18,
    // Cap the separation on very tall phones so the middle never becomes empty space.
    y: vertical ? Math.min(height * (compact ? .20 : .21), panelWidth * .375 + 40) : 0,
    exitY: vertical ? height * .34 : 0,
    // The incoming frame is projected around the corridor's 48% vanishing
    // point on both axes/layouts. Match its rendered center, not its CSS top.
    gatherY: height * (.48 + (panelTop / 100 - .48) / GALLERY_ENTRY_PROJECTION),
  };
}
