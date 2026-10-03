"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./GoldThreads.module.css";

/** Shared light-chapter ornament. The owning surface must create a stacking context. */
export default function GoldThreads({ single = false }: { single?: boolean }) {
  const id = useId().replace(/:/g, "");
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = layer.current;
    if (!node) return;
    const rails = Array.from(node.querySelectorAll<SVGSVGElement>("svg"));
    const visible = new Set<Element>();
    const sync = () => {
      for (const rail of rails) {
        rail.dataset.running = String(visible.has(rail) && !document.hidden);
      }
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      sync();
    });
    rails.forEach((rail) => observer.observe(rail));
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={layer} className={styles.layer} data-gold-threads aria-hidden="true">
      {(single ? ["left"] : ["left", "right"]).map((side) => (
        <svg
          key={side}
          className={`${styles.rail} ${side === "left" ? styles.left : styles.right}`}
          viewBox="0 0 720 720"
          fill="none"
          focusable="false"
          data-running="false"
        >
          <defs>
            <linearGradient id={`${id}-${side}-thread`} x1="-80" y1="800" x2="800" y2="-80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#b58a3d" stopOpacity="0" />
              <stop offset=".25" stopColor="#b58a3d" stopOpacity=".22" />
              <stop offset=".7" stopColor="#c9a65b" stopOpacity=".28" />
              <stop offset="1" stopColor="#c9a65b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-${side}-glint`} x1="-160" y1="880" x2="100" y2="620" gradientUnits="userSpaceOnUse">
              <stop stopColor="#bf9648" stopOpacity="0" />
              <stop offset=".48" stopColor="#d8b86a" stopOpacity=".65" />
              <stop offset=".62" stopColor="#b58a3d" stopOpacity=".85" />
              <stop offset="1" stopColor="#bf9648" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M-80 800 800-80" stroke={`url(#${id}-${side}-thread)`} strokeWidth=".8" />
          {side === "left" && <path d="M-80 840 840-80" stroke={`url(#${id}-${side}-thread)`} strokeWidth=".5" opacity=".55" />}
          <g className={styles.glint}>
            <path d="M-160 880 100 620" stroke={`url(#${id}-${side}-glint)`} strokeWidth="1.1" strokeLinecap="round" />
          </g>
        </svg>
      ))}
    </div>
  );
}
