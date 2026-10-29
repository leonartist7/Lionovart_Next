export type BridgeFrame = {
  x: number; y: number; width: number; height: number;
  parentX: number; parentY: number; motionX: number; motionY: number;
};
export type BridgeTarget = { x: number; y: number; width: number; height: number };

/** Individual CSS scale/rotate also transform the authored split translation.
 * Compensate that offset so every frame lands on its measured service target. */
export function cardBridgeFrame(base: BridgeFrame, target: BridgeTarget, move: number, fit: number, turn: boolean, lift = 0, inset = 0) {
  const angle = (turn ? 90 * fit : 0) * Math.PI / 180;
  const endX = turn ? target.height / (base.width / base.parentX * base.parentY) : target.width / base.width;
  const endY = turn ? target.width / (base.height / base.parentY * base.parentX) : target.height / base.height;
  const sx = 1 + (endX - 1) * fit, sy = 1 + (endY - 1) * fit;
  const transformedX = Math.cos(angle) * sx * base.motionX - Math.sin(angle) * sy * base.motionY;
  const transformedY = Math.sin(angle) * sx * base.motionX + Math.cos(angle) * sy * base.motionY;
  return {
    x: ((target.x - base.x) * move + inset) / base.parentX - (transformedX - base.motionX),
    y: ((target.y - base.y) * move - lift) / base.parentY - (transformedY - base.motionY),
    sx, sy, angle: turn ? 90 * fit : 0,
  };
}
