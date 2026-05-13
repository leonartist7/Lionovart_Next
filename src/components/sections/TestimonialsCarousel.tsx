"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    initials: "CM",
    name: "Camille Moreau",
    role: "Owner, Maison Verre",
    location: "Annecy, France",
    industry: "Hotel / Hospitality",
    quote:
      "We were getting traffic but almost no direct bookings — everything was going through booking sites and eating our margin. Within two months of the new website going live, direct reservations jumped almost 70%. It finally looks like the place we actually run, not a template.",
    accentColor: "#2563eb",
  },
  {
    initials: "IC",
    name: "Isabelle Chen",
    role: "Co-owner, Mesa 14",
    location: "Toronto, Canada",
    industry: "Restaurant",
    quote:
      "Three reels in and we had more reservations in one weekend than we'd had the entire previous month. It wasn't just that the videos looked good — it's that they finally sounded like us. Warm, not corporate. People walked in quoting lines from the reels.",
    accentColor: "#d97706",
  },
  {
    initials: "JH",
    name: "James Hollister",
    role: "Founder, Hollister Build Co.",
    location: "Calgary, Canada",
    industry: "Contractor / Construction",
    quote:
      "I'm a contractor, not a marketing guy. Before LIONOVART I was editing Instagram posts at 11pm after a 12-hour site day. Now I don't touch any of it. Website, ads, socials, the whole thing — handled. My phone rings more than it ever has and I actually get to sleep.",
    accentColor: "#16a34a",
  },
];

const AUTO_PLAY_INTERVAL = 8000;

export default function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > activeIndex ? 1 : -1);
      setActiveIndex(idx);
    },
    [activeIndex]
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // Auto-play — pauses when user hovers or interacts
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  const active = TESTIMONIALS[activeIndex];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section className="relative bg-bg-surface-light py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-[1100px] px-4 md:px-8">

        {/* Section label */}
        <div className="mb-8 md:mb-12 text-center">
          <p className="text-[#e5192a] text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-3">
            What Our Partners Say
          </p>
          <h2 className="text-[2rem] sm:text-[2.8rem] md:text-[3.5rem] font-bold font-clash uppercase leading-[1.05] tracking-tight text-[#111]">
            Real Results, Real Words
          </h2>
        </div>

        {/* Card container */}
        <div
          className="relative bg-[#0d0d0d] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] border border-white/[0.06]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Quote area */}
          <div className="relative min-h-[380px] sm:min-h-[420px] md:min-h-[360px]">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute inset-0 flex flex-col md:flex-row items-center md:items-stretch p-8 sm:p-10 md:p-12 lg:p-14 gap-8 md:gap-12"
              >
                {/* Left: Avatar + Info */}
                <div className="flex flex-col items-center md:items-start justify-center shrink-0 md:w-[200px] lg:w-[220px]">
                  {/* Avatar with initials */}
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-clash font-bold text-[22px] md:text-[26px] mb-5 ring-2 ring-white/10 shrink-0"
                    style={{ backgroundColor: active.accentColor }}
                  >
                    {active.initials}
                  </div>
                  <h3 className="text-white font-bold font-clash text-[17px] md:text-[19px] text-center md:text-left leading-tight">
                    {active.name}
                  </h3>
                  <p className="text-white/55 text-[13px] md:text-[14px] mt-1 text-center md:text-left leading-snug">
                    {active.role}
                  </p>
                  <p className="text-white/35 text-[12px] md:text-[13px] mt-0.5 text-center md:text-left">
                    {active.location}
                  </p>
                  {/* 5 stars */}
                  <div className="flex items-center gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#facc15] text-[#facc15]" />
                    ))}
                  </div>
                </div>

                {/* Divider — visible on desktop only */}
                <div className="hidden md:block w-px bg-white/10 self-stretch" />

                {/* Right: Quote */}
                <div className="flex flex-col justify-center flex-1">
                  <span className="text-[#e5192a] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
                    {active.industry}
                  </span>
                  <blockquote className="text-white/85 text-[15px] sm:text-[16px] md:text-[18px] lg:text-[20px] leading-[1.75] font-light italic">
                    &ldquo;{active.quote}&rdquo;
                  </blockquote>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation bar */}
          <div className="relative z-10 flex items-center justify-between px-8 sm:px-10 md:px-12 lg:px-14 pb-7 md:pb-9">
            {/* Arrow buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setIsPaused(true); goPrev(); setTimeout(() => setIsPaused(false), 10000); }}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all duration-200 hover:bg-white/5"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => { setIsPaused(true); goNext(); setTimeout(() => setIsPaused(false), 10000); }}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all duration-200 hover:bg-white/5"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setIsPaused(true); goTo(i); setTimeout(() => setIsPaused(false), 10000); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-8 h-2 bg-[#e5192a]"
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
