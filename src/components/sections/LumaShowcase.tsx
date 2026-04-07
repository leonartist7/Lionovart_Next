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
   Data
   ═══════════════════════════════════════════════════════════════════════ */

const CDN = "https://res.cloudinary.com/dgio9uutc/image/upload/";

const SERVICES: ServiceItem[] = [
  {
    id: "web",
    label: "WEB / APP",
    shortLabel: "WEB",
    accent: "#10b981",
    hookText: (
      <>
        Websites built to perform.<br />
        Not just to impress.
      </>
    ),
    statValue: "70%",
    statLabel: "of users judge a business by its website design — Stanford",
    leftVisual:  { type: "image", src: `${CDN}1_1_bv3shm.avif`,        caption: "Web project showcase" },
    rightVisual: { type: "image", src: `${CDN}Thumb_2_p6ksrb.avif`,    caption: "Digital experience" },
  },
  {
    id: "av",
    label: "A/V PRODUCTION",
    shortLabel: "A/V",
    accent: "#e5192a",
    hookText: (
      <>
        We don&apos;t make videos.<br />
        We direct emotions.
      </>
    ),
    statValue: "82%",
    statLabel: "of all internet traffic will be video by 2027 — Cisco",
    leftVisual:  { type: "image", src: `${CDN}Frame_1_zhyago.avif`,         caption: "Production reel" },
    rightVisual: { type: "image", src: `${CDN}freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif`, caption: "Campaign results" },
    hasCinematicHit: true,
  },
  {
    id: "default",
    label: "LIONOVART",
    shortLabel: "ALL",
    accent: "#e5192a",
    hookText: (
      <>
        One vision.<br />
        Every medium.
      </>
    ),
    statValue: "50+",
    statLabel: "projects delivered across 9 languages",
    leftVisual:  { type: "image", src: `${CDN}freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif`, caption: "Brand campaign" },
    rightVisual: { type: "image", src: `${CDN}freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_2_cd1gee.avif`, caption: "Creative direction" },
  },
  {
    id: "branding",
    label: "BRANDING",
    shortLabel: "BRAND",
    accent: "#f59e0b",
    hookText: (
      <>
        Your brand is the first thing<br />
        people judge — and the last<br />
        thing they forget.
      </>
    ),
    statValue: "3x",
    statLabel: "average perceived value increase after rebrand — Lucidpress",
    leftVisual:  { type: "image", src: `${CDN}freepik_from-this-brand-identity-help-me-make-a-mockup-of-her-landing-page..-looking-premium-and-elegant_0001_bnk4us.avif`,  caption: "Brand identity" },
    rightVisual: { type: "image", src: `${CDN}freepik__design-a-highly-polished-professional-corporate-we__1650_qukgx3.avif`,    caption: "Corporate identity" },
  },
  {
    id: "print",
    label: "PRINTING",
    shortLabel: "PRINT",
    accent: "#f59e0b",
    hookText: (
      <>
        What you hold in your hands<br />
        says everything about who you are.<br />
        Print that commands attention — and gets kept.
      </>
    ),
    statValue: "100%",
    statLabel: "brand consistency across all deliverables",
    leftVisual:  { type: "image", src: `${CDN}image_19_rnwg8w.avif`, caption: "Print spread" },
    rightVisual: { type: "image", src: `${CDN}Screenshots_2_apvmbr.avif`,        caption: "Deliverables" },
  },
];

const DEFAULT_CENTER = 2;

/* ═══════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════ */

const getPillSize     = (): number => Math.max(44, Math.min(window.innerWidth * 0.05, 64));
const getExpandedPillWidth = (): number => Math.max(140, Math.min(window.innerWidth * 0.22, 260));

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
   Visual Media Sub-component
   ═══════════════════════════════════════════════════════════════════════ */

