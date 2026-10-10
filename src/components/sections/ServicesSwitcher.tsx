"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";
import HomepageServicesChapter from "./HomepageServicesChapter";

/** Land direct services links after the opening scene has settled. */
export default function ServicesSwitcher() {
  const lenis = useLenis();

  useEffect(() => {
    if (window.location.hash !== "#services") return;
    let readyFrame = 0;
    let landingFrame = 0;
    const land = () => {
      readyFrame = requestAnimationFrame(() => {
        landingFrame = requestAnimationFrame(() => {
          const section = document.getElementById("services");
          if (!section) return;
          if (lenis) lenis.scrollTo(section, { immediate: true, force: true });
          else section.scrollIntoView({ behavior: "instant", block: "start" });
        });
      });
    };
    if (document.documentElement.dataset.splashComplete === "true") land();
    else window.addEventListener("lionovart:splash-complete", land, { once: true });
    return () => {
      cancelAnimationFrame(readyFrame);
      cancelAnimationFrame(landingFrame);
      window.removeEventListener("lionovart:splash-complete", land);
    };
  }, [lenis]);
  return <HomepageServicesChapter />;
}
