"use client";

import { useEffect, type RefObject } from "react";

interface Options {
  /** IntersectionObserver rootMargin — expand/shrink the trigger zone. */
  rootMargin?: string;
  /** Fraction of the element visible before it counts as "in view". */
  threshold?: number;
}

/**
 * Plays a <video> only while it intersects the viewport and pauses it the
 * moment it leaves — so at most one background video decodes at a time.
 *
 * The element must already have `muted` + `playsInline` for autoplay to be
 * allowed by browsers.
 */
export function useVideoAutoPause(
  ref: RefObject<HTMLVideoElement | null>,
  { rootMargin = "200px", threshold = 0.1 }: Options = {},
) {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // play() returns a promise that can reject if interrupted — swallow it.
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin, threshold },
    );

    io.observe(video);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold]);
}
