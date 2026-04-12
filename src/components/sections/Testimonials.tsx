"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Star } from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    industry: "Hotel / hospitality",
    hook: "Website that converts + More bookings",
    quote:
      "We were getting traffic but almost no direct bookings — everything was going through booking sites and eating our margin. Within two months of the new website going live, direct reservations jumped almost 70%. It finally looks like the place we actually run, not a template.",
    author: "Camille Moreau",
    role: "Owner, Maison Verre · Annecy, France",
  },
  {
    industry: "Beauty salon / clinic",
    hook: "Brand identity + Confidence",
    quote:
      "I'd been embarrassed to hand out my business card for two years. I couldn't even post on Instagram without cringing. They rebuilt the whole identity from the ground up and now I actually feel proud when someone asks what I do. That's worth more than the money, honestly.",
    author: "Sofia Álvarez",
    role: "Founder, Lumen Skin Studio · Madrid",
  },
  {
    industry: "Real estate / service business",
    hook: "AI & automation + Time back",
    quote:
      "The voice agent they set up for us handles after-hours calls, qualifies leads, and books viewings straight into my calendar. I got a call last Sunday while I was at dinner with my kids — except I didn't, because it was already handled. That one system pays for everything else we do with them.",
    author: "Marco De Luca",
    role: "Director, Atelier Realty · Milan",
  },
  {
    industry: "Restaurant",
    hook: "Video / social + Real growth",
    quote:
      "Three reels in and we had more reservations in one weekend than we'd had the entire previous month. It wasn't just that the videos looked good — it's that they finally sounded like us. Warm, not corporate. People walked in quoting lines from the reels.",
    author: "Isabelle Chen",
    role: "Co-owner, Mesa 14 · Toronto",
  },
  {
    industry: "Contractor / construction",
    hook: "Full creative team + Relief",
    quote:
      "I'm a contractor, not a marketing guy. Before LIONOVART I was editing Instagram posts at 11pm after a 12-hour site day. Now I don't touch any of it. Website, ads, socials, the whole thing — handled. My phone rings more than it ever has and I actually get to sleep.",
    author: "James Hollister",
    role: "Founder, Hollister Build Co. · Calgary",
  },
];

// ─── Desktop Card (Framer Motion 3D Stack) ─────────────────────────────────
function DesktopCard({
  item,
  index,
  scrollYProgress,
}: {
  item: (typeof TESTIMONIALS)[0];
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  // We have 5 cards. Progress goes from 0 to 1.
  // Each card occupies a 0.2 segment. We clamp keyframes to [0,1] and
  // guarantee strictly-increasing offsets so the Web Animations API
  // (used by Framer Motion v11+) never receives illegal negative offsets
  // or duplicate values that some browsers reject.
  const step = 1 / TESTIMONIALS.length; // 0.2

  // Raw keyframe positions (can be negative for early cards)
  const rawStart = (index - 2) * step;
  const rawBehind = (index - 1) * step;
  const rawFront = index * step;
  const rawGone = (index + 1) * step;

  // Clamp to [0,1] then deduplicate by filtering out clamped-equal entries
  const rawRange = [rawStart, rawBehind, rawFront, rawGone];
  const rawOutputScale = [0.85, 0.92, 1, 1];
  const rawOutputY = [80, 40, 0, -200];
  const rawOutputOpacity = [0, 0.4, 1, 0];

  const range: number[] = [];
  const outScale: number[] = [];
  const outY: number[] = [];
  const outOpacity: number[] = [];

  for (let i = 0; i < rawRange.length; i++) {
    const clamped = Math.max(0, Math.min(1, rawRange[i]));
    // If duplicate of previous offset, overwrite with latest output
    // (e.g. card 0: [-0.4,-0.2,0,0.2] clamps to [0,0,0,0.2] — we keep
    //  the "atFront" outputs for offset 0, not the "startAppear" ones)
    if (range.length > 0 && clamped === range[range.length - 1]) {
      outScale[outScale.length - 1] = rawOutputScale[i];
      outY[outY.length - 1] = rawOutputY[i];
      outOpacity[outOpacity.length - 1] = rawOutputOpacity[i];
      continue;
    }
    range.push(clamped);
    outScale.push(rawOutputScale[i]);
    outY.push(rawOutputY[i]);
    outOpacity.push(rawOutputOpacity[i]);
  }

  const scale = useTransform(scrollYProgress, range, outScale);
  const yOffset = useTransform(scrollYProgress, range, outY);
  const opacity = useTransform(scrollYProgress, range, outOpacity);
  const zIndex = 10 - index;

  return (
    <motion.div
      style={{
        scale,
        y: yOffset,
        opacity,
        zIndex,
      }}
      className="absolute top-0 left-0 w-full h-full bg-white rounded-[24px] p-8 lg:p-10 xl:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e5192a]">
          {item.industry}
        </span>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
          ))}
        </div>
      </div>

      <h3 className="text-[#111] font-bold text-lg lg:text-xl mb-4 leading-tight">
        {item.hook}
      </h3>

      <p className="text-[#333] text-[15px] lg:text-[17px] leading-[1.6] mb-8 flex-1 italic">
        &quot;{item.quote}&quot;
      </p>

      <div className="mt-auto">
        <p className="text-[#111] font-bold text-[15px] uppercase tracking-wide">
          {item.author}
        </p>
        <p className="text-[#666] text-[13px] mt-1">{item.role}</p>
      </div>
    </motion.div>
  );
}

