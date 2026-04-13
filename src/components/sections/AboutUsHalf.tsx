"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
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
      <h4 className="text-white font-bold text-[12px] md:text-[14px] uppercase tracking-[0.18em] mb-2">
        {label}
      </h4>
      <div className="flex items-baseline justify-center gap-0.5 leading-none">
        <span className="text-[44px] sm:text-[56px] md:text-[72px] font-black text-[#e5192a] font-clash leading-none">
          {count}
        </span>
        <span className="text-[18px] sm:text-[22px] md:text-[28px] font-bold text-[#e5192a] font-clash leading-none ml-0.5">
          {unit}
        </span>
      </div>
      <p className="text-white/50 text-[11px] md:text-[13px] leading-[1.6] max-w-[95%] mx-auto mt-2">
        {description}
      </p>
    </div>
  );
}

export default function AboutUsHalf() {
  const containerRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center justify-start pt-6 md:pt-10 px-4 bg-[#181818] text-center min-h-0 md:min-h-[50vh] pb-6"
    >
      <div className="max-w-[700px] w-full flex flex-col items-center">

        <div className="flex flex-col gap-5 text-text-main text-[16px] md:text-[28px] font-medium leading-[1.4]">
          <p>
            In 2026, innovation isn&apos;t a choice — it&apos;s a necessity.
          </p>
          <p>
            LIONOVART is a multidisciplinary team of artists and business owners building brands with
            confidence, innovation, and emotion at their core. We bridge digital and physical, strategy
            and feeling, craft and commerce—so your brand works exactly as hard as you do. World-class
            creative, made accessible to any business serious about standing out.
          </p>
        </div>

        {/* Founder card — right-aligned */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="
            z-20 mt-8 md:mt-10 self-end ml-auto inline-flex max-w-full items-center gap-3
            rounded-[20px]
            border border-white/10
            bg-black/60 backdrop-blur-xl
            px-4 py-3
            shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          "
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
              Business &amp; creative director
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 ml-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-[10px] text-green-400 font-semibold uppercase tracking-widest">
              Open
            </span>
          </div>
        </motion.div>

        {/* ── 2 Neumorphic Stat Cards ── */}
        <div
          ref={statsRef}
          className="flex w-full max-w-[800px] gap-6 md:gap-10 mt-6 md:mt-16"
        >
          <StatCard
            number={10}
            unit=""
            label="Years of Experience"
            description="Expertise across digital innovation, audiovisual production and printed media."
            active={statsInView}
          />
          <StatCard
            number={10}
            unit="+"
            label="Countries — Global Reach"
            description="A multilingual team serving clients across 4 continents."
            active={statsInView}
          />
        </div>

      </div>
    </section>
  );
}
