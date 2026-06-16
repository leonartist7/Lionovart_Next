"use client";

/**
 * Red horizontal rail for /services/content-studio. A sticky, scroll-driven
 * horizontal track on brand-red: six floating glass cards ("what we make")
 * glide past, then a black ink-flood swallows the viewport so the page lands
 * seamlessly on the next black section (process/offers).
 *
 * Lenis-driven progress, same mechanic as the page's other pinned scenes.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useLenis } from "lenis/react";

const CARDS = [
  { n: "01", t: "Brand Films", d: "The 60-90s film that makes people feel your brand before they read a word." },
  { n: "02", t: "Social Reels", d: "Hooks in the first second. Native to every platform's rhythm." },
  { n: "03", t: "Motion Design", d: "Titles, logos, and graphics that move like they cost money." },
  { n: "04", t: "Photography", d: "Products, people, and places shot to match your identity." },
  { n: "05", t: "Content Strategy", d: "A monthly calendar built on what your market actually watches." },
  { n: "06", t: "Sound Design", d: "Licensed music and mixes that make every cut land harder." },
];

export default function RedShowcaseRail() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [vh, setVh] = useState(900);
  const [shift, setShift] = useState(1200);

  useEffect(() => {
    const measure = () => {
      setVh(window.innerHeight);
      const track = trackRef.current;
      if (track) setShift(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useLenis(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const travel = el.offsetHeight - vh;
    const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
    progress.set(p);
  });

  // Track glides for the first 80% of travel; the ink flood owns the last 20%.
  const x = useTransform(progress, [0, 0.8], [0, -shift]);
  // Black ink flood: a circle that grows from the right edge to swallow the red.
  const flood = useTransform(progress, [0.78, 0.97], ["circle(0% at 85% 50%)", "circle(150% at 85% 50%)"]);

  return (
    <section ref={sectionRef} className="relative bg-brand-red" style={{ height: "340vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Depth field: darker red forms drifting behind the track, so the
            glass cards have something to refract. */}
        <DepthBlobs progress={progress} />

        {/* Horizontal track */}
        <motion.div ref={trackRef} className="flex h-full items-center gap-8 pl-6 pr-[12vw] md:gap-10 md:pl-12" style={{ x }}>
          {/* Lead panel */}
          <div className="w-[78vw] shrink-0 md:w-[44vw]">
            <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/70">What we make</p>
            <h2
              className="font-clash font-semibold uppercase leading-[0.92] tracking-tight text-white"
              style={{ fontSize: "clamp(2.4rem, 6.5vw, 6rem)" }}
            >
              Every format.
              <br />
              One standard.
            </h2>
            <p className="mt-6 text-[13px] uppercase tracking-[0.25em] text-white/60">
              Keep scrolling &rarr;
            </p>
          </div>

          {/* Glass cards */}
          {CARDS.map((c, i) => (
            <GlassCard key={c.n} card={c} index={i} />
          ))}

          {/* Tail spacer so the last card clears center before the flood */}
          <div className="w-[20vw] shrink-0" />
        </motion.div>

        {/* Ink flood → lands on the next black section */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-bg-dark"
          style={{ clipPath: flood }}
        />
      </div>
    </section>
  );
}

function DepthBlobs({ progress }: { progress: MotionValue<number> }) {
  // Blobs counter-drift at a slower rate than the track: cheap parallax depth.
  const x1 = useTransform(progress, [0, 1], ["0vw", "-32vw"]);
  const x2 = useTransform(progress, [0, 1], ["8vw", "-18vw"]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute left-[18%] top-[8%] h-[58vh] w-[58vh] rounded-full bg-[#a30f1c] opacity-70 blur-[90px]"
        style={{ x: x1 }}
      />
      <motion.div
        className="absolute left-[68%] top-[42%] h-[70vh] w-[70vh] rounded-full bg-[#7d0a14] opacity-60 blur-[110px]"
        style={{ x: x2 }}
      />
      <motion.div
        className="absolute left-[42%] top-[60%] h-[40vh] w-[40vh] rounded-full bg-[#ff5a4e] opacity-30 blur-[80px]"
        style={{ x: x1 }}
      />
    </div>
  );
}

function GlassCard({ card, index }: { card: (typeof CARDS)[number]; index: number }) {
  return (
    <motion.div
      className="w-[78vw] max-w-[400px] shrink-0 rounded-3xl border border-white/25 bg-white/10 p-8 backdrop-blur-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] md:w-[30vw] md:p-10"
      style={{ y: index % 2 === 0 ? -22 : 22 }}
      animate={{ y: index % 2 === 0 ? [-22, -10, -22] : [22, 34, 22] }}
      transition={{ repeat: Infinity, duration: 4.5 + index * 0.4, ease: "easeInOut" }}
    >
      <span className="font-mono text-[12px] tracking-widest text-white/70">{card.n}</span>
      <h3 className="mt-6 font-clash text-2xl font-semibold uppercase tracking-tight text-white md:text-3xl">
        {card.t}
      </h3>
      <p className="mt-4 max-w-[30ch] text-[15px] leading-relaxed text-white/80">{card.d}</p>
    </motion.div>
  );
}
