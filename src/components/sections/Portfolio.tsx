"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useInView,
} from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type Project = {
  id: number;
  title: string;
  description: string;
  metric: string;
  image: string;
  gridClasses: string;
  cardType?: "orbit" | "bento";
};

// --- Data Structure ---
// Mobile/Tablet layout (2-col grid, 3 rows):
//
//  [  Card 1 — 1col×2row tall  ] [  Card 2 — 1col×1row  ]
//  [  Card 1 — continues       ] [  Card 4 — 1col×1row  ]
//  [  Card 3 — 2col×1row wide  ]
//
// Desktop layout (lg, 12-col grid, 2 rows):
//
//  [  Card 1 — 4col×2row  ] [  Card 2 — 4col×1row  ] [  Card 3 — 4col×2row  ]
//  [  Card 1 — continues  ] [  Card 4 — 4col×1row  ] [  Card 3 — continues  ]
//
// DOM order: 1, 2, 4, 3 — so Card 3 naturally falls to the bottom on mobile
//
const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Alture Brand Identity",
    description: "Full rebrand — logo system, typography, color palette",
    metric: "3x",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&q=80",
    gridClasses: "col-span-1 row-span-2 md:col-span-3 md:row-span-2 lg:col-span-4 lg:row-span-2",
  },
  {
    id: 2,
    title: "Top Platform Expertise",
    description: "Always the best tools available",
    metric: "",
    image: "",
    cardType: "orbit",
    gridClasses: "col-span-1 row-span-1 md:col-span-3 md:row-span-1 lg:col-span-4 lg:row-span-1",
  },
  {
    id: 4,
    title: "Arpeggio Music App",
    description: "UI/UX design & interactive prototype",
    metric: "4.9",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    gridClasses: "col-span-1 row-span-1 md:col-span-3 md:row-span-1 lg:col-span-4 lg:row-span-1",
  },
  {
    id: 3,
    title: "Fluora Campaign",
    description: "Social media & video production campaign",
    metric: "10k+",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80",
    gridClasses: "col-span-2 row-span-1 md:col-span-6 md:row-span-1 lg:col-span-8 lg:row-span-1",
  },
];

