"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

interface ServiceItem {
  id: string;
  label: string;
  shortLabel: string;
  accent: string;
  hookText: ReactNode;
  statValue: string;
  statLabel: string;
  leftVisual: { type: "image" | "video"; src: string; caption?: string };
  rightVisual: { type: "image" | "video"; src: string; caption?: string };
  hasCinematicHit?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════
   Data  (Phase 3 - Awwwards Blueprint)
   ═══════════════════════════════════════════════════════════════════════ */

const SERVICES: ServiceItem[] = [
  {
    id: "web",
    label: "WEB / APP",
    shortLabel: "WEB",
    accent: "#10b981", // teal
    hookText: (
      <>
        Websites built to perform.<br />
        Not just to impress.
      </>
    ),
    statValue: "150%",
    statLabel: "conversion lift on Nova redesign",
    leftVisual: { type: "video", src: "https://cdn.pixabay.com/video/2021/08/21/85842-591522026_large.mp4", caption: "Live website scroll recording" },
    rightVisual: { type: "image", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070", caption: "Phone mockup + speed score" },
  },
  {
    id: "av",
    label: "A/V PRODUCTION",
    shortLabel: "A/V",
    accent: "#e5192a", // red
    hookText: (
      <>
        We don&apos;t make videos.<br />
        We direct emotions.
      </>
    ),
    statValue: "10k+",
    statLabel: "social impressions on Fluora campaign",
    leftVisual: { type: "video", src: "https://cdn.pixabay.com/video/2020/02/26/32839-393275753_large.mp4", caption: "Video production reel clip" },
    rightVisual: { type: "image", src: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974", caption: "Social media results card" },
    hasCinematicHit: true,
  },
  {
    id: "default",
    label: "LIONOVART",
    shortLabel: "ALL",
    accent: "#e5192a", // center red pill active
    hookText: (
      <>
        We don&apos;t make videos.<br />
        We direct emotions.
      </>
    ),
    statValue: "30+",
    statLabel: "years combined experience",
    leftVisual: { type: "video", src: "https://cdn.pixabay.com/video/2020/05/24/40061-424855011_large.mp4", caption: "Short looping video reel" },
    rightVisual: { type: "image", src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070", caption: "Device mockup showing best website project" },
  },
  {
    id: "branding",
    label: "BRANDING",
    shortLabel: "BRA",
    accent: "#f59e0b", // amber
    hookText: (
      <>
        Your brand is the first thing<br />
        people judge — and the last<br />
        thing they forget.
      </>
    ),
    statValue: "3x",
    statLabel: "average perceived value increase after rebrand",
    leftVisual: { type: "image", src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070", caption: "Brand identity spread" },
    rightVisual: { type: "image", src: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2071", caption: "Before → After comparison" },
  },
  {
    id: "print",
    label: "PRINTING",
    shortLabel: "PRI",
    accent: "#f59e0b", // amber
    hookText: (
      <>
        Every touchpoint is an emotion.<br />
        We compose them like a score —<br />
        nothing is accidental.
      </>
    ),
    statValue: "100%",
    statLabel: "brand consistency across all deliverables",
    leftVisual: { type: "image", src: "https://images.unsplash.com/photo-1616186637372-df7a6b28f804?q=80&w=2070", caption: "Print design spread" },
    rightVisual: { type: "image", src: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=2070", caption: "Physical product mockup" },
  },
];

/** Index of the default active (center) pill */
const DEFAULT_CENTER = 2; // LIONOVART / ALL

/* ═══════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════ */

const getPillSize = (): number => Math.max(40, Math.min(window.innerWidth * 0.042, 60));
const getExpandedPillWidth = (): number => Math.max(120, Math.min(window.innerWidth * 0.18, 220));

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
  /* ── Refs ─────────────────────────────────────────────────────────── */
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const oneVisionRef = useRef<HTMLDivElement>(null);
  const lionRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pillsRowRef = useRef<HTMLDivElement>(null);
  const centerAnchorRef = useRef<HTMLDivElement>(null);
  const finalContentRef = useRef<HTMLDivElement>(null);

  /* ── State ──────────────────────────────────────────────────────── */
  const [activeIndex, setActiveIndex] = useState(DEFAULT_CENTER);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isScrollComplete, setIsScrollComplete] = useState(false);
  
  const ordered = getOrderedServices(activeIndex);
  const active = SERVICES[activeIndex];

  // We use a ref to track scroll completion state inside the GSAP callback
  // to avoid endless re-renders from state updates during scrub
  const isScrollCompleteRef = useRef(false);

  // Store references to Audio elements
  const bassAudioRef = useRef<HTMLAudioElement | null>(null);
  const hitAudioRef = useRef<HTMLAudioElement | null>(null);

  /* ── Auto-cycle & Progress Engine ─────────────────────────────── */
  const autoPlayDuration = 6000; // 6 seconds per state
  const lastInteractionTime = useRef<number>(0);
  const progressStartTime = useRef<number | null>(null);
  const reqRef = useRef<number>(0);

  useEffect(() => {
    lastInteractionTime.current = Date.now();
  }, []);

  useEffect(() => {
    // Check if we should resume autoplay after 10s of idle
    const idleCheckInterval = setInterval(() => {
      if (!isAutoPlaying && isScrollComplete && Date.now() - lastInteractionTime.current > 10000) {
        setIsAutoPlaying(true);
        progressStartTime.current = Date.now();
      }
    }, 1000);
    return () => clearInterval(idleCheckInterval);
  }, [isAutoPlaying, isScrollComplete]);

  useEffect(() => {
    if (!isAutoPlaying || !isScrollComplete) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      progressStartTime.current = null; // Reset start time so it doesn't glitch when scrolling back down
      return;
    }

    if (!progressStartTime.current) progressStartTime.current = Date.now();

    const updateProgress = () => {
      if (!progressStartTime.current) return;
      const elapsed = Date.now() - progressStartTime.current;
      const progress = Math.min((elapsed / autoPlayDuration) * 100, 100);
      
      setAutoPlayProgress(progress);

      if (progress >= 100) {
        // Next state
        setActiveIndex((prev) => (prev + 1) % SERVICES.length);
        progressStartTime.current = Date.now();
      }
      
      reqRef.current = requestAnimationFrame(updateProgress);
    };

    reqRef.current = requestAnimationFrame(updateProgress);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isAutoPlaying, isScrollComplete, activeIndex]);

  const handlePillClick = (index: number) => {
    if (!isScrollComplete) return; // Ignore clicks if scroll intro isn't done
    setActiveIndex(index);
    setIsAutoPlaying(false);
    lastInteractionTime.current = Date.now();
  };

  /* ── Audio Engine ─────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      bassAudioRef.current = new Audio("https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3");
      hitAudioRef.current = new Audio("https://cdn.freesound.org/previews/336/336605_2865330-lq.mp3");
    }
  }, []);

  // Play sound when activeIndex changes
  useEffect(() => {
    if (!isSoundOn || !isScrollComplete) return;
    
    // Play cinematic hit if applicable
    if (active.hasCinematicHit && hitAudioRef.current) {
      hitAudioRef.current.currentTime = 0;
      hitAudioRef.current.volume = 0.6;
      hitAudioRef.current.play().catch(e => console.log("Hit play failed:", e));
    }
  }, [activeIndex, active, isSoundOn, isScrollComplete]);

  const toggleSound = () => {
    const newSoundState = !isSoundOn;
    setIsSoundOn(newSoundState);
    if (newSoundState) {
      // On initial unmute, play the bass ambient sound
      if (bassAudioRef.current) {
        bassAudioRef.current.volume = 0.5;
        bassAudioRef.current.play().catch(e => console.log("Bass play failed:", e));
      }
    }
  };

  /* ── GSAP Scroll Timeline (3-Stage Cinematic Snap) ──────────────
   *
   *  STAGE 1  snap=0.00  Full-screen video, lion hidden, "ONE VISION" visible
   *  STAGE 2  snap=0.40  Lion fully risen & holding, video still full-screen
   *  STAGE 3  snap=0.75  Video shrinks to pill, pills row + 3-col layout revealed
   *  EXIT     snap=1.00  Section exit (scroll continues)
   *
   *  Timeline progress positions used below are normalised to [0 → 1.6]
   *  because tl.set({}, {}, 1.6) anchors the total duration.
   *  Snap points are expressed as fractions of the ScrollTrigger's scroll
   *  range (which maps to the tl progress 0→1).
   * ──────────────────────────────────────────────────────────────── */
  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stickyRef.current ||
        !videoRef.current ||
        !oneVisionRef.current ||
        !lionRef.current ||
        !glowRef.current ||
        !pillsRowRef.current ||
        !centerAnchorRef.current ||
        !finalContentRef.current
      )
        return;

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

          // Lion dimensions
          const lionRestW  = c.isMobile ? 402 : c.isTablet ? 448 : c.isDesktop ? 494 : 540;
          const lionEntryW = Math.round(lionRestW * 1.3); // Oversized on entry for drama
          const lionShrinkW = c.isMobile ? 230 : c.isTablet ? 241 : c.isDesktop ? 287 : 299;

          // Video starting dimensions (full-screen-ish rectangle)
          const videoFromW = c.isMobile ? "70vw" : c.isTablet ? "75vw" : c.isDesktop ? "60vw" : "50vw";
          const videoFromH = c.isMobile ? "50vw" : c.isTablet ? "45vw" : c.isDesktop ? "35vw" : "28vw";

          // Calculates how far the video center must travel to sit inside the center pill anchor
          const getDelta = () => {
            const vR = videoRef.current!.getBoundingClientRect();
            const pR = centerAnchorRef.current!.getBoundingClientRect();
            return {
              x: (pR.left + pR.width / 2) - (vR.left + vR.width / 2),
              y: (pR.top + pR.height / 2) - (vR.top + vR.height / 2),
            };
          };

          /* ─────────────────────────────────────────────────────────
           *  ScrollTrigger with 4 magnetic snap points
           * ───────────────────────────────────────────────────────── */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.2,          // Slightly higher scrub = feels heavier / more cinematic
              invalidateOnRefresh: true,
              snap: {
                snapTo: [0, 0.40, 0.75, 1],
                duration: { min: 0.5, max: 1.2 },
                delay: 0.08,
                ease: "power2.inOut",
              },
              onEnter: () => {
                if (isSoundOn && bassAudioRef.current) {
                  bassAudioRef.current.currentTime = 0;
                  bassAudioRef.current.volume = 0.5;
                  bassAudioRef.current.play().catch(() => {});
                }
              },
              onUpdate: (self) => {
                // Hand off to interactive presentation mode at stage 3
                const isComplete = self.progress >= 0.73;
                if (isComplete && !isScrollCompleteRef.current) {
                  isScrollCompleteRef.current = true;
                  setIsScrollComplete(true);
                  setIsAutoPlaying(true);
                  lastInteractionTime.current = Date.now();
                } else if (!isComplete && isScrollCompleteRef.current) {
                  isScrollCompleteRef.current = false;
                  setIsScrollComplete(false);
                  setIsAutoPlaying(false);
                  setAutoPlayProgress(0);
                }
              },
            },
          });

