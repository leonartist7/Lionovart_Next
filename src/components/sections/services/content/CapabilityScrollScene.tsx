"use client";

/**
 * Act 3 — Capability proof for /services/content-studio.
 * A pinned showreel with capability tags that reveal in scroll-synced zones,
 * so the demonstration feels like an edit (show-don't-tell authority). The
 * medium is the argument: the page behaves like film.
 *
 * v1 uses a robust muted-loop clip with scroll-driven reveals. True desktop
 * frame-scrub (driving video.currentTime by scroll) can layer on top later;
 * per spec it must fall back to an image-sequence on iOS, so it is deliberately
 * NOT wired here yet to keep this first frame smooth on every device.
 * Reduced-motion: static poster + tags shown plainly.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";

const CAPABILITIES = [
  "Brand films",
  "Social reels",
  "Motion design",
  "Content strategy",
  "Sound design",
  "AI-assisted",
];

const SCENE_CLIP =
  "https://res.cloudinary.com/dgio9uutc/video/upload/v1779845634/Footage_07_o3rfbu.mp4";

export default function CapabilityScrollScene() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [vh, setVh] = useState(900);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useLenis(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const travel = el.offsetHeight - vh;
    const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
    progress.set(p);
    const idx = Math.min(CAPABILITIES.length - 1, Math.floor(p * CAPABILITIES.length));
    setActive(idx);
  });

  const videoScale = useTransform(progress, [0, 1], [1.06, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-bg-dark"
      style={{ height: reduce ? "auto" : `${CAPABILITIES.length * 60 + 60}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Showreel */}
        <motion.div className="absolute inset-0" style={{ scale: reduce ? 1 : videoScale }}>
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={SCENE_CLIP}
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        </motion.div>

        {/* Capability list */}
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 md:px-12">
          <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-white/50">
            What we make
          </p>
          <ul className="space-y-1 md:space-y-2">
            {CAPABILITIES.map((cap, i) => {
              const isActive = reduce ? true : i === active;
              return (
                <li key={cap}>
                  <span
                    className="font-clash font-semibold leading-[1.05] tracking-tight transition-colors duration-300"
                    style={{
                      fontSize: "clamp(2rem, 6.5vw, 5.5rem)",
                      color: isActive ? "var(--color-brand-red)" : "rgba(255,255,255,0.28)",
                    }}
                  >
                    {cap}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
