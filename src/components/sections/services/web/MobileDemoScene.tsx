"use client";

/**
 * "Spec Sheet" mobile-demo scene for /services/web (Proposal A).
 * A big phone holding a looping app video pins to the right; on the left, benefit
 * rows reveal one by one and STAY, joined by a red spine that fills as they
 * appear — so the visitor watches a complete case get built, nothing lost.
 *
 * Sticky Lenis scene. Phone rises once then pins; rows accumulate; spine grows.
 * Light theme. Effects always-on (SSR-safe: phone settled, rows visible).
 *
 * SWAP POINT: APP_VIDEO — drop in your real mobile/app screen-capture clip.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useLenis } from "lenis/react";
import { useNovaStore } from "@/lib/stores/nova-store";

// Looping app capture. Placeholder = existing Cloudinary footage (object-cover
// crops it to the phone). Replace with a real vertical app-demo clip.
const APP_VIDEO =
  "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto,w_720,c_limit/v1779845634/Footage_07_o3rfbu.mp4";

const BENEFITS = [
  { n: "01", t: "Thumb-first by design", d: "Every tap lands where the thumb already is. No pinching, no hunting." },
  { n: "02", t: "Loads in under a second", d: "They never wait — so they never bounce to a competitor." },
  { n: "03", t: "Converts on the small screen", d: "Booking and checkout in two taps, not ten." },
  { n: "04", t: "Works for you 24/7", d: "Captures and qualifies leads while you sleep — on autopilot." },
];

export default function MobileDemoScene() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [vh, setVh] = useState(900);
  const openNova = useNovaStore((s) => s.openNova);

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

  // Phone rises from below, then pins. Subtle settle.
  const phoneY = useTransform(progress, [0, 0.2], ["54vh", "0vh"]);
  const phoneRot = useTransform(progress, [0, 0.2], [4, -6]);

  // Rows reveal across this window; spine fills to match.
  const REVEAL_START = 0.2;
  const REVEAL_END = 0.82;
  const spineFill = useTransform(progress, [REVEAL_START, REVEAL_END], [0, 1]);

  return (
    <section ref={sectionRef} className="relative bg-white" style={{ height: "340vh" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-6 md:px-10">
        <div className="mx-auto grid w-full max-w-[1300px] items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16 lg:gap-24">

          {/* LEFT — accumulating benefit rows + red spine */}
          <div className="order-2 md:order-1">
            <p className="mb-8 text-[11px] uppercase tracking-[0.3em] text-[#999] md:mb-12">
              On the device that matters
            </p>

            <div className="relative">
              {/* Spine track + fill */}
              <div className="absolute left-[17px] top-3 bottom-3 w-[2px] bg-black/10">
                <motion.div className="w-full origin-top bg-brand-red" style={{ height: "100%", scaleY: spineFill }} />
              </div>

              <div className="space-y-9 md:space-y-11">
                {BENEFITS.map((b, i) => (
                  <BenefitRow key={b.n} row={b} index={i} count={BENEFITS.length} progress={progress} start={REVEAL_START} end={REVEAL_END} />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => openNova("hero", true)}
              className="mt-12 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#111] transition-colors hover:text-brand-red"
            >
              See it live
              <span className="text-brand-red">&rarr;</span>
            </button>
          </div>

          {/* RIGHT — big phone with looping app video */}
          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative">
              {/* Floor shadow */}
              <div className="absolute -bottom-6 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/20 blur-2xl" />
              <motion.div
                className="relative w-[230px] overflow-hidden rounded-[2.6rem] border-[8px] border-[#1b1b1b] bg-black shadow-[0_60px_120px_-40px_rgba(0,0,0,0.55)] md:w-[300px]"
                style={{ y: phoneY, rotate: phoneRot }}
              >
                <div className="absolute left-1/2 top-2.5 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-white/25" />
                <video
                  className="aspect-[9/19.5] w-full object-cover"
                  src={APP_VIDEO}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Benefit row — reveals once and STAYS (opacity/y clamp at the lit state). */
function BenefitRow({
  row,
  index,
  count,
  progress,
  start,
  end,
}: {
  row: (typeof BENEFITS)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  const step = (end - start) / count;
  const a = start + index * step;
  const opacity = useTransform(progress, [a, a + step * 0.45], [0, 1]);
  const y = useTransform(progress, [a, a + step * 0.45], [22, 0]);
  // Number dot lights red once the row is in.
  const dotBg = useTransform(progress, [a, a + step * 0.45], ["rgba(0,0,0,0.12)", "#e5192a"]);
  const dotColor = useTransform(progress, [a, a + step * 0.45], ["rgba(0,0,0,0.4)", "#ffffff"]);

  return (
    <motion.div style={{ opacity, y }} className="relative pl-14">
      <motion.span
        className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full font-clash text-[12px] font-bold ring-4 ring-white"
        style={{ backgroundColor: dotBg, color: dotColor }}
      >
        {row.n}
      </motion.span>
      <h3 className="font-clash text-xl font-semibold uppercase leading-tight tracking-tight text-[#111] md:text-2xl">
        {row.t}
      </h3>
      <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-[#666]">{row.d}</p>
    </motion.div>
  );
}
