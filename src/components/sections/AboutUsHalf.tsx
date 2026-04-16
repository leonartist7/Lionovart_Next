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

const CONTACT_PHONE   = "+1-587-897-4772";
const CONTACT_EMAIL   = "connect@lionovart.com";
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

/* ─── Scroll-driven opacity fade (no movement) ──────────────────── */
function ScrollFade({
  progress,
  start,
  end,
  className,
  children,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  className?: string;
  children: React.ReactNode;
}) {
  const opacity = useSpring(useTransform(progress, [start, end], [0.08, 1]), {
    stiffness: 80,
    damping: 24,
    mass: 0.6,
  });
  return (
    <motion.span style={{ opacity }} className={className}>
      {children}
    </motion.span>
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
        <span className="text-[18px] sm:text-[22px] md:text-[28px] font-bold text-[#e5192a] font-clash leading-none mr-0.5">
          {unit}
        </span>
        <span className="text-[44px] sm:text-[56px] md:text-[72px] font-black text-[#e5192a] font-clash leading-none">
          {count}
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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openContact  = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setContactOpen(true);
  };
  const closeContact = () => {
    closeTimer.current = setTimeout(() => setContactOpen(false), 180);
  };

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
  const lineScaleX = useSpring(useTransform(progress, [0.08, 0.20], [0, 1]), {
    stiffness: 70,
    damping: 22,
  });

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-start pt-6 md:pt-10 px-4 bg-[#181818] text-center min-h-0 md:min-h-[50vh] pb-6"
    >
      <div className="max-w-[700px] w-full flex flex-col items-center">

        {/* ── Headline ── */}
        <div className="text-text-main text-[20px] md:text-[34px] font-medium leading-[1.4] mb-2">
          <ScrollFade progress={progress} start={0.0} end={0.12}>
            In 2026, innovation is no longer a choice
          </ScrollFade>
        </div>

        {/* ── Red accent ── */}
        <div className="text-[22px] md:text-[38px] font-bold leading-[1.3] text-[#e5192a] mb-4">
          <ScrollFade progress={progress} start={0.05} end={0.18}>
            {"it's a necessity."}
          </ScrollFade>
        </div>

        {/* ── Divider ── */}
        <motion.div
          style={{ scaleX: lineScaleX, originX: "50%" }}
          className="w-24 h-px bg-white/20 mb-6"
        />

        {/* ── Body ── */}
        <div className="text-[18px] md:text-[30px] font-semibold leading-[1.4] text-white">
          <ScrollFade progress={progress} start={0.12} end={0.38}>
            As a multidisciplinary team of artists and business owners, we provide what is needed to lead in today&#39;s digital landscape.
          </ScrollFade>
        </div>

        {/* ── Contact card — photo beside card ── */}
        <div ref={cardRef} className="flex items-end gap-3 mt-8 md:mt-10 self-end">

          {/* Photo — sits beside the contact card */}
          <div className="w-[64px] h-[64px] shrink-0 rounded-[16px] overflow-hidden border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            <Image
              src="https://res.cloudinary.com/dgio9uutc/image/upload/v1776064620/leonardo_icon_rkjxcx.webp"
              alt="Leonardo"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Contact card shell */}
          <div className="relative h-[72px] w-[220px]">
            <motion.button
              type="button"
              layout
              layoutDependency={contactOpen}
              onMouseEnter={openContact}
              onMouseLeave={closeContact}
              onClick={() => setContactOpen((v) => !v)}
              transition={{ layout: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } }}
              className="absolute bottom-0 right-0 w-[220px] text-left rounded-[20px] border border-white/[0.12] shadow-[0_8px_40px_rgba(0,0,0,0.55)] cursor-pointer select-none overflow-visible"
              style={{
                background: "rgba(28,28,30,0.88)",
                backdropFilter: "blur(32px) saturate(1.8)",
                WebkitBackdropFilter: "blur(32px) saturate(1.8)",
              }}
            >
              {/* Pulse dot — top right, always visible */}
              <span className="absolute top-3 right-3 z-10 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e5192a] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e5192a]" />
              </span>

              {/* Collapsed label — fades out when open */}
              <AnimatePresence>
                {!contactOpen && (
                  <motion.div
                    key="label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    className="px-4 pt-[22px] pb-[22px] pr-8"
                  >
                    <p className="text-[14px] font-bold text-white leading-tight whitespace-nowrap">
                      Contact Leonardo
                    </p>
                    <p className="text-[11px] text-white/45 mt-0.5 whitespace-nowrap">
                      {t.about.founderRole}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expanded info — fades in after card finishes growing */}
              <AnimatePresence>
                {contactOpen && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.18, duration: 0.18 } }}
                    exit={{ opacity: 0, transition: { duration: 0.08 } }}
                    className="px-4 pt-4 pb-4 flex flex-col gap-3.5"
                  >
                    <a href={`mailto:${CONTACT_EMAIL}`} className="group block" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[9px] text-white/35 uppercase tracking-[0.15em] mb-0.5">Email</p>
                      <p className="text-[13px] font-semibold text-white group-hover:text-white/60 transition-colors">
                        {CONTACT_EMAIL}
                      </p>
                    </a>
                    <a href={`tel:${CONTACT_PHONE}`} className="group block" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[9px] text-white/35 uppercase tracking-[0.15em] mb-0.5">Phone</p>
                      <p className="text-[13px] font-semibold text-white group-hover:text-white/60 transition-colors">
                        {CONTACT_PHONE}
                      </p>
                    </a>
                    <a href={CONTACT_MEETING} target="_blank" rel="noopener noreferrer" className="group block" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[9px] text-white/35 uppercase tracking-[0.15em] mb-0.5">Schedule a call</p>
                      <p className="text-[13px] font-semibold text-white group-hover:text-white/60 transition-colors">
                        Google Meet
                      </p>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

        </div>

        {/* ── Stat cards ── */}
        <div
          ref={statsRef}
          className="flex w-full max-w-[800px] gap-6 md:gap-10 mt-6 md:mt-16"
        >
          <StatCard
            number={9}
            unit="+"
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
