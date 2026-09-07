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
import PaneCardView from "./PaneCardView";
import type { PillarId } from "../pillars/config/pillars";

const PILLAR_IDS: readonly PillarId[] = ["LION", "NOVA", "ART"];

interface Card {
  code: string;
  title: string;
  body: string;
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

/* ─── Motion tuning ─────────────────────────────────────────── */

const CURSOR_SPRING = { stiffness: 140, damping: 22, mass: 0.6 } as const;
const TILT_Y = 7;
const TILT_X = 5;

const SECTION_HEIGHT_VH = 190;
const SPLIT_START = 0.08;
const SPLIT_END = 0.58;

const CANVAS_DPR_CAP = 2;

function useLocalProgress(source: MotionValue<number>, start: number, end: number) {
  return useTransform(source, [start, end], [0, 1], { clamp: true });
}

/* ─── Pane ──────────────────────────────────────────────────── */

// True pillar accents (not the homepage's warm-only gradient): each card's
// spotlight and edge light run its own signature color.
const SPOT_STOPS: [core: string, mid: string, edge: string][] = [
  ["232,160,32", "255,182,61", "122,60,0"], // LION gold
  ["123,63,242", "46,107,255", "43,15,102"], // NOVA violet → electric blue
  ["229,25,42", "255,59,78", "77,2,8"], // ART crimson
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
  const stagger = Math.abs(dir) * 0.08;

  const splitP = useLocalProgress(flip, 0 + stagger, 0.36 + stagger);
  const flipP = useLocalProgress(flip, 0.14 + stagger, 0.52 + stagger);
  const backP = useLocalProgress(flip, 0.42 + stagger, 0.62 + stagger);
  const codeP = useLocalProgress(flip, 0.46 + stagger, 0.68 + stagger);
  const contentP = useLocalProgress(flip, 0.56 + i * 0.05, 0.8 + i * 0.05);

  const paneX = useTransform(splitP, (p) => (isDesktop ? `${dir * 2.4 * p}vw` : "0vw"));
  const paneY = useTransform(splitP, (p) => (isDesktop ? "0vh" : `${dir * 2.4 * p}vh`));
  const paneRotateY = useTransform(splitP, (p) => (isDesktop ? dir * -11 * p : 0));
  const paneRotateX = useTransform(splitP, (p) => (isDesktop ? 0 : dir * 11 * p));
  const paneBorderRadius = useTransform(splitP, (p) => 18 * p);

  const innerFlipRotateY = useTransform(flipP, (p) => 180 * p);

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
      whileHover={armed ? { z: 46, transition: { duration: 0.4, ease: "easeOut" } } : undefined}
    >
      <motion.div
        className="absolute inset-0"
        style={{ rotateY: innerFlipRotateY, transformStyle: "preserve-3d", borderRadius: "inherit" }}
      >
        {/* Front face — this pane's own crop of the one shared video. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[inherit]"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        </div>

        {/* Back face — the v2 WebGPU glass card fills the pane; DOM layers
            below remain as the no-WebGL fallback, typography stays DOM. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[inherit] bg-bg-dark/45"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), inset 1px 0 0 rgba(255,255,255,0.07)",
          }}
        >
          <PaneCardView pillar={PILLAR_IDS[i % PILLAR_IDS.length]} reveal={backP} />

          {/* The pillar word, oversize and bled off the top-left corner. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-3 select-none font-clash text-[2.9rem] font-bold uppercase leading-[0.78] tracking-[-0.05em] text-white/[0.08] md:left-6 md:top-5 md:text-[clamp(3.25rem,5.6vw,4.75rem)]"
            style={{ opacity: codeP, y: codeMarkY }}
          >
            {card.code}
          </motion.span>

          {/* Spotlight, armed once the flip has landed. Colour stays reserved
              for the card the cursor is on — selection, not decoration. */}
          {armed ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ease-out"
              style={{
                opacity: "var(--spot-active, 0)",
                background: `radial-gradient(circle 220px at var(--spot-x, 50%) var(--spot-y, 35%), rgba(${SPOT_STOPS[i][0]},0.14) 0%, rgba(${SPOT_STOPS[i][1]},0.06) 42%, rgba(${SPOT_STOPS[i][2]},0.02) 62%, transparent 74%)`,
              }}
            />
          ) : null}

          <motion.div
            className="absolute inset-x-0 bottom-0 p-4 text-left [text-shadow:0_1px_10px_rgba(0,0,0,0.75)] md:p-6"
            style={{ opacity: contentP, y: contentY }}
          >
            <h3 className="font-clash text-[1.1rem] font-bold uppercase leading-[0.95] text-white md:text-[1.9rem]" style={{ wordSpacing: "0.2em" }}>
              {card.title}
            </h3>
            <p className="mt-1.5 max-w-[25ch] font-body text-[11px] leading-[1.35] text-white/70 md:mt-2 md:min-h-[63px] md:max-w-[34ch] md:text-[14px] md:leading-[1.5]">
              {card.body}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Section ───────────────────────────────────────────────── */

/**
 * SplitShowcase — the v2 rebuild of the split-card choreography. One shared
 * video plays joined, splits into three panes on scroll, and each pane flips
 * from its footage crop to a live WebGPU glass pillar card. Fully
 * scroll-scrubbed (reversible), one decoder, cursor rig arms on settle.
 */
export default function SplitShowcase({ cards, video }: Props) {
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
  const armed = !reduce && entranceDone;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const u = () => setIsDesktop(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const scrollFlip = useTransform(scrollYProgress, [SPLIT_START, SPLIT_END], [0, 1], { clamp: true });
  const staticFlip = useMotionValue(1);
  const flip = reduce ? staticFlip : scrollFlip;

  useMotionValueEvent(flip, "change", (v) => {
    if (reduce) return;
    setEntranceDone(v > 0.98);
  });

  /* Video mirror: one decode, drawn into 3 cropped canvases via rAF. */
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

  /* Cursor rig — normalised -1..1, spring-smoothed. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, CURSOR_SPRING);
  const sy = useSpring(py, CURSOR_SPRING);

  const rotateY = useTransform(sx, [-1, 1], [-TILT_Y, TILT_Y]);
  const rotateX = useTransform(sy, [-1, 1], [TILT_X, -TILT_X]);
  const sheen = useTransform(sx, [-1, 0, 1], [0.55, 0.14, 0.55]);

  const measure = useCallback(() => {
    rectRef.current = stageRef.current?.getBoundingClientRect() ?? null;
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

      if (e.pointerType !== "touch") {
        paneRectsRef.current.forEach((pr, i) => {
          const el = paneNodesRef.current[i];
          if (!el || !pr) return;
          const inside =
            e.clientX >= pr.left && e.clientX <= pr.right && e.clientY >= pr.top && e.clientY <= pr.bottom;
          el.style.setProperty("--spot-active", inside ? "1" : "0");
          if (inside) {
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
        {/* Ambient wash — the same footage, blurred past legibility. */}
        <canvas
          ref={washRef}
          width={72}
          height={40}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2"
          style={{
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

          {/* Glass plane — tilts as one sheet so the three panes stay a single
              object. */}
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
