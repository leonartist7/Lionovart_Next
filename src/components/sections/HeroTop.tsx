"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { getWhatsAppUrl } from "@/lib/contact";
import HeroCycling, { Word } from "@/components/sections/HeroCycling";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { useLanguage } from "@/contexts/LanguageContext";
import MagneticOrb from "@/components/ai-strategist/MagneticOrb";
import StrategistPanel from "@/components/ai-strategist/StrategistPanel";

/* ─── Variants ─────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/* ─── Animated Stats Overlay ────────────────────────────────────── */
function AnimatedStats({ labels }: { labels: { clients: string; industries: string; yearsExp: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  // margin "0px" — triggers as soon as any pixel of the element enters the viewport.
  // Previously "-40px" was causing it to miss on some viewport heights.
  const inView = useInView(ref, { once: true, margin: "0px" });

  const clients = useCountUp(50, 1600, inView);
  const industries = useCountUp(20, 1400, inView);
  const years = useCountUp(20, 1200, inView);

  return (
    <div ref={ref} className="flex items-center justify-center gap-6 md:gap-10">
      {[
        { value: clients, suffix: "+", label: labels.clients },
        { value: industries, suffix: "+", label: labels.industries },
        { value: years, suffix: "+", label: labels.yearsExp },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
        >
          <span className="text-[22px] sm:text-[26px] font-black text-white leading-none tabular-nums">
            {stat.value}{stat.suffix}
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/50 mt-1">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Count-Up Hook ─────────────────────────────────────────────── */
function useCountUp(target: number, duration: number = 1800, active: boolean = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

/* ─── Cycling words are built inside the component from translations ─── */


/* ─── Trust Badge Components ────────────────────────────────────── */

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80",
];

const FLAGS = [
  { src: "https://flagcdn.com/w40/kr.png", rot: -10, y: -2 },
  { src: "https://flagcdn.com/w40/jp.png", rot: -6,  y:  0 },
  { src: "https://flagcdn.com/w40/it.png", rot: -3,  y:  1 },
  { src: "https://flagcdn.com/w40/ch.png", rot:  0,  y:  2 },
  { src: "https://flagcdn.com/w40/fr.png", rot:  3,  y:  2 },
  { src: "https://flagcdn.com/w40/us.png", rot:  6,  y:  1 },
  { src: "https://flagcdn.com/w40/gb.png", rot:  10, y:  0 },
];

/*
 * STRUCTURAL APPROACH — Flex Row Form-Fitting Badge
 * ───────────────────────────────────────────────────
 * Instead of an artificial safe zone, we use a flex row:
 * [Left Laurel] [Content] [Right Laurel]
 * This guarantees the laurels ALWAYS hug the content perfectly
 * with an exact 4px gap, mimicking the reference image.
 */
function TrustBadge({
  children,
  title,
  contentWidth,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  contentWidth: number;
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      {/* ── Left Laurel ── fixed height to maintain arch, scaled down 50% */}
      <img
        src="/images/laurel-L.webp"
        alt=""
        aria-hidden="true"
        className="h-[60px] sm:h-[70px] md:h-[80px] w-auto object-contain pointer-events-none select-none"
      />

      {/* ── Content Container ── exact width requested */}
      <div
        className="flex flex-col items-center justify-center text-center flex-shrink-0"
        style={{ width: contentWidth }}
      >
        {children}
        {title && (
          <span
            className="text-[#e5192a] font-bold leading-[1.1] mt-1 sm:mt-1.5"
            style={{ fontSize: contentWidth * 0.18 }}
          >
            {title}
          </span>
        )}
      </div>

      {/* ── Right Laurel ── */}
      <img
        src="/images/laurel-R.webp"
        alt=""
        aria-hidden="true"
        className="h-[60px] sm:h-[70px] md:h-[80px] w-auto object-contain pointer-events-none select-none"
      />
    </div>
  );
}

/*
 * Inner badges component — only rendered after mount (client-only).
 * This eliminates the SSR skeleton race condition: the ref attaches
 * immediately, so useInView fires correctly the first time.
 */
function TrustBadgesInner({ badges }: { badges: { brands: readonly string[]; experience: readonly string[]; countries: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  // margin "0px" — fires as soon as the element enters the viewport.
  // "once: true" so the count-up runs exactly once and never resets.
  const inView = useInView(ref, { once: true, margin: "0px" });

  const brandsCount    = useCountUp(50, 1600, inView);
  const countriesCount = useCountUp(7, 1400, inView);

  const sideWidth = typeof window !== "undefined" && window.innerWidth < 768 ? 45 : 65;
  const midWidth  = typeof window !== "undefined" && window.innerWidth < 768 ? 70 : 100;

  return (
    <div
      ref={ref}
      className="flex flex-wrap justify-center items-center gap-y-2 gap-x-0 sm:gap-2 md:gap-4 w-full max-w-[1100px] mx-auto mt-4 md:mt-5"
    >
      {/* ── Badge 1: Brands — mobile row 2, desktop row 1 ── */}
      <motion.div
        className="order-2 sm:order-1"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.55, delay: 0.0, ease: [0.16, 1, 0.3, 1] }}
      >
        <TrustBadge title={<>{badges.brands[0]}<br />{badges.brands[1]}</>} contentWidth={sideWidth}>
          <div
            className="flex items-center text-[#e5192a] font-black leading-none tracking-tighter"
            style={{ fontSize: sideWidth * 0.7 }}
          >
            <span style={{ fontSize: sideWidth * 0.45, marginRight: 2 }}>+</span>
            {brandsCount}
          </div>
        </TrustBadge>
      </motion.div>

      {/* ── Badge 2: Customer Experience — mobile row 1 (full width), desktop center ── */}
      <motion.div
        className="order-1 sm:order-2 basis-full sm:basis-auto flex justify-center"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <TrustBadge title={<>{badges.experience[0]}<br />{badges.experience[1]}</>} contentWidth={midWidth}>
          <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
            {/* Stars — each animates in with scale + opacity, staggered */}
            <div className="flex items-center justify-between w-[95%]">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.svg
                  key={i}
                  viewBox="0 0 24 24"
                  fill="#e5192a"
                  style={{ width: midWidth * 0.16, height: midWidth * 0.16 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + i * 0.08,
                    ease: [0.34, 1.56, 0.64, 1], // spring-like overshoot
                  }}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </motion.svg>
              ))}
            </div>
            {/* Avatars */}
            <div className="flex items-center justify-center w-full">
              {AVATARS.map((src, i) => (
                <motion.div
                  key={i}
                  style={{
                    width: midWidth * 0.22,
                    height: midWidth * 0.22,
                    borderRadius: "50%",
                    border: "1px solid #e5192a",
                    overflow: "hidden",
                    marginLeft: i === 0 ? 0 : -(midWidth * 0.05),
                    position: "relative",
                    zIndex: AVATARS.length - i,
                    flexShrink: 0,
                  }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.35, delay: 0.5 + i * 0.07, ease: "easeOut" }}
                >
                  <img src={src} alt="client" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </motion.div>
              ))}
            </div>
          </div>
        </TrustBadge>
      </motion.div>

      {/* ── Badge 3: Countries — mobile row 2, desktop row 1 ── */}
      <motion.div
        className="order-3"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.55, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <TrustBadge contentWidth={sideWidth}>
          <div className="flex flex-col items-center w-full">
            <div
              className="flex items-center text-[#e5192a] font-black leading-none tracking-tighter"
              style={{ fontSize: sideWidth * 0.7 }}
            >
              <span style={{ fontSize: sideWidth * 0.45, marginRight: 2 }}>+</span>
              {countriesCount}
            </div>
            <span
              className="text-[#e5192a] font-bold leading-[1.2]"
              style={{ fontSize: sideWidth * 0.2 }}
            >
              {badges.countries}
            </span>
            {/* Flags — fan in staggered */}
            <div className="flex items-center justify-center mt-2 sm:mt-3 gap-1">
              {FLAGS.map((flag, i) => (
                <motion.img
                  key={i}
                  src={flag.src}
                  alt="flag"
                  style={{
                    width: sideWidth * 0.16,
                    height: sideWidth * 0.11,
                    objectFit: "cover",
                    borderRadius: "1px",
                    transform: `rotate(${flag.rot}deg) translateY(${flag.y}px)`,
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.06, ease: "easeOut" }}
                />
              ))}
            </div>
          </div>
        </TrustBadge>
      </motion.div>
    </div>
  );
}

/*
 * DynamicTrustBadges — SSR-safe wrapper.
 * Renders an invisible same-size placeholder on the server to prevent
 * layout shift. After hydration, swaps to the real animated component
 * so the ref attaches cleanly and useInView fires correctly.
 */
function DynamicTrustBadges({ badges }: { badges: { brands: readonly string[]; experience: readonly string[]; countries: string } }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-[1100px] mx-auto mt-4 md:mt-5 opacity-0 invisible h-[120px]" />
    );
  }

  return <TrustBadgesInner badges={badges} />;
}

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */
export default function HeroTop() {
  const [submitted, setSubmitted] = useState(false);
  const [strategistOpen, setStrategistOpen] = useState(false);
  const { t } = useLanguage();

  const CYCLING_WORDS: Word[] = t.hero.cyclingWords.map((content) => ({
    type: "text" as const,
    content,
    holdMs: 4000,
  }));

  const handleConnectNow = () => {
    const url = getWhatsAppUrl();
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="relative flex min-h-[72vh] flex-col items-center justify-center px-4 pt-40 pb-6 md:pt-60 md:px-6 overflow-hidden">
      {/* Video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://res.cloudinary.com/dgio9uutc/video/upload/v1775960150/hero-notext_eqjdin.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      {/* Dark overlay to preserve text readability */}
      <div className="absolute inset-0 bg-bg-dark/10 z-0 pointer-events-none" />
      {/* Bottom gradient to blend into the next section */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-bg-dark to-transparent z-0 pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 flex w-full max-w-[1200px] flex-col items-center gap-2 text-center -mt-4"
      >
        {/* Main Heading — cycling */}
        <motion.div variants={itemVariants} className="w-full text-center">
          <HeroCycling
            staticText={t.hero.staticText}
            words={CYCLING_WORDS}
            fontSize="clamp(2rem, 6vw, 7rem)"
            cyclingFontSize="clamp(2.8rem, 11vw, 11rem)"
            forceAnimate
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="max-w-[520px] text-[15px] leading-[170%] text-text-muted md:text-[18px]"
        >
          {t.hero.subtitle}
        </motion.p>

        {/* CTAs — always one row, wraps on very small screens */}
        <motion.div
          variants={itemVariants}
          className="flex flex-row flex-wrap items-center justify-center gap-4"
        >
          <LiquidMetalButton
            label={submitted ? t.hero.ctaStartOpening : t.hero.ctaStart}
            onClick={handleConnectNow}
            width={168}
          />
          <LiquidMetalButton
            label={t.hero.ctaWork}
            variant="white"
            width={168}
            onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
          />
        </motion.div>

        {/* AI Strategist Orb — between CTAs and carousel */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center mt-4"
        >
          <MagneticOrb onOpen={() => setStrategistOpen(true)} />
        </motion.div>

        
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 flex w-full max-w-[1200px] flex-col items-center gap-2 text-center -mt-4"
      >
        {/* Dynamic Trust Badges */}
        <DynamicTrustBadges badges={t.hero.badges} />

        {/* Trust Text */}
        <motion.p
          variants={itemVariants}
          className="mt-1 text-[13px] font-medium tracking-wide text-text-muted md:text-[14px]"
        >
          {t.hero.trustText}
        </motion.p>
      </motion.div>

      {/* AI Strategist Panel (renders via portal to document.body) */}
      <StrategistPanel
        isOpen={strategistOpen}
        onClose={() => setStrategistOpen(false)}
      />

    </section>
  );
}