// ─── Platform Icons ───────────────────────────────────────────────────────────
// First 4 → inner ring (CW, fast) | Last 5 → outer ring (CCW, slow)
const PLATFORM_ICONS = [
  // ── Inner ring ──
  {
    key: "adobe",
    label: "Adobe",
    bg: "#FF0000",
    svg: (
      <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
        <path d="M10 2L1 18h5l1.5-4h5L14 18h5L10 2zm0 5l1.7 5H8.3L10 7z" fill="white" />
      </svg>
    ),
  },
  {
    key: "figma",
    label: "Figma",
    bg: "#1E1E1E",
    svg: (
      <svg viewBox="0 0 20 20" width="13" height="13" fill="none">
        <circle cx="7.5" cy="5.5"  r="3" fill="#F24E1E" />
        <circle cx="7.5" cy="10"   r="3" fill="#A259FF" />
        <circle cx="7.5" cy="14.5" r="3" fill="#0ACF83" />
        <circle cx="12.5" cy="10"  r="3" fill="#1ABCFE" />
      </svg>
    ),
  },
  {
    key: "openai",
    label: "OpenAI",
    bg: "#10a37f",
    svg: (
      <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
        <path d="M10 3a7 7 0 1 0 0 14A7 7 0 0 0 10 3zm0 3a4 4 0 0 1 3.46 6L6.54 7A3.98 3.98 0 0 1 10 6zm0 8a4 4 0 0 1-3.46-6l6.92 5.05A3.98 3.98 0 0 1 10 14z" fill="white" />
      </svg>
    ),
  },
  {
    key: "google",
    label: "Google",
    bg: "#FFFFFF",
    svg: (
      <svg viewBox="0 0 20 20" width="13" height="13" fill="none">
        <path d="M18 10.2c0-.6-.1-1.1-.2-1.7H10v3.2h4.5c-.2 1-.8 1.9-1.7 2.4v2h2.7C17 14.6 18 12.6 18 10.2z" fill="#4285F4" />
        <path d="M10 18c2.4 0 4.4-.8 5.8-2.1l-2.7-2c-.8.5-1.9.8-3.1.8-2.4 0-4.4-1.6-5.1-3.7H2.1v2.1C3.5 16.1 6.5 18 10 18z" fill="#34A853" />
        <path d="M4.9 11c-.2-.5-.3-1-.3-1.5s.1-1 .3-1.5V5.9H2.1C1.4 7.2 1 8.5 1 10s.4 2.8 1.1 4.1L4.9 11z" fill="#FBBC05" />
        <path d="M10 4.3c1.3 0 2.5.5 3.4 1.3l2.5-2.5C14.4 1.7 12.4.8 10 .8 6.5.8 3.5 2.7 2.1 5.9l2.8 2.1C5.6 5.9 7.6 4.3 10 4.3z" fill="#EA4335" />
      </svg>
    ),
  },
  // ── Outer ring ──
  {
    key: "instagram",
    label: "Instagram",
    bg: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
    svg: (
      <svg viewBox="0 0 20 20" width="13" height="13" fill="none">
        <rect x="2" y="2" width="16" height="16" rx="4.5" stroke="white" strokeWidth="1.6" />
        <circle cx="10" cy="10" r="3.5" stroke="white" strokeWidth="1.6" />
        <circle cx="15" cy="5" r="1" fill="white" />
      </svg>
    ),
  },
  {
    key: "meta",
    label: "Meta",
    bg: "#1877F2",
    svg: (
      <svg viewBox="0 0 20 20" width="10" height="16" fill="none">
        <path d="M13 3h-2.2C8.7 3 7 4.7 7 7v1.5H5V12h2v8h4v-8h2.7l.3-3.5H11V7c0-.6.4-1 1-1h1V3z" fill="white" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    bg: "#FF0000",
    svg: (
      <svg viewBox="0 0 20 20" width="16" height="12" fill="none">
        <polygon points="7,4 7,16 17,10" fill="white" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    bg: "#010101",
    svg: (
      <svg viewBox="0 0 20 20" width="12" height="16" fill="none">
        <path d="M14 2c0 1.9 1.3 3.5 3 4v2.5c-1.1 0-2.2-.4-3-1v5c0 2.5-2 4.5-4.5 4.5S5 15 5 12.5 7 8 9.5 8c.2 0 .3 0 .5.1V11c-.2 0-.3-.1-.5-.1-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2V2h2.5z" fill="white" />
      </svg>
    ),
  },
  {
    key: "canva",
    label: "Canva",
    bg: "#00C4CC",
    svg: (
      <svg viewBox="0 0 20 20" width="13" height="13" fill="none">
        <path d="M16 7.5C14.8 5.4 12.6 4 10 4c-3.9 0-7 3.1-7 7s3.1 7 7 7c2.6 0 4.8-1.4 6-3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

type PlatformIcon = (typeof PLATFORM_ICONS)[number];

// ─── OrbitRing ────────────────────────────────────────────────────────────────
function OrbitRing({
  icons,
  radius,
  duration,
  direction,
  iconSize = 28,
}: {
  icons: readonly PlatformIcon[];
  radius: number;
  duration: number;
  direction: 1 | -1;
  iconSize?: number;
}) {
  const halfIcon = iconSize / 2;
  return (
    <>
      {icons.map((icon, i) => {
        const theta = (360 / icons.length) * i;
        const target = theta + 360 * direction;
        return (
          <motion.div
            key={icon.key}
            style={{
              position: "absolute",
              width: radius * 2,
              height: radius * 2,
              top: "50%",
              left: "50%",
              marginTop: -radius,
              marginLeft: -radius,
              originX: "50%",
              originY: "50%",
            }}
            initial={{ rotate: theta }}
            animate={{ rotate: target }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              style={{
                position: "absolute",
                top: -halfIcon,
                left: "50%",
                x: "-50%",
                width: iconSize,
                height: iconSize,
                borderRadius: "50%",
                background: icon.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                flexShrink: 0,
              }}
              initial={{ rotate: -theta }}
              animate={{ rotate: -target }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
            >
              {icon.svg}
            </motion.div>
          </motion.div>
        );
      })}
    </>
  );
}

// ─── OrbitPlatformsCard ───────────────────────────────────────────────────────
function OrbitPlatformsCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const innerIcons = PLATFORM_ICONS.slice(0, 4) as readonly PlatformIcon[];
  const outerIcons = PLATFORM_ICONS.slice(4) as readonly PlatformIcon[];

  return (
    <motion.div
      className={`relative ${project.gridClasses}`}
    >
      {/* Outer shell — position:relative so shader fills it as a ring */}
      <div
        className="relative flex h-full w-full min-h-[220px] md:min-h-0 bg-[#e2e8f0]"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 24px -6px rgba(0,0,0,0.15)",
        }}
      >
        {/* Soft Animated Rim */}
        <div
          className="absolute inset-[-100%] animate-[spin_5s_linear_infinite]"
          style={{
            background: "conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(229,25,42,0.8) 25%, transparent 50%, rgba(229,25,42,0.8) 75%, transparent 100%)",
            opacity: 0.6,
          }}
        />

        {/* Inner dark layer — 2px inset leaves the animated gradient visible as the border */}
        <div
          className="flex flex-col"
          style={{
            position: "absolute",
            inset: "2px",
            borderRadius: "18px",
            background: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* Radial red glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 55% at 50% 42%, rgba(229,25,42,0.10) 0%, transparent 75%)",
              pointerEvents: "none",
            }}
          />

          {/* Orbit stage */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: 56,
            }}
          >
            {/* Zero-size anchor at center */}
            <div style={{ position: "relative", width: 0, height: 0 }}>
              {/* Faint guide rings */}
              {([120, 190] as const).map((d) => (
                <div
                  key={d}
                  style={{
                    position: "absolute",
                    width: d,
                    height: d,
                    borderRadius: "50%",
                    border: "1px solid rgba(0,0,0,0.05)",
                    top: -d / 2,
                    left: -d / 2,
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* Inner ring: 4 icons, 60px radius, 9s CW */}
              <OrbitRing icons={innerIcons} radius={60} duration={9} direction={1} />

              {/* Outer ring: 5 icons, 95px radius, 18s CCW */}
              <OrbitRing icons={outerIcons} radius={95} duration={18} direction={-1} />

              {/* Lion emblem at center */}
              <div
                style={{
                  position: "absolute",
                  width: 40,
                  height: 40,
                  top: -20,
                  left: -20,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.02)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  filter: "drop-shadow(0 0 10px rgba(0,0,0,0.1))",
                  zIndex: 10,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775553451/Lion_emblem2PGbCnR_-_Imgur_t6jkfg.avif"
                  alt="Lionovart emblem"
                  width={32}
                  height={32}
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>

          {/* Bottom label */}
          <div
            className="relative z-10 mt-auto px-5 pb-4 pt-2 md:px-6 md:pb-5"
            style={{
              background:
                "linear-gradient(to top, rgba(255,255,255,0.98) 70%, transparent)",
            }}
          >
            <p
              className="mb-[2px] text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "#e5192a" }}
            >
              OUR TOOLS
            </p>
            <h3 className="text-[1rem] font-bold leading-tight text-[#111]">
              Top Platform Expertise
            </h3>
            <p
              className="mt-[2px] text-[12px] leading-snug"
              style={{ color: "#666" }}
            >
              Always the best tools available
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── BentoCard ────────────────────────────────────────────────────────────────
function BentoCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // biome-ignore lint/suspicious/noExplicitAny: External library without types
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`relative ${project.gridClasses}`}
      style={{ perspective: 1200 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative flex h-full w-full cursor-default min-h-[220px] md:min-h-0 bg-[#e2e8f0]"
        style={{
          rotateX,
          rotateY,
          borderRadius: "20px",
          overflow: "hidden",
        }}
        animate={{
          scale: isHovered ? 1.015 : 1,
          boxShadow: isHovered
            ? "0 10px 28px -8px rgba(0,0,0,0.20), 0 0 16px -4px rgba(229,25,42,0.10)"
            : "0 8px 24px -6px rgba(0,0,0,0.15), 0 2px 8px -2px rgba(0,0,0,0.10)",
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Soft Animated Rim */}
        <motion.div
          className="absolute inset-[-100%] animate-[spin_5s_linear_infinite]"
          style={{
            background: "conic-gradient(from 0deg at 50% 50%, transparent 0%, rgba(229,25,42,0.8) 25%, transparent 50%, rgba(229,25,42,0.8) 75%, transparent 100%)",
          }}
          animate={{ opacity: isHovered ? 1 : 0.3 }}
          transition={{ duration: 0.4 }}
        />

        {/* Inner content wrapper — 2px inset makes the rim visible */}
        <div
          className="absolute flex flex-col justify-end"
          style={{
            inset: "2px",
            borderRadius: "18px",
            background: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${project.image})` }}
          />

          {/* Fade Overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background:
                "linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.75) 18%, rgba(255,255,255,0.3) 36%, transparent 60%)",
              opacity: isHovered ? 0.85 : 1,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-row items-end justify-between px-6 pt-6 pb-[15px] md:px-8 md:pt-8 md:pb-[19px]">
            <span
              className="text-[2.5rem] font-[800] leading-none text-[#e5192a] mb-0"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            >
              {project.metric}
            </span>
            <h3 className="mb-1 text-[1.1rem] font-bold text-[#111] text-right max-w-[55%]">
              {project.title}
            </h3>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Portfolio() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const activeProject = activeIdx !== null ? PROJECTS[activeIdx] : null;

  const handleClose = () => setActiveIdx(null);

  const handleNext = useCallback(() => {
    if (activeIdx !== null) setActiveIdx((activeIdx + 1) % PROJECTS.length);
  }, [activeIdx]);

  const handlePrev = useCallback(() => {
    if (activeIdx !== null)
      setActiveIdx((activeIdx - 1 + PROJECTS.length) % PROJECTS.length);
  }, [activeIdx]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIdx === null) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIdx, handleNext, handlePrev]);

  useEffect(() => {
    document.body.style.overflow = activeIdx !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeIdx]);

  return (
    <section id="work" className="bg-[#eceff3] pt-[40px] pb-[80px] md:pt-[60px] md:pb-[120px]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <motion.p
            className="mb-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-brand-red"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Selected Work
          </motion.p>
          <motion.h2
            className="text-[2.2rem] font-bold uppercase leading-none tracking-tight text-[#111111] sm:text-[3rem] md:text-[4.5rem]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Built for <span className="text-brand-red">Impact</span>
          </motion.h2>
        </div>

        {/* Bento Grid */}
        <div className="
          grid gap-3
          grid-cols-2 grid-rows-[220px_220px_180px]
          md:grid-cols-6 md:grid-rows-[260px_260px_200px]
          lg:grid-cols-12 lg:grid-rows-[270px_270px]
        ">
          {PROJECTS.map((project, idx) =>
            project.cardType === "orbit" ? (
              <OrbitPlatformsCard
                key={project.id}
                project={project}
                index={idx}
              />
            ) : (
              <BentoCard
                key={project.id}
                project={project}
                index={idx}
                onClick={() => setActiveIdx(idx)}
              />
            )
          )}
        </div>
      </div>

      {/* Modal Slideshow */}
      <AnimatePresence>
        {activeProject && activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md md:p-8"
            onClick={handleClose}
          >
            {/* Left Arrow */}
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-2 top-1/2 z-[60] -translate-y-1/2 p-4 text-white/50 transition-all hover:scale-110 hover:text-white md:left-8"
              aria-label="Previous project"
            >
              <svg className="h-10 w-10 md:h-14 md:w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-2 top-1/2 z-[60] -translate-y-1/2 p-4 text-white/50 transition-all hover:scale-110 hover:text-white md:right-8"
              aria-label="Next project"
            >
              <svg className="h-10 w-10 md:h-14 md:w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Modal Container */}
            <motion.div
              className="relative flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[24px] bg-[#0a0a0a] shadow-2xl md:h-[600px] md:flex-row"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Image */}
              <div className="relative h-[300px] w-full md:h-full md:w-[55%]">
                {activeProject.image ? (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeProject.id}
                      src={activeProject.image}
                      alt={activeProject.title}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AnimatePresence>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0d]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775553451/Lion_emblem2PGbCnR_-_Imgur_t6jkfg.avif"
                      alt="Lionovart"
                      width={56}
                      height={56}
                      style={{ objectFit: "contain", opacity: 0.5, filter: "drop-shadow(0 0 12px rgba(255,255,255,0.4))" }}
                    />
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="flex w-full flex-col justify-between p-8 md:w-[45%] md:p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProject.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeProject.metric && (
                      <span className="mb-4 block text-[3.5rem] font-[800] leading-none text-brand-red md:text-[4.5rem]">
                        {activeProject.metric}
                      </span>
                    )}
                    <h3 className="mb-4 text-[1.8rem] font-bold uppercase tracking-tight text-white md:text-[2.2rem]">
                      {activeProject.title}
                    </h3>
                    <p className="text-[1rem] leading-relaxed text-white/70">
                      {activeProject.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Thumbnail Dock */}
                <div className="mt-12 flex flex-wrap items-center gap-3 md:gap-4">
                  {PROJECTS.map((proj, dotIdx) => {
                    const isActive = dotIdx === activeIdx;
                    return (
                      <button
                        key={dotIdx}
                        onClick={() => setActiveIdx(dotIdx)}
                        className={`relative h-10 w-10 overflow-hidden rounded-full transition-all duration-500 md:h-12 md:w-12 ${
                          isActive
                            ? "scale-110 shadow-[0_0_15px_rgba(229,25,42,0.8)] ring-2 ring-brand-red ring-offset-2 ring-offset-[#0a0a0a]"
                            : "opacity-40 hover:scale-105 hover:opacity-100"
                        }`}
                        aria-label={`View ${proj.title}`}
                      >
                        {proj.image ? (
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-[#0d0d0d] text-[7px] text-white/50 font-bold uppercase tracking-wide text-center leading-tight px-1">
                            Tools
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Close"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