function ServiceVisual({
  visual,
  serviceId,
  side,
}: {
  visual: ServiceItem["leftVisual"];
  serviceId: string;
  side: string;
}) {
  return (
    <AnimatePresence mode="wait">
      {visual.type === "image" ? (
        <motion.img
          key={`${side}-img-${serviceId}`}
          src={visual.src}
          alt={visual.caption}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <motion.video
          key={`${side}-vid-${serviceId}`}
          src={visual.src}
          autoPlay
          muted
          loop
          playsInline
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export default function LumaShowcase() {

  /* ── Refs ─────────────────────────────────────────────────────────── */
  const sectionRef      = useRef<HTMLElement>(null);
  const stickyRef       = useRef<HTMLDivElement>(null);
  const videoRef        = useRef<HTMLDivElement>(null);
  const oneVisionRef    = useRef<HTMLDivElement>(null);
  const lionRef         = useRef<HTMLImageElement>(null);
  const glowRef         = useRef<HTMLDivElement>(null);
  const pillsRowRef     = useRef<HTMLDivElement>(null);
  const centerAnchorRef = useRef<HTMLDivElement>(null);
  const finalContentRef = useRef<HTMLDivElement>(null);

  /* ── State ──────────────────────────────────────────────────────── */
  const [activeIndex,      setActiveIndex]      = useState(DEFAULT_CENTER);
  const [isSoundOn,        setIsSoundOn]        = useState(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);
  const [isAutoPlaying,    setIsAutoPlaying]    = useState(false);
  const [isScrollComplete, setIsScrollComplete] = useState(false);

  const ordered            = getOrderedServices(activeIndex);
  const active             = SERVICES[activeIndex];
  const isScrollCompleteRef = useRef(false);
  const isTransitioningRef  = useRef(false);
  const bassAudioRef        = useRef<HTMLAudioElement | null>(null);
  const hitAudioRef         = useRef<HTMLAudioElement | null>(null);

  /* ── Auto-cycle & Progress Engine ─────────────────────────────── */
  const autoPlayDuration    = 6000;
  const lastInteractionTime = useRef<number>(0);
  const progressStartTime   = useRef<number | null>(null);
  const reqRef              = useRef<number>(0);

  useEffect(() => { lastInteractionTime.current = Date.now(); }, []);

  // Resume auto-play after 10 s of inactivity
  useEffect(() => {
    const id = setInterval(() => {
      if (!isAutoPlaying && isScrollComplete && Date.now() - lastInteractionTime.current > 10000) {
        setIsAutoPlaying(true);
        progressStartTime.current = Date.now();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isAutoPlaying, isScrollComplete]);

  // rAF progress loop
  useEffect(() => {
    if (!isAutoPlaying || !isScrollComplete) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      progressStartTime.current = null;
      return;
    }
    if (!progressStartTime.current) progressStartTime.current = Date.now();

    const tick = () => {
      if (!progressStartTime.current) return;
      const elapsed  = Date.now() - progressStartTime.current;
      const progress = Math.min((elapsed / autoPlayDuration) * 100, 100);
      setAutoPlayProgress(progress);

      if (progress >= 100 && !isTransitioningRef.current) {
        isTransitioningRef.current = true;
        progressStartTime.current  = Date.now();
        setAutoPlayProgress(0);
        // Instant advance — no travel animation
        setActiveIndex((prev) => (prev + 1) % SERVICES.length);
        setTimeout(() => { isTransitioningRef.current = false; }, 350);
      }

      reqRef.current = requestAnimationFrame(tick);
    };
    reqRef.current = requestAnimationFrame(tick);
    return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
  }, [isAutoPlaying, isScrollComplete, activeIndex]);

  /* ── Pill click ──────────────────────────────────────────────── */
  const handlePillClick = (globalIndex: number) => {
    if (!isScrollComplete) return;
    if (globalIndex === activeIndex) return;
    setIsAutoPlaying(false);
    lastInteractionTime.current = Date.now();
    setActiveIndex(globalIndex);
  };

  /* ── Audio Engine ─────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      bassAudioRef.current = new Audio("https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3");
      hitAudioRef.current  = new Audio("https://cdn.freesound.org/previews/336/336605_2865330-lq.mp3");
    }
  }, []);

  useEffect(() => {
    if (!isSoundOn || !isScrollComplete) return;
    if (active.hasCinematicHit && hitAudioRef.current) {
      hitAudioRef.current.currentTime = 0;
      hitAudioRef.current.volume      = 0.6;
      hitAudioRef.current.play().catch(() => {});
    }
  }, [activeIndex, active, isSoundOn, isScrollComplete]);

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    if (next && bassAudioRef.current) {
      bassAudioRef.current.volume = 0.5;
      bassAudioRef.current.play().catch(() => {});
    }
  };

  /* ── GSAP Scroll Timeline ──────────────────────────────────────── */
  useGSAP(
    () => {
      if (
        !sectionRef.current      ||
        !stickyRef.current       ||
        !videoRef.current        ||
        !oneVisionRef.current    ||
        !lionRef.current         ||
        !glowRef.current         ||
        !pillsRowRef.current     ||
        !centerAnchorRef.current ||
        !finalContentRef.current
      ) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isMobile:  "(max-width: 767px)",
          isTablet:  "(min-width: 768px)  and (max-width: 1023px)",
          isDesktop: "(min-width: 1024px) and (max-width: 1439px)",
          isLarge:   "(min-width: 1440px)",
        },
        (ctx) => {
          const c = ctx.conditions as Record<string, boolean>;

          const lionRestW   = c.isMobile ? 442 : c.isTablet ? 493 : c.isDesktop ? 445 : 432;
          const lionEntryW  = Math.round(lionRestW * 1.3);
          const lionShrinkW = c.isMobile ? 253 : c.isTablet ? 265 : c.isDesktop ? 258 : 239;

          const videoFromW = c.isMobile ? "70vw" : c.isTablet ? "75vw" : c.isDesktop ? "60vw" : "50vw";
          const videoFromH = c.isMobile ? "50vw" : c.isTablet ? "45vw" : c.isDesktop ? "35vw" : "28vw";

          const getDelta = () => {
            const vR = videoRef.current!.getBoundingClientRect();
            const pR = centerAnchorRef.current!.getBoundingClientRect();
            return {
              x: (pR.left + pR.width  / 2) - (vR.left + vR.width  / 2),
              y: (pR.top  + pR.height / 2) - (vR.top  + vR.height / 2),
            };
          };

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start:   "top top",
              end:     "bottom bottom",
              scrub:   4,
              invalidateOnRefresh: true,
              snap: {
                snapTo:   [0.55],
                duration: { min: 0.8, max: 1.4 },
                delay:    0.2,
                ease:     "power2.inOut",
              },
              onEnter: () => {
                if (isSoundOn && bassAudioRef.current) {
                  bassAudioRef.current.currentTime = 0;
                  bassAudioRef.current.volume      = 0.5;
                  bassAudioRef.current.play().catch(() => {});
                }
              },
              onUpdate: (self) => {
                const isComplete = self.progress >= 0.50;
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

          /* ── Entrance sweep  (0 → 0.48) ── */
          tl.set(lionRef.current!, { y: () => window.innerHeight * 1.1, opacity: 1, width: lionEntryW }, 0);

          tl.to(oneVisionRef.current!, { y: "60vh", scale: 0.15, opacity: 0, duration: 0.14, ease: "power3.in" }, 0.02);

          tl.to(lionRef.current!, { y: 0, duration: 0.22, ease: "power3.out" }, 0.04);
          tl.to(lionRef.current!, { width: lionShrinkW, duration: 0.16, ease: "power2.inOut" }, 0.22);

          tl.fromTo(
            videoRef.current!,
            { width: videoFromW, height: videoFromH, borderRadius: 20, x: 0, y: 0 },
            {
              width: () => getPillSize(), height: () => getPillSize(),
              borderRadius: 9999,
              x: () => getDelta().x, y: () => getDelta().y,
              duration: 0.18, ease: "power2.inOut",
            },
            0.22,
          );

          tl.fromTo(glowRef.current!, { opacity: 0 }, { opacity: 1.0, duration: 0.12 }, 0.28);

          tl.to(videoRef.current!, { opacity: 0, duration: 0.04 }, 0.36);
          tl.fromTo(pillsRowRef.current!, { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.36);

          // Side pills cascade in (inner → outer)
          tl.fromTo(
            pillsRowRef.current!,
            { "--pill-1-scale": 0, "--pill-1-opacity": 0, "--pill-3-scale": 0, "--pill-3-opacity": 0 },
            { "--pill-1-scale": 1, "--pill-1-opacity": 1, "--pill-3-scale": 1, "--pill-3-opacity": 1, duration: 0.05, ease: "back.out(1.7)" },
            0.36,
          );
          tl.fromTo(
            pillsRowRef.current!,
            { "--pill-0-scale": 0, "--pill-0-opacity": 0, "--pill-4-scale": 0, "--pill-4-opacity": 0 },
            { "--pill-0-scale": 1, "--pill-0-opacity": 1, "--pill-4-scale": 1, "--pill-4-opacity": 1, duration: 0.05, ease: "back.out(1.7)" },
            0.40,
          );

          // Center pill stretches open
          tl.fromTo(
            pillsRowRef.current!,
            { "--center-pill-width": () => `${getPillSize()}px` },
            { "--center-pill-width": () => `${getExpandedPillWidth()}px`, duration: 0.06, ease: "power2.out" },
            0.40,
          );

          // Center label fades in
          tl.fromTo(
            pillsRowRef.current!,
            { "--center-label-opacity": 0 },
            { "--center-label-opacity": 1, duration: 0.05 },
            0.44,
          );

          // Content zooms in from behind
          tl.fromTo(
            finalContentRef.current!,
            { opacity: 0, scale: 0.55, filter: "blur(20px)" },
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.22, ease: "power2.out" },
            0.28,
          );

          /* ── Exit (progress 0.88 → 1.00 = time 1.936 → 2.2) ── */
          tl.to(finalContentRef.current!, { y: -80, opacity: 0, duration: 0.18, ease: "power2.in" }, 1.936);
          tl.to(pillsRowRef.current!,     { y: -50, opacity: 0, duration: 0.14, ease: "power2.in" }, 1.98);
          tl.to(lionRef.current!,         { y: 100, opacity: 0, duration: 0.16, ease: "power2.in" }, 2.0);
          tl.to(glowRef.current!,         { opacity: 0,         duration: 0.12                    }, 2.02);

          tl.set({}, {}, 2.2);
        },
      );
    },
    { scope: stickyRef, dependencies: [] },
  );

  /* ══════════════════════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════════════════════ */
  return (
    <section ref={sectionRef} className="relative h-[500vh] md:h-[600vh]">
      <motion.div
        ref={stickyRef}
        className="sticky top-0 h-screen bg-[#0D0D0D]"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initial={{ "--luma-accent": active.accent } as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animate={{ "--luma-accent": active.accent } as any}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Sound toggle ── */}
        <button
          onClick={toggleSound}
          className="absolute bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-white/70 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
        >
          {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isSoundOn ? "Sound On" : "Sound Off"}
          </span>
        </button>

        {/* ── Auto-play badge ── */}
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

        {/* ══════════════════════════════════════════════════════════════
            Content — 3-col desktop / stacked mobile
            GSAP drives opacity/scale/blur on the container (finalContentRef).
            Each inner column has its own Framer entrance tied to isScrollComplete.
        ══════════════════════════════════════════════════════════════ */}
        <div
          ref={finalContentRef}
          className="absolute inset-0 z-[25] pointer-events-none
                     mx-auto flex max-w-[1400px] flex-col items-center
                     justify-start px-4 opacity-0
                     pt-[8vh]
                     md:flex-row md:items-start md:justify-between md:px-6 md:pt-[18vh]"
          style={{ willChange: "transform, opacity, filter" }}
        >
          {/* Left image — desktop only */}
          <motion.div
            className="relative hidden overflow-hidden rounded-[18px] border border-white/10 bg-white/5 md:block flex-shrink-0"
            style={{ width: "22%", aspectRatio: "4/3", maxHeight: "24vh" }}
            animate={
              isScrollComplete
                ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, scale: 0.58, filter: "blur(18px)" }
            }
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.04 }}
          >
            <ServiceVisual visual={active.leftVisual} serviceId={active.id} side="left" />
            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[9px] font-medium uppercase tracking-widest text-white/80 backdrop-blur-md">
              {active.leftVisual.caption}
            </div>
          </motion.div>

          {/* Center column */}
          <motion.div
            className="flex w-full flex-col items-center md:flex-1 md:px-5 lg:px-8"
            animate={
              isScrollComplete
                ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, scale: 0.62, filter: "blur(14px)" }
            }
            transition={{ duration: 0.95, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.10 }}
          >
            {/* Hook text */}
            <div className="w-full text-center" style={{ minHeight: "clamp(2.8rem, 7vw, 5rem)" }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`hook-${active.id}`}
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="font-clash italic font-semibold leading-snug text-white/90"
                  style={{ fontSize: "clamp(0.95rem, 2.8vw, 1.7rem)" }}
                >
                  {active.hookText}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Stat */}
            <div className="w-full text-center" style={{ minHeight: "clamp(4rem, 10vw, 8rem)" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`stat-${active.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className="font-clash font-black leading-none"
                    style={{ color: "var(--luma-accent)", fontSize: "clamp(2.4rem, 6vw, 4.8rem)" }}
                  >
                    {active.statValue}
                  </span>
                  <span
                    className="font-semibold uppercase text-white/45"
                    style={{ fontSize: "clamp(0.55rem, 1vw, 0.78rem)", letterSpacing: "0.22em" }}
                  >
                    {active.statLabel}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile image strip */}
            <div
              className="relative w-full flex-shrink-0 overflow-hidden rounded-[12px] border border-white/10 bg-white/5 md:hidden"
              style={{ aspectRatio: "4/3", maxWidth: "60vw", maxHeight: "22vh" }}
            >
              <AnimatePresence mode="wait">
                {activeIndex % 2 === 0 ? (
                  <ServiceVisual
                    key={`mob-even-${active.id}`}
                    visual={active.leftVisual}
                    serviceId={`mob-even-${active.id}`}
                    side="mob-left"
                  />
                ) : (
                  <ServiceVisual
                    key={`mob-odd-${active.id}`}
                    visual={active.rightVisual}
                    serviceId={`mob-odd-${active.id}`}
                    side="mob-right"
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right image — desktop only */}
          <motion.div
            className="relative hidden overflow-hidden rounded-[18px] border border-white/10 bg-white/5 md:block flex-shrink-0"
            style={{ width: "22%", aspectRatio: "4/3", maxHeight: "24vh" }}
            animate={
              isScrollComplete
                ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, scale: 0.58, filter: "blur(18px)" }
            }
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.04 }}
          >
            <ServiceVisual visual={active.rightVisual} serviceId={active.id} side="right" />
            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[9px] font-medium uppercase tracking-widest text-white/80 backdrop-blur-md">
              {active.rightVisual.caption}
            </div>
          </motion.div>
        </div>

        {/* ── "One Vision" heading (Stage 1) ── */}
        <div
          ref={oneVisionRef}
          className="absolute inset-x-0 bottom-1/2 mb-[25vw] md:mb-[22.5vw] lg:mb-[17.5vw] 2xl:mb-[14vw] z-[7] text-center pointer-events-none"
        >
          <h2 className="text-[2.5rem] sm:text-[4rem] md:text-[5rem] lg:text-[7rem] font-bold text-white uppercase tracking-widest font-clash leading-none">
            One Vision
          </h2>
        </div>

        {/* ── Video pill (Phase 1 origin) ── */}
        <div
          ref={videoRef}
          className="absolute inset-0 z-[8] m-auto overflow-hidden rounded-[20px] pointer-events-auto bg-black
                     w-[70vw]  h-[50vw]
                     md:w-[75vw] md:h-[45vw]
                     lg:w-[60vw] lg:h-[35vw]
                     2xl:w-[50vw] 2xl:h-[28vw]"
        >
          <video autoPlay muted loop playsInline className="h-full w-full object-cover">
            <source src="https://i.imgur.com/x9yWTNn.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* ── Glow ── */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute bottom-0 left-1/2 z-[0] h-[90vh] w-[110vw] -translate-x-1/2 opacity-0 blur-xl"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, var(--luma-accent) 0%, var(--luma-accent) 25%, transparent 70%)" }}
        />

        {/* ── Lion cutout ── */}
        <img
          ref={lionRef}
          src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775553451/Lion_emblem2PGbCnR_-_Imgur_t6jkfg.avif"
          alt="Lion cutout"
          draggable={false}
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[12] mx-auto h-auto select-none object-contain opacity-0
                     w-[537px] md:w-[644px] lg:w-[581px] 2xl:w-[564px]"
        />

        {/* ── Center anchor (GSAP snap target) ── */}
        <div
          ref={centerAnchorRef}
          className="pointer-events-none absolute z-[1] opacity-0
                     bottom-[280px] md:bottom-[320px] lg:bottom-[290px] 2xl:bottom-[275px]"
          style={{
            width: "clamp(44px, 5vw, 64px)",
            height: "clamp(44px, 5vw, 64px)",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

        {/* ══════════════════════════════════════════════════════════════
            Pills Row
            GSAP CSS-var animations control cascade-in / expand.
            Click → instant setActiveIndex, Framer handles width + color.
        ══════════════════════════════════════════════════════════════ */}
        <div
          ref={pillsRowRef}
          className="absolute left-1/2 z-[30] -translate-x-1/2 opacity-0
                     bottom-[280px] md:bottom-[320px] lg:bottom-[290px] 2xl:bottom-[275px]"
        >
          <div className="flex items-center gap-2 md:gap-3">
            {ordered.map((item, i) => {
              const isActive     = i === 2;
              const globalIndex  = SERVICES.findIndex((s) => s.id === item.id);
              const pillH        = "clamp(44px, 5vw, 64px)";

              return (
                <motion.div
                  key={i}
                  onClick={() => handlePillClick(globalIndex)}
                  animate={{
                    backgroundColor: isActive ? active.accent : "#3D3D3D",
                  }}
                  transition={{ backgroundColor: { duration: 0.4 } }}
                  className="relative shrink-0 flex items-center justify-center rounded-full overflow-hidden"
                  style={{
                    width: isActive
                      ? "var(--center-pill-width, clamp(44px,5vw,64px))"
                      : "clamp(44px,5vw,64px)",
                    height: pillH,
                    transform: isActive ? "none" : `scale(var(--pill-${i}-scale, 0))`,
                    opacity:   isActive ? 1 : `var(--pill-${i}-opacity, 0)`,
                    cursor: isScrollComplete ? "pointer" : "default",
                    transition: isScrollComplete
                      ? "opacity 0.25s ease, transform 0.25s ease"
                      : "none",
                  }}
                  title={item.label}
                >
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      <motion.span
                        key={`center-${item.id}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="whitespace-nowrap px-4 text-[11px] font-bold uppercase tracking-wider text-white md:text-[13px]"
                        style={!isScrollComplete ? { opacity: "var(--center-label-opacity, 0)" } : undefined}
                      >
                        {item.label}
                      </motion.span>
                    ) : (
                      <motion.span
                        key={`side-${item.id}`}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[10px] font-semibold uppercase tracking-wide text-white/70"
                      >
                        {item.shortLabel}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Auto-play progress bar under active pill */}
                  {isActive && isScrollComplete && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute -bottom-4 left-1/2 h-[2px] w-[80px] -translate-x-1/2 overflow-hidden rounded-full bg-white/10"
                    >
                      <div
                        className="h-full rounded-full transition-[width] duration-100"
                        style={{ width: `${autoPlayProgress}%`, backgroundColor: "var(--luma-accent)" }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

      </motion.div>
    </section>
  );
}
