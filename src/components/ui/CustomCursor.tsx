"use client";

import { MagneticCursor } from "@/components/ui/magnetic-cursor";

/**
 * LIONOVART cursor preset.
 *
 * Keeps this compatibility component because the public site layout already
 * mounts <CustomCursor />. The actual pointer engine lives in
 * magnetic-cursor.tsx so other surfaces can reuse/configure it independently.
 */
export default function CustomCursor() {
  return (
    <MagneticCursor
      magneticFactor={0.55}
      lerpAmount={0.12}
      hoverPadding={10}
      blendMode="exclusion"
      cursorSize={14}
      cursorColor="#ffffff"
      contrastBoost={1.5}
      speedMultiplier={0.02}
      maxScaleX={0.55}
      maxScaleY={0.12}
      disableOnTouch
    />
  );
}
