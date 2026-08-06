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

interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/* ─── Motion tuning ───────────────────────────────────────────────── */

// Soft enough that releasing the cursor glides home instead of snapping.
const CURSOR_SPRING = { stiffness: 140, damping: 22, mass: 0.6 } as const;

// Max tilt of the whole glass plane, in degrees.
const TILT_Y = 7;
const TILT_X = 5;

// Cursor interaction arms only once the entrance has settled.
const ARM_DELAY_MS = 1600;

// How far into the section's scroll runway the split/flip fires.
const SECTION_HEIGHT_VH = 190;
const SCROLL_TRIGGER_THRESHOLD = 0.4;

// Per-pane flip: centre leads, outer two follow (mirrors the split stagger).
const FLIP_DURATION = 0.95;
const FLIP_DELAY_BASE = 0.22;
const FLIP_STAGGER_STEP = 0.08;

// Caps the canvas backing-store size on very-high-DPR screens.
const CANVAS_DPR_CAP = 2;

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

function flipEndDelay(dir: number) {
  return FLIP_DELAY_BASE + Math.abs(dir) * FLIP_STAGGER_STEP + FLIP_DURATION;
}

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

// The flip itself — a separate nested rotateY, independent of the split's
// own rotateY tilt and the cursor rig's group tilt. Three different nodes,
// three different timelines; the browser composes them, we don't have to.
const flipVariants = {
  joined: { rotateY: 0 },
  split: ({ dir }: PaneCustom) => ({
    rotateY: 180,
    transition: {
      duration: FLIP_DURATION,
      delay: FLIP_DELAY_BASE + Math.abs(dir) * FLIP_STAGGER_STEP,
      ease: EASE_OUT,
    },
  }),
};

// Front-face ring crystallises in step with the split-apart translate —
// there's nothing else on the front face to reveal, it's just the crop.
const frontRingVariants = {
  joined: { opacity: 0 },
  split: { opacity: 1, transition: { duration: 0.6, delay: 0.28, ease: "easeOut" as const } },
};

// Back face has nothing to show until its own flip has (nearly) landed.
const backGlassVariants = {
  joined: { opacity: 0 },
  split: ({ dir }: PaneCustom) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: flipEndDelay(dir) - 0.25, ease: "easeOut" as const },
  }),
};

const backImageVariants = {
  joined: { opacity: 0 },
  split: ({ dir }: PaneCustom) => ({
    opacity: 0.28,
    transition: { duration: 0.55, delay: flipEndDelay(dir) - 0.2, ease: "easeOut" as const },
  }),
};

const backScrimVariants = {
  joined: { opacity: 0 },
  split: ({ dir }: PaneCustom) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: flipEndDelay(dir) - 0.15, ease: "easeOut" as const },
  }),
};

const contentVariants = {
  joined: { opacity: 0, y: 18 },
  split: ({ dir, i }: PaneCustom) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: flipEndDelay(dir) + i * 0.08, ease: EASE_OUT },
  }),
};

/* ─── Pane ────────────────────────────────────────────────────────── */

