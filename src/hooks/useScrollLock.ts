"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * Locks both Lenis smooth scrolling AND native browser scrollbar
 * when `locked` is true. Restores both on unlock or unmount.
 *
 * Must be called inside a component wrapped by <ReactLenis>.
 *
 * NOTE: Using only `document.body.style.overflow = "hidden"` does NOT
 * stop Lenis — it intercepts wheel/touch events via its own VirtualScroll
 * class, bypassing native overflow. Both `lenis.stop()` AND overflow:hidden
 * are required for a complete scroll lock.
 */
export function useScrollLock(locked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    if (locked) {
      lenis.stop();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      lenis.start();
    }

    return () => {
      // Safety cleanup if component unmounts while locked
      document.body.style.overflow = "";
      if (lenis.isStopped) {
        lenis.start();
      }
    };
  }, [locked, lenis]);
}
