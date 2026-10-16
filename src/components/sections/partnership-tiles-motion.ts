import { PARTNERSHIP_TILE_SETTINGS as settings } from "./partnership-tile-config";

export type TileStage = { width: number; height: number; gridWidth: number; gap: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const phase = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const smooth = (value: number) => value * value * (3 - 2 * value);

/** Original choreography: alternating flight, a zoom, then a clear reading hold. */
export function partnershipTilePose(progress: number, index: number, stage: TileStage) {
  const column = index % settings.columns;
  const row = Math.floor(index / settings.columns);
  const width = Math.max(1, (stage.gridWidth - stage.gap * 2) / 3);
  const height = width / settings.tileAspect;
  const flight = 0.22;
  const order = column % 2 ? 2 - row : row;
  const start = 0.075 + order * settings.stagger * flight + column * 0.008;
  const enter = phase(progress, start, start + flight);
  const zoomStart = 0.385 - settings.overlap * flight;
  const scale = 1 + (settings.zoom - 1) * smooth(phase(progress, zoomStart, 0.61));
  const exit = smooth(phase(progress, 0.43 + row * 0.012, 0.72 + row * 0.012));
  const baseX = (column - 1) * (width + stage.gap);
  const baseY = (row - 1) * (height + stage.gap);
  const horizontal = column - 1;
  // The middle tile also leaves completely; it never obstructs the headline.
  const vertical = column === 1 ? (row === 0 ? -1 : 1) : 0;
  const pushX = Math.max(width * settings.spread, stage.width / 2 + width * scale / 2 + stage.gap - Math.abs(baseX * scale));
  const pushY = Math.max(height * settings.spread, stage.height / 2 + height * scale / 2 + stage.gap - Math.abs(baseY * scale));
  const x = baseX * (scale - 1) + horizontal * pushX * exit;
  const y = baseY * (scale - 1) + vertical * pushY * exit
    + (column % 2 ? 1 : -1) * (stage.height + height) * Math.pow(1 - enter, 3);
  const opacity = smooth(phase(enter, 0, 0.2)) * (1 - phase(progress, 0.75, 0.78));
  return { x, y, scale, opacity, width, height, baseX, baseY };
}
