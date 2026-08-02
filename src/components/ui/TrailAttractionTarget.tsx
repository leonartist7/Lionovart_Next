"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useTrailAttraction } from "@/contexts/TrailAttractionContext";

/**
 * Registers a CTA with the ambient trail without rendering a second effect.
 * The wrapper is intentionally visual-free; TubesCursor steers the real WebGL
 * tube geometry toward its measured capsule perimeter.
 */
export default function TrailAttractionTarget({
  children,
}: {
  children: ReactNode;
}) {
  const controller = useTrailAttraction();
  const cleanupRef = useRef<(() => void) | null>(null);

  const setTarget = useCallback(
    (node: HTMLDivElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;

      if (node && controller) {
        cleanupRef.current = controller.registerTarget(node);
      }
    },
    [controller],
  );

  useEffect(() => () => cleanupRef.current?.(), []);

  return (
    <div
      ref={setTarget}
      className="relative inline-flex"
      data-trail-attraction="hero-primary"
      data-trail-occlude="control"
      data-trail-preserve-palette="true"
    >
      {children}
    </div>
  );
}
