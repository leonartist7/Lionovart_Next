export const HONEYCOMB_BROWSE_START = .018;
export const HONEYCOMB_LIFT_START = .38;
export const HONEYCOMB_PASS_END = .59;
const HONEYCOMB_WALK_END = .76;

const clamp = (p: number) => Math.min(1, Math.max(0, p));
const smooth = (p: number) => { const t = clamp(p); return t * t * (3 - 2 * t); };

export function honeycombPose(progress: number, lastProject: number) {
  const lift = smooth((progress - HONEYCOMB_LIFT_START) / .11);
  const push = smooth((progress - .46) / .12);
  const arrival = smooth(progress / .045);
  const handoff = smooth((progress - .53) / (HONEYCOMB_PASS_END - .53));
  // Keep the carried work still during the entrance. Match the final exhibit
  // at the push-through, then run the original branded ending at its own pace.
  const tunnel = progress <= HONEYCOMB_LIFT_START ? 0
    : progress <= HONEYCOMB_PASS_END ? lastProject * smooth((progress - HONEYCOMB_LIFT_START) / .16)
    : lastProject + (HONEYCOMB_WALK_END - lastProject) * clamp((progress - HONEYCOMB_PASS_END) / (HONEYCOMB_WALK_END - HONEYCOMB_PASS_END));
  return {
    lift, push, arrival, handoff,
    opacity: arrival * (1 - handoff),
    tunnelOpacity: 1 - arrival * (1 - handoff),
    tunnel: progress >= HONEYCOMB_WALK_END ? progress : tunnel,
    browsing: progress >= HONEYCOMB_BROWSE_START && progress < HONEYCOMB_LIFT_START,
  };
}

export const CELL_Y = Math.sqrt(3);
export const CELL_X = 1.5;

export function tileCenter(column: number, row: number) {
  return { x: column * CELL_X, y: (row + (column & 1) * .5) * CELL_Y };
}

export function tileProject(column: number, row: number, count: number) {
  const index = column + row * 3;
  return ((index % count) + count) % count;
}

export function nearestProject(x: number, y: number, project: number, count: number) {
  const column = Math.round(x / CELL_X);
  const row = Math.round(y / CELL_Y);
  let nearest = tileCenter(column, row), distance = Infinity;
  for (let c = column - count; c <= column + count; c++) {
    for (let r = row - 2; r <= row + 2; r++) {
      if (tileProject(c, r, count) !== project) continue;
      const center = tileCenter(c, r);
      const next = (x - center.x) ** 2 + (y - center.y) ** 2;
      if (next < distance) { nearest = center; distance = next; }
    }
  }
  return nearest;
}