          /* ══════════════════════════════════════════════════════════
           *  STAGE 1 → STAGE 2  (progress 0.00 → 0.40)
           *  Lion rises from below; "ONE VISION" text disappears
           * ══════════════════════════════════════════════════════════ */

          // At scroll=0: lion is offscreen below, fully opaque (no fade-in flash)
          tl.set(lionRef.current!, { y: () => window.innerHeight * 1.1, opacity: 1, width: lionEntryW }, 0);

          // "ONE VISION" starts fully visible at scroll=0 — no initial set needed

          // Lion rises up into the hero position (ends at progress 0.30 so it
          // fully arrives well before the snap point at 0.40)
          tl.to(
            lionRef.current!,
            { y: 0, duration: 0.30, ease: "power3.out" },
            0.05,
          );

          // "ONE VISION" text falls down and fades out as the lion rises
          // It's placed BEHIND the video (z-index 7 vs video z-index 8) so it
          // physically appears to be swallowed by the video frame as it drops.
          tl.to(
            oneVisionRef.current!,
            { y: "60vh", scale: 0.15, opacity: 0, duration: 0.28, ease: "power3.in" },
            0.10, // Starts early so it's gone before the snap at 0.40
          );

          /* ══════════════════════════════════════════════════════════
           *  STAGE 2 → STAGE 3  (progress 0.40 → 0.75)
           *  Video shrinks to pill; lion settles down; pills appear
           * ══════════════════════════════════════════════════════════ */

