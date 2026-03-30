"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

interface ServiceItem {
  id: string;
  label: string;
  accent: string;
  cards: [string, string, string];
}

/* ═══════════════════════════════════════════════════════════════════════
   Data  (Phase 2 will drive this via state)
   ═══════════════════════════════════════════════════════════════════════ */

const SERVICES: ServiceItem[] = [
  {
    id: "marketing",
    label: "MARKETING",
    accent: "#e5192a",
    cards: [
      "https://i.imgur.com/hp35INW.png",
      "https://i.imgur.com/9pgdQyy.png",
      "https://i.imgur.com/fXXRQRk.png",
    ],
  },
  {
    id: "av",
    label: "A/V PRODUCTION",
    accent: "#f0c917",
    cards: [
      "https://i.imgur.com/hp35INW.png",
      "https://i.imgur.com/9pgdQyy.png",
      "https://i.imgur.com/fXXRQRk.png",
    ],
  },
  {
    id: "web",
    label: "WEB / APP",
    accent: "#3b82f6",
    cards: [
      "https://i.imgur.com/hp35INW.png",
      "https://i.imgur.com/9pgdQyy.png",
      "https://i.imgur.com/fXXRQRk.png",
    ],
  },
  {
    id: "printing",
    label: "PRINTING",
    accent: "#10b981",
    cards: [
      "https://i.imgur.com/hp35INW.png",
      "https://i.imgur.com/9pgdQyy.png",
      "https://i.imgur.com/fXXRQRk.png",
    ],
  },
  {
    id: "branding",
    label: "BRANDING",
    accent: "#a855f7",
    cards: [
      "https://i.imgur.com/hp35INW.png",
      "https://i.imgur.com/9pgdQyy.png",
      "https://i.imgur.com/fXXRQRk.png",
    ],
  },
];

/** Index of the default active (center) pill */
const DEFAULT_CENTER = 2; // WEB / APP

/* ═══════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Runtime equivalent of CSS `clamp(40px, 4.2vw, 60px)`.
 * Used to keep GSAP shrink-target pixel-perfect with the CSS pill size.
 */
const getPillSize = (): number =>
  Math.max(40, Math.min(window.innerWidth * 0.042, 60));

/** Runtime equivalent of CSS `clamp(120px, 18vw, 220px)` */
const getExpandedPillWidth = (): number =>
  Math.max(120, Math.min(window.innerWidth * 0.18, 220));

/**
 * Orders SERVICES around `centerIdx` → `[L2, L1, Center, R1, R2]`.
 * Wraps circularly so any index works.
 */
