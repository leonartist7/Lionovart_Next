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
      {/* Floating Founder Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="
          absolute top-[194px] left-[582px] z-20
          flex h-[100px] items-center gap-3
          rounded-[20px]
          border border-white/10
          bg-black/60 backdrop-blur-xl
          px-4 py-[11px]
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        "
      >
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-brand-red/60 bg-brand-red/10">
          <div className="flex h-full w-full items-center justify-center text-brand-red font-black text-lg select-none">
            L
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-white leading-tight tracking-tight">
            Leo — Founder
          </span>
          <span className="text-[11px] text-white/50 leading-tight">
            LIONOVART Creative Agency
          </span>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-[10px] text-green-400 font-semibold uppercase tracking-widest">
            Open
          </span>
        </div>
      </motion.div>

      <div className="max-w-[700px] w-full flex flex-col items-center">
        
        <p className="text-text-main text-[16px] md:text-[28px] font-medium leading-[1.4]">
          We are a multidisciplinary creative agency — building brands that don&apos;t just look right,
          they feel great. From strategy to screen to sound, every decision is made with intention.
        </p>

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