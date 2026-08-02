"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useTrailAttraction } from "@/contexts/TrailAttractionContext";

export default function TrailAttractionTarget({ children }: { children: ReactNode }) {
  const controller = useTrailAttraction();
  const cleanupRef = useRef<(() => void) | null>(null);

  const setTarget = useCallback(
    (node: HTMLDivElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      if (node && controller) cleanupRef.current = controller.registerTarget(node);
    },
    [controller],
  );

  useEffect(() => () => cleanupRef.current?.(), []);

  return (
    <div
      ref={setTarget}
      className="relative z-40 inline-flex"
      data-trail-attraction="primary"
      data-trail-preserve-palette="true"
    >
      {children}
    </div>
  );
}
