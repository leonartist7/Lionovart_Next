"use client";

import { useRef } from "react";

export default function AboutUsHalf() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section 
      ref={containerRef}
      // Reduced mobile height from 42vh to 35vh to violently close the gap between the cards and the video!
      className="relative flex flex-col items-center justify-start pt-6 md:pt-10 px-4 bg-bg-dark text-center h-[35vh] sm:h-[42vh] md:h-[50vh]"
    >
      <div className="max-w-[700px] w-full flex flex-col items-center">
        <h2 className="text-brand-red text-[9px] md:text-[11px] font-bold uppercase tracking-widest mb-2 md:mb-3">
          About Us
        </h2>
        <p className="text-text-main text-[16px] md:text-[28px] font-medium leading-[1.4]">
          We are a creative agency obsessed with one thing — building brands that move people.
          From strategy to screen, every decision is made with intention.
        </p>

        {/* ── 2 "Mini-Video" Style Cards Underneath ── */}
        <div className="flex w-full max-w-[600px] gap-4 md:gap-8 mt-10 md:mt-16">
          
          {/* Card 1 — 20 Years */}
          <div className="relative flex-1 rounded-[16px] border border-white/10 bg-[#0A0A0A] h-[120px] sm:h-[140px] md:h-[180px] shadow-2xl">
            {/* Stat label floating above the card */}
            <div className="absolute inset-x-0 top-0 -translate-y-[130%] text-center pointer-events-none">
              <h3 className="text-[16px] sm:text-[20px] md:text-[26px] font-bold text-white uppercase tracking-widest font-clash leading-none whitespace-nowrap">
                20 Years
              </h3>
            </div>

            {/* Background image */}
            <div className="absolute inset-0 rounded-[16px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=900"
                alt="Team collaboration"
                className="w-full h-full object-cover opacity-40"
              />
            </div>

            {/* Info box at the bottom */}
            <div className="absolute bottom-0 inset-x-0 p-3 md:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-[16px] text-left">
              <h4 className="text-white font-bold text-[11px] md:text-[14px] mb-0.5">Combined Experience</h4>
              <p className="text-text-muted text-[9px] md:text-[11px] leading-[1.3] line-clamp-2">
                Two decades of craft across branding, digital, and production.
              </p>
            </div>
          </div>

          {/* Card 2 — 9 Languages */}
          <div className="relative flex-1 rounded-[16px] border border-white/10 bg-[#0A0A0A] h-[120px] sm:h-[140px] md:h-[180px] shadow-2xl">
            {/* Stat label floating above the card */}
            <div className="absolute inset-x-0 top-0 -translate-y-[130%] text-center pointer-events-none">
              <h3 className="text-[16px] sm:text-[20px] md:text-[26px] font-bold text-white uppercase tracking-widest font-clash leading-none whitespace-nowrap">
                9 Languages
              </h3>
            </div>

            {/* Background image */}
            <div className="absolute inset-0 rounded-[16px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900"
                alt="Global team"
                className="w-full h-full object-cover opacity-40"
              />
            </div>

            {/* Info box at the bottom */}
            <div className="absolute bottom-0 inset-x-0 p-3 md:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-[16px] text-left">
              <h4 className="text-white font-bold text-[11px] md:text-[14px] mb-0.5">Global Reach</h4>
              <p className="text-text-muted text-[9px] md:text-[11px] leading-[1.3] line-clamp-2">
                A multilingual team serving clients across 4 continents.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}