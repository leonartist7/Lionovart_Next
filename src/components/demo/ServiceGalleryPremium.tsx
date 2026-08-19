"use client";

/* ─────────────────────────────────────────────────────────────
   DEMO ONLY — batch two. The ambitious tier: treatments aimed at
   an award-level creative agency site rather than a solid one.
   Route: /demo/services-gallery
   ───────────────────────────────────────────────────────────── */

import { useRef, useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  useAnimationFrame,
} from "framer-motion";
import { en } from "@/lib/i18n/locales/en";
import {
  EASE,
  useAutoAdvance,
  type VariantProps,
  type Variant,
} from "./gallery-shared";

/* ═══════════════════════════════════════════════════════════════
   06 — LIQUID DISSOLVE
   Frames melt into each other through an animated turbulence
   displacement field. No slide, no fade edge: the image itself
   liquefies and reforms. The single most expensive-looking move
   available without a WebGL pipeline.
   ═══════════════════════════════════════════════════════════════ */

function LiquidGallery({ images, serviceIndex, reduce }: VariantProps) {
  const [i] = useAutoAdvance(images.length, 3600, serviceIndex);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const scale = useMotionValue(0);
  const filterId = "lv-liquid";

  useMotionValueEvent(scale, "change", (v) => {
    dispRef.current?.setAttribute("scale", String(v));
  });

  // Pulse the displacement as each new frame arrives, then settle to 0.
  useEffect(() => {
    if (reduce) {
      scale.set(0);
      return;
    }
    const controls = animate(scale, [0, 90, 0], {
      duration: 1.2,
      times: [0, 0.45, 1],
      ease: EASE,
    });
    return () => controls.stop();
  }, [i, serviceIndex, reduce, scale]);

  return (
    <div className="flex flex-col gap-4">
      <svg aria-hidden className="absolute h-0 w-0">
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.014"
            numOctaves={2}
            seed={11}
            result="noise"
          />
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="noise"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-black/5"
        style={{ filter: `url(#${filterId})` }}
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.img
            key={images[i]}
            src={images[i]}
            alt=""
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 1.1, ease: EASE }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>

      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">
        Turbulence displacement · frames liquefy and reform
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   07 — TYPE MASK
   The work plays INSIDE the letterforms. One enormous Clash
   Display word per service, filled with moving imagery. The most
   brand-forward option: type is the identity, work is the fill.
   ═══════════════════════════════════════════════════════════════ */

function TypeMaskGallery({ images, serviceIndex, reduce }: VariantProps) {
  const [i] = useAutoAdvance(images.length, 2800, serviceIndex);
  const title = en.services.items[serviceIndex]?.title ?? "";
  const word = title.split(" ")[0].replace(/[^A-Za-z]/g, "").toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[20px] bg-[#0d0d0d] px-4">
        <div className="relative">
          {/* Stacked text layers, each filled with a frame, crossfading. */}
          <AnimatePresence mode="sync" initial={false}>
            <motion.span
              key={`${word}-${images[i]}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 1, ease: EASE }}
              style={{
                backgroundImage: `url(${images[i]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
              className="absolute inset-0 flex items-center justify-center font-clash text-[clamp(3rem,11vw,7.5rem)] font-bold uppercase leading-none tracking-[-0.04em]"
            >
              {word}
            </motion.span>
          </AnimatePresence>

          {/* Invisible twin holds the box size so the absolute layers have a frame. */}
          <span
            aria-hidden
            className="block font-clash text-[clamp(3rem,11vw,7.5rem)] font-bold uppercase leading-none tracking-[-0.04em] text-transparent"
          >
            {word}
          </span>
        </div>

        <span className="absolute bottom-5 left-0 right-0 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          {title}
        </span>
      </div>

      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">
        Imagery lives inside the letterforms
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   08 — THE WALL
   Two columns drifting in opposite directions, forever. Reads as
   a studio with far more work than fits on screen. Volume as the
   argument. Slows on hover so a frame can be studied.
   ═══════════════════════════════════════════════════════════════ */

/* Driven per-frame rather than with a keyframe animation: changing
   speed on hover must not restart the loop and snap it back. */
function WallColumn({
  images,
  direction,
  duration,
  paused,
  reduce,
}: {
  images: string[];
  direction: "up" | "down";
  duration: number;
  paused: boolean;
  reduce: boolean | null;
}) {
  const loop = [...images, ...images];
  const pct = useMotionValue(direction === "up" ? 0 : -50);
  const y = useTransform(pct, (v) => `${v}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const speed = (paused ? 0.22 : 1) * (50 / duration) * (delta / 1000);
    let next = pct.get() + (direction === "up" ? -speed : speed);
    if (next <= -50) next += 50;
    if (next >= 0) next -= 50;
    pct.set(next);
  });

  return (
    <div className="relative flex-1 overflow-hidden">
      <motion.div className="flex flex-col gap-3" style={{ y }}>
        {loop.map((src, k) => (
          <div
            key={`${src}-${k}`}
            className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-[12px] bg-black/5"
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function WallGallery({ images, serviceIndex, reduce }: VariantProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="relative flex aspect-[4/3] w-full gap-3 overflow-hidden rounded-[20px]"
      >
        <WallColumn
          key={`a-${serviceIndex}`}
          images={images}
          direction="up"
          duration={26}
          paused={paused}
          reduce={reduce}
        />
        <WallColumn
          key={`b-${serviceIndex}`}
          images={[...images].reverse()}
          direction="down"
          duration={32}
          paused={paused}
          reduce={reduce}
        />

        {/* Soft top and bottom falloff so the loop has no hard seam. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f7f4ef_0%,transparent_16%,transparent_84%,#f7f4ef_100%)]"
        />
      </div>

      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">
        Endless wall · hover to slow it down
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   09 — KINETIC UNFOLD
   One image holds the frame, then fractures into four tiles that
   each resolve into a different piece of work, then closes back.
   The one-to-many reveal, choreographed. Four over six: each tile
   reads at a larger, more legible size.
   ═══════════════════════════════════════════════════════════════ */

const UNFOLD_COLS = 2;
const UNFOLD_ROWS = 2;
const UNFOLD_TILES = UNFOLD_COLS * UNFOLD_ROWS;

function UnfoldGallery({ images, serviceIndex, reduce }: VariantProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    const id = setInterval(() => setOpen((v) => !v), 3200);
    return () => clearInterval(id);
  }, [serviceIndex]);

  const hero = images[0];

  return (
    <div className="flex flex-col gap-4">
      <div
        className="grid aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-black/5"
        style={{
          gridTemplateColumns: `repeat(${UNFOLD_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${UNFOLD_ROWS}, 1fr)`,
        }}
      >
        {Array.from({ length: UNFOLD_TILES }, (_, k) => {
          const col = k % UNFOLD_COLS;
          const row = Math.floor(k / UNFOLD_COLS);
          return (
            <motion.div
              key={k}
              animate={{
                scale: open ? 0.9 : 1,
                borderRadius: open ? 14 : 0,
              }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.8, ease: EASE, delay: k * 0.05 }
              }
              className="relative overflow-hidden"
            >
              {/* Slice of the hero frame: the six together read as one image. */}
              <motion.div
                animate={{ opacity: open ? 0 : 1 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: k * 0.05 }
                }
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${hero})`,
                  backgroundSize: `${UNFOLD_COLS * 100}% ${UNFOLD_ROWS * 100}%`,
                  backgroundPosition: `${(col / (UNFOLD_COLS - 1)) * 100}% ${
                    (row / (UNFOLD_ROWS - 1)) * 100
                  }%`,
                }}
              />
              {/* The tile's own piece of work. */}
              <motion.div
                animate={{ opacity: open ? 1 : 0 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: k * 0.05 }
                }
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${images[k % images.length]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </motion.div>
          );
        })}
      </div>

      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">
        One frame fractures into {UNFOLD_TILES}, then closes
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10 — THE MOODBOARD
   A physical pinboard you can throw around. Every frame is
   draggable with real momentum. Nothing else on a competitor's
   site will let a founder touch the work.
   ═══════════════════════════════════════════════════════════════ */

const PINS = [
  { x: 2, y: 8, w: 40, r: -5 },
  { x: 46, y: 2, w: 36, r: 3 },
  { x: 22, y: 40, w: 42, r: -2 },
  { x: 60, y: 46, w: 34, r: 5 },
  { x: 4, y: 64, w: 32, r: 2 },
];

function MoodboardGallery({ images, serviceIndex, reduce }: VariantProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={boardRef}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-[#efeae2] ring-1 ring-black/5"
      >
        {PINS.map((p, k) => (
          <motion.div
            key={`${serviceIndex}-${k}`}
            drag
            dragConstraints={boardRef}
            dragElastic={0.18}
            dragMomentum={!reduce}
            dragTransition={{ power: 0.25, timeConstant: 320 }}
            onDragStart={() => setTop(k)}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
            initial={{ opacity: 0, y: 26, scale: 0.94, rotate: p.r * 2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: p.r }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.9, ease: EASE, delay: k * 0.08 }
            }
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.w}%`,
              zIndex: top === k ? 20 : k,
            }}
            className="absolute cursor-grab touch-none overflow-hidden rounded-[12px] bg-white p-2 shadow-[0_14px_36px_-10px_rgba(0,0,0,0.32)]"
          >
            <img
              src={images[k]}
              alt=""
              className="pointer-events-none aspect-[4/3] w-full rounded-[6px] object-cover"
              draggable={false}
            />
          </motion.div>
        ))}
      </div>

      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">
        Drag and throw the frames
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */

export const PREMIUM_VARIANTS: Variant[] = [
  {
    id: "liquid",
    number: "06",
    name: "Liquid Dissolve",
    pitch:
      "Frames melt into each other through a turbulence field. No slide, no fade edge: the image liquefies and reforms.",
    Component: LiquidGallery,
  },
  {
    id: "typemask",
    number: "07",
    name: "Type Mask",
    pitch:
      "The work plays inside the letterforms. Type is the identity, the work is the fill.",
    Component: TypeMaskGallery,
  },
  {
    id: "wall",
    number: "08",
    name: "The Wall",
    pitch:
      "Two columns drifting opposite directions, forever. Volume is the argument. Hover to slow it.",
    Component: WallGallery,
  },
  {
    id: "unfold",
    number: "09",
    name: "Kinetic Unfold",
    pitch:
      "One image holds the frame, then fractures into four that each resolve into different work.",
    Component: UnfoldGallery,
  },
  {
    id: "moodboard",
    number: "10",
    name: "The Moodboard",
    pitch:
      "A pinboard you can throw around. Every frame drags with real momentum.",
    Component: MoodboardGallery,
  },
];
