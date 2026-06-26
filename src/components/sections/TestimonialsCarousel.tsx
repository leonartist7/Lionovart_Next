"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTO_PLAY_INTERVAL = 8000;

type CarouselItem = {
  name: string;
  industry: string;
  quote: string;
  logo: string; // brand mark, shown on top
  image?: string; // profile photo beside the name (Forty Seven has none)
  backImage: string; // venue photo, shown as card background
};

// Our latest brand partners. Assets live in public/images/Testimonials/<venue>/;
// folder names contain spaces (some doubled), so paths are run through encodeURI
// at render time so the spaces survive as %20.
const PARTNERS: CarouselItem[] = [
  {
    name: "Rocco",
    industry: "Website · Menu Content",
    quote:
      "We always had the food, we just never looked like it online. Leon rebuilt our whole site and shot the menu properly so it finally matches what's on the plate. Now people walk in already knowing what they want. The photos did half the selling before anyone even sat down.",
    logo: "/images/Testimonials/CocoRocco  - Resto/cocorocco-logo.svg",
    image: "/images/Testimonials/CocoRocco  - Resto/Rocco-Profile.avif",
    backImage: "/images/Testimonials/CocoRocco  - Resto/Rocco-back.avif",
  },
  {
    name: "Forty Seven",
    industry: "Website · Brand Content",
    quote:
      "Too many of our rooms were booking through third party sites and we paid for it every single night. The new website and the content gave guests a reason to book with us directly. Direct reservations are up and the place finally feels as good online as it does in person.",
    logo: "/images/Testimonials/Forty Seven - Hotel/logo.webp",
    backImage: "/images/Testimonials/Forty Seven - Hotel/Fortyseven-back.png",
  },
  {
    name: "Lahaut",
    industry: "Identity · Social Reels",
    quote:
      "The reels they made of the dining room and the dishes completely changed our weekends. We went from a quiet midweek crowd to people booking days ahead because they'd seen us on their feed. It actually looks and sounds like our place now, not some template.",
    logo: "/images/Testimonials/Lahaut  - Resto/lahaut-logo-bleu.svg",
    image: "/images/Testimonials/Lahaut  - Resto/Lahaut-profil.avif",
    backImage: "/images/Testimonials/Lahaut  - Resto/Lahaut-back.avif",
  },
  {
    name: "Podium",
    industry: "Rebrand · Content",
    quote:
      "Leon rebranded us top to bottom. Logo, website, the content for socials, all of it. For the first time people recognise the name before they walk in. Regulars keep telling us it looks like a completely different place, and the bookings have followed.",
    logo: "/images/Testimonials/Podium  - Resto/Podium-logo.svg",
    image: "/images/Testimonials/Podium  - Resto/Podium-profil.avif",
    backImage: "/images/Testimonials/Podium  - Resto/Podium-back.avif",
  },
];

export default function TestimonialsCarousel() {
  const TESTIMONIALS = PARTNERS;

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

  const count = TESTIMONIALS.length;

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (count ? (prev + 1) % count : 0));
  }, [count]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (count ? (prev - 1 + count) % count : 0));
  }, [count]);

  // Auto-play — pauses when user hovers or interacts
  useEffect(() => {
    if (isPaused || count <= 1) return;
    const timer = setInterval(goNext, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, goNext, count]);

  // Nothing to show (e.g. a locale whose reviews lack the curated authors).
  if (count === 0) return null;

  const active = TESTIMONIALS[activeIndex] ?? TESTIMONIALS[0];

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
            Featured Partnerships
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
          {/* Venue photo background — spans the whole card (quote + nav bar) */}
          <AnimatePresence mode="popLayout">
            <motion.img
              key={activeIndex}
              src={encodeURI(active.backImage)}
              alt=""
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          {/* Legibility wash */}
          <div className="absolute inset-0 bg-black/25 backdrop-blur-lg bg-gradient-to-t from-black/50 via-black/20 to-black/15" />

          {/* Quote area */}
          <div className="relative z-10 min-h-[380px] sm:min-h-[420px] md:min-h-[360px]">
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
                <div className="relative z-10 flex flex-col items-center md:items-start justify-center shrink-0 md:w-[200px] lg:w-[220px]">
                  {/* Brand logo, free-standing (no circle) */}
                  <img
                    src={encodeURI(active.logo)}
                    alt={active.name}
                    className="h-20 md:h-24 w-auto max-w-[200px] object-contain mb-5 shrink-0"
                  />
                  <div className="flex items-center gap-3">
                    {active.image && (
                      <img
                        src={encodeURI(active.image)}
                        alt={active.name}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-white/20 shrink-0"
                      />
                    )}
                    <div className="flex flex-col items-center md:items-start">
                      <h3 className="text-white font-bold font-clash text-[18px] md:text-[20px] text-center md:text-left leading-tight">
                        {active.name}
                      </h3>
                      <span className="text-[#e5192a] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] mt-1 text-center md:text-left">
                        {active.industry}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider — visible on desktop only */}
                <div className="relative z-10 hidden md:block w-px bg-white/15 self-stretch" />

                {/* Right: Quote */}
                <div className="relative z-10 flex flex-col justify-center flex-1">
                  <blockquote className="text-white text-[17px] sm:text-[19px] md:text-[22px] lg:text-[25px] leading-[1.6] font-normal italic">
                    &ldquo;{active.quote}&rdquo;
                  </blockquote>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation bar */}
          <div className="relative z-10 flex items-center justify-between px-8 sm:px-10 md:px-12 lg:px-14 pb-7 md:pb-9">
            {/* Dot indicators — left */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setIsPaused(true); goTo(i); setTimeout(() => setIsPaused(false), 10000); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-8 h-2 bg-[#facc15]"
                      : "w-2 h-2 bg-white/25 hover:bg-white/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            {/* Arrow buttons — right */}
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
          </div>
        </div>

      </div>
    </section>
  );
}
