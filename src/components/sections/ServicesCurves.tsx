"use client";

import { useId } from "react";
import styles from "./ServicesCurves.module.css";

/** Mirrored gold contours frame the expertise without entering the reading area. */
export default function ServicesCurves() {
  const id = useId().replace(/:/g, "");
  return (
    <div className={styles.frame} data-services-curves aria-hidden="true">
      {(["left", "right"] as const).map((side) => (
        <svg
          key={side}
          className={`${styles.rail} ${styles[side]}`}
          data-services-curve={side}
          viewBox="0 0 400 1000"
          preserveAspectRatio="none"
          fill="none"
          focusable="false"
        >
          <defs>
            <linearGradient id={`${id}-${side}`} x1="0" y1="0" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#B58A3D" stopOpacity="0" />
              <stop offset=".16" stopColor="#B58A3D" stopOpacity=".62" />
              <stop offset=".42" stopColor="#C9A65B" stopOpacity=".9" />
              <stop offset=".72" stopColor="#B58A3D" stopOpacity=".72" />
              <stop offset="1" stopColor="#B58A3D" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke={`url(#${id}-${side})`} vectorEffect="non-scaling-stroke">
            <path d="M 70 -80 C 400 100 390 290 210 435 C 20 590 25 760 300 1080" strokeWidth="1.35" vectorEffect="non-scaling-stroke" />
            <path d="M 40 -80 C 370 100 360 290 180 435 C -10 590 -5 760 270 1080" strokeWidth=".8" opacity=".6" vectorEffect="non-scaling-stroke" />
            <path d="M 100 -80 C 430 100 420 290 240 435 C 50 590 55 760 330 1080" strokeWidth=".8" opacity=".6" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      ))}
    </div>
  );
}
