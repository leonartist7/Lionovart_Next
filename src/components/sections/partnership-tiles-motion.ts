import { PARTNERSHIP_TILE_SETTINGS as settings } from "./partnership-tile-config";
import { PARTNERSHIP_TIMING as timing } from "./partnership-motion";

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
  const flight = timing.tileFlight;
  const order = column % 2 ? 2 - row : row;
  const start = timing.tilesStart + order * settings.stagger * flight + column * 0.006;
  const enter = phase(progress, start, start + flight);
  // Keep the entire assembled grid still for browsing before the zoom begins.
  const zoomStart = timing.imageHoldEnd - settings.overlap * 0.02;
  const scale = 1 + (settings.zoom - 1) * smooth(phase(progress, zoomStart, timing.zoomEnd));
  const exit = smooth(phase(progress, timing.exitStart + row * 0.004, timing.exitEnd + row * 0.004));
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
  const opacity = smooth(phase(enter, 0, 0.2)) * (1 - phase(progress, timing.tileFadeStart, timing.tileFadeEnd));
  return { x, y, scale, opacity, width, height, baseX, baseY };
}
