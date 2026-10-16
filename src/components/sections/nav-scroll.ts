/** Accumulate deliberate travel in one direction, rather than frame deltas. */
export function navScrollIntent(previous: number, latest: number, direction: number, origin: number) {
  const nextDirection = Math.sign(latest - previous);
  if (!nextDirection) return { direction, origin, visible: undefined };
  const nextOrigin = nextDirection === direction ? origin : previous;
  const travel = Math.abs(latest - nextOrigin);
  return {
    direction: nextDirection, origin: nextOrigin,
    visible: travel >= (nextDirection > 0 ? 12 : 32) ? nextDirection < 0 : undefined,
  };
}
