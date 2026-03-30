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
  const lastInteractionTime = useRef<number>(Date.now());
  const progressStartTime = useRef<number | null>(null);
  const reqRef = useRef<number>(0);

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
      setAutoPlayProgress(0);
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

  /* ── GSAP Scroll Timeline (The Hybrid Handoff) ────────────────── */
  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stickyRef.current ||
        !videoRef.current ||
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

          const lionRestW = c.isMobile ? 350 : c.isTablet ? 390 : c.isDesktop ? 430 : 470;
          const lionEntryW = Math.round(lionRestW * 1.3);
          const lionShrinkW = c.isMobile ? 200 : c.isTablet ? 210 : c.isDesktop ? 250 : 260;

          const videoFromW = c.isMobile ? "70vw" : c.isTablet ? "80vw" : c.isDesktop ? "90vw" : "80vw";
          const videoFromH = c.isMobile ? "50vw" : c.isTablet ? "50vw" : c.isDesktop ? "60vw" : "50vw";

          const getDelta = () => {
            const vR = videoRef.current!.getBoundingClientRect();
            const pR = centerAnchorRef.current!.getBoundingClientRect();
            return {
              x: (pR.left + pR.width / 2) - (vR.left + vR.width / 2),
              y: (pR.top + pR.height / 2) - (vR.top + vR.height / 2),
            };
          };

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
              invalidateOnRefresh: true,
              onEnter: () => {
                if (isSoundOn && bassAudioRef.current) {
                  bassAudioRef.current.currentTime = 0;
                  bassAudioRef.current.volume = 0.5;
                  bassAudioRef.current.play().catch(() => {});
                }
              },
              onUpdate: (self) => {
                // Handoff to presentation mode when scroll animation completes (at 0.82)
                const isComplete = self.progress >= 0.82;
                if (isComplete && !isScrollCompleteRef.current) {
                  isScrollCompleteRef.current = true;
                  setIsScrollComplete(true);
                  setIsAutoPlaying(true); // Start auto-cycle
                  lastInteractionTime.current = Date.now();
                } else if (!isComplete && isScrollCompleteRef.current) {
                  isScrollCompleteRef.current = false;
                  setIsScrollComplete(false);
                  setIsAutoPlaying(false); // Pause auto-cycle
                  setAutoPlayProgress(0);
                }
              }
            },
          });

          const getLionPeekY = () => -(lionEntryW * 0);

          // Force lion down and hidden at scroll 0.00
          tl.set(lionRef.current!, { y: () => window.innerHeight, opacity: 0, width: lionEntryW }, 0);

          /* ── Phase A: Lion rises from below ── */
          tl.to(lionRef.current!, { y: () => getLionPeekY(), opacity: 1, duration: 0.15, ease: "power2.out" }, 0.05);

          /* ── Phase B: Lion shrinks back to bottom ── */
          tl.to(lionRef.current!, { y: 0, width: lionShrinkW, duration: 0.20, ease: "power2.inOut" }, 0.20);

          /* ── Video shrinks + translates to pill ── */
          tl.fromTo(
            videoRef.current!,
            { width: videoFromW, height: videoFromH, borderRadius: 20, x: 0, y: 0 },
            {
              width: () => getPillSize(), height: () => getPillSize(), borderRadius: 9999,
              x: () => getDelta().x, y: () => getDelta().y, duration: 0.40, ease: "power2.inOut",
            },
            0.05,
          );

          /* ── Glow fades in ── */
          tl.fromTo(glowRef.current!, { opacity: 0 }, { opacity: 0.7, duration: 0.15 }, 0.10);

          /* ── Handoff: video out + pills row in ── */
          tl.to(videoRef.current!, { opacity: 0, duration: 0.05 }, 0.45);
          tl.fromTo(pillsRowRef.current!, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.45);

          /* ── Side pills scale in ── */
          tl.fromTo(
            pillsRowRef.current!,
            { "--pill-1-scale": 0, "--pill-1-opacity": 0, "--pill-3-scale": 0, "--pill-3-opacity": 0 },
            { "--pill-1-scale": 1, "--pill-1-opacity": 1, "--pill-3-scale": 1, "--pill-3-opacity": 1, duration: 0.08, ease: "back.out(1.7)" },
            0.52,
          );
          tl.fromTo(
            pillsRowRef.current!,
            { "--pill-0-scale": 0, "--pill-0-opacity": 0, "--pill-4-scale": 0, "--pill-4-opacity": 0 },
            { "--pill-0-scale": 1, "--pill-0-opacity": 1, "--pill-4-scale": 1, "--pill-4-opacity": 1, duration: 0.08, ease: "back.out(1.7)" },
            0.54,
          );

          /* ── Center pill expands + label fades ── */
          tl.fromTo(
            pillsRowRef.current!,
            { "--center-pill-width": () => `${getPillSize()}px` },
            { "--center-pill-width": () => `${getExpandedPillWidth()}px`, duration: 0.10, ease: "power2.out" },
            0.60,
          );

          tl.fromTo(pillsRowRef.current!, { "--center-label-opacity": 0 }, { "--center-label-opacity": 1, duration: 0.08 }, 0.72);

          /* ── 3-Column Layout Unveils (Final Content) ── */
          tl.fromTo(
            finalContentRef.current!,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.10, ease: "power2.out" },
            0.82,
          );

          /* Anchor to keep totalDuration at 1.3 */
          tl.set({}, {}, 1.3);
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
          className="absolute inset-0 z-[5] mx-auto flex max-w-[1400px] flex-col items-center justify-between px-4 pb-[25vh] pt-[15vh] opacity-0 md:flex-row md:px-6 md:pb-[20vh] lg:pb-[15vh] md:pt-[20vh]"
        >
          {/* Left Visual Column */}
          <div className="relative hidden aspect-[4/5] w-[25%] overflow-hidden rounded-[20px] border border-white/10 bg-white/5 md:block">
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

          {/* Center Column: Hook Text + Stat Card */}
          <div className="flex flex-1 flex-col items-center justify-center text-center z-10">
            {/* Hook Text */}
            <div className="relative h-[120px] w-full md:h-[160px]">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`hook-${active.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center text-[28px] font-medium leading-[1.2] tracking-tight text-white sm:text-[36px] md:text-[44px]"
                >
                  <span className="max-w-[700px]">{active.hookText}</span>
                </motion.h2>
              </AnimatePresence>
            </div>

            {/* Stat Card */}
            <div className="relative mt-8 h-[90px] w-full max-w-[320px] overflow-hidden rounded-[16px] border border-white/10 bg-white/5 backdrop-blur-xl md:mt-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`stat-${active.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center px-4"
                >
                  <div className="text-[28px] font-bold leading-none text-white" style={{ color: "var(--luma-accent)" }}>
                    {active.statValue}
                  </div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-widest text-white/50">
                    {active.statLabel}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile Single Visual (Alternating) */}
            <div className="relative mt-8 aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-[16px] border border-white/10 bg-white/5 md:hidden">
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
          <div className="relative hidden aspect-[4/5] w-[25%] overflow-hidden rounded-[20px] border border-white/10 bg-white/5 md:block">
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

        {/* ── Video Pill (Phase 1 start point) ── */}
        <div
          ref={videoRef}
          className="absolute inset-0 z-[8] m-auto overflow-hidden rounded-[20px] w-[70vw] h-[50vw] md:w-[80vw] md:h-[50vw] lg:w-[90vw] lg:h-[60vw] 2xl:w-[80vw] 2xl:h-[50vw]"
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
                {isCenter && (
                  <div className="absolute -bottom-3 left-0 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div 
                      className="h-full bg-white"
                      style={{ width: `${autoPlayProgress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}