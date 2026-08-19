"use client";

/* ─────────────────────────────────────────────────────────────
   DEMO ONLY — candidate treatments for showing MULTIPLE images
   per service in the Services section. Batch one lives here,
   batch two in ServiceGalleryPremium.tsx. Not wired into
   production. Route: /demo/services-gallery
   ───────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { en } from "@/lib/i18n/locales/en";
import { PREMIUM_VARIANTS } from "./ServiceGalleryPremium";
import {
  EASE,
  galleryFor,
  useAutoAdvance,
  type VariantProps,
  type Variant,
} from "./gallery-shared";

/* ═══════════════════════════════════════════════════════════════
   01 — THE DECK
   Physical prints stacked on a table. Click to peel the top card
   to the back. Browsing feels tactile, like a portfolio review.
   ═══════════════════════════════════════════════════════════════ */

function DeckGallery({ images, serviceIndex, reduce }: VariantProps) {
  const [order, setOrder] = useState<number[]>(() => images.map((_, i) => i));
  useEffect(() => setOrder(images.map((_, i) => i)), [serviceIndex, images.length]);

  const peel = useCallback(
    () => setOrder((o) => [...o.slice(1), o[0]]),
    []
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative aspect-[4/3] w-full cursor-pointer select-none"
        onClick={peel}
        style={{ perspective: 1400 }}
      >
        {order.map((imgIdx, pos) => (
          <motion.div
            key={images[imgIdx]}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{
              opacity: pos > 3 ? 0 : 1,
              x: pos * 16,
              y: pos * 11,
              rotate: pos * 1.7,
              scale: 1 - pos * 0.045,
            }}
            transition={reduce ? { duration: 0 } : { duration: 0.75, ease: EASE }}
            style={{ zIndex: images.length - pos }}
            className="absolute inset-0 overflow-hidden rounded-[20px] bg-white shadow-[0_18px_50px_-12px_rgba(0,0,0,0.28)] ring-1 ring-black/5"
          >
            <img
              src={images[imgIdx]}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          </motion.div>
        ))}
      </div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">
        Click the stack to peel · {order.length} frames
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   02 — THE MOSAIC
   An asymmetric editorial grid that RE-COMPOSES per service.
   Tiles physically travel to new positions (FLIP) while their
   images crossfade. Every service gets its own art direction.
   ═══════════════════════════════════════════════════════════════ */

type Cell = { c: number; cs: number; r: number; rs: number };

const MOSAIC: Cell[][] = [
  [
    { c: 1, cs: 7, r: 1, rs: 5 },
    { c: 8, cs: 5, r: 1, rs: 3 },
    { c: 8, cs: 5, r: 4, rs: 2 },
    { c: 1, cs: 4, r: 6, rs: 3 },
    { c: 5, cs: 8, r: 6, rs: 3 },
  ],
  [
    { c: 1, cs: 5, r: 1, rs: 4 },
    { c: 6, cs: 7, r: 1, rs: 6 },
    { c: 1, cs: 5, r: 5, rs: 4 },
    { c: 6, cs: 3, r: 7, rs: 2 },
    { c: 9, cs: 4, r: 7, rs: 2 },
  ],
  [
    { c: 1, cs: 12, r: 1, rs: 3 },
    { c: 1, cs: 4, r: 4, rs: 5 },
    { c: 5, cs: 4, r: 4, rs: 3 },
    { c: 9, cs: 4, r: 4, rs: 3 },
    { c: 5, cs: 8, r: 7, rs: 2 },
  ],
];

function MosaicGallery({ images, serviceIndex, reduce }: VariantProps) {
  const cells = MOSAIC[serviceIndex % MOSAIC.length];

  return (
    <div className="flex flex-col gap-4">
      <div
        className="grid w-full gap-2.5"
        style={{
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
          aspectRatio: "4 / 3",
        }}
      >
        {cells.map((cell, slot) => (
          <motion.div
            key={slot}
            layout
            transition={reduce ? { duration: 0 } : { duration: 0.85, ease: EASE }}
            style={{
              gridColumn: `${cell.c} / span ${cell.cs}`,
              gridRow: `${cell.r} / span ${cell.rs}`,
            }}
            className="relative overflow-hidden rounded-[14px] bg-black/5"
          >
            <AnimatePresence mode="sync" initial={false}>
              <motion.img
                key={images[slot]}
                src={images[slot]}
                alt=""
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { duration: 0.9, ease: EASE, delay: slot * 0.06 }
                }
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">
        Grid re-composes per service · tiles travel, images crossfade
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   03 — THE SLATS
   One frame, sliced into vertical louvers. Each new image wipes
   in slat by slat, left to right. Mechanical, precise, sovereign.
   Cycles the service's full set on its own.
   ═══════════════════════════════════════════════════════════════ */

const SLATS = 9;

function SlatGallery({ images, serviceIndex, reduce }: VariantProps) {
  const [i] = useAutoAdvance(images.length, 3400, serviceIndex);
  const prev = images[(i - 1 + images.length) % images.length];
  const current = images[i];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-black/5">
        {/* Outgoing frame sits underneath so no gap ever shows. */}
        <img src={prev} alt="" className="absolute inset-0 h-full w-full object-cover" />

        {Array.from({ length: SLATS }, (_, s) => (
          <motion.div
            key={`${current}-${s}`}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.7, ease: EASE, delay: s * 0.045 }
            }
            style={{
              left: `${(s * 100) / SLATS}%`,
              width: `${100 / SLATS}%`,
              transformOrigin: s % 2 === 0 ? "top" : "bottom",
            }}
            className="absolute inset-y-0 overflow-hidden"
          >
            <img
              src={current}
              alt=""
              className="absolute inset-y-0 max-w-none object-cover"
              style={{ width: `${SLATS * 100}%`, left: `${-s * 100}%`, height: "100%" }}
            />
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {images.map((_, k) => (
          <span
            key={k}
            className={`h-[2px] flex-1 transition-colors duration-500 ${
              k === i ? "bg-brand-red" : "bg-black/12"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   04 — RACK FOCUS
   The set recedes into depth. The front frame is sharp; the ones
   behind blur out like a lens pulling focus. The stack steps
   forward on its own. Pure cinema language.
   ═══════════════════════════════════════════════════════════════ */

function FocusGallery({ images, serviceIndex, reduce }: VariantProps) {
  const [i] = useAutoAdvance(images.length, 3000, serviceIndex);
  const n = images.length;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative aspect-[4/3] w-full"
        style={{ perspective: 1500, transformStyle: "preserve-3d" }}
      >
        {images.map((src, k) => {
          const depth = (k - i + n) % n;
          const visible = depth < 4;
          return (
            <motion.div
              key={src}
              animate={{
                z: -depth * 190,
                y: depth * -18,
                opacity: visible ? 1 - depth * 0.22 : 0,
                filter: `blur(${depth * 3.5}px)`,
              }}
              transition={reduce ? { duration: 0 } : { duration: 1, ease: EASE }}
              style={{ zIndex: n - depth, transformStyle: "preserve-3d" }}
              className="absolute inset-0 overflow-hidden rounded-[20px] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.35)]"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </motion.div>
          );
        })}
      </div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">
        Frame {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} · depth of field
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   05 — THE SCATTER
   Prints thrown across the table, settling into a loose spread.
   The whole cluster drifts with the cursor at layered depths.
   Alive, human, unmistakably a studio.
   ═══════════════════════════════════════════════════════════════ */

const SCATTER = [
  { x: 1, y: 4, w: 44, r: -6 },
  { x: 52, y: 0, w: 38, r: 4 },
  { x: 26, y: 34, w: 46, r: 2 },
  { x: 64, y: 42, w: 34, r: -3 },
  { x: 2, y: 60, w: 33, r: 6 },
];

function ScatterGallery({ images, serviceIndex, reduce }: VariantProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) / r.width);
    my.set((e.clientY - (r.top + r.height / 2)) / r.height);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        className="relative aspect-[4/3] w-full"
      >
        {SCATTER.map((p, k) => (
          <ScatterCard
            key={`${serviceIndex}-${k}`}
            src={images[k]}
            pos={p}
            index={k}
            sx={sx}
            sy={sy}
            reduce={reduce}
          />
        ))}
      </div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">
        Move the cursor across the spread
      </p>
    </div>
  );
}

/* Own component so the parallax hooks run unconditionally, once per card. */
function ScatterCard({
  src,
  pos,
  index,
  sx,
  sy,
  reduce,
}: {
  src: string;
  pos: (typeof SCATTER)[number];
  index: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  reduce: boolean | null;
}) {
  const depth = (index % 3) + 1;
  const x = useTransform(sx, (v) => (reduce ? 0 : v * depth * 16));
  const y = useTransform(sy, (v) => (reduce ? 0 : v * depth * 12));

  return (
    <motion.div
      initial={{ opacity: 0, y: 34, scale: 0.92, rotate: pos.r * 2.4 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: pos.r }}
      transition={
        reduce ? { duration: 0 } : { duration: 0.95, ease: EASE, delay: index * 0.09 }
      }
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: `${pos.w}%`,
        zIndex: index,
        x,
        y,
      }}
      className="absolute overflow-hidden rounded-[14px] bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
    >
      <img
        src={src}
        alt=""
        className="aspect-[4/3] w-full object-cover"
        draggable={false}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHELL
   ═══════════════════════════════════════════════════════════════ */

const CORE_VARIANTS: Variant[] = [
  {
    id: "deck",
    number: "01",
    name: "The Deck",
    pitch: "Physical prints stacked on a table. Click to peel through.",
    Component: DeckGallery,
  },
  {
    id: "mosaic",
    number: "02",
    name: "The Mosaic",
    pitch: "An editorial grid that re-composes for every service.",
    Component: MosaicGallery,
  },
  {
    id: "slats",
    number: "03",
    name: "The Slats",
    pitch: "One frame, sliced into louvers. Images wipe in slat by slat.",
    Component: SlatGallery,
  },
  {
    id: "focus",
    number: "04",
    name: "Rack Focus",
    pitch: "The set recedes into depth and pulls focus, like a lens.",
    Component: FocusGallery,
  },
  {
    id: "scatter",
    number: "05",
    name: "The Scatter",
    pitch: "Prints thrown across the table, drifting with the cursor.",
    Component: ScatterGallery,
  },
];

const VARIANTS: Variant[] = [...CORE_VARIANTS, ...PREMIUM_VARIANTS];

export default function ServiceGalleryDemos() {
  const reduce = useReducedMotion();
  const [variant, setVariant] = useState(0);
  const [service, setService] = useState(0);

  const services = en.services.items;
  const active = VARIANTS[variant];
  const Gallery = active.Component;
  const images = galleryFor(service, 5);

  return (
    <main className="min-h-screen bg-bg-surface-light text-[#111111]">
      {/* ── Variant switcher ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-black/8 bg-bg-surface-light/92 backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-5 py-4 sm:px-8 lg:px-12">
          <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red">
            Services gallery · five directions
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {VARIANTS.map((v, i) => (
              <div key={v.id} className="flex items-center gap-2">
                {i === CORE_VARIANTS.length && (
                  <span className="mx-1 hidden h-5 w-px bg-black/15 sm:block" />
                )}
                <button
                  type="button"
                  onClick={() => setVariant(i)}
                  className={`flex items-baseline gap-2 rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors duration-300 ${
                    i === variant
                      ? "bg-brand-red text-white"
                      : "bg-black/5 text-black/55 hover:bg-black/10 hover:text-black/80"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-60">{v.number}</span>
                  {v.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <p className="mb-10 max-w-[52ch] font-body text-[15px] leading-[1.7] text-black/55">
          {active.pitch}
        </p>

        {/* ── Stage: production-shaped two column ─────────────── */}
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Left: service list */}
          <div className="flex flex-col justify-center">
            {services.map((s, i) => {
              const isActive = i === service;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setService(i)}
                  className="group flex w-full items-baseline gap-4 py-2.5 text-left"
                >
                  <span
                    className={`shrink-0 font-mono text-[11px] tracking-widest text-brand-red transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-15"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`font-clash text-[clamp(1.4rem,2.6vw,2.4rem)] font-bold uppercase leading-none transition-colors duration-500 ${
                      isActive
                        ? "text-[#111111]"
                        : "text-[#dcdcdc] group-hover:text-[#a8a8a8]"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}

            {/* Copy block, calm fade only (matches the swap you approved) */}
            <div className="relative mt-8 min-h-[132px]">
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={service}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <p className="mb-4 max-w-[46ch] font-body text-[16px] font-semibold leading-[1.65] text-[#111]">
                    {services[service].description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {services[service].deliverables.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-brand-red"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: the gallery treatment */}
          <div>
            <Gallery images={images} serviceIndex={service} reduce={reduce} />
          </div>
        </div>
      </div>
    </main>
  );
}
