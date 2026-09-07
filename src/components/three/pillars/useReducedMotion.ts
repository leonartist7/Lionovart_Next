"use client";

import { useEffect, useState } from "react";

/** Tracks prefers-reduced-motion (directive §15). */
export function useReducedMotion(): boolean {
  // Lazy initializer reads the media query once; the effect below only
  // subscribes for changes (setState in a callback, not the effect body).
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