// ─── Mobile Card (Horizontal Snap) ─────────────────────────────────────────
function MobileCard({ item }: { item: (typeof TESTIMONIALS)[0] }) {
  return (
    <div className="snap-center shrink-0 w-[85vw] sm:w-[400px] bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#e5192a]">
          {item.industry}
        </span>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-[#facc15] text-[#facc15]" />
          ))}
        </div>
      </div>

      <h3 className="text-[#111] font-bold text-[16px] sm:text-lg mb-3 leading-tight">
        {item.hook}
      </h3>

      <p className="text-[#444] text-[14px] sm:text-[15px] leading-[1.6] mb-6 flex-1 italic">
        &quot;{item.quote}&quot;
      </p>

      <div className="mt-auto">
        <p className="text-[#111] font-bold text-[14px] sm:text-[15px] uppercase tracking-wide">
          {item.author}
        </p>
        <p className="text-[#666] text-[12px] sm:text-[13px] mt-1">{item.role}</p>
      </div>
    </div>
  );
}

// ─── Main Section ──────────────────────────────────────────────────────────
export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll progress for the desktop sticky stack
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="testimonials" className="bg-[#fafafa] relative w-full">
      
      {/* ── MOBILE / TABLET LAYOUT (< 1024px) ── */}
      <div className="flex lg:hidden flex-col py-16 sm:py-24 overflow-hidden">
        <div className="px-6 sm:px-10 mb-10">
          <p className="text-[#e5192a] text-[12px] font-bold uppercase tracking-[0.2em] mb-2">
            Client Stories
          </p>
          <h2 className="text-[2.5rem] sm:text-[3.5rem] font-bold uppercase leading-none tracking-tight text-[#111]">
            The Verdict
          </h2>
        </div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 px-6 sm:px-10 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TESTIMONIALS.map((item, i) => (
            <MobileCard key={i} item={item} />
          ))}
          {/* Spacer to allow the last card to snap perfectly with right padding */}
          <div className="shrink-0 w-[4px] sm:w-[10px]" aria-hidden />
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (>= 1024px) Cinematic Stack ── */}
      {/* Container is 500vh to give enough scroll distance for 5 cards */}
      <div
        ref={containerRef}
        className="hidden lg:block relative w-full h-[500vh]"
      >
        <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-[1280px] mx-auto px-10 flex items-center justify-between gap-12 xl:gap-20">
            
            {/* Left: Sticky Header */}
            <div className="w-5/12 flex flex-col justify-center">
              <p className="text-[#e5192a] text-[13px] font-bold uppercase tracking-[0.2em] mb-4">
                Client Stories
              </p>
              <h2 className="text-[4rem] xl:text-[4.5rem] font-bold uppercase leading-[1.05] tracking-tight text-[#111] mb-6">
                The Verdict
              </h2>
              <p className="text-[#444] text-[17px] leading-[1.6] max-w-[400px]">
                Don&apos;t just take our word for it. Hear from the founders and directors who transformed their brands and businesses with us.
              </p>
            </div>

            {/* Right: The 3D Card Stack */}
            <div className="w-6/12 relative h-[500px] xl:h-[550px] flex items-center justify-center">
              {TESTIMONIALS.map((item, i) => (
                <DesktopCard
                  key={i}
                  index={i}
                  item={item}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>

          </div>
        </div>
      </div>

    </section>
  );
}