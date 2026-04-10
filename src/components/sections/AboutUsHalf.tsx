"use client";

import { useRef } from "react";

export default function AboutUsHalf() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section 
      ref={containerRef}
      // Reduced mobile height from 42vh to 35vh to violently close the gap between the cards and the video!
      className="relative flex flex-col items-center justify-start pt-6 md:pt-10 px-4 bg-[#181818] text-center h-auto min-h-[35vh] sm:min-h-[42vh] md:min-h-[50vh] pb-20"
    >
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