"use client";

import { useCallback, useContext, useId, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ServicesArrivalContext } from "./ServicesArrival";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import styles from "./ServicesCurves.module.css";
import recipe from "@/lib/pearl-gold/material-recipe.json";

const gold=recipe.materials.gold.edge;

/** Mirrored gold contours frame the expertise without entering the reading area. */
export default function ServicesCurves({ continuation = false }: { continuation?: boolean }) {
  const id = useId().replace(/:/g, "");
  const arrival = useContext(ServicesArrivalContext);
  const reduced = useHydratedReducedMotion();
  const subscribe = useCallback((notify: () => void) =>
    typeof arrival === "number" ? () => {} : arrival.on("change", notify), [arrival]);
  const snapshot = useCallback(() =>
    continuation || (typeof arrival === "number" ? arrival : arrival.get()) >= .8, [arrival, continuation]);
  const settled = useSyncExternalStore(subscribe, snapshot, () => continuation);

  return (
    <motion.div className={`${styles.frame} ${continuation ? styles.continuation : ""}`}
      data-services-curves data-portion={continuation ? "continuation" : "start"} aria-hidden="true"
      initial={continuation || reduced ? false : { opacity: 0 }}
      animate={{ opacity: settled ? 1 : 0 }}
      transition={{ duration: reduced || continuation ? 0 : settled ? 1 : .2, delay: settled && !reduced && !continuation ? .15 : 0, ease: [0.16, 1, 0.3, 1] }}>
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
              {gold.map((color,index)=><stop key={index} offset={index/(gold.length-1)} stopColor={color} stopOpacity={index===0||index===gold.length-1?0:1} />)}
            </linearGradient>
          </defs>
          <g stroke={`url(#${id}-${side})`} vectorEffect="non-scaling-stroke">
            <path d="M 70 -80 C 400 100 390 290 210 435 C 20 590 25 760 300 1080" strokeWidth="2.25" vectorEffect="non-scaling-stroke" />
            <path d="M 70 -80 C 400 100 390 290 210 435 C 20 590 25 760 300 1080" strokeWidth=".5" opacity=".75" vectorEffect="non-scaling-stroke" />
            <path d="M 40 -80 C 370 100 360 290 180 435 C -10 590 -5 760 270 1080" strokeWidth=".8" opacity=".6" vectorEffect="non-scaling-stroke" />
            <path d="M 100 -80 C 430 100 420 290 240 435 C 50 590 55 760 330 1080" strokeWidth=".8" opacity=".6" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      ))}
    </motion.div>
  );
}
