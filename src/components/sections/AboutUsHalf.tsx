"use client";

import { useRef, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useLenis } from "@studio-freight/react-lenis";
import { useLanguage } from "@/contexts/LanguageContext";

const CONTACT_PHONE   = "+1 (514) 000-0000";
const CONTACT_EMAIL   = "hello@lionovart.com";
const CONTACT_MEETING = "https://cal.com/lionovart";

/* ─── Lenis-compatible section scroll progress ──────────────
   Framer Motion's useScroll breaks with Lenis (autoRaf:false).
   We drive a MotionValue manually from the Lenis scroll callback.
   ─────────────────────────────────────────────────────────── */
function useLenisProgress(ref: React.RefObject<HTMLElement | null>): MotionValue<number> {
  const progress = useMotionValue(0);

  useLenis(({ scroll: _scroll }) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const elH = ref.current.offsetHeight;
    // 0 = section top at viewport bottom, 1 = section bottom at viewport top
    const total = vh + elH;
    const current = vh - rect.top;
    progress.set(Math.max(0, Math.min(1, current / total)));
  });

  return progress;
}

/* ─── Single animated word ───────────────────────────────── */
function Word({
  children,
  progress,
  start,
  end,
  dim,
}: {
  children: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
  dim?: boolean;
}) {
  const opacity = useSpring(useTransform(progress, [start, end], [0, 1]), {
    stiffness: 100,
    damping: 22,
    mass: 0.5,
  });
  const y = useSpring(useTransform(progress, [start, end], [24, 0]), {
    stiffness: 100,
    damping: 22,
    mass: 0.5,
  });

  return (
    <motion.span style={{ opacity, y, display: "inline-block" }} className={dim ? "text-white/25" : ""}>
      {children}
    </motion.span>
  );
}

/* ─── Word-reveal paragraph ──────────────────────────────── */
function WordReveal({
  text,
  progress,
  blockStart,
  blockEnd,
  dimLastN = 0,
  className,
}: {
  text: string;
  progress: MotionValue<number>;
  blockStart: number;
  blockEnd: number;
  dimLastN?: number;
  className?: string;
}) {
  const words = text.split(" ");
  const total = words.length;
  const span = (blockEnd - blockStart) / total;

  return (
    <span className={className}>
      {words.map((word, i) => {
        const wordStart = blockStart + i * span * 0.65;
        const wordEnd = Math.min(wordStart + span * 1.6, blockEnd + 0.05);
        const isDim = dimLastN > 0 && i >= total - dimLastN;

        return (
          <span key={i}>
            <Word progress={progress} start={wordStart} end={wordEnd} dim={isDim}>
              {word}
            </Word>
            {i < total - 1 && <span> </span>}
          </span>
        );
      })}
    </span>
  );
}

/* ─── Animated stat counter ──────────────────────────────── */
function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return count;
}