          // Lion shrinks down to its rest size as the video starts collapsing
          tl.to(
            lionRef.current!,
            { width: lionShrinkW, duration: 0.18, ease: "power2.inOut" },
            0.42,
          );

          // Video collapses from full rectangle → tiny pill, sliding into the center anchor
          tl.fromTo(
            videoRef.current!,
            { width: videoFromW, height: videoFromH, borderRadius: 20, x: 0, y: 0 },
            {
              width: () => getPillSize(),
              height: () => getPillSize(),
              borderRadius: 9999,
              x: () => getDelta().x,
              y: () => getDelta().y,
              duration: 0.28,
              ease: "power2.inOut",
            },
            0.44,
          );

          // Glow appears as the video morphs
          tl.fromTo(glowRef.current!, { opacity: 0 }, { opacity: 0.7, duration: 0.15 }, 0.52);

          // Video fades out once it's pill-sized (hand off to the pills row DOM)
          tl.to(videoRef.current!, { opacity: 0, duration: 0.06 }, 0.72);

          // Pills row fades in at the same time
          tl.fromTo(pillsRowRef.current!, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.72);

          /* ══════════════════════════════════════════════════════════
           *  STAGE 3 FINISHES  (progress 0.75 → 1.00)
           *  Side pills cascade in; center pill expands; 3-col reveals
           * ══════════════════════════════════════════════════════════ */

