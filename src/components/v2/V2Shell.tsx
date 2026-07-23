"use client";

import { useEffect } from "react";

/* Isolates /v2 from production chrome (splash, sticky Nova, bottom blur)
   without editing root layout or shared UI components. */

const SPLASH_KEY = "lionovart_splash_seen";

export default function V2Shell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.v2 = "1";
    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      /* ignore private mode */
    }
    document.body.style.overflow = "";

    /* Hide an already-mounted splash overlay if present. */
    document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const z = getComputedStyle(el).zIndex;
      if (z === "10000" && getComputedStyle(el).position === "fixed") {
        el.style.display = "none";
        el.setAttribute("aria-hidden", "true");
      }
    });

    return () => {
      delete root.dataset.v2;
    };
  }, []);

  return <>{children}</>;
}