function StatCard({
  number,
  unit,
  label,
  description,
  active,
}: {
  number: number;
  unit: string;
  label: string;
  description: string;
  active: boolean;
}) {
  const count = useCountUp(number, 1400, active);

  return (
    <div className="relative flex-1 flex flex-col justify-center items-center rounded-[20px] bg-[#181818] shadow-[10px_10px_28px_rgba(0,0,0,0.75),-6px_-6px_18px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/[0.04] p-6 md:p-10 text-center h-auto min-h-[160px] md:min-h-[220px] gap-1">
      <div className="flex items-baseline justify-center gap-0.5 leading-none">
        <span className="text-[44px] sm:text-[56px] md:text-[72px] font-black text-[#e5192a] font-clash leading-none">
          {count}
        </span>
        <span className="text-[18px] sm:text-[22px] md:text-[28px] font-bold text-[#e5192a] font-clash leading-none ml-0.5">
          {unit}
        </span>
      </div>
      <h4 className="text-[#e5192a] font-bold text-[12px] md:text-[14px] uppercase tracking-[0.18em] mt-2">
        {label}
      </h4>
      <p className="text-white/50 text-[11px] md:text-[13px] leading-[1.6] max-w-[95%] mx-auto mt-2">
        {description}
      </p>
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────── */
export default function AboutUsHalf() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-60px" });
  const { t } = useLanguage();
  const [contactOpen, setContactOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setContactOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const progress = useLenisProgress(sectionRef);

  // Divider line
  const lineScaleX = useSpring(useTransform(progress, [0.18, 0.32], [0, 1]), {
    stiffness: 70,
    damping: 22,
  });

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-start pt-6 md:pt-10 px-4 bg-[#181818] text-center min-h-0 md:min-h-[50vh] pb-6"
    >
      <div className="max-w-[700px] w-full flex flex-col items-center">

        {/* ── Headline word reveal ── */}
        <div className="text-text-main text-[16px] md:text-[28px] font-medium leading-[1.4] mb-2">
          <WordReveal
            text="In 2026, innovation is no longer a choice"
            progress={progress}
            blockStart={0.0}
            blockEnd={0.22}
          />
        </div>

        {/* ── Red accent ── */}
        <div className="text-[18px] md:text-[32px] font-bold leading-[1.3] text-[#e5192a] mb-4">
          <WordReveal
            text="it's a necessity."
            progress={progress}
            blockStart={0.10}
            blockEnd={0.26}
          />
        </div>

        {/* ── Divider ── */}
        <motion.div
          style={{ scaleX: lineScaleX, originX: "50%" }}
          className="w-24 h-px bg-white/20 mb-6"
        />

        {/* ── Body word reveal ── */}
        <div className="text-text-main text-[16px] md:text-[28px] font-semibold leading-[1.4] text-white/60">
          <WordReveal
            text="As a multidisciplinary team of artists and business owners, we provide what is needed to lead in today's digital landscape."
            progress={progress}
            blockStart={0.20}
            blockEnd={0.50}
          />
        </div>

        {/* ── Founder card — two chips, expands to contact card on click ── */}
        <div ref={cardRef} className="relative z-20 mt-8 md:mt-10 self-end ml-auto">

          {/* Contact card — appears above chips */}
          <AnimatePresence>
            {contactOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="absolute bottom-full mb-3 right-0 min-w-[260px] rounded-[20px] border border-white/10 bg-[#1c1c1e] backdrop-blur-xl px-5 pt-5 pb-10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-visible"
              >
                {/* Green pulse — top right */}
                <span className="absolute top-4 right-4 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>

                {/* Email */}
                <a href={`mailto:${CONTACT_EMAIL}`} className="group block mb-4">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Email</p>
                  <p className="text-[15px] font-semibold text-white group-hover:text-white/80 transition-colors">
                    {CONTACT_EMAIL}
                  </p>
                </a>

                {/* Phone */}
                <a href={`tel:${CONTACT_PHONE}`} className="group block mb-4">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Phone</p>
                  <p className="text-[15px] font-semibold text-white group-hover:text-white/80 transition-colors">
                    {CONTACT_PHONE}
                  </p>
                </a>

                {/* Schedule */}
                <a href={CONTACT_MEETING} target="_blank" rel="noopener noreferrer" className="group block">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Schedule a call</p>
                  <p className="text-[15px] font-semibold text-[#e5192a] group-hover:text-[#ff2233] transition-colors">
                    Book on Calendly →
                  </p>
                </a>

                {/* Photo — peeks below card bottom-left */}
                <div className="absolute bottom-[-20px] left-4 w-12 h-12 rounded-[12px] overflow-hidden border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                  <Image
                    src="https://res.cloudinary.com/dgio9uutc/image/upload/v1776064620/leonardo_icon_rkjxcx.webp"
                    alt="Leonardo"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Two resting chips */}
          <div className="flex items-center gap-2">
            {/* Photo chip */}
            <button
              type="button"
              aria-label="Contact Leonardo"
              onClick={() => setContactOpen((v) => !v)}
              className="relative w-10 h-10 rounded-[12px] overflow-hidden border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.4)] shrink-0 cursor-pointer"
            >
              <Image
                src="https://res.cloudinary.com/dgio9uutc/image/upload/v1776064620/leonardo_icon_rkjxcx.webp"
                alt="Leonardo"
                fill
                className="object-cover"
                unoptimized
              />
            </button>

            {/* Name chip */}
            <button
              type="button"
              onClick={() => setContactOpen((v) => !v)}
              className="inline-flex items-center gap-2.5 rounded-[14px] border border-white/10 bg-black/60 backdrop-blur-xl px-3.5 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.4)] cursor-pointer select-none"
            >
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-bold text-white leading-tight tracking-tight">
                  Leonardo
                </span>
                <span className="text-[11px] text-white/50 leading-tight">
                  {t.about.founderRole}
                </span>
              </div>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
            </button>
          </div>

        </div>

        {/* ── Stat cards ── */}
        <div
          ref={statsRef}
          className="flex w-full max-w-[800px] gap-6 md:gap-10 mt-6 md:mt-16"
        >
          <StatCard
            number={10}
            unit=""
            label={t.about.stat1Label}
            description={t.about.stat1Desc}
            active={statsInView}
          />
          <StatCard
            number={7}
            unit="+"
            label="Countries"
            description="A multilingual team serving clients across 4 continents."
            active={statsInView}
          />
        </div>

      </div>
    </section>
  );
}
