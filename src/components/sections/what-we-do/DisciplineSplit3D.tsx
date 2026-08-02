"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

// Locked tag style (flip to red here if preferred).
const TAG_CLASS = "border-white/25 text-white/75";

interface Card {
  title: string;
  body: string;
  tags: string[];
  image: string;
}

interface Props {
  cards: Card[];
  video: string;
}

/** Per-pane data handed to the dynamic variants. */
interface PaneCustom {
  i: number;
  dir: number;
  isDesktop: boolean;
}

/* ─── Motion tuning ───────────────────────────────────────────────── */

// Soft enough that releasing the cursor glides home instead of snapping.
const CURSOR_SPRING = { stiffness: 140, damping: 22, mass: 0.6 } as const;

// Max tilt of the whole glass plane, in degrees.
const TILT_Y = 7;
const TILT_X = 5;

// The backdrop counter-shifts further than the glass moves; that differential
// is what the eye reads as thickness (refraction) rather than a flat blur.
const REFRACT_X = 22;
const REFRACT_Y = 14;

// Cursor interaction arms only once the entrance has settled.
const ARM_DELAY_MS = 1600;

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ─── Variants ────────────────────────────────────────────────────── */

const paneVariants = {
  joined: { x: "0vw", y: "0vh", rotateX: 0, rotateY: 0, borderRadius: 0 },
  split: ({ dir, isDesktop }: PaneCustom) => ({
    x: isDesktop ? `${dir * 2.4}vw` : "0vw",
    y: isDesktop ? "0vh" : `${dir * 2.4}vh`,
    rotateY: isDesktop ? dir * -11 : 0,
    rotateX: isDesktop ? 0 : dir * 11,
    borderRadius: 18,
    transition: {
      duration: 1.05,
      // Centre pane leads, outer two follow — reads as choreographed
      // rather than three things moving on the same frame.
      delay: 0.15 + Math.abs(dir) * 0.06,
      ease: EASE_OUT,
    },
  }),
};

// The glass crystallises out of the footage rather than cutting in.
const glassVariants = {
  joined: { opacity: 0 },
  split: { opacity: 1, transition: { duration: 0.8, delay: 0.28, ease: "easeOut" as const } },
};

const imageVariants = {
  joined: { opacity: 0 },
  split: { opacity: 0.28, transition: { duration: 0.9, delay: 0.34, ease: "easeOut" as const } },
};

const scrimVariants = {
  joined: { opacity: 0 },
  split: { opacity: 1, transition: { duration: 0.7, delay: 0.4, ease: "easeOut" as const } },
};

const contentVariants = {
  joined: { opacity: 0, y: 18 },
  split: ({ i }: PaneCustom) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.72 + i * 0.08, ease: EASE_OUT },
  }),
};

/* ─── Pane ────────────────────────────────────────────────────────── */

