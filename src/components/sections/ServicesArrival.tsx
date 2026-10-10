"use client";

import { createContext, useContext, type ReactNode } from "react";
import { motion, type MotionValue } from "framer-motion";

/** Shared opacity keeps the services backdrop and existing gold rails in step. */
export const ServicesArrivalContext = createContext<MotionValue<number> | number>(1);

export function ServicesArrivalLayer({ children }: { children: ReactNode }) {
  const opacity = useContext(ServicesArrivalContext);
  return <motion.div className="pointer-events-none absolute inset-0" data-services-arrival-layer aria-hidden="true"
    style={{ opacity }}>
    {children}
  </motion.div>;
}
