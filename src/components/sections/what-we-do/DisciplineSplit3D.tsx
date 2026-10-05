"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  cubicBezier,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { SPLIT_START, SPLIT_END } from "../lion-journey/motion";
import { useLionJourney } from "../lion-journey/LionJourney";
import OpeningProof from "../OpeningProof";
const FACE_TINTS = [
  "rgba(176, 112, 28, 0.16), rgba(7, 7, 10, 0.88)",
  "rgba(92, 54, 196, 0.16), rgba(7, 7, 10, 0.88)",
  "rgba(170, 24, 42, 0.16), rgba(7, 7, 10, 0.88)",
] as const;
const EDGE_TINTS = ["#e8a020", "#7b3ff2", "#e5192a"] as const;

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
  mobileVideo?: string;
  videoFallback?: string;
  mobileVideoFallback?: string;
  poster?: string;
  mobilePoster?: string;
  pinned?: boolean;
}

interface FilmFrame {
  width: number;
  height: number;
  top: number;
  stageWidth: number;
  stageHeight: number;
  centerOffset: number;
  handoffOffset: number;
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
const SECTION_HEIGHT_VH = 160;

// One shared cue starts shrink, split, surface light and copy together.
const HANDOFF_START = 0.06;
const HANDOFF_END = 0.80;
const FILM_FADE_END = 0.64;
const CARD_SETTLE_END = HANDOFF_END;
const FINAL_FRAME_SCALE = 0.95;
const SPLIT_FINISH = Math.min(0.9, SPLIT_END + 0.08);
const FRAME_EASE = cubicBezier(0.77, 0, 0.175, 1);

function cue(progress: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

// The cards retain the film's outline throughout: one 5% uniform shrink,
// never a second width/height morph after the image disappears.
function handoffGeometry(frame: FilmFrame, progress: number) {
  const p = FRAME_EASE(cue(progress, HANDOFF_START, HANDOFF_END));
  const filmScale = 1 + (FINAL_FRAME_SCALE - 1) * p;
  const offset = frame.centerOffset + (frame.handoffOffset - frame.centerOffset) * p;
  return {
    filmScale,
    filmY: offset - frame.centerOffset,
    glassX: frame.width * filmScale / frame.stageWidth,
    glassY: frame.height * filmScale / frame.stageHeight,
    glassOffset: offset,
  };
}

function useLocalProgress(source: MotionValue<number>, start: number, end: number) {
  return useTransform(source, [start, end], [0, 1], { clamp: true, ease: FRAME_EASE });
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

// Resize without cropping the source; the existing face controls framing.
function cardArtworkUrl(source: string, width: number) {
  if (!source.startsWith("https://res.cloudinary.com/") || !source.includes("/image/upload/")) return source;
  return source.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

function Pane({
  card,
  dir,
  i,
  isDesktop,
  flip,
  armed,
  reducedMotion,
  paneRef: registerPane,
  canvasRef: registerCanvas,
  filmOpacity,
  poster,
  canvasReady,
}: {
  card: Card;
  dir: number;
  i: number;
  isDesktop: boolean;
  flip: MotionValue<number>;
  armed: boolean;
  reducedMotion: boolean;
  paneRef: (el: HTMLDivElement | null) => void;
  canvasRef: (el: HTMLCanvasElement | null) => void;
  filmOpacity: MotionValue<number>;
  poster: string;
  canvasReady: boolean;
}) {
  const splitP = useLocalProgress(flip, HANDOFF_START, HANDOFF_END);
  const cardP = splitP;
  const contentP = splitP;

  // The split-apart translate/tilt — driven straight off scroll, so it
  // scrubs forward and backward with the gesture instead of playing once.
  const paneX = useTransform(splitP, (p) => (isDesktop && !reducedMotion ? `${dir * 1.8 * p}vw` : "0vw"));
  const paneY = useTransform(splitP, (p) => (isDesktop || reducedMotion ? "0vh" : `${dir * 1.8 * p}vh`));
  // One sculptural rhythm across the set: the two outer cards share a quiet
  // lean while the middle counters it. The effect gives depth without making
  // any card look like a separate panel sitting on top of another.
  const cardLean = i === 1 ? -8 : 8;
  const paneRotateY = useTransform(splitP, (p) => (isDesktop && !reducedMotion ? cardLean * p : 0));
  const paneRotateX = useTransform(splitP, (p) => (isDesktop || reducedMotion ? 0 : cardLean * p));
  const innerRadius = useTransform(splitP, (p) => 18 * p);
  const outerRadius = useTransform(splitP, (p) => 16 + 2 * p);

  // The film lives on these same faces while they divide and light up.
  const cardZ = useTransform(cardP, [0, 1], reducedMotion ? [0, 0] : [0, 16]);
  const backImageOpacity = useTransform(cardP, [0, 1], [0, 1]);
  const contentY = useTransform(contentP, [0, 1], reducedMotion ? [0, 0] : [18, 0]);
  const markOpacity = useTransform(contentP, [0, 1], [0, 0.24]);

  return (
    <motion.div
      ref={registerPane}
      className="opening-glass-pane relative min-h-0 min-w-0 flex-1"
      style={{
        x: paneX,
        y: paneY,
        rotateX: paneRotateX,
        rotateY: paneRotateY,
        // The complete glass face has an opaque base before it separates.
        backgroundColor: "#08080a",
        borderTopLeftRadius: i === 0 ? outerRadius : innerRadius,
        borderTopRightRadius: (isDesktop ? i === 2 : i === 0) ? outerRadius : innerRadius,
        borderBottomLeftRadius: (isDesktop ? i === 0 : i === 2) ? outerRadius : innerRadius,
        borderBottomRightRadius: i === 2 ? outerRadius : innerRadius,
        transformStyle: "preserve-3d",
      }}
      // Lift on hover; `z` composes with the group tilt instead of fighting it.
      whileHover={armed ? { z: 46, transition: { duration: 0.4, ease: "easeOut" } } : undefined}
    >
      {/* The glass body rises underneath the fading, unbroken film. */}
      <motion.div
        className="absolute inset-0 z-[1] rounded-[inherit]"
        style={{
          z: cardZ,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Glass face -- this pane becomes the final card without a second
            rotating back-face entering the composition. */}
        <div
          className="absolute inset-0 z-[1] overflow-hidden rounded-[inherit]"
          style={{
            background: `linear-gradient(135deg, ${FACE_TINTS[i]}, rgba(4,4,6,0.94) 72%)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 34px ${EDGE_TINTS[i]}22, 0 24px 48px -28px rgba(0,0,0,0.95)`,
          }}
        >
          {/* Three crops from one decoder preserve the complete image at the
              join, then travel with their card instead of fading above it. */}
          <motion.div aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[inherit]"
            style={{ opacity: filmOpacity,
              backgroundImage: poster ? `url("${poster}")` : undefined,
              backgroundSize: isDesktop ? "300% 100%" : "100% 300%",
              backgroundPosition: isDesktop ? `${i * 50}% 50%` : `50% ${i * 50}%` }}>
            <canvas ref={registerCanvas} className="absolute inset-0 h-full w-full"
              style={{ opacity: canvasReady ? 1 : 0 }} />
          </motion.div>
          {/* One continuous bevel: always present, then intensified by the
              pointer's proximity to this pane. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] p-[1.25px] transition-opacity duration-300"
            style={{
              opacity: cardP,
              background: `linear-gradient(135deg, ${EDGE_TINTS[i]}, rgba(255,245,214,0.78) 18%, ${EDGE_TINTS[i]} 52%, rgba(255,255,255,0.4) 76%, ${EDGE_TINTS[i]})`,
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              maskComposite: "exclude",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: "calc(0.12 + (var(--spot-active, 0) * 0.34))",
              background: `radial-gradient(180px circle at var(--spot-x, 50%) var(--spot-y, 20%), ${EDGE_TINTS[i]}66, transparent 72%)`,
              mixBlendMode: "screen",
            }}
          />
          {card.image ? (
            <motion.img
              src={cardArtworkUrl(card.image, 960)}
              srcSet={[480, 800, 1200].map(width => `${cardArtworkUrl(card.image!, width)} ${width}w`).join(", ")}
              sizes="(min-width: 1440px) 430px, (min-width: 768px) 30vw, 86vw"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
              style={{ opacity: backImageOpacity }}
              onError={event => {
                const image = event.currentTarget;
                image.removeAttribute("srcset");
                if (card.image && image.src !== card.image) image.src = card.image;
              }}
            />
          ) : null}
          <motion.div
            className="absolute inset-0 z-[2]"
            style={{
              background:
                "radial-gradient(120% 85% at 6% 0%, rgba(255,255,255,0.23) 0%, transparent 48%), linear-gradient(150deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.045) 52%, rgba(255,255,255,0.025) 100%)",
              opacity: cardP,
            }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10"
            style={{ opacity: cardP }}
          />
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
                className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] p-[1.25px] blur-[2px] transition-opacity duration-500 ease-out"
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
                className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] p-[1px] transition-opacity duration-500 ease-out"
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

          {/* Quiet pillar signature. It belongs to the surface, not the
              content block: outlined and deliberately faint so it adds a
              recognisable brand texture without becoming a second heading. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-4 z-[2] select-none font-clash text-[clamp(2rem,5vw,4.9rem)] font-bold uppercase leading-[0.78] tracking-[-0.07em] md:left-6 md:top-6"
            style={{
              opacity: markOpacity,
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,255,255,0.42)",
              textShadow: `0 0 18px ${EDGE_TINTS[i]}30`,
            }}
          >
            {card.code}
          </motion.span>

          <motion.div
            className="opening-pane-copy absolute inset-x-0 bottom-0 z-10 flex min-h-[8.8rem] flex-col justify-end p-4 pt-16 text-left [background:linear-gradient(0deg,rgba(4,4,6,0.96)_0%,rgba(4,4,6,0.84)_64%,transparent_100%)] [text-shadow:0_1px_10px_rgba(0,0,0,0.75)] md:min-h-[10.5rem] md:p-6 md:pt-20"
            style={{ opacity: contentP, y: contentY }}
          >
            <h3 className="max-w-[24ch] font-clash text-[clamp(1.05rem,2.2vw,1.55rem)] font-bold uppercase leading-[0.96] text-white [text-wrap:balance]">
              {card.title}
            </h3>
            {/* Reserved height keeps the three headings on one baseline even
                when a locale wraps the body to a different line count. */}
            <p className="mt-1.5 max-w-[34ch] font-body text-[clamp(0.72rem,1.3vw,0.9rem)] leading-[1.45] text-white/70 md:mt-2 md:min-h-[3.9rem]">
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
 * One source frame becomes three moving film crops on the same glass faces.
 * Shrink, fade, split, light and content overlap without a second reshape.
 * Film geometry is measured on layout changes, never on scroll.
 */
export default function DisciplineSplit3D({
  cards, video, mobileVideo = video, videoFallback = video,
  mobileVideoFallback = mobileVideo, poster = "/images/hero_img/footage-07-poster.jpg",
  mobilePoster = poster, pinned = false,
}: Props) {
  const journey = useLionJourney();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardGroupRef = useRef<HTMLDivElement>(null);
  const canvasNodesRef = useRef<(HTMLCanvasElement | null)[]>([]);
  const rectRef = useRef<DOMRect | null>(null);
  const paneNodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const paneRectsRef = useRef<(DOMRect | null)[]>([]);

  const reduce = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(true);
  const [isTablet, setIsTablet] = useState(false);
  const [shortScreen, setShortScreen] = useState(false);
  const [veryShort, setVeryShort] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [viewportHeight, setViewportHeight] = useState(700);
  const [entranceDone, setEntranceDone] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [filmActive, setFilmActive] = useState(true);
  // Resolve the viewport before attaching a source: phones never fetch the landscape film.
  const [videoSrc, setVideoSrc] = useState("");
  const [activePoster, setActivePoster] = useState("");
  const fallbackSrcRef = useRef(videoFallback);
  const [playBlocked, setPlayBlocked] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [joinedFilmVisible, setJoinedFilmVisible] = useState(true);
  const [filmFrame, setFilmFrame] = useState<FilmFrame | null>(null);
  // The scroll handoff is reversible on every device; optional pointer tilt
  // is available only after settling, with a mouse and motion enabled.
  const armed = !reduce && entranceDone && finePointer;

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const params = new URLSearchParams(location.search);
      const frame = requestAnimationFrame(() => {
        if (params.has("filmStill")) setVideoFailed(true);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const tablet = window.matchMedia("(min-width: 768px)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const short = window.matchMedia("(max-height: 700px)");
    const veryShortScreen = window.matchMedia("(max-height: 500px)");
    const u = () => { setIsDesktop(mq.matches); setIsTablet(tablet.matches); setShortScreen(short.matches); setVeryShort(veryShortScreen.matches); setViewportWidth(window.innerWidth); setViewportHeight(window.innerHeight); setFinePointer(pointer.matches); };
    u();
    mq.addEventListener("change", u);
    tablet.addEventListener("change", u);
    pointer.addEventListener("change", u);
    short.addEventListener("change", u);
    veryShortScreen.addEventListener("change", u);
    window.addEventListener("resize", u);
    return () => { mq.removeEventListener("change", u); tablet.removeEventListener("change", u); pointer.removeEventListener("change", u); short.removeEventListener("change", u); veryShortScreen.removeEventListener("change", u); window.removeEventListener("resize", u); };
  }, []);

  /* --- Scroll-scrubbed master progress: 0 (joined) to 1 (split, flipped,
     content revealed) across [SPLIT_START, SPLIT_END] of the section's
     scroll range. Scrolling back through that range reverses it -- this
     is a direct useTransform of scrollYProgress, not a triggered timeline. --- */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const scrollFlip = useTransform(scrollYProgress, [SPLIT_START, SPLIT_FINISH], [0, 1], { clamp: true });
  const openingProgress = journey?.openingProgress ?? scrollYProgress;
  const openingFlip = useTransform(openingProgress, [SPLIT_START, SPLIT_FINISH], [0, 1], { clamp: true });
  // The wash lives in the video layer, above the WebGL lion. Keep it off
  // until the opaque film has covered the mane; otherwise its translucent
  // footage tints the head and makes it appear see-through.
  const pinnedWashOpacity = useTransform(openingProgress, [0, .36, .5], [0, 0, .3]);
  const flip = pinned ? openingFlip : scrollFlip;
  const filmOpacity = useTransform(flip, [HANDOFF_START, FILM_FADE_END], [1, 0], { ease: FRAME_EASE });
  // Switch from the native film to matching pane crops while still joined.
  const joinedFilmOpacity = useTransform(flip, p => p <= HANDOFF_START ? 1 : 0);
  const filmTransform = useTransform(flip, (p) => {
    if (!filmFrame || reduce) return "translateX(-50%)";
    const geometry = handoffGeometry(filmFrame, p);
    return `translateX(-50%) translateY(${geometry.filmY}px) scale(${geometry.filmScale})`;
  });
  const cardTransform = useTransform(flip, (p) => {
    if (!filmFrame) return "none";
    if (reduce) return `translateY(${filmFrame.centerOffset}px) scale(${filmFrame.width / filmFrame.stageWidth}, ${filmFrame.height / filmFrame.stageHeight})`;
    const geometry = handoffGeometry(filmFrame, p);
    return `translateY(${geometry.glassOffset}px) scale(${geometry.glassX}, ${geometry.glassY})`;
  });
  // Opaque card bases prevent a dark dip beneath the fading film crops.
  const proofPresence = useTransform(flip, [CARD_SETTLE_END, 0.94], [0, 1], { ease: FRAME_EASE });
  const proofTransform = useTransform(flip, (p) => {
    if (!filmFrame) return "none";
    const geometry = handoffGeometry(filmFrame, p);
    const offset = reduce ? filmFrame.centerOffset : geometry.glassOffset;
    const height = filmFrame.height * (reduce ? 1 : geometry.filmScale);
    return `translateY(${offset + (height - filmFrame.stageHeight) / 2}px)`;
  });
  // Let taller phones show more of the film without crowding the invitation.
  // The settled card and proof assembly moves as one, with the short-screen
  // second beat reserved for viewports that cannot fit both legibly.
  const phonePeekLift = Math.min(45, Math.max(0, (viewportHeight - 700) * .25));
  const tallPhonePeekLift = Math.min(8, Math.max(0, (viewportHeight - 720) * .065));
  const peekY = shortScreen
    ? isDesktop && !isTablet ? "55svh" : isDesktop ? "59svh" : "51svh"
    : isDesktop ? isTablet && viewportWidth < 1024 ? "51svh" : "61svh"
      : isTablet ? "61svh" : `${70 - phonePeekLift / viewportHeight * 100 - tallPhonePeekLift}svh`;
  const settledY = veryShort ? "-8svh" : shortScreen ? isDesktop ? "-5svh" : "-6svh" : isTablet ? "-2svh" : "2svh";
  const entranceY = useTransform(openingProgress, [0, .46], [peekY, settledY]);
  const entranceScale = useTransform(openingProgress, [0, .46], [.82, 1]);
  // The video-to-card handoff belongs to this section.  Keeping it local means
  // the cards always reveal as the visitor scrolls through WHAT WE BUILD.

  // Cursor rig arms only once the sequence has fully landed, and disarms
  // again the moment scrolling back pulls it out of the settled state.
  useEffect(() => {
    const v = flip.get();
    setEntranceDone(v > 0.98);
    setFilmActive(v < FILM_FADE_END);
    setJoinedFilmVisible(v <= HANDOFF_START);
  }, [flip]);
  useMotionValueEvent(flip, "change", (v) => {
    setEntranceDone(v > 0.98);
    setFilmActive(v < FILM_FADE_END);
    setJoinedFilmVisible(v <= HANDOFF_START);
  });

  // Fit the shared film/card outline to the safe viewport with its source
  // aspect intact. The final assembly stays at 95% of this frame.
  const measureFilm = useCallback(() => {
    const v = videoRef.current, stage = stageRef.current;
    if (!v || !stage || !stage.offsetHeight || !stage.offsetWidth) return;
    const landscape = window.matchMedia("(min-width: 768px)").matches;
    const sourceWidth = v.videoWidth || (landscape ? 16 : 9);
    const sourceHeight = v.videoHeight || (landscape ? 9 : 16);
    const opening = stage.closest<HTMLElement>(".hero-opening-stage");
    const work = stage.closest<HTMLElement>(".opening-work-pinned");
    const openingStyles = opening ? getComputedStyle(opening) : null;
    const overflow = Number.parseFloat(openingStyles?.getPropertyValue("--hero-overflow") || "") || 0;
    const viewport = opening ? Math.max(1, opening.offsetHeight - overflow) : window.innerHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const navClearance = Number.parseFloat(openingStyles?.getPropertyValue("--hero-nav-clearance") || "") || 100;
    const safeTop = pinned ? navClearance + 16 : 24;
    const safeBottom = viewport - 24;
    const availableHeight = Math.max(1, safeBottom - safeTop);
    // Keep the film close to the joined cards instead of making it nearly
    // fullscreen. Portrait media keeps its generous available height.
    const scale = Math.min(viewportWidth * 0.86 / sourceWidth,
      stage.offsetWidth * 1.14 / sourceWidth,
      (landscape ? 1400 : 420) / sourceWidth,
      availableHeight * (landscape ? 0.88 : 0.94) / sourceHeight);
    const fittedWidth = sourceWidth * scale, fittedHeight = sourceHeight * scale;
    const centerPercent = work ? Number.parseFloat(getComputedStyle(work).getPropertyValue("--opening-video-center")) || 41 : 50;
    const stageCenter = pinned ? viewport * (centerPercent + Number.parseFloat(settledY)) / 100 : viewport / 2;
    const filmCenter = pinned ? (safeTop + safeBottom) / 2 : viewport / 2;
    const stageWidth = stage.offsetWidth, stageHeight = stage.offsetHeight;
    const centerOffset = filmCenter - stageCenter;
    const top = stageHeight / 2 + centerOffset - fittedHeight / 2;
    const handoffScale = FINAL_FRAME_SCALE;
    const handoffHeight = fittedHeight * handoffScale;
    // Reserve space for the outer pane's split and a modest perspective tilt.
    const splitAllowance = landscape ? 12 : Math.min(28, viewport * 0.026);
    const handoffCenter = Math.max(safeTop + splitAllowance + handoffHeight / 2,
      Math.min(stageCenter, safeBottom - splitAllowance - handoffHeight / 2));
    const nextFrame: FilmFrame = { width: fittedWidth, height: fittedHeight, top,
      stageWidth, stageHeight, centerOffset,
      handoffOffset: handoffCenter - stageCenter };
    setFilmFrame(previous => previous
      && (Object.keys(nextFrame) as (keyof FilmFrame)[]).every(key => Math.abs(previous[key] - nextFrame[key]) < 0.1)
      ? previous : nextFrame);
  }, [pinned, settledY]);

  useEffect(() => {
    const landscape = window.matchMedia("(min-width: 768px)");
    const selectSource = () => {
      videoRef.current?.pause();
      setVideoReady(false);
      setCanvasReady(false);
      setVideoFailed(false);
      setPlayBlocked(false);
      fallbackSrcRef.current = landscape.matches ? videoFallback : mobileVideoFallback;
      setActivePoster(landscape.matches ? poster : mobilePoster);
      setVideoSrc(landscape.matches ? video : mobileVideo);
    };
    selectSource();
    landscape.addEventListener("change", selectSource);
    return () => landscape.removeEventListener("change", selectSource);
  }, [video, mobileVideo, videoFallback, mobileVideoFallback, poster, mobilePoster]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.addEventListener("loadedmetadata", measureFilm);
    if (v.readyState >= 1) measureFilm();
    return () => v.removeEventListener("loadedmetadata", measureFilm);
  }, [measureFilm, videoSrc]);

  useEffect(() => {
    measureFilm();
  }, [isDesktop, measureFilm]);

  useEffect(() => {
    const observer = new ResizeObserver(measureFilm);
    if (stageRef.current) observer.observe(stageRef.current);
    window.addEventListener("resize", measureFilm);
    return () => { observer.disconnect(); window.removeEventListener("resize", measureFilm); };
  }, [measureFilm]);

  // Pause the sole decoder once the pane film crops have faded, and resume it
  // when scrolling back. Hidden/offscreen tabs also stop playback.
  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    const videoElement = videoRef.current;
    let inView = false, playPending = false, disposed = false;
    const update = () => {
      const v = videoRef.current;
      if (!v) return;
      if (videoSrc && inView && !document.hidden && !videoFailed && flip.get() < FILM_FADE_END) {
        if (v.paused && !playPending && !playBlocked) {
          playPending = true;
          void v.play().then(() => {
            if (disposed || !inView || document.hidden || flip.get() >= FILM_FADE_END) v.pause();
          }).catch((error: DOMException) => {
            if (!disposed && error.name === "NotAllowedError") setPlayBlocked(true);
          }).finally(() => { playPending = false; });
        }
      } else {
        v.pause();
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(sec);
    const unsubscribe = flip.on("change", update);
    videoElement?.addEventListener("playing", update);
    videoElement?.addEventListener("loadeddata", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      disposed = true;
      io.disconnect();
      unsubscribe();
      videoElement?.removeEventListener("playing", update);
      videoElement?.removeEventListener("loadeddata", update);
      document.removeEventListener("visibilitychange", update);
      videoElement?.pause();
    };
  }, [flip, videoFailed, videoSrc, playBlocked]);

  // Mirror one decoded frame into three canvases only during the handoff.
  // No pixel readback/export is needed, so cross-origin playback keeps its
  // normal browser behavior. Poster crops cover loading or draw failures.
  useEffect(() => {
    const v = videoRef.current, sec = sectionRef.current;
    if (!v || !sec || !videoSrc) return;
    let disposed = false, inView = false, painted = false, drawFailed = false;
    let frameId: number | null = null;
    let lastPaint = -Infinity;
    const useVideoFrames = typeof v.requestVideoFrameCallback === "function";
    const cancelFrame = () => {
      if (frameId === null) return;
      if (useVideoFrames) v.cancelVideoFrameCallback(frameId);
      else cancelAnimationFrame(frameId);
      frameId = null;
    };
    const paint = () => {
      if (disposed || drawFailed || videoFailed || v.readyState < 2 ||
          !v.videoWidth || !v.videoHeight || v.currentSrc !== videoSrc) return;
      const nodes = canvasNodesRef.current;
      if (nodes.length !== cards.length || nodes.some(node => !node)) return;
      // Bound the entire mirrored image, not each individual crop.
      const fullWidth = Math.max(1, Math.round(Math.min(v.videoWidth, 1920,
        (filmFrame?.width ?? v.videoWidth) * Math.min(window.devicePixelRatio || 1, 2))));
      const fullHeight = Math.max(1, Math.round(fullWidth * v.videoHeight / v.videoWidth));
      try {
        nodes.forEach((canvas, i) => {
          if (!canvas) return;
          const width = isDesktop ? Math.ceil(fullWidth / cards.length) : fullWidth;
          const height = isDesktop ? fullHeight : Math.ceil(fullHeight / cards.length);
          if (canvas.width !== width) canvas.width = width;
          if (canvas.height !== height) canvas.height = height;
          const context = canvas.getContext("2d", { alpha: false });
          if (!context) throw new Error("Canvas unavailable");
          const sw = isDesktop ? v.videoWidth / cards.length : v.videoWidth;
          const sh = isDesktop ? v.videoHeight : v.videoHeight / cards.length;
          context.drawImage(v, isDesktop ? i * sw : 0, isDesktop ? 0 : i * sh,
            sw, sh, 0, 0, width, height);
        });
        if (!painted) { painted = true; setCanvasReady(true); }
      } catch {
        drawFailed = true;
        setCanvasReady(false);
        cancelFrame();
      }
    };
    const shouldMirror = () => !disposed && !drawFailed && inView &&
      !document.hidden && !v.paused && !v.ended &&
      flip.get() >= HANDOFF_START && flip.get() < FILM_FADE_END;
    const schedule = () => {
      if (frameId !== null || !shouldMirror()) return;
      const tick = (now: number) => {
        frameId = null;
        if (!shouldMirror()) return;
        if (now - lastPaint >= 1000 / 30) { paint(); lastPaint = now; }
        schedule();
      };
      frameId = useVideoFrames ? v.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
    };
    const update = () => {
      if (inView && !document.hidden && flip.get() < FILM_FADE_END) paint();
      if (shouldMirror()) schedule(); else cancelFrame();
    };
    // Scroll updates only schedule the frame loop. Decoded frames handle the
    // drawing while playing; a paused poster/frame is repainted at the join.
    const onProgress = () => {
      if (!shouldMirror()) { cancelFrame(); return; }
      if (frameId === null) { paint(); schedule(); }
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { rootMargin: "120px 0px" });
    observer.observe(sec);
    const unsubscribe = flip.on("change", onProgress);
    v.addEventListener("loadeddata", update);
    v.addEventListener("seeked", update);
    v.addEventListener("playing", update);
    v.addEventListener("pause", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      disposed = true; cancelFrame(); observer.disconnect(); unsubscribe();
      v.removeEventListener("loadeddata", update);
      v.removeEventListener("seeked", update);
      v.removeEventListener("playing", update);
      v.removeEventListener("pause", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [cards.length, filmFrame, flip, isDesktop, videoFailed, videoSrc]);

  /* Cursor rig â€” normalised -1..1, spring-smoothed. Releasing sets the raw
     values to 0 and the spring carries them home; no exit animation needed,
     and no snap. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, CURSOR_SPRING);
  const sy = useSpring(py, CURSOR_SPRING);

  const rotateY = useTransform(sx, [-1, 1], reduce ? [0, 0] : [-TILT_Y, TILT_Y]);
  const rotateX = useTransform(sy, [-1, 1], reduce ? [0, 0] : [TILT_X, -TILT_X]);
  const sheen = useTransform(sx, [-1, 0, 1], [0.55, 0.14, 0.55]);
  const handoffSheen = useTransform(flip, p => 0.14 * FRAME_EASE(cue(p, HANDOFF_START, HANDOFF_END)));

  // Cache the stage rect instead of measuring on every pointermove â€” a
  // getBoundingClientRect() per move forces sync layout, which is exactly the
  // kind of main-thread work Lenis-smoothed pages can least afford.
  const measure = useCallback(() => {
    rectRef.current = cardGroupRef.current?.getBoundingClientRect() ?? null;
    // Flat 2D rects, deliberately â€” the panes are rotateY-tilted, and testing
    // against the true 3D geometry is exactly what leaves the outer edge of
    // the outer two cards dead to hover. The visual rectangle is the target.
    paneRectsRef.current = paneNodesRef.current.map((el) => el?.getBoundingClientRect() ?? null);
  }, [stageRef]);

  useEffect(() => {
    if (!armed) return;
    // The cards have moved since the joined-video state. Capture their settled
    // screen positions before the shared hover field begins using them.
    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [armed, measure]);

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!armed) return;
      const r = rectRef.current;
      if (!r) return;
      // The rig remains stable even when the pointer is in the breathing room
      // around the cards, rather than only when it is over the stage itself.
      px.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)));
      py.set(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)));

      // Once the video has split, the cursor becomes a light source for the
      // whole card assembly. Every pane follows the same pointer, including
      // the gaps between cards, so the effect reads as one object instead of
      // three unrelated hover targets.
      if (e.pointerType !== "touch") {
        paneRectsRef.current.forEach((pr, i) => {
          const el = paneNodesRef.current[i];
          if (!el || !pr) return;
          // The stage still moves as one object, but light belongs only to
          // the card directly beneath the pointer.
          const spotX = Math.max(0, Math.min(pr.width, e.clientX - pr.left));
          const spotY = Math.max(0, Math.min(pr.height, e.clientY - pr.top));
          const intensity =
            e.clientX >= pr.left &&
            e.clientX <= pr.right &&
            e.clientY >= pr.top &&
            e.clientY <= pr.bottom
              ? 1
              : 0;

          el.style.setProperty("--spot-active", intensity.toFixed(3));
          // Clamp the inner spotlight to the card's own contour.
          el.style.setProperty(
            "--spot-x",
            `${spotX}px`,
          );
          el.style.setProperty(
            "--spot-y",
            `${spotY}px`,
          );
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

  const joinedFilmStyle = filmFrame ? {
    width: filmFrame.width, height: filmFrame.height, top: filmFrame.top,
    left: "50%",
  } : {};

  return (
    <section
      ref={(node) => { sectionRef.current = node; journey?.setVideoSection(node); }}
      data-cursor-behind
      data-opening-transition="continuous-split-v4"
      id={pinned ? undefined : "what-we-build"}
      data-cards-armed={armed}
      data-film-active={filmActive}
      className={journey ? "relative lion-video-section" : "relative isolate"}
      style={{
        height: pinned ? "100%" : journey ? "auto" : `${SECTION_HEIGHT_VH}vh`,
        backgroundColor: journey ? "transparent" : "rgba(4, 4, 6, 0.78)",
      }}
    >
      <div
        className={pinned
          ? "opening-video-layout relative z-40 h-full overflow-hidden"
          : "sticky top-0 z-40 flex min-h-screen flex-col items-center justify-center gap-[clamp(2.5rem,6vh,5rem)] overflow-hidden px-3 py-24 md:px-4"}
        onPointerEnter={measure}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        {/* Ambient wash from the film poster, blurred past legibility, pooling
            behind the stage. It's what makes the translucent panes read as
            glass, and it's masked to a soft pool so it never squares off
            into a panel. Oversized so the blur's own edge stays offscreen. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2"
          style={{
            // Held down hard: the footage runs cool magenta, and this is a
            // black-red-gold system. It should read as light in the room,
            // not as a second palette.
            backgroundImage: activePoster ? `url("${activePoster}")` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(64px) saturate(0.72) contrast(1.05)",
            opacity: pinned ? pinnedWashOpacity : 0.3,
            maskImage:
              "radial-gradient(52% 46% at 50% 50%, #000 0%, rgba(0,0,0,0.55) 58%, transparent 84%)",
            WebkitMaskImage:
              "radial-gradient(52% 46% at 50% 50%, #000 0%, rgba(0,0,0,0.55) 58%, transparent 84%)",
          }}
        />

        <div ref={(node) => journey?.setVideo(node)}
          className="opening-video-anchor relative z-40 w-[min(80vw,360px)] md:w-[min(82vw,1120px)]">
        <motion.div ref={stageRef} className="relative w-full"
          style={{ perspective: "1400px", y: pinned ? entranceY : 0, scale: pinned ? entranceScale : 1 }}>
          {/* Native playback hands its exact joined outline to the pane crops. */}
          <motion.div data-opening-film
            className="opening-joined-film absolute z-[2] overflow-hidden rounded-[16px] bg-[#08080a]"
            style={{ ...joinedFilmStyle, opacity: filmFrame ? joinedFilmOpacity : 0,
              transform: filmTransform, pointerEvents: joinedFilmVisible ? "auto" : "none" }}
            inert={!joinedFilmVisible}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activePoster || undefined} alt="" aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-contain"
              style={{ opacity: videoFailed || !videoReady ? 1 : 0 }} />
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-contain"
              style={{ opacity: videoReady && !videoFailed ? 1 : 0, pointerEvents: playBlocked ? "auto" : "none" }}
              src={videoSrc || undefined}
              loop muted playsInline preload="metadata"
              poster={activePoster || undefined}
              controls={playBlocked && joinedFilmVisible}
              onLoadedData={() => setVideoReady(true)}
              onError={() => {
                if (videoSrc && videoSrc !== fallbackSrcRef.current) {
                  setVideoReady(false);
                  setVideoSrc(fallbackSrcRef.current);
                } else setVideoFailed(true);
              }}
              aria-hidden={!joinedFilmVisible || !playBlocked}
              aria-label="LIONOVART studio film"
            />
            {playBlocked && !videoFailed && joinedFilmVisible && (
              <button type="button" className="absolute left-1/2 top-1/2 z-50 min-h-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80 px-6 py-3 text-white focus-visible:outline-2 focus-visible:outline-white"
                onClick={() => {
                  const v = videoRef.current;
                  if (v) void v.play().then(() => {
                    setPlayBlocked(false);
                    if (flip.get() >= FILM_FADE_END || document.hidden) v.pause();
                  }).catch(() => setPlayBlocked(true));
                }}>Play video</button>
            )}
            {videoFailed && joinedFilmVisible && (
              <a href={`https://player.cloudinary.com/embed/?cloud_name=dgio9uutc&public_id=${isTablet ? "Demo_hero" : "hero_demo_mobile"}`}
                target="_blank" rel="noopener noreferrer"
                className="absolute bottom-4 left-1/2 z-50 min-h-11 -translate-x-1/2 rounded-full bg-black/80 px-5 py-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-white">Watch video</a>
            )}
          </motion.div>

          {/* The outline stays constant while its faces split and fade. */}
          <motion.div ref={cardGroupRef} className="opening-card-morph relative"
            style={{ transform: cardTransform, opacity: filmFrame ? 1 : 0,
              transformStyle: "preserve-3d" }}>
          {/* Glass plane â€” tilts as one sheet so the three panes stay a single
              object. Individual feedback lives on the panes' hover lift. */}
          <motion.div
            className={`opening-film-plane relative flex aspect-[9/16] w-full ${isDesktop ? "flex-row" : "flex-col"} md:aspect-video`}
            style={{
              rotateX,
              rotateY,
              aspectRatio: filmFrame ? filmFrame.width / filmFrame.height : undefined,
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
                reducedMotion={!!reduce}
                filmOpacity={filmOpacity}
                poster={activePoster}
                canvasReady={canvasReady}
                canvasRef={(el) => { canvasNodesRef.current[i] = el; }}
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
              className="pointer-events-none absolute inset-0 rounded-[14px]"
              style={{
                opacity: armed ? sheen : handoffSheen,
                transform: "translateZ(2px)",
                background:
                  "radial-gradient(68% 38% at 50% -12%, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.035) 42%, transparent 72%)",
                maskImage: "linear-gradient(180deg, #000 0%, transparent 38%)",
                WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 38%)",
              }}
            />
          </motion.div>
          </motion.div>
          {pinned && <motion.div className="opening-proof-stage" style={{ opacity: proofPresence, transform: proofTransform }}>
            <OpeningProof />
          </motion.div>}
        </motion.div>
        </div>

      </div>
    </section>
  );
}
