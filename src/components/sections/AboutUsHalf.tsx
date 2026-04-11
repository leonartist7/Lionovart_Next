"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

export default function AboutUsHalf() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section 
      ref={containerRef}
      // Reduced mobile height from 42vh to 35vh to violently close the gap between the cards and the video!
      className="relative flex flex-col items-center justify-start pt-6 md:pt-10 px-4 bg-[#181818] text-center h-auto min-h-[35vh] sm:min-h-[42vh] md:min-h-[50vh] pb-20"
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

        {/* Founder card — between intro copy and stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="
            z-20 mt-8 md:mt-10 inline-flex max-w-full items-center gap-3 self-center
            rounded-[20px]
            border border-white/10
            bg-black/60 backdrop-blur-xl
            px-4 py-3
            shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          "
        >
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-brand-red/60 bg-brand-red/10">
            <div className="flex h-full w-full items-center justify-center text-brand-red font-black text-lg select-none">
              L
            </div>
          </div>
          <div className="flex min-w-0 flex-col text-left">
            <span className="text-[13px] font-bold text-white leading-tight tracking-tight">
              Leo — Founder
            </span>
            <span className="text-[11px] text-white/50 leading-tight">
              LIONOVART Creative Agency
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

        {/* ── 2 Neumorphic Text Cards Underneath ── */}
        <div className="flex w-full max-w-[800px] gap-6 md:gap-10 mt-10 md:mt-16">
          
          {/* Card 1 — 10 Years */}
          <div className="relative flex-1 flex flex-col justify-center items-center rounded-[20px] bg-[#181818] shadow-[12px_12px_24px_rgba(0,0,0,0.6),-6px_-6px_20px_rgba(255,255,255,0.03)] ring-1 ring-white/[0.02] p-6 md:p-10 text-center h-auto min-h-[160px] md:min-h-[220px]">
            <h3 className="text-[20px] sm:text-[24px] md:text-[36px] font-bold text-[#e5192a] uppercase tracking-widest font-clash leading-none mb-3">
              10 Years
            </h3>
            <h4 className="text-white font-bold text-[13px] md:text-[16px] mb-1.5 uppercase tracking-wider">Creative Experience</h4>
            <p className="text-white/50 text-[11px] md:text-[13px] leading-[1.6] max-w-[95%] mx-auto">
              Expertise across digital innovation, audiovisual production and printed media.
            </p>
          </div>

          {/* Card 2 — 10 Countries */}
          <div className="relative flex-1 flex flex-col justify-center items-center rounded-[20px] bg-[#181818] shadow-[12px_12px_24px_rgba(0,0,0,0.6),-6px_-6px_20px_rgba(255,255,255,0.03)] ring-1 ring-white/[0.02] p-6 md:p-10 text-center h-auto min-h-[160px] md:min-h-[220px]">
            <h3 className="text-[20px] sm:text-[24px] md:text-[36px] font-bold text-[#e5192a] uppercase tracking-widest font-clash leading-none mb-3">
              10 Countries
            </h3>
            <h4 className="text-white font-bold text-[13px] md:text-[16px] mb-1.5 uppercase tracking-wider">Global Reach</h4>
            <p className="text-white/50 text-[11px] md:text-[13px] leading-[1.6] max-w-[95%] mx-auto">
              A multilingual team serving clients across 4 continents.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}