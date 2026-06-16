"use client";

/**
 * /services/web hero. Pinned desktop + mobile mockups stay frozen while the
 * headline fades and swaps to the next conversion line in the same spot as the
 * visitor scrolls. Folds the old static hero + StatementRelay + DeviceBuildScene
 * into one cinematic pinned scene. Mockups never move; only the text changes.
 *
 * Lenis-driven progress (same mechanic as StatementRelay). Effects always-on:
 * SSR/no-JS shows the first beat + assembled mockups, but there is no separate
 * reduced-motion static fork.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useLenis } from "lenis/react";

// Premium site-mockup shots already in Cloudinary (reused from ImageMarquee).
const DESKTOP_SHOT =
  "https://res.cloudinary.com/dgio9uutc/image/upload/q_auto,w_1400,c_limit/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif";
const MOBILE_SHOT =
  "https://res.cloudinary.com/dgio9uutc/image/upload/q_auto,w_600,c_limit/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif";

// First beat is the two-line hero title; the rest are converting stakes lines.
type Beat = { lines: string[]; accentLast?: boolean; title?: boolean };
const BEATS: Beat[] = [
  { lines: ["A site that", "books the call"], accentLast: true, title: true },
  { lines: ["Visitors decide", "in 3 seconds."] },
  { lines: ["Most sites spend", "them loading."] },
  { lines: ["Yours won't."], accentLast: true },
];

export default function StickyMockupHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [vh, setVh] = useState(900);

  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useLenis(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const travel = el.offsetHeight - vh;
    progress.set(travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0);
  });

  // Mockups: subtle settle on entry, then frozen. No horizontal motion.
  const mockScale = useTransform(progress, [0, 0.12], [1.04, 1]);

  return (
    <section ref={sectionRef} className="relative bg-white" style={{ height: "340vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="mx-auto flex h-full max-w-[1400px] flex-col items-center gap-4 px-6 pt-24 md:flex-row md:gap-10 md:px-10 md:pt-0">

          {/* Text column — beats swap in the same anchored spot */}
          <div className="relative w-full md:w-[38%]">
            <p className="mb-5 text-[12px] uppercase tracking-[0.35em] text-[#999] md:text-[13px]">
              Web &amp; Apps
            </p>
            <div className="relative h-[20vh] md:h-[46vh]">
              {BEATS.map((beat, i) => (
                <BeatLine key={i} beat={beat} index={i} count={BEATS.length} progress={progress} />
              ))}
            </div>
          </div>

          {/* Mockups — pinned, frozen */}
          <motion.div
            className="relative flex w-full flex-1 items-center justify-center"
            style={{ scale: mockScale }}
          >
            {/* Desktop browser frame */}
            <div className="w-full max-w-[760px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_40px_120px_-40px_rgba(0,0,0,0.28)]">
              <div className="flex items-center gap-2 border-b border-black/10 bg-[#f3f1ec] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-black/15" />
                <span className="h-3 w-3 rounded-full bg-black/15" />
                <span className="h-3 w-3 rounded-full bg-black/15" />
                <span className="ml-4 h-5 flex-1 rounded-md bg-black/[0.05]" />
              </div>
              <img
                src={DESKTOP_SHOT}
                alt="Website mockup"
                className="aspect-[16/10] w-full object-cover object-top"
              />
            </div>

            {/* Phone frame — overlaps lower-left, same site mobile */}
            <div className="absolute -bottom-6 left-0 w-[28%] min-w-[120px] max-w-[200px] overflow-hidden rounded-[2rem] border-[5px] border-[#e7e3dc] bg-white shadow-[0_30px_70px_-20px_rgba(0,0,0,0.3)] md:-left-4">
              <div className="absolute left-1/2 top-1.5 z-10 h-1.5 w-10 -translate-x-1/2 rounded-full bg-black/15" />
              <img
                src={MOBILE_SHOT}
                alt="Mobile mockup"
                className="aspect-[9/19] w-full object-cover object-top"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BeatLine({
  beat,
  index,
  count,
  progress,
}: {
  beat: Beat;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const seg = 1 / count;
  const c = (index + 0.5) * seg;
  const isFirst = index === 0;
  const isLast = index === count - 1;
  // In-place opacity crossfade only — no vertical movement. First beat holds
  // from the very top; last beat holds through to the end.
  const inA = isFirst ? -1 : c - seg * 0.5;
  const inB = isFirst ? 0 : c - seg * 0.16;
  const outA = isLast ? 2 : c + seg * 0.16;
  const outB = isLast ? 3 : c + seg * 0.5;
  const opacity = useTransform(progress, [inA, inB, outA, outB], [0, 1, 1, 0]);

  return (
    <motion.h1
      className="absolute inset-x-0 top-0 font-clash font-normal leading-[1.02] tracking-tight text-[#111]"
      style={{ opacity, fontSize: "clamp(2.2rem, 5vw, 5.5rem)" }}
    >
      {beat.lines.map((line, j) => {
        const accent = beat.accentLast && j === beat.lines.length - 1;
        return (
          <span key={j} className={`block ${accent ? "font-semibold text-brand-red" : ""}`}>
            {line}
          </span>
        );
      })}
    </motion.h1>
  );
}
