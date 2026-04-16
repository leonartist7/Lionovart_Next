"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
interface MagneticOrbProps {
  onOpen: () => void;
}

/* ─── Spring config for hover ───────────────────────────────── */
const hoverSpring = { type: "spring" as const, stiffness: 400, damping: 25 };

/* ─── Component ─────────────────────────────────────────────── */
export default function MagneticOrb({ onOpen }: MagneticOrbProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* ── Detect reduced motion (matches HeroCycling.tsx pattern) ── */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* ── Hover handlers (pointer-device only) ── */
  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      setIsHovered(true);
    }
  };
  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      setIsHovered(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* ── Tooltip (above orb) ── */}
      <AnimatePresence>
        {isHovered && !prefersReduced && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-16 z-10 pointer-events-none"
          >
            <div
              className="rounded-xl px-4 py-2 text-[12px] font-medium tracking-wide text-white/90 whitespace-nowrap"
              style={{
                background: "rgba(10, 10, 10, 0.7)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
            >
              Free brand audit &middot; 3 min &middot; Voice or text
            </div>
            {/* Tooltip arrow */}
            <div className="flex justify-center -mt-[1px]">
              <div
                className="w-2.5 h-2.5 rotate-45"
                style={{
                  background: "rgba(10, 10, 10, 0.7)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.12)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Orb Button ── */}
      <motion.button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpen();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={prefersReduced ? { scale: 1.02 } : { scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={hoverSpring}
        className={[
          "relative flex items-center justify-center rounded-full cursor-pointer",
          "w-[80px] h-[80px] md:w-[100px] md:h-[100px]",
          /* Focus ring for keyboard users */
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark",
          /* Pulse animation (disabled by CSS @media prefers-reduced-motion) */
          !prefersReduced ? "animate-orb-pulse" : "",
        ].join(" ")}
        style={{
          background: "rgba(10, 10, 10, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          /* Layered shadows — when not pulsing (reduced motion) use static shadow */
          ...(prefersReduced
            ? {
                boxShadow: [
                  "0 0 60px rgba(229, 25, 42, 0.4)",
                  "inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                  "inset 0 -2px 4px rgba(0, 0, 0, 0.3)",
                ].join(", "),
              }
            : {}),
        }}
        aria-label="Open AI brand strategist"
      >
        {/* Inner glow ring on hover */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? "0 0 80px rgba(229, 25, 42, 0.6), inset 0 0 30px rgba(229, 25, 42, 0.1)"
              : "0 0 0px rgba(229, 25, 42, 0), inset 0 0 0px rgba(229, 25, 42, 0)",
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Mic icon */}
        <Mic
          className="relative z-10 text-white"
          size={24}
          strokeWidth={1.8}
        />
      </motion.button>
    </div>
  );
}