function Pane({
  card,
  custom,
  armed,
  sheen,
  canvasRef,
}: {
  card: Card;
  custom: PaneCustom;
  armed: boolean;
  sheen: MotionValue<number>;
  canvasRef: (el: HTMLCanvasElement | null) => void;
}) {
  return (
    <motion.div
      className="relative flex-1"
      variants={paneVariants}
      custom={custom}
      // Lift on hover; `z` composes with the group tilt instead of fighting it.
      whileHover={armed ? { z: 46, transition: { duration: 0.4, ease: "easeOut" } } : undefined}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* The flip — its own nested rotateY, separate from the pane's resting
          tilt above and the cursor rig further up the tree. */}
      <motion.div
        className="absolute inset-0"
        variants={flipVariants}
        custom={custom}
        style={{ transformStyle: "preserve-3d", borderRadius: "inherit" }}
      >
        {/* Front face — this pane's own crop of the one shared video. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[inherit]"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 h-[45%]"
            style={{
              opacity: sheen,
              background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
              maskImage: "linear-gradient(180deg, #000 0%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 100%)",
            }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20"
            variants={frontRingVariants}
          />
        </div>

        {/* Back face — revealed once the pane has turned to face forward. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[inherit] bg-[#111111]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <motion.img
            src={card.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            variants={backImageVariants}
            custom={custom}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            variants={backScrimVariants}
            custom={custom}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(150deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.055) 44%, rgba(255,255,255,0.02) 100%)",
            }}
            variants={backGlassVariants}
            custom={custom}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20"
            variants={backGlassVariants}
            custom={custom}
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
        </div>
      </motion.div>
    </motion.div>
  );
}
/* ─── Section ─────────────────────────────────────────────────────── */

/**
 * DisciplineSplit3D — plays the clip joined and full-frame, then, once
 * scroll crosses a threshold further into the section, splits the three
 * panes apart and flips each one from its own crop of that footage to a
 * glass card (the outcome pillars). Desktop splits horizontally, mobile
 * vertically.
 *
 * Scroll only decides *when* the sequence fires — a one-shot boolean, not a
 * scrubbed progress value. The animation itself plays on authored easing,
 * same as before; this just adds scroll-gated timing on top instead of
 * firing the instant the section enters view.
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

  /* ─── Scroll-gated trigger: plays joined, then fires the split+flip once
     and never reverses, even if the user scrolls back up. ─── */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const hasTriggeredRef = useRef(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (hasTriggeredRef.current || reduce) return;
    if (p > SCROLL_TRIGGER_THRESHOLD) {
      hasTriggeredRef.current = true;
      setHasTriggered(true);
    }
  });

  /* ─── Video mirror: one decode, drawn into 3 cropped canvases via rAF.
     Stops for good once every pane has finished flipping — the front
     faces are then permanently hidden by backface-visibility. ─── */
  const loopStoppedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const startLoop = useCallback(() => {
    if (rafRef.current != null || reduce || loopStoppedRef.current) return;
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
  // size) from the stage's current box and the video's intrinsic size —
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
  // section is in view — and never again once every pane has flipped.
  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current;
        if (!v) return;
        if (entry.isIntersecting) {
          if (!loopStoppedRef.current) {
            void v.play().catch(() => {});
            startLoop();
          }
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

  // Once the outermost pane's flip has landed, the front-face crops will
  // never be seen again — stop mirroring and release the decoder for good.
  useEffect(() => {
    if (!hasTriggered || reduce) return;
    const t = setTimeout(() => {
      loopStoppedRef.current = true;
      stopLoop();
      videoRef.current?.pause();
    }, (flipEndDelay(1) + 0.1) * 1000);
    return () => clearTimeout(t);
  }, [hasTriggered, reduce, stopLoop]);

  // Hold the cursor rig back until the entrance has settled, so the two
  // aren't animating the same transform at once.
  useEffect(() => {
    if (!hasTriggered || reduce) return;
    const t = setTimeout(() => setEntranceDone(true), ARM_DELAY_MS);
    return () => clearTimeout(t);
  }, [hasTriggered, reduce]);

  /* Cursor rig — normalised -1..1, spring-smoothed. Releasing sets the raw
     values to 0 and the spring carries them home; no exit animation needed,
     and no snap. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, CURSOR_SPRING);
  const sy = useSpring(py, CURSOR_SPRING);

  const rotateY = useTransform(sx, [-1, 1], [-TILT_Y, TILT_Y]);
  const rotateX = useTransform(sy, [-1, 1], [TILT_X, -TILT_X]);
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
  const animate = reduce || hasTriggered ? "split" : "joined";

  return (
    <section ref={sectionRef} className="relative bg-[#0a0a0a]" style={{ height: `${SECTION_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 z-40 flex min-h-screen flex-col items-center justify-center gap-[clamp(2.5rem,6vh,5rem)] overflow-hidden px-3 py-24 md:px-4">
        <div
          ref={stageRef}
          className="relative z-40 w-[min(80vw,450px)] lg:w-[min(80vw,945px)]"
          style={{ perspective: "1400px" }}
          onPointerEnter={measure}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
        >
          {/* Hidden source: the section's only decoder. Kept at real layout
              size via opacity (not display/visibility) so nothing throttles
              its decode — the canvases are what's actually seen. */}
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
                sheen={sheen}
                canvasRef={(el) => {
                  canvasRefs.current[i] = el;
                }}
              />
            ))}
          </motion.div>
        </div>

        <div className="relative z-40 mx-auto max-w-[52ch] px-6 text-center">
          <h2 className="font-clash text-[clamp(1.8rem,4vw,3.75rem)] font-semibold uppercase leading-[0.92] tracking-[-0.035em] text-[#f2ede3]">
            Different disciplines. One unmistakable direction.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] font-body text-[13px] leading-[1.6] text-white/60 md:text-[15px]">
            Identity, content, and systems aligned around the ambition behind your brand.
          </p>
        </div>
      </div>
    </section>
  );
}