          // Inner pills cascade in (±1 first, then ±2)
          tl.fromTo(
            pillsRowRef.current!,
            { "--pill-1-scale": 0, "--pill-1-opacity": 0, "--pill-3-scale": 0, "--pill-3-opacity": 0 },
            { "--pill-1-scale": 1, "--pill-1-opacity": 1, "--pill-3-scale": 1, "--pill-3-opacity": 1, duration: 0.07, ease: "back.out(1.7)" },
            0.78,
          );
          tl.fromTo(
            pillsRowRef.current!,
            { "--pill-0-scale": 0, "--pill-0-opacity": 0, "--pill-4-scale": 0, "--pill-4-opacity": 0 },
            { "--pill-0-scale": 1, "--pill-0-opacity": 1, "--pill-4-scale": 1, "--pill-4-opacity": 1, duration: 0.07, ease: "back.out(1.7)" },
            0.85,
          );

          // Center pill stretches from circle → expanded label pill
          tl.fromTo(
            pillsRowRef.current!,
            { "--center-pill-width": () => `${getPillSize()}px` },
            { "--center-pill-width": () => `${getExpandedPillWidth()}px`, duration: 0.10, ease: "power2.out" },
            0.90,
          );

          // Label text fades in once the pill is expanded
          tl.fromTo(
            pillsRowRef.current!,
            { "--center-label-opacity": 0 },
            { "--center-label-opacity": 1, duration: 0.08 },
            1.00,
          );

