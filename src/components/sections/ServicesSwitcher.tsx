"use client";

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import HomepageServicesChapter from "./HomepageServicesChapter";
import SelectedWork from "./SelectedWork";

/** A quiet comparison switch: the heading itself changes the presentation. */
export default function ServicesSwitcher() {
  const [view, setView] = useState<"chapter" | "glass">("chapter");
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
  const toggle = () => {
    setView((current) => current === "chapter" ? "glass" : "chapter");
    requestAnimationFrame(() => {
      const section = document.getElementById("services");
      section?.scrollIntoView({ behavior: "instant", block: "start" });
      section?.querySelector<HTMLButtonElement>("h2 button")?.focus({ preventScroll: true });
    });
  };

  return view === "glass"
    ? <SelectedWork mode="services" onHeadingClick={toggle} />
    : <HomepageServicesChapter onHeadingClick={toggle} />;
}
