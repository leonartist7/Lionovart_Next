import { LiquidMetalShapes } from '@paper-design/shaders';

// Paint a centered sheet of metal. The button's CSS owns the silhouette.
export const liquidMetalMaterial = {
  u_shape: LiquidMetalShapes.none,
  u_originX: .5,
  u_originY: .5,
  u_scale: 2,
  u_repetition: 3,
  u_softness: .42,
  u_shiftRed: .65,
  u_shiftBlue: 0,
  u_distortion: .14,
  u_contour: .45,
  u_angle: 36,
};

export const liquidMetalPixelBudget = 80_000;