          // 3-column layout slides up into view
          tl.fromTo(
            finalContentRef.current!,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.10, ease: "power2.out" },
            1.05,
          );

          // Anchor — keeps totalDuration stable for scrub mapping
          tl.set({}, {}, 1.6);
        },
      );
    },
    { scope: stickyRef, dependencies: [] },
  );

  return (
    <section ref={sectionRef} className="relative h-[300vh] md:h-[400vh]">
      <motion.div
        ref={stickyRef}
        className="sticky top-0 h-screen overflow-hidden bg-[#0D0D0D]"
        initial={{ "--luma-accent": active.accent } as any}
        animate={{ "--luma-accent": active.accent } as any}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        {/* ── Audio Opt-In Button ── */}
        <button 
          onClick={toggleSound}
          className="absolute bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-white/70 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
        >
          {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="text-xs font-semibold uppercase tracking-wider">{isSoundOn ? "Sound On" : "Sound Off"}</span>
        </button>

        {/* ── Auto-cycle Indicator ── */}
        <AnimatePresence>
          {isAutoPlaying && isScrollComplete && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-4 z-[60] -translate-x-1/2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/50 backdrop-blur-sm"
            >
              Auto-Playing
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 3-Column Guided Presentation Layout ── */}
        <div
          ref={finalContentRef}
          className="absolute inset-0 z-[25] pointer-events-none mx-auto flex max-w-[1400px] flex-col items-center justify-start px-4 pb-[44vh] pt-[14vh] opacity-0 md:flex-row md:items-center md:justify-between md:px-6 md:pb-[20vh] md:pt-[10vh]"
        >
          {/* Left Visual Column */}
          <div className="relative hidden aspect-[4/5] w-[25%] max-h-[55vh] overflow-hidden rounded-[20px] border border-white/10 bg-white/5 md:block">
            <AnimatePresence mode="wait">
              {active.leftVisual.type === "image" ? (
                <motion.img
                  key={`left-img-${active.id}`}
                  src={active.leftVisual.src}
                  alt={active.leftVisual.caption}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <motion.video
                  key={`left-vid-${active.id}`}
                  src={active.leftVisual.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </AnimatePresence>
            <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-white/80 backdrop-blur-md">
              {active.leftVisual.caption}
            </div>
          </div>

          {/* Center Column: Stat Card */}
          <div className="flex flex-1 flex-col items-center z-10 justify-start gap-5 md:justify-start md:text-center md:gap-0 md:pt-[6vh]">
            {/* Stat Card */}
            <div className="relative h-[80px] md:h-[90px] w-full max-w-[260px] md:max-w-[320px] overflow-hidden rounded-[16px] border border-white/10 bg-white/5 backdrop-blur-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`stat-${active.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center px-4"
                >
                  <div className="text-[22px] md:text-[28px] font-bold leading-none text-white" style={{ color: "var(--luma-accent)" }}>
                    {active.statValue}
                  </div>
                  <div className="mt-1 text-[10px] md:text-[11px] font-medium uppercase tracking-widest text-white/50">
                    {active.statLabel}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile Single Visual (Alternating) */}
            <div className="relative aspect-[4/3] w-full max-w-[90vw] max-h-[28vh] overflow-hidden rounded-[20px] border border-white/10 bg-white/5 md:hidden">
              <AnimatePresence mode="wait">
                {activeIndex % 2 === 0 ? (
                  active.leftVisual.type === "image" ? (
                    <motion.img
                      key={`mob-left-img-${active.id}`}
                      src={active.leftVisual.src}
                      alt={active.leftVisual.caption}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <motion.video
                      key={`mob-left-vid-${active.id}`}
                      src={active.leftVisual.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )
                ) : (
                  active.rightVisual.type === "image" ? (
                    <motion.img
                      key={`mob-right-img-${active.id}`}
                      src={active.rightVisual.src}
                      alt={active.rightVisual.caption}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <motion.video
                      key={`mob-right-vid-${active.id}`}
                      src={active.rightVisual.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="relative hidden aspect-[4/5] w-[25%] max-h-[55vh] overflow-hidden rounded-[20px] border border-white/10 bg-white/5 md:block">
            <AnimatePresence mode="wait">
              {active.rightVisual.type === "image" ? (
                <motion.img
                  key={`right-img-${active.id}`}
                  src={active.rightVisual.src}
                  alt={active.rightVisual.caption}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <motion.video
                  key={`right-vid-${active.id}`}
                  src={active.rightVisual.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </AnimatePresence>
            <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-white/80 backdrop-blur-md">
              {active.rightVisual.caption}
            </div>
          </div>
        </div>

        {/* ── Text above the video ── */}
        <div
          ref={oneVisionRef}
          className="absolute inset-x-0 bottom-1/2 mb-[25vw] md:mb-[22.5vw] lg:mb-[17.5vw] 2xl:mb-[14vw] z-[7] text-center pointer-events-none"
        >
          <h2 className="text-[2.5rem] sm:text-[4rem] md:text-[5rem] lg:text-[7rem] font-bold text-white uppercase tracking-widest font-clash leading-none">
            One Vision
          </h2>
        </div>

        {/* ── Video Pill (Phase 1 start point) ── */}
        <div
          ref={videoRef}
          className="absolute inset-0 z-[8] m-auto overflow-hidden rounded-[20px] w-[70vw] h-[50vw] md:w-[75vw] md:h-[45vw] lg:w-[60vw] lg:h-[35vw] 2xl:w-[50vw] 2xl:h-[28vw] pointer-events-auto bg-black"
        >
          <video autoPlay muted loop playsInline className="h-full w-full object-cover">
            <source src="https://i.imgur.com/x9yWTNn.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* ── Glow Layer ── */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute bottom-0 left-1/2 z-[10] h-[55vh] w-[80vw] -translate-x-1/2 rounded-t-full opacity-0 blur-3xl"
          style={{ background: "radial-gradient(ellipse at bottom, var(--luma-accent), transparent 70%)" }}
        />

        {/* ── Lion Cutout ── */}
        <img
          ref={lionRef}
          src="https://i.imgur.com/2PGbCnR.png"
          alt="Lion cutout"
          draggable={false}
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[12] mx-auto h-auto select-none object-contain opacity-0 w-[488px] md:w-[585px] lg:w-[645px] 2xl:w-[705px]"
        />

        {/* ── Pills Row ── */}
        <div
          ref={pillsRowRef}
          className="absolute left-1/2 z-[20] flex -translate-x-1/2 items-center opacity-0 top-[60%] gap-2 md:gap-3 lg:top-[52%]"
        >
          <div
            ref={centerAnchorRef}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[clamp(40px,4.2vw,60px)] w-[clamp(40px,4.2vw,60px)] -translate-x-1/2 -translate-y-1/2 opacity-0"
          />

          {ordered.map((item, i) => {
            const isCenter = i === 2;
            return (
              <div
                key={i}
                onClick={() => handlePillClick(SERVICES.findIndex((s) => s.id === item.id))}
                className="relative shrink-0 rounded-full"
                style={{
                  width: isCenter ? "var(--center-pill-width, clamp(40px,4.2vw,60px))" : "clamp(40px,4.2vw,60px)",
                  height: "clamp(40px,4.2vw,60px)",
                  cursor: isScrollComplete ? "pointer" : "default",
                }}
              >
                <div
                  className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full backdrop-blur-md ${isCenter ? "" : "border border-white/10 bg-white/20"}`}
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
                        transition={{ duration: 0.4 }}
                        className="whitespace-nowrap px-3 text-[11px] font-bold uppercase tracking-wider text-white md:text-[12px]"
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
                        transition={{ duration: 0.4 }}
                        className="text-[10px] font-semibold uppercase tracking-wide text-white/70"
                      >
                        {item.shortLabel}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Auto-play Progress Bar */}
                {isCenter && isScrollComplete && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -bottom-3 left-1/2 h-[2px] w-[72px] -translate-x-1/2 overflow-hidden rounded-full bg-white/10"
                  >
                    <motion.div
                      className="h-full bg-white/50"
                      style={{ width: `${autoPlayProgress}%` }}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}