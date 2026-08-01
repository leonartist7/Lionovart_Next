"use client";

/**
 * Web signature scene: a site assembles section-by-section inside a browser
 * frame as you scroll (the page performs "we build sites"). Blocks are
 * deliberately schematic wireframe regions (not a fake polished screenshot,
 * per design-taste rules); the hero slot holds a real clip to ground it.
 * Swap blocks for a real mockup/screenshot when available.
 * Lenis-driven. Reduced-motion: whole frame shown assembled.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { useLenis } from "lenis/react";

const HERO_CLIP =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto/v1779845553/Footage_05_yalbaj.mp4";

export default function DeviceBuildScene() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(reduce ? 1 : 0);
  const [vh, setVh] = useState(900);

  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useLenis(() => {
    if (reduce) return;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const travel = el.offsetHeight - vh;
    progress.set(travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0);
  });

  return (
    <section ref={sectionRef} className="relative bg-bg-dark" style={{ height: reduce ? "auto" : "300vh" }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4 py-[12vh] md:px-6">
        <div className="mx-auto w-full max-w-[1000px]">
          <p className="mb-5 text-center text-[11px] uppercase tracking-[0.3em] text-white/50">
            Built section by section
          </p>

          {/* Browser frame */}
          <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
            {/* Chrome */}
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-white/15" />
              <span className="h-3 w-3 rounded-full bg-white/15" />
              <span className="h-3 w-3 rounded-full bg-white/15" />
              <span className="ml-4 h-5 flex-1 rounded-md bg-white/[0.06]" />
            </div>

            {/* Page body — blocks reveal in sequence */}
            <div className="space-y-4 p-4 md:p-6">
              <Block progress={progress} reduce={!!reduce} from={0} to={0.14}>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                  <span className="h-4 w-20 rounded bg-white/20" />
                  <div className="hidden gap-3 md:flex">
                    <span className="h-3 w-12 rounded bg-white/12" />
                    <span className="h-3 w-12 rounded bg-white/12" />
                    <span className="h-3 w-12 rounded bg-white/12" />
                  </div>
                  <span className="h-7 w-20 rounded-full bg-brand-red" />
                </div>
              </Block>

              <Block progress={progress} reduce={!!reduce} from={0.14} to={0.42}>
                <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-2 md:items-center md:p-7">
                  <div className="space-y-3">
                    <span className="block h-7 w-4/5 rounded bg-white/20" />
                    <span className="block h-7 w-3/5 rounded bg-white/20" />
                    <span className="block h-3 w-full rounded bg-white/12" />
                    <span className="block h-3 w-2/3 rounded bg-white/12" />
                    <span className="mt-2 block h-9 w-32 rounded-full bg-brand-red" />
                  </div>
                  <div className="aspect-[16/10] overflow-hidden rounded-lg">
                    <video className="h-full w-full object-cover" src={HERO_CLIP} autoPlay loop muted playsInline />
                  </div>
                </div>
              </Block>

              <Block progress={progress} reduce={!!reduce} from={0.42} to={0.72}>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                      <span className="block h-16 w-full rounded bg-white/[0.07]" />
                      <span className="block h-3 w-3/4 rounded bg-white/15" />
                      <span className="block h-3 w-1/2 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              </Block>

              <Block progress={progress} reduce={!!reduce} from={0.72} to={0.92}>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-4">
                  <span className="h-3 w-24 rounded bg-white/12" />
                  <span className="h-3 w-16 rounded bg-white/12" />
                </div>
              </Block>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Block({
  progress,
  reduce,
  from,
  to,
  children,
}: {
  progress: MotionValue<number>;
  reduce: boolean;
  from: number;
  to: number;
  children: ReactNode;
}) {
  const opacity = useTransform(progress, [from, to], [0, 1]);
  const y = useTransform(progress, [from, to], [28, 0]);
  return (
    <motion.div style={reduce ? undefined : { opacity, y }}>{children}</motion.div>
  );
}
