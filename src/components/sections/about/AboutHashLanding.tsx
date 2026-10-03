"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

/** Land deep links after the intro unlocks scrolling and fonts settle. */
export default function AboutHashLanding() {
  const lenis = useLenis();

  useEffect(() => {
    let disposed = false;
    let readyFrame = 0;
    let landingFrame = 0;

    const land = () => {
      const hash = window.location.hash;
      if (hash !== "#comparison" && hash !== "#approach") return;
      void document.fonts.ready.then(() => {
        if (disposed || hash !== window.location.hash) return;
        cancelAnimationFrame(readyFrame);
        cancelAnimationFrame(landingFrame);
        readyFrame = requestAnimationFrame(() => {
          landingFrame = requestAnimationFrame(() => {
            const target = document.getElementById(hash.slice(1));
            if (!target) return;
            if (lenis) {
              lenis.resize();
              // Lenis already applies the target's CSS scroll margin.
              lenis.scrollTo(target, { immediate: true, force: true });
            } else {
              target.scrollIntoView({ behavior: "instant", block: "start" });
            }
          });
        });
      });
    };

    const onHashChange = () => {
      if (document.documentElement.dataset.splashComplete === "true") land();
    };

    if (document.documentElement.dataset.splashComplete === "true") land();
    window.addEventListener("lionovart:splash-complete", land);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      disposed = true;
      cancelAnimationFrame(readyFrame);
      cancelAnimationFrame(landingFrame);
      window.removeEventListener("lionovart:splash-complete", land);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [lenis]);

  return null;
}