function Pane({
  card,
  custom,
  armed,
  frost,
  sheen,
}: {
  card: Card;
  custom: PaneCustom;
  armed: boolean;
  frost: boolean;
  sheen: MotionValue<number>;
}) {
  return (
    <motion.div
      className="relative flex-1 overflow-hidden"
      variants={paneVariants}
      custom={custom}
      // Lift on hover; `z` composes with the group tilt instead of fighting it.
      whileHover={armed ? { z: 46, transition: { duration: 0.4, ease: "easeOut" } } : undefined}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Frosted pane. backdrop-blur is desktop-only: blurring three large
          surfaces over live video is the expensive part, and mid-tier phones
          pay for it every frame. Mobile keeps the tint, drops the filter. */}
      <motion.div
        className={`absolute inset-0 ${frost ? "backdrop-blur-[10px] backdrop-saturate-150" : ""}`}
        style={{
          background:
            "linear-gradient(150deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.055) 44%, rgba(255,255,255,0.02) 100%)",
        }}
        variants={glassVariants}
      />

      {/* Card artwork, held *inside* the glass — present but never competing
          with it. Swap this layer for per-pillar motion graphics later. */}
      <motion.img
        src={card.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        variants={imageVariants}
      />

      {/* Legibility scrim */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
        variants={scrimVariants}
      />

      {/* Edge light — brightens as the plane tilts away from centre, so the
          rim catches the light the way a real bevel would. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-[45%]"
        style={{
          opacity: sheen,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
          maskImage: "linear-gradient(180deg, #000 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 100%)",
        }}
      />

      {/* Inner rim, drawn last so it sits above the fill */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20"
        variants={glassVariants}
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 p-5 text-left md:p-6"
        variants={contentVariants}
        custom={custom}
      >
        <h3 className="font-clash text-[1.4rem] font-bold uppercase leading-[1.0] text-white md:text-[1.9rem]">
          {card.title}
        </h3>
        <p className="mt-2 max-w-[34ch] font-body text-[12.5px] leading-[1.5] text-white/70 md:text-[14px]">
          {card.body}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {card.tags.map((t) => (
            <span
              key={t}
              className={`rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] md:text-[10px] ${TAG_CLASS}`}
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Section ─────────────────────────────────────────────────────── */

/**
 * DisciplineSplit3D — one seamless clip out of which three glass panes
 * crystallise and drift apart (the outcome pillars). Desktop splits
 * horizontally, mobile vertically.
 *
 * The sequence is *triggered*, not scroll-scrubbed: it fires once the section
 * is in view and then plays on its own easing. That keeps the timing authored
 * rather than hostage to scroll speed, and lets the section be one screen tall
 * instead of the 230vh of runway a scrubbed version needed.
 *
 * A single <video> sits behind the panes and shows through them, so the whole
 * section costs exactly one decoder.
 */
export default function DisciplineSplit3D({ cards, video }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const reduce = useReducedMotion();
  const inView = useInView(sectionRef, { once: true, amount: 0.4 });
  const [isDesktop, setIsDesktop] = useState(true);
  const [entranceDone, setEntranceDone] = useState(false);
  // Reduced motion gets the settled state and no cursor tilt at all.
  const armed = !reduce && entranceDone;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const u = () => setIsDesktop(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  // Perf: only decode/play the video while the section is in view.
  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current;
        if (!v) return;
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(sec);
    return () => io.disconnect();
  }, []);

  // Hold the cursor rig back until the entrance has settled, so the two
  // aren't animating the same transform at once.
  useEffect(() => {
    if (!inView || reduce) return;
    const t = setTimeout(() => setEntranceDone(true), ARM_DELAY_MS);
    return () => clearTimeout(t);
  }, [inView, reduce]);

  /* Cursor rig — normalised -1..1, spring-smoothed. Releasing sets the raw
     values to 0 and the spring carries them home; no exit animation needed,
     and no snap. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, CURSOR_SPRING);
  const sy = useSpring(py, CURSOR_SPRING);

  const rotateY = useTransform(sx, [-1, 1], [-TILT_Y, TILT_Y]);
  const rotateX = useTransform(sy, [-1, 1], [TILT_X, -TILT_X]);
  const bgX = useTransform(sx, [-1, 1], [REFRACT_X, -REFRACT_X]);
  const bgY = useTransform(sy, [-1, 1], [REFRACT_Y, -REFRACT_Y]);
  const sheen = useTransform(sx, [-1, 0, 1], [0.55, 0.14, 0.55]);

  // Cache the stage rect instead of measuring on every pointermove — a
  // getBoundingClientRect() per move forces sync layout, which is exactly the
  // kind of main-thread work Lenis-smoothed pages can least afford.
  const measure = useCallback(() => {
    rectRef.current = stageRef.current?.getBoundingClientRect() ?? null;
  }, []);

  useEffect(() => {
    if (!armed) return;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [armed, measure]);

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!armed) return;
      const r = rectRef.current;
      if (!r) return;
      px.set(((e.clientX - r.left) / r.width) * 2 - 1);
      py.set(((e.clientY - r.top) / r.height) * 2 - 1);
    },
    [armed, px, py],
  );

  const handleLeave = useCallback(() => {
    px.set(0);
    py.set(0);
  }, [px, py]);

  // Reduced motion: render the settled state, skip the entrance entirely.
  const initial = reduce ? "split" : "joined";
  const animate = reduce || inView ? "split" : "joined";

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-3 py-24 md:px-4"
    >
      <div
        ref={stageRef}
        className="relative z-40 w-[min(80vw,450px)] lg:w-[min(80vw,945px)]"
        style={{ perspective: "1400px" }}
        onPointerEnter={measure}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        {/* Backdrop: the single decoder for this whole section. Scaled slightly
            so the refraction shift never exposes an edge. */}
        <div className="absolute inset-0 overflow-hidden rounded-[18px]">
          <motion.video
            ref={videoRef}
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover"
            style={{ x: bgX, y: bgY }}
            src={video}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        </div>

        {/* Glass plane — tilts as one sheet so the three panes stay a single
            object. Individual feedback lives on the panes' hover lift. */}
        <motion.div
          className="relative flex h-[clamp(350px,66vh,660px)] w-full flex-col lg:h-[clamp(270px,50vh,500px)] lg:flex-row"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
          initial={initial}
          animate={animate}
        >
          {cards.map((card, i) => (
            <Pane
              key={`${card.title}-${isDesktop ? "d" : "m"}`}
              card={card}
              custom={{ i, dir: i - 1, isDesktop }}
              armed={armed}
              frost={isDesktop}
              sheen={sheen}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
