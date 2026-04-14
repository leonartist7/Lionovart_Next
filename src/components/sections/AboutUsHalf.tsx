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

        {/* ── Founder card — always visible, contact popup on hover/click ── */}
        <div className="relative z-20 mt-8 md:mt-10 self-end ml-auto">
          <div
            className="inline-flex max-w-full items-center gap-3 rounded-[20px] border border-white/10 bg-black/60 backdrop-blur-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer select-none"
            onClick={() => setContactOpen((v) => !v)}
            onMouseEnter={() => setContactOpen(true)}
            onMouseLeave={() => setContactOpen(false)}
          >
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-brand-red/60">
              <Image
                src="https://res.cloudinary.com/dgio9uutc/image/upload/v1776064620/leonardo_icon_rkjxcx.webp"
                alt="Leonardo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex min-w-0 flex-col text-left">
              <span className="text-[13px] font-bold text-white leading-tight tracking-tight">
                Leonardo
              </span>
              <span className="text-[11px] text-white/50 leading-tight">
                {t.about.founderRole}
              </span>
            </div>
            <div className="flex shrink-0 items-center ml-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
            </div>
          </div>

          {/* Contact popup — appears above card */}
          <AnimatePresence>
            {contactOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-full mb-3 right-0 min-w-[240px] rounded-[20px] border border-white/10 bg-black/70 backdrop-blur-xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-3"
                onMouseEnter={() => setContactOpen(true)}
                onMouseLeave={() => setContactOpen(false)}
              >
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="flex items-center gap-2.5 text-white/80 hover:text-white text-[13px] transition-colors"
                >
                  <span>📞</span><span>{CONTACT_PHONE}</span>
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-2.5 text-white/80 hover:text-white text-[13px] transition-colors"
                >
                  <span>✉️</span><span>{CONTACT_EMAIL}</span>
                </a>
                <a
                  href={CONTACT_MEETING}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-xl bg-[#e5192a] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#c01020] transition-colors"
                >
                  Schedule Meeting
                </a>
              </motion.div>
            )}
          </AnimatePresence>
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
