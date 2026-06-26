"use client";

/**
 * Act 1 — Arc hero for /services/content-studio.
 * A rainbow arc of small content cards (images + muted video loops) curves
 * over the centered hero title. Cards fan in on load, float gently while
 * idle, then disperse radially outward as you scroll (the same "clear the
 * noise" language as SocialScene). The page opens by performing the product:
 * scroll-stopping content, arranged around the one line that matters.
 *
 * Sticky scene: 170vh of travel, pinned viewport. Lenis-driven progress.
 * Reduced-motion: static arc, no float, no dispersal.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useLenis } from "lenis/react";

type ArcCard = {
  id: string;
  angle: number; // degrees from arc apex (0 = top of the rainbow)
  size: number; // width multiplier
  type: "image" | "video";
  src: string;
  mobileHidden?: boolean;
};

// Mixed media along the arc. Videos reuse existing Cloudinary clips; images
// use picsum placeholders (repo convention) until real reels/posts land.
const CARDS: ArcCard[] = [
  { id: "arc-a", angle: -64, size: 0.92, type: "image", src: "https://picsum.photos/seed/lion-arc-a/320/400", mobileHidden: true },
  { id: "arc-b", angle: -48, size: 1.05, type: "video", src: "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto,w_480,c_limit/v1779845634/Footage_07_o3rfbu.mp4" },
  { id: "arc-c", angle: -32, size: 0.88, type: "image", src: "https://picsum.photos/seed/lion-arc-c/320/400" },
  { id: "arc-d", angle: -16, size: 1.0, type: "image", src: "https://picsum.photos/seed/lion-arc-d/320/400" },
  { id: "arc-e", angle: 0, size: 1.12, type: "video", src: "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto,w_480,c_limit/v1775960150/hero-notext_eqjdin.mp4" },
  { id: "arc-f", angle: 16, size: 0.95, type: "image", src: "https://picsum.photos/seed/lion-arc-f/320/400" },
  { id: "arc-g", angle: 32, size: 0.9, type: "image", src: "https://picsum.photos/seed/lion-arc-g/320/400" },
  { id: "arc-h", angle: 48, size: 1.04, type: "image", src: "https://picsum.photos/seed/lion-arc-h/320/400" },
  { id: "arc-i", angle: 64, size: 0.92, type: "image", src: "https://picsum.photos/seed/lion-arc-i/320/400", mobileHidden: true },
];

// Vertical squash turns the circle into a rainbow-shaped ellipse.
// Mobile uses a rounder arc, lifted higher, so cards clear the title block.
const arcGeometry = (vw: number) => {
  const mobile = vw < 640;
  return {
    radius: mobile ? vw * 0.6 : Math.min(vw * 0.4, 600),
    vFactor: mobile ? 0.78 : 0.6,
    anchorTop: mobile ? "38%" : "56%",
  };
};

export default function ArcHero() {
  // Effects always on (founder decision): the cinematic entry IS the product
  // demo, so this scene deliberately ignores the OS reduced-motion flag.
  const reduce = false;
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [vh, setVh] = useState(900);
  const [vw, setVw] = useState(1440);

  useEffect(() => {
    const measure = () => {
      setVh(window.innerHeight);
      setVw(window.innerWidth);
    };
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
  });

  const { radius, vFactor, anchorTop } = arcGeometry(vw);
  const baseCard = Math.max(64, Math.min(radius * (vw < 640 ? 0.34 : 0.3), 148));

  const title = (
    <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
      <motion.p
        className="mb-6 text-[12px] md:text-[14px] uppercase tracking-[0.35em] text-white/70"
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        Content Studio
      </motion.p>
      <motion.h1
        className="font-normal leading-[1.02] tracking-tight text-white"
        style={{ fontSize: "clamp(2rem, 6.5vw, 7.5rem)", fontFamily: "var(--font-clash)" }}
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="block">We make brands</span>
        <span className="block font-semibold text-brand-red">impossible to ignore</span>
      </motion.h1>
      <motion.p
        className="mt-7 text-[12px] md:text-[13px] uppercase tracking-[0.3em] text-white/55"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.55 }}
      >
        Films &middot; Reels &middot; Social &middot; Motion
      </motion.p>
    </div>
  );

  if (reduce) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark pt-24">
        <ArcCards radius={radius} vFactor={vFactor} anchorTop={anchorTop} baseCard={baseCard} progress={progress} staticArc />
        {title}
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-bg-dark" style={{ height: "170vh" }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden pt-16">
        <ArcCards radius={radius} vFactor={vFactor} anchorTop={anchorTop} baseCard={baseCard} progress={progress} />
        {title}

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{ opacity: useTransform(progress, [0, 0.2], [1, 0]) }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
          <motion.div
            className="w-px bg-white/30"
            style={{ height: 32 }}
            animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 0.9, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
}

function ArcCards({
  radius,
  vFactor,
  anchorTop,
  baseCard,
  progress,
  staticArc = false,
}: {
  radius: number;
  vFactor: number;
  anchorTop: string;
  baseCard: number;
  progress: MotionValue<number>;
  staticArc?: boolean;
}) {
  return (
    // Arc anchor: below center on desktop (rainbow crowns the title), higher
    // on mobile so the whole arc floats above the title block.
    <div aria-hidden className="absolute left-1/2" style={{ top: anchorTop }}>
      {CARDS.map((card) => (
        <Card
          key={card.id}
          card={card}
          radius={radius}
          vFactor={vFactor}
          baseCard={baseCard}
          progress={progress}
          staticArc={staticArc}
        />
      ))}
    </div>
  );
}

function Card({
  card,
  radius,
  vFactor,
  baseCard,
  progress,
  staticArc,
}: {
  card: ArcCard;
  radius: number;
  vFactor: number;
  baseCard: number;
  progress: MotionValue<number>;
  staticArc: boolean;
}) {
  const rad = (card.angle * Math.PI) / 180;
  const x = Math.sin(rad) * radius;
  const y = -Math.cos(rad) * radius * vFactor;
  const w = baseCard * card.size;

  // Scroll dispersal: each card slides further out along its own radial.
  const dx = useTransform(progress, [0, 1], [0, Math.sin(rad) * radius * 0.55]);
  const dy = useTransform(progress, [0, 1], [0, -Math.cos(rad) * radius * vFactor * 0.9]);
  const opacity = useTransform(progress, [0, 0.35, 0.85], [1, 1, 0]);

  // Entrance staggers outward from the arc apex.
  const delay = 0.35 + (Math.abs(card.angle) / 64) * 0.45;

  return (
    <motion.div
      className={`absolute ${card.mobileHidden ? "hidden sm:block" : ""}`}
      style={{
        left: x,
        top: y,
        width: w,
        marginLeft: -w / 2,
        marginTop: (-w * 1.25) / 2,
        x: staticArc ? 0 : dx,
        y: staticArc ? 0 : dy,
        opacity: staticArc ? 1 : opacity,
      }}
    >
      <motion.div
        initial={staticArc ? false : { opacity: 0, scale: 0.55, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="overflow-hidden rounded-xl shadow-[0_16px_50px_-16px_rgba(0,0,0,0.75)] ring-1 ring-white/10"
          style={{ rotate: card.angle * 0.55 }}
          animate={
            staticArc
              ? undefined
              : { y: [0, card.angle % 2 === 0 ? -7 : 7, 0] }
          }
          transition={{
            repeat: Infinity,
            duration: 3.4 + Math.abs(card.angle) / 40,
            ease: "easeInOut",
            delay: delay + 0.6,
          }}
        >
          {card.type === "video" ? (
            <video
              className="aspect-[4/5] w-full object-cover"
              src={card.src}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img src={card.src} alt="" className="aspect-[4/5] w-full object-cover" />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
