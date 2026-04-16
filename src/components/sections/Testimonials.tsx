"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, MotionValue } from "framer-motion";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Static data — quotes, authors, roles stay in English (real client words)
const TESTIMONIALS_STATIC = [
  {
    quote:
      "We were getting traffic but almost no direct bookings — everything was going through booking sites and eating our margin. Within two months of the new website going live, direct reservations jumped almost 70%. It finally looks like the place we actually run, not a template.",
    author: "Camille Moreau",
    role: "Owner, Maison Verre · Annecy, France",
  },
  {
    quote:
      "I was not as confident to hand out my business card and didn't know what to post in instagram for two years. Thank you Leon for rebuilding my whole brand identity, got my confidence back and now I know what to do when someone asks what I do. That's worth more than the money, gracias!",
    author: "Sofia Álvarez",
    role: "Founder, Luminous Skin Studio · UK",
  },
  {
    quote:
      "The voice agent they set up for us handles after-hours calls, qualifies leads, and books viewings straight into my calendar. I got a call last Sunday while I was at dinner with my kids — except I didn't, because it was already handled. That one system pays for everything else we do with them.",
    author: "Marco De Luca",
    role: "Director, Atelier Realty · Milan",
  },
  {
    quote:
      "Three reels in and we had more reservations in one weekend than we'd had the entire previous month. It wasn't just that the videos looked good — it's that they finally sounded like us. Warm, not corporate. People walked in quoting lines from the reels.",
    author: "Isabelle Chen",
    role: "Co-owner, Mesa 14 · Toronto",
  },
  {
    quote:
      "I'm a contractor, not a marketing guy. Before LIONOVART I was editing Instagram posts at 11pm after a 12-hour site day. Now I don't touch any of it. Website, ads, socials, the whole thing — handled. My phone rings more than it ever has and I actually get to sleep.",
    author: "James Hollister",
    role: "Founder, Hollister Build Co. · Calgary",
  },
];

type TestimonialItem = {
  industry: string;
  hook: string;
  quote: string;
  author: string;
  role: string;
};

// ─── Desktop Card ───────────────────────────────────────────────────────────
// Uses a manually-driven MotionValue (not useScroll) so it works correctly
// alongside Lenis smooth scroll, which can confuse Framer Motion v12's
// WAAPI-based ScrollTimeline implementation.
function DesktopCard({
  item,
  index,
  progress,
}: {
  item: TestimonialItem;
  index: number;
  progress: MotionValue<number>;
}) {
  const step = 1 / TESTIMONIALS_STATIC.length; // 0.2 per card

  // Card 0 starts fully visible and fades as card 1 rises to cover it.
  // Cards 1–4 rise from y:60 into position then fade in place.
  // zIndex = index: each new card renders ON TOP of the one before it,
  // so the rising card always covers the fading card cleanly.
  let inputRange: number[];
  let outOpacity: number[];
  let outY: number[];
  let outScale: number[];

  if (index === 0) {
    inputRange = [0, step];
    outOpacity = [1, 0];
    outY     = [0, 0];
    outScale = [1, 1];
  } else {
    const preEnter = index * step - step * 0.5; // start rising half a step early
    const enter    = index * step;
    const exit     = Math.min(1, (index + 1) * step);
    inputRange = [Math.max(0, preEnter), enter, exit];
    outOpacity = [0, 1, 0];
    outY       = [60, 0, 0];
    outScale   = [0.95, 1, 1];
  }

  const scale   = useTransform(progress, inputRange, outScale);
  const yOffset = useTransform(progress, inputRange, outY);
  const opacity = useTransform(progress, inputRange, outOpacity);

  return (
    <motion.div
      style={{ scale, y: yOffset, opacity, zIndex: index }}
      className="absolute top-0 left-0 w-full h-full bg-white rounded-[24px] p-8 lg:p-10 xl:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col transition-none"
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

// ─── Mobile Card ────────────────────────────────────────────────────────────
function MobileCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col">
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
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  // Merge translated hooks/industries with static quotes/author/role
  const TESTIMONIALS: TestimonialItem[] = TESTIMONIALS_STATIC.map((s, i) => ({
    industry: t.testimonials.industries[i] ?? "",
    hook: t.testimonials.hooks[i] ?? "",
    ...s,
  }));

  // Manually track scroll progress so we bypass Framer Motion v12's WAAPI
  // ScrollTimeline, which mis-calculates progress when Lenis smooth scroll
  // is running (Lenis moves scroll differently than native window.scrollY).
  const progress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect  = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.max(0, Math.min(1, -rect.top / total));
      progress.set(p);
    };

    window.addEventListener("scroll", update, { passive: true });
    // Also run on resize in case layout shifts
    window.addEventListener("resize", update, { passive: true });
    update(); // set initial value
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [progress]);

  return (
    <section id="testimonials" className="bg-[#fafafa] relative w-full">

      {/* ── MOBILE / TABLET LAYOUT (< 1024px) — horizontal draggable marquee ── */}
      <div className="flex lg:hidden flex-col py-16 sm:py-24">
        <div className="mb-10 px-6 sm:px-10">
          <p className="text-[#e5192a] text-[12px] font-bold uppercase tracking-[0.2em] mb-2">
            {t.testimonials.eyebrow}
          </p>
          <h2 className="text-[2.5rem] sm:text-[3.5rem] font-bold uppercase leading-none tracking-tight text-[#111]">
            {t.testimonials.heading}
          </h2>
        </div>

        {/* Drag-scroll strip */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-4 px-6 sm:px-10 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ right: 0, left: -((TESTIMONIALS.length - 1) * 320) }}
            dragElastic={0.1}
            whileTap={{ cursor: "grabbing" }}
          >
            {TESTIMONIALS.map((item, i) => (
              <div key={i} className="shrink-0 w-[300px] sm:w-[360px]">
                <MobileCard item={item} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (>= 1024px) Cinematic Stack ── */}
      {/* 500vh gives enough scroll runway for 5 cards (100vh each) */}
      <div
        ref={containerRef}
        className="hidden lg:block relative w-full h-[500vh]"
      >
        <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-[1280px] mx-auto px-10 flex items-center justify-between gap-12 xl:gap-20">

            {/* Left: Sticky Header */}
            <div className="w-5/12 flex flex-col justify-center">
              <p className="text-[#e5192a] text-[13px] font-bold uppercase tracking-[0.2em] mb-4">
                {t.testimonials.eyebrow}
              </p>
              <h2 className="text-[4rem] xl:text-[4.5rem] font-bold uppercase leading-[1.05] tracking-tight text-[#111] mb-6">
                {t.testimonials.heading}
              </h2>
              <p className="text-[#444] text-[17px] leading-[1.6] max-w-[400px]">
                {t.testimonials.subheading}
              </p>
            </div>

            {/* Right: Card Stack */}
            <div className="w-6/12 relative h-[500px] xl:h-[550px]">
              {TESTIMONIALS.map((item, i) => (
                <DesktopCard
                  key={i}
                  index={i}
                  item={item}
                  progress={progress}
                />
              ))}
            </div>

          </div>
        </div>
      </div>

    </section>
  );
}