function getOrderedServices(centerIdx: number): ServiceItem[] {
  const n = SERVICES.length;
  return [
    SERVICES[(centerIdx - 2 + n) % n],
    SERVICES[(centerIdx - 1 + n) % n],
    SERVICES[centerIdx],
    SERVICES[(centerIdx + 1) % n],
    SERVICES[(centerIdx + 2) % n],
  ];
}

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export default function LumaShowcase() {
  /* ── Derived data (static for Phase 1; Phase 2 uses state) ─────── */
  const [activeIndex, setActiveIndex] = useState(DEFAULT_CENTER);
  const ordered = getOrderedServices(activeIndex);
  const active = SERVICES[activeIndex];

  /* ── Refs ─────────────────────────────────────────────────────────── */
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const lionRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pillsRowRef = useRef<HTMLDivElement>(null);
  const centerAnchorRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  /* ═════════════════════════════════════════════════════════════════════
     GSAP Scroll Timeline  —  Phase 1 (scroll-driven, scrubbed)
     ═════════════════════════════════════════════════════════════════════

     Architecture notes (see CRITICAL RULES in prompt):

     1.  CSS centering uses `inset-0 m-auto` (video) and
         `bottom-0 left-0 right-0 mx-auto` (lion) — NO CSS translate,
         so GSAP has uncontested ownership of the `transform` property.

     2.  The "Unified Delta-Center" FLIP math computes a pixel delta
         between the video's center and the target pill's center using
         pure CSS layout math (NOT getBoundingClientRect, which reads
         stale GSAP inline styles during invalidateOnRefresh).
         `invalidateOnRefresh: true` ensures GSAP re-evaluates
         functional values on browser resize.

     3.  `gsap.matchMedia()` wraps the entire timeline so every
         responsive constant (lion shrink width, pill sizes, etc.)
         is recalculated when breakpoints change.

     4.  The Lenis ↔ GSAP bridge lives in SmoothScrollProvider.tsx
         (autoRaf=false, ticker-driven) to prevent pinning jitter.
     ═════════════════════════════════════════════════════════════════════ */

  useGSAP(
    () => {
      /* Bail if any critical ref is missing (pre-mount guard) */
      if (
        !sectionRef.current ||
        !stickyRef.current ||
        !videoRef.current ||
        !lionRef.current ||
        !glowRef.current ||
        !pillsRowRef.current ||
        !centerAnchorRef.current ||
        !headingRef.current ||
        !card1Ref.current ||
        !card2Ref.current ||
        !card3Ref.current
      )
        return;

      /* ── Responsive breakpoint wrapper ─────────────────────────── */
      const mm = gsap.matchMedia();

      mm.add(
        {
          isMobile: "(max-width: 767px)",
          isTablet: "(min-width: 768px) and (max-width: 1023px)",
          isDesktop: "(min-width: 1024px) and (max-width: 1439px)",
          isLarge: "(min-width: 1440px)",
        },
        (ctx) => {
          const c = ctx.conditions as Record<string, boolean>;

           /* ── Responsive constants ─────────────────────────────── */

           // Lion resting size (what it settles to after the overlap shrink)
           const lionRestW = c.isMobile
             ? 350
             : c.isTablet
               ? 390
               : c.isDesktop
                 ? 430
                 : 470;

           // Lion entry size = 1.5× resting (drops from above at this size)
           const lionEntryW = Math.round(lionRestW * 1.3);

           // Lion final small ornamental size (same as before)
           const lionShrinkW = c.isMobile
             ? 200
             : c.isTablet
               ? 210
               : c.isDesktop
                 ? 250
                 : 260;

          // Video pill: CSS initial size (must match Tailwind classes)
          const videoFromW = c.isMobile
            ? "70vw"
            : c.isTablet
              ? "80vw"
              : c.isDesktop
                ? "90vw"
                : "80vw";
          const videoFromH = c.isMobile
            ? "50vw"
            : c.isTablet
              ? "50vw"
              : c.isDesktop
                ? "60vw"
                : "50vw";

          /* ─────────────────────────────────────────────────────────
             Delta-Center — direct DOM measurement

             Uses getBoundingClientRect() on both elements to find
             the exact pixel delta between their visual centres.

             This is safe because GSAP functional values run:
             - At tween creation (elements at CSS baseline), and
             - During invalidateOnRefresh (GSAP reverts ALL inline
               styles to progress 0 before re-evaluating).

             In both cases the rects reflect pure CSS layout, so
             the delta is always pixel-perfect for any viewport.
             ───────────────────────────────────────────────────────── */
          const getDelta = () => {
            const vR = videoRef.current!.getBoundingClientRect();
            const pR = centerAnchorRef.current!.getBoundingClientRect();
            return {
              x: (pR.left + pR.width / 2) - (vR.left + vR.width / 2),
              y: (pR.top + pR.height / 2) - (vR.top + vR.height / 2),
            };
          };

          /* ── Master timeline ──────────────────────────────────── */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });

          /* ───────────────────────────────────────────────────────
             Timeline map  (section is 700vh)

             0.00 → 0.10  Dead zone: sticky video visible, nothing moves.
             0.10 → 0.28  Lion RISES from below at 1.5× resting size,
                          peeks ~55% of its width above its rest position.
             0.28 → 0.60  Lion shrinks 1.5× → ornamental, settles to bottom
                          (overlaps with video shrink for synchronized feel).
             0.10 → 0.64  Video shrinks + translates to pill.
             0.24 → 0.42  Glow fades in.
             0.64 → 0.68  Handoff: video out, pills row in.
             0.68 → 0.76  Side pills scale in.
             0.76 → 0.90  Center pill expands, label fades in.
             0.86 → 1.00  Heading + floating cards stagger in.
             1.00 → 1.50  Final grace space (dead zone to stay in section)
             ─────────────────────────────────────────────────────── */

          /* ── Helper: how far the lion rises above its resting bottom ──
             The lion is bottom-anchored (bottom:0, y=0 = fully at rest).
             A negative y moves it upward.  We want it to peek above the
             video's bottom edge by ~40% of the lion's entry width — enough
             to show the head clearly without the whole body flying up.
             Using a self-relative value (fraction of lionEntryW) makes
             it resize-safe without any getBoundingClientRect dependency.  */
          const getLionPeekY = () => -(lionEntryW * 0);

          // Force lion down and hidden at scroll 0.00
          tl.set(lionRef.current!, { y: () => window.innerHeight, opacity: 0, width: lionEntryW }, 0);

          /* ── Phase A: Lion rises from below ── */
          tl.to(
            lionRef.current!,
            {
              y: () => getLionPeekY(),
              opacity: 1,
              duration: 0.15,
              ease: "power2.out",
            },
            0.05,
          );

          /* ── Phase B: Lion shrinks back to ornamental size at bottom ── */
          tl.to(
            lionRef.current!,
            {
              y: 0,
              width: lionShrinkW,
              duration: 0.20,
              ease: "power2.inOut",
            },
            0.20,
          );

          /* ── Video shrinks + translates to pill ── */
          tl.fromTo(
            videoRef.current!,
            {
              width: videoFromW,
              height: videoFromH,
              borderRadius: 20,
              x: 0,
              y: 0,
            },
            {
              width: () => getPillSize(),
              height: () => getPillSize(),
              borderRadius: 9999,
              x: () => getDelta().x,
              y: () => getDelta().y,
              duration: 0.40,
              ease: "power2.inOut",
            },
            0.05,
          );

          /* ── Glow fades in ── */
          tl.fromTo(
            glowRef.current!,
            { opacity: 0 },
            { opacity: 0.7, duration: 0.15 },
            0.10,
          );

          /* ── Handoff: video out + pills row in ── */
          tl.to(videoRef.current!, { opacity: 0, duration: 0.05 }, 0.45);
          tl.fromTo(
            pillsRowRef.current!,
            { opacity: 0 },
            { opacity: 1, duration: 0.05 },
            0.45,
          );

          /* ── Side pills scale in ── */
          tl.fromTo(
            pillsRowRef.current!,
            {
              "--pill-1-scale": 0,
              "--pill-1-opacity": 0,
              "--pill-3-scale": 0,
              "--pill-3-opacity": 0,
            },
            {
              "--pill-1-scale": 1,
              "--pill-1-opacity": 1,
              "--pill-3-scale": 1,
              "--pill-3-opacity": 1,
              duration: 0.08,
              ease: "back.out(1.7)",
            },
            0.52,
          );
          tl.fromTo(
            pillsRowRef.current!,
            {
              "--pill-0-scale": 0,
              "--pill-0-opacity": 0,
              "--pill-4-scale": 0,
              "--pill-4-opacity": 0,
            },
            {
              "--pill-0-scale": 1,
              "--pill-0-opacity": 1,
              "--pill-4-scale": 1,
              "--pill-4-opacity": 1,
              duration: 0.08,
              ease: "back.out(1.7)",
            },
            0.54,
          );

          /* ── Center pill expands + label fades ── */
          tl.fromTo(
            pillsRowRef.current!,
            { "--center-pill-width": () => `${getPillSize()}px` },
            {
              "--center-pill-width": () => `${getExpandedPillWidth()}px`,
              duration: 0.10,
              ease: "power2.out",
            },
            0.60,
          );

          tl.fromTo(
            pillsRowRef.current!,
            { "--center-label-opacity": 0 },
            { "--center-label-opacity": 1, duration: 0.08 },
            0.72,
          );

          /* ── Heading + floating cards ── */
          tl.fromTo(
            headingRef.current!,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.10, ease: "power2.out" },
            0.82,
          );

          tl.fromTo(
            [card1Ref.current!, card2Ref.current!, card3Ref.current!],
            { scale: 0.3, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              stagger: 0.03,
              duration: 0.10,
              ease: "power2.out",
            },
            0.86,
          );

          /* Anchor to keep totalDuration at 1.3 */
          tl.set({}, {}, 1.3);
        },
      );
    },
    { scope: stickyRef, dependencies: [] },
  );

  /* ═════════════════════════════════════════════════════════════════════
     JSX — Layer stack (z-index order):
       5   Heading
       8   Video pill
      10   Glow layer
      12   Lion cutout
      15   Floating cards (×3)
      20   Pills row
     ═════════════════════════════════════════════════════════════════════ */

  return (
    <section ref={sectionRef} className="relative h-[300vh] md:h-[400vh]">
      <motion.div
        ref={stickyRef}
        className="sticky top-0 h-screen overflow-hidden bg-[#0D0D0D]"
        initial={{ "--luma-accent": active.accent } as any}
        animate={{ "--luma-accent": active.accent } as any}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        {/* ── Heading ──────────────────────────────────────────────── */}
        <h2
          ref={headingRef}
          className={`
            absolute left-0 right-0 z-[5]
            text-center font-bold uppercase leading-none tracking-tight
            text-white opacity-0
            text-[32px] md:text-[48px] lg:text-[64px] 2xl:text-[78px]
            bottom-[calc(40%+clamp(40px,4.2vw,60px)+20px)]
            lg:bottom-[calc(48%+clamp(40px,4.2vw,60px)+20px)]
          `}
        >
          What We Do
        </h2>

        {/* ── Video Pill ───────────────────────────────────────────── *
         *  Centred via `inset-0 m-auto` (no CSS translate) so GSAP   *
         *  fully owns the `transform` property for x / y / scale.    *
         *  Tailwind sets responsive initial width + height; GSAP     *
         *  shrinks them to getPillSize() during Phase 1a.            *
         * ──────────────────────────────────────────────────────────── */}
        <div
          ref={videoRef}
          className={`
            absolute inset-0 z-[8] m-auto overflow-hidden rounded-[20px]
            w-[70vw] h-[50vw]
            md:w-[80vw] md:h-[50vw]
            lg:w-[90vw] lg:h-[60vw]
            2xl:w-[80vw] 2xl:h-[50vw]
          `}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          >
            <source src="https://i.imgur.com/x9yWTNn.mp4" type="video/mp4" />
          </video>
          {/* Subtle dark scrim — makes the handoff to the solid-colour
              center pill less jarring. */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* ── Glow Layer ───────────────────────────────────────────── *
         *  Uses `var(--luma-accent)` so Phase 2 state changes update  *
         *  the colour automatically.                                  *
         * ──────────────────────────────────────────────────────────── */}
        <div
          ref={glowRef}
          className={`
            pointer-events-none absolute bottom-0 left-1/2 z-[10]
            h-[55vh] w-[80vw] -translate-x-1/2 rounded-t-full
            opacity-0 blur-3xl
          `}
          style={{
            background:
              "radial-gradient(ellipse at bottom, var(--luma-accent), transparent 70%)",
          }}
        />

        {/* ── Lion Cutout ──────────────────────────────────────────── *
         *  Bottom-anchored, horizontally centred via `left-0 right-0  *
         *  mx-auto` (no translate). GSAP owns `transform` for the    *
         *  rise animation (y: 100vh → 0) and shrinks `width`.        *
         *  `h-auto` preserves aspect ratio during width animation.   *
         * ──────────────────────────────────────────────────────────── */}
        <img
          ref={lionRef}
          src="https://i.imgur.com/2PGbCnR.png"
          alt="Lion cutout"
          draggable={false}
          className={`
            pointer-events-none absolute bottom-0 left-0 right-0 z-[12]
            mx-auto h-auto select-none object-contain opacity-0
            w-[488px] md:w-[585px] lg:w-[645px] 2xl:w-[705px]
          `}
        />

        {/* ── Floating Cards ───────────────────────────────────────── */}

        {/* Card 1 — Top-left  (hidden on mobile) */}
        <div
          ref={card1Ref}
          className={`
            absolute z-[15] hidden overflow-hidden rounded-[20px] opacity-0
            md:block
            md:left-[1%] md:top-[3%] md:h-[200px] md:w-[170px]
            lg:left-[2%] lg:top-[3%] lg:h-[310px] lg:w-[260px]
          `}
        >
          <AnimatePresence>
            <motion.img
              key={active.id}
              src={active.cards[0]}
              alt="Service demo — top left"
              className="absolute h-full w-full object-cover"
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            />
          </AnimatePresence>
        </div>

        {/* Card 2 — Top-right */}
        <div
          ref={card2Ref}
          className={`
            absolute z-[15] overflow-hidden rounded-[20px] opacity-0
            right-[2%] top-[4%] h-[140px] w-[200px]
            md:right-[2%] md:top-[6%] md:h-[180px] md:w-[270px]
            lg:right-[4%] lg:top-[8%] lg:h-[280px] lg:w-[420px]
          `}
        >
          <AnimatePresence>
            <motion.img
              key={active.id}
              src={active.cards[1]}
              alt="Service demo — top right"
              className="absolute h-full w-full object-cover"
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            />
          </AnimatePresence>
        </div>

        {/* Card 3 — Bottom-right */}
        <div
          ref={card3Ref}
          className={`
            absolute z-[15] overflow-hidden rounded-[20px] opacity-0
            right-[2%] bottom-[8%] h-[140px] w-[110px]
            md:right-[3%] md:bottom-[10%] md:h-[160px] md:w-[130px]
            lg:right-[5%] lg:bottom-[12%] lg:h-[240px] lg:w-[190px]
          `}
        >
          <AnimatePresence>
            <motion.img
              key={active.id}
              src={active.cards[2]}
              alt="Service demo — bottom right"
              className="absolute h-full w-full object-cover"
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            />
          </AnimatePresence>
        </div>

        {/* ── Pills Row ────────────────────────────────────────────── *
         *  Tailwind `-translate-x-1/2` uses the CSS `translate`       *
         *  property (not `transform`), so it coexists safely with     *
         *  GSAP's `transform`-based `scale` on the child pills.      *
         * ──────────────────────────────────────────────────────────── */}
        <div
          ref={pillsRowRef}
          className={`
            absolute left-1/2 z-[20] flex -translate-x-1/2 items-center
            opacity-0
            top-[60%] gap-2
            md:gap-3 lg:top-[52%]
          `}
        >
          {/* Hidden anchor for Delta center measurement */}
          <div
            ref={centerAnchorRef}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[clamp(40px,4.2vw,60px)] w-[clamp(40px,4.2vw,60px)] -translate-x-1/2 -translate-y-1/2 opacity-0"
          />

          {ordered.map((item, i) => {
            const isCenter = i === 2;
            return (
              <div
                key={i}
                onClick={() => {
                  const originalIndex = SERVICES.findIndex((s) => s.id === item.id);
                  setActiveIndex(originalIndex);
                }}
                className="shrink-0 rounded-full"
                style={{
                  width: isCenter
                    ? "var(--center-pill-width, clamp(40px,4.2vw,60px))"
                    : "clamp(40px,4.2vw,60px)",
                  height: "clamp(40px,4.2vw,60px)",
                  cursor: "pointer",
                }}
              >
                <div
                  className={`
                    flex h-full w-full items-center justify-center overflow-hidden
                    rounded-full backdrop-blur-md
                    ${isCenter ? "" : "border border-white/10 bg-white/20"}
                  `}
                  style={{
                    backgroundColor: isCenter ? "var(--luma-accent)" : undefined,
                    transform: isCenter ? "none" : `scale(var(--pill-${i}-scale, 0))`,
                    opacity: isCenter ? 1 : `var(--pill-${i}-opacity, 0)`,
                  }}
                  title={item.label}
                >
                  <AnimatePresence mode="wait">
                    {isCenter ? (
                      <motion.span
                        key={`center-${item.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          whitespace-nowrap px-3 text-[11px] font-bold uppercase
                          tracking-wider text-white
                          md:text-[12px]
                        `}
                      >
                        <span style={{ opacity: "var(--center-label-opacity, 0)" }}>
                          {item.label}
                        </span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key={`side-${item.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[10px] font-semibold uppercase tracking-wide text-white/70"
                      >
                        {item.label.slice(0, 3)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
