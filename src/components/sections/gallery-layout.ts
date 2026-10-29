/** Shared geometry keeps the departing services and incoming exhibits on one axis. */
export const GALLERY_ENTRY_PROJECTION = 1.35; // perspective 1000px at translateZ(-350px)
export function galleryLayout(viewportWidth: number, height: number, contentWidth = viewportWidth) {
  const vertical = viewportWidth <= 1024;
  const compact = height <= 740 || vertical && height <= 840;
  const panelWidth = vertical ? Math.min(contentWidth * .82, height * (compact ? .36 : .46), 544) : Math.min(contentWidth * .37, height * .68, 720);
  const panelTop = vertical ? (compact ? 43 : 48) : 54;
  const centerGap = Math.min(260, Math.max(160, contentWidth * .17));
  const x = vertical ? 0 : panelWidth * .5 + centerGap * GALLERY_ENTRY_PROJECTION / 2;
  const y = vertical ? Math.min(height * (compact ? .20 : .21), panelWidth * .375 + 40) : 0;
  return {
    vertical, compact, panelWidth, panelTop, centerGap: vertical ? 0 : centerGap,
    backgroundX: vertical ? Math.min(contentWidth * .34, 240) : 0,
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
