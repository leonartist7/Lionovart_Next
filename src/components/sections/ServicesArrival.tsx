"use client";

import { createContext, useContext, type ReactNode } from "react";
import { motion, type MotionValue } from "framer-motion";
import {useServicesCarouselPreview} from "./ServicesPreview";

/** Shared opacity keeps the services backdrop and existing gold rails in step. */
export const ServicesArrivalContext = createContext<MotionValue<number> | number>(1);

export function ServicesArrivalLayer({ children }: { children: ReactNode }) {
  const opacity = useContext(ServicesArrivalContext);
  const preview = useServicesCarouselPreview();
  return <motion.div className="pointer-events-none absolute inset-0" data-services-arrival-layer aria-hidden="true"
    style={{ opacity, background: preview ? "transparent" : "var(--site-surface-light, #f7f4ef)" }}>
    {children}
  </motion.div>;
}
