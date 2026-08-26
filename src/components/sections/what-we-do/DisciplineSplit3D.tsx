"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

// Locked tag style (flip to red here if preferred).
interface Card {
  code: string;
  title: string;
  body: string;
  image?: string;
}

interface Props {
  cards: Card[];
  video: string;
}

interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/* â”€â”€â”€ Motion tuning â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

// Soft enough that releasing the cursor glides home instead of snapping.
const CURSOR_SPRING = { stiffness: 140, damping: 22, mass: 0.6 } as const;

// Max tilt of the whole glass plane, in degrees.
const TILT_Y = 7;
const TILT_X = 5;

// How far into the section's scroll runway the split+flip choreography is
// scrubbed. Below SPLIT_START the video plays joined; between the two, the
// panes track the scrollbar directly (forward *and* backward — scrolling
// back up re-joins them and the video comes back together); past
// SPLIT_END the scene is settled and the cursor rig can arm.
const SECTION_HEIGHT_VH = 190;
const SPLIT_START = 0.08;
const SPLIT_END = 0.58;

// Caps the canvas backing-store size on very-high-DPR screens.
const CANVAS_DPR_CAP = 2;

// Maps a slice of the master 0→1 scrub progress to its own local 0→1 —
// each animated property (translate, flip, opacity, ...) reads its cue
// from a different slice, which is what turns one scroll-linked value
// into a choreographed, fully reversible sequence instead of a canned,
// time-based one.
function useLocalProgress(source: MotionValue<number>, start: number, end: number) {
  return useTransform(source, [start, end], [0, 1], { clamp: true });
}

/* â”€â”€â”€ Pane â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

// One point per pillar on a single warm gradient, rather than the same
// accent repeated three times: LION sits at sovereign gold, ART warms into
// the brand's own Lacquer Red, NOVA is the amber waypoint between them.
const SPOT_STOPS: [core: string, mid: string, edge: string][] = [
  ["255,214,64", "255,150,32", "255,116,24"],
  ["255,186,56", "255,128,32", "255,92,24"],
  ["255,150,72", "237,72,40", "229,25,42"],
];

function Pane({
  card,
  dir,
  i,
  isDesktop,
  flip,
  armed,
  canvasRef,
  paneRef: registerPane,
}: {
  card: Card;
  dir: number;
  i: number;
  isDesktop: boolean;
  flip: MotionValue<number>;
  armed: boolean;
  canvasRef: (el: HTMLCanvasElement | null) => void;
  paneRef: (el: HTMLDivElement | null) => void;
}) {
  // Centre pane leads, outer two lag slightly behind it on the scrub —
  // reads as choreographed rather than three panes moving in lockstep
  // with the scrollbar.
  const stagger = Math.abs(dir) * 0.08;

  const splitP = useLocalProgress(flip, 0 + stagger, 0.36 + stagger);
  const flipP = useLocalProgress(flip, 0.14 + stagger, 0.52 + stagger);
  const ringP = useLocalProgress(flip, 0.02 + stagger, 0.2 + stagger);
  const backP = useLocalProgress(flip, 0.42 + stagger, 0.62 + stagger);
  const codeP = useLocalProgress(flip, 0.46 + stagger, 0.68 + stagger);
  const contentP = useLocalProgress(flip, 0.56 + i * 0.05, 0.8 + i * 0.05);

  // The split-apart translate/tilt — driven straight off scroll, so it
  // scrubs forward and backward with the gesture instead of playing once.
  const paneX = useTransform(splitP, (p) => (isDesktop ? `${dir * 2.4 * p}vw` : "0vw"));
  const paneY = useTransform(splitP, (p) => (isDesktop ? "0vh" : `${dir * 2.4 * p}vh`));
  const paneRotateY = useTransform(splitP, (p) => (isDesktop ? dir * -11 * p : 0));
  const paneRotateX = useTransform(splitP, (p) => (isDesktop ? 0 : dir * 11 * p));
  const paneBorderRadius = useTransform(splitP, (p) => 18 * p);

  // The flip itself — a separate nested rotateY, independent of the split's
  // own rotateY tilt and the cursor rig's group tilt. Three different nodes,
  // three different timelines; the browser composes them, we don't have to.
  const innerFlipRotateY = useTransform(flipP, (p) => 180 * p);

  const backImageOpacity = useTransform(backP, [0, 1], [0, 0.28]);
  const codeMarkY = useTransform(codeP, [0, 1], [10, 0]);
  const contentY = useTransform(contentP, [0, 1], [18, 0]);

  return (
    <motion.div
      ref={registerPane}
      className="relative flex-1"
      style={{
        x: paneX,
        y: paneY,
        rotateX: paneRotateX,
        rotateY: paneRotateY,
        borderRadius: paneBorderRadius,
        transformStyle: "preserve-3d",
      }}
      // Lift on hover; `z` composes with the group tilt instead of fighting it.
      whileHover={armed ? { z: 46, transition: { duration: 0.4, ease: "easeOut" } } : undefined}
    >
      {/* The flip -- its own nested rotateY, separate from the pane's resting
          tilt above and the cursor rig further up the tree. */}
      <motion.div
        className="absolute inset-0"
        style={{ rotateY: innerFlipRotateY, transformStyle: "preserve-3d", borderRadius: "inherit" }}
      >
        {/* Front face -- this pane's own crop of the one shared video. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[inherit]"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20"
            style={{ opacity: ringP }}
          />
        </div>

        {/* Back face -- revealed once the pane has turned to face forward.
            Deliberately translucent: the blurred footage washing behind the
            stage is what the glass refracts, so the fill stays light. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[inherit] bg-bg-dark/45"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            // No backdrop filter here. Three independently transformed blur
            // layers are expensive during scroll and can contend with the
            // fixed navbar compositor layer.
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), inset 1px 0 0 rgba(255,255,255,0.07)",
          }}
        >
          {card.image ? (
            <motion.img
              src={card.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: backImageOpacity }}
            />
          ) : null}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 85% at 6% 0%, rgba(255,255,255,0.23) 0%, transparent 48%), linear-gradient(150deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.045) 52%, rgba(255,255,255,0.025) 100%)",
              opacity: backP,
            }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20"
            style={{ opacity: backP }}
          />
          {/* The pillar word, oversize and bled off the top-left corner. */}
          {/* Left edge shares the text block's margin, so the card reads as
              one composition: pillar word top, promise bottom, same spine. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-3 select-none font-clash text-[2.9rem] font-bold uppercase leading-[0.78] tracking-[-0.05em] text-white/[0.08] md:left-6 md:top-5 md:text-[clamp(3.25rem,5.6vw,4.75rem)]"
            style={{ opacity: codeP, y: codeMarkY }}
          >
            {card.code}
          </motion.span>

          {/* Spotlight, armed only once the flip has fully landed. The edge
              light carries the effect; the surface wash underneath is now
              just enough to seat it, not compete with it. Colour comes from
              SPOT_STOPS, one point per pillar on a single gold-to-Lacquer-Red
              gradient, so the three cards read as variations of one system
              instead of the same accent stamped three times.
              Opacity is driven by --spot-active, a var the stage's own
              pointermove handler writes after a flat 2D box test against
              this pane's rect. Native :hover isn't used: these panes are
              rotateY-tilted, so CSS hit-tests the rendered 3D trapezoid, not
              the visual rectangle -- the tilted-away edge of the outer two
              cards would never register a hover close to their outer side. */}
          {armed ? (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ease-out"
                style={{
                  opacity: "var(--spot-active, 0)",
                  background: `radial-gradient(circle 220px at var(--spot-x, 50%) var(--spot-y, 35%), rgba(${SPOT_STOPS[i][0]},0.14) 0%, rgba(${SPOT_STOPS[i][1]},0.06) 42%, rgba(${SPOT_STOPS[i][2]},0.02) 62%, transparent 74%)`,
                }}
              />
              {/* Travelling edge light, in two passes: a blurred bloom that
                  spills off the border, then the crisp line on top. Colour
                  stays reserved for the card the cursor is on, so it reads as
                  selection rather than decoration. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] p-[3.5px] blur-[5px] transition-opacity duration-500 ease-out"
                style={{
                  opacity: "calc(var(--spot-active, 0) * 0.95)",
                  background: `radial-gradient(circle 300px at var(--spot-x, 50%) var(--spot-y, 35%), rgba(${SPOT_STOPS[i][0]},1) 0%, rgba(${SPOT_STOPS[i][2]},0.3) 52%, transparent 72%)`,
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  maskComposite: "exclude",
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] p-[1.75px] transition-opacity duration-500 ease-out"
                style={{
                  opacity: "var(--spot-active, 0)",
                  background: `radial-gradient(circle 300px at var(--spot-x, 50%) var(--spot-y, 35%), rgba(255,245,214,1) 0%, rgba(${SPOT_STOPS[i][0]},1) 16%, rgba(${SPOT_STOPS[i][1]},0.6) 45%, rgba(${SPOT_STOPS[i][2]},0.14) 65%, transparent 80%)`,
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  maskComposite: "exclude",
                }}
              />
            </>
          ) : null}

          <motion.div
            className="absolute inset-x-0 bottom-0 p-4 text-left [text-shadow:0_1px_10px_rgba(0,0,0,0.75)] md:p-6"
            style={{ opacity: contentP, y: contentY }}
          >
            <h3 className="font-clash text-[1.1rem] font-bold uppercase leading-[0.95] text-white md:text-[1.9rem]">
              {card.title}
            </h3>
            {/* Reserved height keeps the three headings on one baseline even
                when a locale wraps the body to a different line count. */}
            <p className="mt-1.5 max-w-[25ch] font-body text-[11px] leading-[1.35] text-white/70 md:mt-2 md:min-h-[63px] md:max-w-[34ch] md:text-[14px] md:leading-[1.5]">
              {card.body}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
/* â”€â”€â”€ Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * DisciplineSplit3D -- plays the clip joined and full-frame, then, as
 * scroll moves through the section, splits the three panes apart and
 * flips each one from its own crop of that footage to a glass card (the
 * outcome pillars). Desktop splits horizontally, mobile vertically.
 *
 * The whole sequence is scroll-scrubbed, not triggered: a single motion
 * value tracks scrollYProgress directly, and every pane's translate,
 * flip, and content reveal is a useTransform of that value. Scrolling
 * forward plays it, scrolling back reverses it continuously -- there's
 * no canned timeline running on its own clock once a threshold is
 * crossed.
 *
 * A single hidden <video> is the only decoder in the section; a shared
 * requestAnimationFrame loop mirrors its frames into each pane's own
 * <canvas>, cropped to that pane's third, so the video is what visibly
 * splits into three without paying for three decode pipelines.
 */
export default function DisciplineSplit3D({ cards, video }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const cropRectsRef = useRef<(CropRect | null)[]>([]);
  const washRef = useRef<HTMLCanvasElement | null>(null);
  const paneNodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const paneRectsRef = useRef<(DOMRect | null)[]>([]);

  const reduce = useReducedMotion();
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

  /* --- Scroll-scrubbed master progress: 0 (joined) to 1 (split, flipped,
     content revealed) across [SPLIT_START, SPLIT_END] of the section's
     scroll range. Scrolling back through that range reverses it -- this
     is a direct useTransform of scrollYProgress, not a triggered timeline. --- */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const scrollFlip = useTransform(scrollYProgress, [SPLIT_START, SPLIT_END], [0, 1], { clamp: true });
  const staticFlip = useMotionValue(1);
  const flip = reduce ? staticFlip : scrollFlip;

  // Cursor rig arms only once the sequence has fully landed, and disarms
  // again the moment scrolling back pulls it out of the settled state.
  useMotionValueEvent(flip, "change", (v) => {
    if (reduce) return;
    setEntranceDone(v > 0.98);
  });

  /* â”€â”€â”€ Video mirror: one decode, drawn into 3 cropped canvases via rAF.
     Stops for good once every pane has finished flipping â€” the front
     faces are then permanently hidden by backface-visibility. â”€â”€â”€ */
  const rafRef = useRef<number | null>(null);

  const startLoop = useCallback(() => {
    if (rafRef.current != null || reduce) return;
    const tick = () => {
      const v = videoRef.current;
      if (v) {
        cropRectsRef.current.forEach((rect, i) => {
          const canvas = canvasRefs.current[i];
          if (!canvas || !rect) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(v, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, canvas.width, canvas.height);
        });

        // Ambient wash: the whole frame at a deliberately tiny backing store,
        // scaled up and blurred by CSS. At this size the draw is free, and
        // the blur is what the glass panes refract.
        const wash = washRef.current;
        const wctx = wash?.getContext("2d");
        if (wash && wctx) {
          wctx.drawImage(v, 0, 0, wash.width, wash.height);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [reduce]);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Recomputes each pane's source crop rect (and its canvas's backing-store
  // size) from the stage's current box and the video's intrinsic size â€”
  // reproduces an object-cover fill across the *combined* 3-pane box, then
  // slices that into thirds, so joined panes read as one continuous frame.
  const recomputeCrops = useCallback(() => {
    const v = videoRef.current;
    const stage = stageRef.current;
    if (!v || !stage || !v.videoWidth || !v.videoHeight) return;

    const stageRect = stage.getBoundingClientRect();
    const scale = Math.max(stageRect.width / v.videoWidth, stageRect.height / v.videoHeight);
    const srcW = stageRect.width / scale;
    const srcH = stageRect.height / scale;
    const sx0 = (v.videoWidth - srcW) / 2;
    const sy0 = (v.videoHeight - srcH) / 2;
    const dpr = Math.min(window.devicePixelRatio || 1, CANVAS_DPR_CAP);

    for (let i = 0; i < 3; i++) {
      cropRectsRef.current[i] = isDesktop
        ? { sx: sx0 + i * (srcW / 3), sy: sy0, sw: srcW / 3, sh: srcH }
        : { sx: sx0, sy: sy0 + i * (srcH / 3), sw: srcW, sh: srcH / 3 };

      const canvas = canvasRefs.current[i];
      if (canvas) {
        const paneRect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(paneRect.width * dpr));
        canvas.height = Math.max(1, Math.round(paneRect.height * dpr));
      }
    }
  }, [isDesktop]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.addEventListener("loadedmetadata", recomputeCrops);
    if (v.readyState >= 1) recomputeCrops();
    return () => v.removeEventListener("loadedmetadata", recomputeCrops);
  }, [recomputeCrops]);

  useEffect(() => {
    recomputeCrops();
  }, [isDesktop, recomputeCrops]);

  useEffect(() => {
    window.addEventListener("resize", recomputeCrops);
    return () => window.removeEventListener("resize", recomputeCrops);
  }, [recomputeCrops]);

  // Perf: only decode/play the video (and run the mirror loop) while the
  // section is in view â€” and never again once every pane has flipped.
  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current;
        if (!v) return;
        if (entry.isIntersecting) {
          void v.play().catch(() => {});
          startLoop();
        } else {
          v.pause();
          stopLoop();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(sec);
    return () => {
      io.disconnect();
      stopLoop();
    };
  }, [startLoop, stopLoop]);

  /* Cursor rig â€” normalised -1..1, spring-smoothed. Releasing sets the raw
     values to 0 and the spring carries them home; no exit animation needed,
     and no snap. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, CURSOR_SPRING);
  const sy = useSpring(py, CURSOR_SPRING);

  const rotateY = useTransform(sx, [-1, 1], [-TILT_Y, TILT_Y]);
  const rotateX = useTransform(sy, [-1, 1], [TILT_X, -TILT_X]);
  const sheen = useTransform(sx, [-1, 0, 1], [0.55, 0.14, 0.55]);

  // Cache the stage rect instead of measuring on every pointermove â€” a
  // getBoundingClientRect() per move forces sync layout, which is exactly the
  // kind of main-thread work Lenis-smoothed pages can least afford.
  const measure = useCallback(() => {
    rectRef.current = stageRef.current?.getBoundingClientRect() ?? null;
    // Flat 2D rects, deliberately â€” the panes are rotateY-tilted, and testing
    // against the true 3D geometry is exactly what leaves the outer edge of
    // the outer two cards dead to hover. The visual rectangle is the target.
    paneRectsRef.current = paneNodesRef.current.map((el) => el?.getBoundingClientRect() ?? null);
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

      // Per-pane spotlight: a flat box test against each pane's cached rect,
      // independent of the pane's own 3D tilt. Touch has no hover concept,
      // and tracking it would fight Lenis for the scroll gesture.
      if (e.pointerType !== "touch") {
        paneRectsRef.current.forEach((pr, i) => {
          const el = paneNodesRef.current[i];
          if (!el || !pr) return;
          const inside =
            e.clientX >= pr.left && e.clientX <= pr.right && e.clientY >= pr.top && e.clientY <= pr.bottom;
          el.style.setProperty("--spot-active", inside ? "1" : "0");
          if (inside) {
            // No mirroring: the back face's own rotateY(180deg) cancels
            // against the parent's flip, so its local axes match the screen.
            el.style.setProperty("--spot-x", `${e.clientX - pr.left}px`);
            el.style.setProperty("--spot-y", `${e.clientY - pr.top}px`);
          }
        });
      }
    },
    [armed, px, py],
  );

  const handleLeave = useCallback(() => {
    px.set(0);
    py.set(0);
    paneNodesRef.current.forEach((el) => el?.style.setProperty("--spot-active", "0"));
  }, [px, py]);

  return (
    <section ref={sectionRef} className="relative bg-bg-dark" style={{ height: `${SECTION_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 z-40 flex min-h-screen flex-col items-center justify-center gap-[clamp(2.5rem,6vh,5rem)] overflow-hidden px-3 py-24 md:px-4">
        {/* Ambient wash â€” the same footage, blurred past legibility, pooling
            behind the stage. It's what makes the translucent panes read as
            glass, and it's masked to a soft pool so it never squares off
            into a panel. Oversized so the blur's own edge stays offscreen. */}
        <canvas
          ref={washRef}
          width={72}
          height={40}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2"
          style={{
            // Held down hard: the footage runs cool magenta, and this is a
            // black-red-gold system. It should read as light in the room,
            // not as a second palette.
            filter: "blur(64px) saturate(0.72) contrast(1.05)",
            opacity: 0.3,
            maskImage:
              "radial-gradient(52% 46% at 50% 50%, #000 0%, rgba(0,0,0,0.55) 58%, transparent 84%)",
            WebkitMaskImage:
              "radial-gradient(52% 46% at 50% 50%, #000 0%, rgba(0,0,0,0.55) 58%, transparent 84%)",
          }}
        />

        <div
          ref={stageRef}
          className="relative z-40 w-[min(80vw,450px)] lg:w-[min(85vw,1060px)] xl:w-[min(85vw,1220px)] 2xl:w-[min(78vw,1400px)]"
          style={{ perspective: "1400px" }}
          onPointerEnter={measure}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
        >
          {/* Hidden source: the section's only decoder. Kept at real layout
              size via opacity (not display/visibility) so nothing throttles
              its decode â€” the canvases are what's actually seen. */}
          <video
            ref={videoRef}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
            src={video}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
          />

          {/* Glass plane â€” tilts as one sheet so the three panes stay a single
              object. Individual feedback lives on the panes' hover lift. */}
          <motion.div
            className="relative flex h-[clamp(350px,66vh,660px)] w-full flex-col lg:h-[clamp(300px,54vh,560px)] lg:flex-row xl:h-[clamp(320px,56vh,620px)] 2xl:h-[clamp(340px,58vh,680px)]"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {cards.map((card, i) => (
              <Pane
                key={`${card.title}-${isDesktop ? "d" : "m"}`}
                card={card}
                dir={i - 1}
                i={i}
                isDesktop={isDesktop}
                flip={flip}
                armed={armed}
                canvasRef={(el) => {
                  canvasRefs.current[i] = el;
                }}
                paneRef={(el) => {
                  paneNodesRef.current[i] = el;
                }}
              />
            ))}
            {/* One reflection belongs to the complete object. Keeping it out of
                individual panes prevents hard vertical seams from appearing
                when the cursor tilts the three-card assembly. */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[18px]"
              style={{
                opacity: sheen,
                transform: "translateZ(2px)",
                background:
                  "radial-gradient(75% 65% at 50% -18%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.075) 38%, transparent 72%)",
                maskImage: "linear-gradient(180deg, #000 0%, transparent 58%)",
                WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 58%)",
              }}
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
