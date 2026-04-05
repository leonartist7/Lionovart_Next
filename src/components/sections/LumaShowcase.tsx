"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
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
    statValue: "150%",
    statLabel: "conversion lift on Nova redesign",
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
    statValue: "10k+",
    statLabel: "social impressions on Fluora campaign",
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
    statValue: "30+",
    statLabel: "years combined experience",
    leftVisual:  { type: "image", src: `${CDN}freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif`, caption: "Brand campaign" },
    rightVisual: { type: "image", src: `${CDN}freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_2_cd1gee.avif`, caption: "Creative direction" },
  },
  {
    id: "branding",
    label: "BRANDING",
    shortLabel: "BRA",
    accent: "#f59e0b",
    hookText: (
      <>
        Your brand is the first thing<br />
        people judge — and the last<br />
        thing they forget.
      </>
    ),
    statValue: "3x",
    statLabel: "average perceived value increase after rebrand",
    leftVisual:  { type: "image", src: `${CDN}freepik_from-this-brand-identity-help-me-make-a-mockup-of-her-landing-page..-looking-premium-and-elegant_0001_bnk4us.avif`,  caption: "Brand identity" },
    rightVisual: { type: "image", src: `${CDN}freepik__design-a-highly-polished-professional-corporate-we__1650_qukgx3.avif`,    caption: "Corporate identity" },
  },
  {
    id: "print",
    label: "PRINTING",
    shortLabel: "PRI",
    accent: "#f59e0b",
    hookText: (
      <>
        Every touchpoint is an emotion.<br />
        We compose them like a score —<br />
        nothing is accidental.
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

const getPillSize = (): number => Math.max(44, Math.min(window.innerWidth * 0.05, 64));
const getExpandedPillWidth = (): number => Math.max(160, Math.min(window.innerWidth * 0.22, 280));

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
   Visual Media Sub-component (shared between left/right/mobile)
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
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
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
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
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
  // Track which pill position triggered the pulse animation
  const [fluidOriginPillIndex, setFluidOriginPillIndex] = useState<number | null>(null);

  const ordered = getOrderedServices(activeIndex);
  const active = SERVICES[activeIndex];

  const isScrollCompleteRef = useRef(false);
  const bassAudioRef = useRef<HTMLAudioElement | null>(null);
  const hitAudioRef = useRef<HTMLAudioElement | null>(null);

  /* ── Auto-cycle & Progress Engine ─────────────────────────────── */
  const autoPlayDuration = 6000;
  const lastInteractionTime = useRef<number>(0);
  const progressStartTime = useRef<number | null>(null);
  const reqRef = useRef<number>(0);

  useEffect(() => {
    lastInteractionTime.current = Date.now();
  }, []);

  useEffect(() => {
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
      progressStartTime.current = null;
      return;
    }

    if (!progressStartTime.current) progressStartTime.current = Date.now();

    const updateProgress = () => {
      if (!progressStartTime.current) return;
      const elapsed = Date.now() - progressStartTime.current;
      const progress = Math.min((elapsed / autoPlayDuration) * 100, 100);
      setAutoPlayProgress(progress);

      if (progress >= 100) {
        setFluidOriginPillIndex(3);
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

  // Clear fluid origin after animation completes
  useEffect(() => {
    if (fluidOriginPillIndex !== null) {
      const t = setTimeout(() => setFluidOriginPillIndex(null), 700);
      return () => clearTimeout(t);
    }
  }, [fluidOriginPillIndex]);

  const handlePillClick = (globalIndex: number, orderedPosition: number) => {
    if (!isScrollComplete) return;
    if (globalIndex === activeIndex) return;
    setFluidOriginPillIndex(orderedPosition);
    setActiveIndex(globalIndex);
    setIsAutoPlaying(false);
    // eslint-disable-next-line react-hooks/purity
    lastInteractionTime.current = Date.now();
  };

  /* ── Audio Engine ─────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      bassAudioRef.current = new Audio("https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3");
      hitAudioRef.current = new Audio("https://cdn.freesound.org/previews/336/336605_2865330-lq.mp3");
    }
  }, []);

  useEffect(() => {
    if (!isSoundOn || !isScrollComplete) return;
    if (active.hasCinematicHit && hitAudioRef.current) {
      hitAudioRef.current.currentTime = 0;
      hitAudioRef.current.volume = 0.6;
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

          const lionRestW  = c.isMobile ? 442 : c.isTablet ? 493 : c.isDesktop ? 445 : 432;
          const lionEntryW = Math.round(lionRestW * 1.3); // Oversized on entry for drama
          const lionShrinkW = c.isMobile ? 253 : c.isTablet ? 265 : c.isDesktop ? 258 : 239;

          const videoFromW = c.isMobile ? "70vw" : c.isTablet ? "75vw" : c.isDesktop ? "60vw" : "50vw";
          const videoFromH = c.isMobile ? "50vw" : c.isTablet ? "45vw" : c.isDesktop ? "35vw" : "28vw";

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
              scrub: 2.5,             // Heavy scrub — feels like dragging through resistance
              invalidateOnRefresh: true,
              snap: {
                // Only 2 points: full-reveal (0.55), exit (1)
                // Removed 0 so the engine never fights the user and pulls backwards to the top
                snapTo: [0.55, 1],
                duration: { min: 0.4, max: 1.0 },
                delay: 0.15,
                ease: "power4.inOut",   // Very aggressive pull into snap points
              },
              onEnter: () => {
                if (isSoundOn && bassAudioRef.current) {
                  bassAudioRef.current.currentTime = 0;
                  bassAudioRef.current.volume = 0.5;
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

          /* ══════════════════════════════════════════════════════════════
           *  ONE FLUID SWEEP  (progress 0.00 → 0.48)
           *  ALL animations complete before 0.48 — snap at 0.55 always
           *  lands on a fully-revealed state. No partial-open pills.
           *
           *    0.02–0.16  "ONE VISION" drops away
           *    0.04–0.26  Lion rises dramatically
           *    0.22–0.38  Video shrinks to pill while lion finishes
           *    0.28–0.36  Glow blooms
           *    0.36–0.40  Video fades, pills row fades in
           *    0.36–0.42  Side pills cascade (inner → outer)
           *    0.40–0.46  Center pill stretches
           *    0.44–0.48  Label fades in
           *    0.28–0.48  Content zooms in from behind
           *
           *  DWELL ZONE  (0.55 → 1.00)
           *  Full luma view is locked. Snap at 0.55 always shows complete state.
           *  tl.set({}, {}, 2.2) anchors duration so dwell = ~40% of scroll.
           * ══════════════════════════════════════════════════════════════ */

          // Lion starts below, oversized
          tl.set(lionRef.current!, { y: () => window.innerHeight * 1.1, opacity: 1, width: lionEntryW }, 0);

          // "ONE VISION" drops fast at the very start
          tl.to(
            oneVisionRef.current!,
            { y: "60vh", scale: 0.15, opacity: 0, duration: 0.14, ease: "power3.in" },
            0.02,
          );

          // Lion rises — spans most of the sweep
          tl.to(
            lionRef.current!,
            { y: 0, duration: 0.22, ease: "power3.out" },
            0.04,
          );

          // Lion shrinks & video collapses simultaneously (overlap at 0.22)
          tl.to(
            lionRef.current!,
            { width: lionShrinkW, duration: 0.16, ease: "power2.inOut" },
            0.22,
          );

          tl.fromTo(
            videoRef.current!,
            { width: videoFromW, height: videoFromH, borderRadius: 20, x: 0, y: 0 },
            {
              width: () => getPillSize(),
              height: () => getPillSize(),
              borderRadius: 9999,
              x: () => getDelta().x,
              y: () => getDelta().y,
              duration: 0.18,
              ease: "power2.inOut",
            },
            0.22,
          );

          // Glow blooms as video collapses
          tl.fromTo(glowRef.current!, { opacity: 0 }, { opacity: 1.0, duration: 0.12 }, 0.28);

          // Video fades out, pills fade in simultaneously
          tl.to(videoRef.current!, { opacity: 0, duration: 0.04 }, 0.36);
          tl.fromTo(pillsRowRef.current!, { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.36);

          // Side pills cascade in (inner pair first, then outer)
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

          // Center pill stretches
          tl.fromTo(
            pillsRowRef.current!,
            { "--center-pill-width": () => `${getPillSize()}px` },
            { "--center-pill-width": () => `${getExpandedPillWidth()}px`, duration: 0.06, ease: "power2.out" },
            0.40,
          );

          // Label fades in once pill is expanded
          tl.fromTo(
            pillsRowRef.current!,
            { "--center-label-opacity": 0 },
            { "--center-label-opacity": 1, duration: 0.05 },
            0.44,
          );

          // Content zooms in from behind — starts alongside glow
          tl.fromTo(
            finalContentRef.current!,
            { opacity: 0, scale: 0.55, filter: "blur(20px)" },
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.22, ease: "power2.out" },
            0.28,
          );

          // ── Dwell zone anchor ──
          // Everything done by 0.48. Snap at 0.55 always shows full reveal.
          // Remaining 0.55→1.0 = dead dwell the user scrolls through to exit.
          tl.set({}, {}, 2.2);
        },
      );
    },
    { scope: stickyRef, dependencies: [] },
  );

  /* ── Pill pulse animation size estimate ── */
  const pillSizeEstimate = 52; // midpoint of clamp(44px, 5vw, 64px)

  return (
    <section ref={sectionRef} className="relative h-[600vh] md:h-[800vh]">
      <motion.div
        ref={stickyRef}
        className="sticky top-0 h-screen bg-[#0D0D0D]"
        // CSS variable animation — `as any` is the documented Framer Motion workaround for CSS vars
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initial={{ "--luma-accent": active.accent } as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        animate={{ "--luma-accent": active.accent } as any}
        transition={{ duration: 0.5, ease: "easeOut" }}
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

        {/* ══════════════════════════════════════════════════════════════
            3-Column Guided Presentation Layout
            Mobile: flex-col (hookText → stat → image), centered
            Desktop: flex-row (left img | center text+stat | right img)
            finalContentRef opacity/scale/blur controlled by GSAP (container)
            Each column has its own Framer zoom-from-behind driven by isScrollComplete
        ══════════════════════════════════════════════════════════════ */}
        <div
          ref={finalContentRef}
          className="absolute inset-0 z-[25] pointer-events-none mx-auto flex max-w-[1400px] flex-col items-center justify-start px-4 opacity-0
                     pt-[8vh]
                     md:flex-row md:items-start md:justify-between md:px-6 md:pt-[18vh]"
          style={{ willChange: "transform, opacity, filter" }}
        >
          {/* ── Left Visual Column (desktop only) ── */}
          <motion.div
            className="relative hidden overflow-hidden rounded-[18px] border border-white/10 bg-white/5 md:block flex-shrink-0"
            style={{ width: "20%", aspectRatio: "3/4", maxHeight: "36vh" }}
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

          {/* ── Center Column ── */}
          <motion.div
            className="flex w-full flex-col items-center md:flex-1 md:px-5 lg:px-8"
            animate={
              isScrollComplete
                ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, scale: 0.62, filter: "blur(14px)" }
            }
            transition={{ duration: 0.95, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.10 }}
          >
            {/* Hook Text — min-h prevents layout shift, no clipping */}
            <div
              className="w-full text-center"
              style={{ minHeight: "clamp(2.8rem, 7vw, 5rem)" }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={`hook-${active.id}`}
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="font-clash italic font-semibold leading-snug text-white/90"
                  style={{ fontSize: "clamp(0.95rem, 2.8vw, 1.7rem)" }}
                >
                  {active.hookText}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Stat Text — min-h, no clipping */}
            <div
              className="w-full text-center"
              style={{ minHeight: "clamp(4rem, 10vw, 8rem)" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`stat-${active.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease: "easeInOut", delay: 0.07 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className="font-clash font-black leading-none"
                    style={{
                      color: "var(--luma-accent)",
                      fontSize: "clamp(2.4rem, 6vw, 4.8rem)",
                    }}
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

            {/* Mobile Single Visual — thin cinematic strip, won't overlap pills */}
            <div
              className="relative w-full flex-shrink-0 overflow-hidden rounded-[12px] border border-white/10 bg-white/5 md:hidden"
              style={{ aspectRatio: "16/7", maxWidth: "80vw", maxHeight: "14vh" }}
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

          {/* ── Right Visual Column (desktop only) ── */}
          <motion.div
            className="relative hidden overflow-hidden rounded-[18px] border border-white/10 bg-white/5 md:block flex-shrink-0"
            style={{ width: "20%", aspectRatio: "3/4", maxHeight: "36vh" }}
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

        {/* ── Text above the video (Stage 1 hero heading) ── */}
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
          className="absolute inset-0 z-[8] m-auto overflow-hidden rounded-[20px] pointer-events-auto bg-black
                     w-[70vw] h-[50vw]
                     md:w-[75vw] md:h-[45vw]
                     lg:w-[60vw] lg:h-[35vw]
                     2xl:w-[50vw] 2xl:h-[28vw]"
        >
          <video autoPlay muted loop playsInline className="h-full w-full object-cover">
            <source src="https://i.imgur.com/x9yWTNn.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* ── Glow Layer — bleeds past section bottom into marquee below ── */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute bottom-0 left-1/2 z-[0] h-[90vh] w-[110vw] -translate-x-1/2 opacity-0 blur-xl"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, var(--luma-accent) 0%, var(--luma-accent) 25%, transparent 70%)" }}
        />

        {/* ── Lion Cutout ── */}
        <img
          ref={lionRef}
          src="https://i.imgur.com/2PGbCnR.png"
          alt="Lion cutout"
          draggable={false}
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[12] mx-auto h-auto select-none object-contain opacity-0
                     w-[537px] md:w-[644px] lg:w-[581px] 2xl:w-[564px]"
        />

        {/* ── Center Anchor (GSAP target for video-to-pill snap) ──
            bottom = lion_width - pill_height + 5px (5px gap above lion)
              mobile:  537 - 44 + 5 = 498px  → but PNG has transparent padding, use ~280px
              Empirically tuned: pills sit just above the visible lion head.        ── */}
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

        {/* ── Pills Row ── */}
        <LayoutGroup>
          <div
            ref={pillsRowRef}
            className="absolute left-1/2 z-[30] flex -translate-x-1/2 items-center opacity-0 gap-2 md:gap-3
                       bottom-[280px] md:bottom-[320px] lg:bottom-[290px] 2xl:bottom-[275px]"
          >

            {/* ── Soft inner-glow pulse on pill switch ──
                A white radial bloom that scales out from center and fades.
                Triggered on every activeIndex change once scroll is complete. */}
            <AnimatePresence>
              {fluidOriginPillIndex !== null && (
                <motion.div
                  key={`pulse-${activeIndex}-${fluidOriginPillIndex}`}
                  className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-[5]"
                  initial={{
                    width: pillSizeEstimate,
                    height: pillSizeEstimate,
                    opacity: 0.7,
                    scale: 1,
                  }}
                  animate={{
                    width: pillSizeEstimate * 3.5,
                    height: pillSizeEstimate * 3.5,
                    opacity: 0,
                    scale: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: [0.0, 0.0, 0.2, 1] }}
                  style={{
                    background: `radial-gradient(circle, rgba(255,255,255,0.55) 0%, ${active.accent}55 35%, transparent 70%)`,
                    boxShadow: `0 0 24px 8px ${active.accent}66`,
                  }}
                />
              )}
            </AnimatePresence>

            {ordered.map((item, i) => {
              const isCenter = i === 2;
              const globalIndex = SERVICES.findIndex((s) => s.id === item.id);
              return (
                <div
                  key={i}
                  onClick={() => handlePillClick(globalIndex, i)}
                  className="relative shrink-0 rounded-full"
                  style={{
                    width: isCenter
                      ? "var(--center-pill-width, clamp(44px,5vw,64px))"
                      : "clamp(44px,5vw,64px)",
                    height: "clamp(44px,5vw,64px)",
                    cursor: isScrollComplete ? "pointer" : "default",
                    zIndex: isCenter ? 10 : 6,
                  }}
                >
                  <div
                    className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-full backdrop-blur-md ${
                      isCenter ? "" : "border border-white/10 bg-white/20"
                    }`}
                    style={{
                      backgroundColor: isCenter ? "var(--luma-accent)" : undefined,
                      transform: isCenter ? "none" : `scale(var(--pill-${i}-scale, 0))`,
                      opacity: isCenter ? 1 : `var(--pill-${i}-opacity, 0)`,
                    }}
                    title={item.label}
                  >
                    {/* Center pill: Framer layout-animated background for smooth accent color morph */}
                    {isCenter && (
                      <motion.div
                        layoutId="center-pill-bg"
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: active.accent }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}

                    <AnimatePresence mode="wait">
                      {isCenter ? (
                        <motion.span
                          key={`center-${item.id}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.3 }}
                          className="relative z-10 whitespace-nowrap px-4 text-[11px] font-bold uppercase tracking-wider text-white md:text-[13px]"
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

                  {/* Auto-play Progress Bar under center pill */}
                  {isCenter && isScrollComplete && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -bottom-4 left-1/2 h-[2px] w-[80px] -translate-x-1/2 overflow-hidden rounded-full bg-white/10"
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          width: `${autoPlayProgress}%`,
                          backgroundColor: "var(--luma-accent)",
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </LayoutGroup>
      </motion.div>
    </section>
  );
}
