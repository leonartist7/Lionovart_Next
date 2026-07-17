"use client";

/**
 * Brand capability proof: a brand system assembling on scroll — type specimen,
 * palette, and voice. Editorial layout (not icon cards). Reduced-motion safe.
 */

import { motion, useReducedMotion } from "framer-motion";

const SWATCHES = [
  { name: "Void", hex: "#000000", border: true },
  { name: "Lacquer Red", hex: "#e5192a" },
  { name: "Sovereign Gold", hex: "#f0c917" },
  { name: "Warm Ivory", hex: "#f5f0eb" },
];

export default function BrandSystemReveal() {
  const reduce = useReducedMotion();
  const item = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section className="bg-bg-dark px-6 py-28 md:py-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 md:grid-cols-2">
        {/* Type specimen */}
        <motion.div {...item(0)}>
          <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-white/50">The system</p>
          <div className="font-clash leading-none text-white" style={{ fontSize: "clamp(7rem, 22vw, 18rem)" }}>
            Aa
          </div>
          <p className="mt-4 text-[13px] uppercase tracking-[0.18em] text-white/45">
            Clash Display, 200&ndash;700
          </p>
        </motion.div>

        {/* Palette + voice */}
        <div>
          <div className="space-y-3">
            {SWATCHES.map((s, i) => (
              <motion.div key={s.name} {...item(i + 1)} className="flex items-center gap-5">
                <span
                  className="h-12 w-20 shrink-0 rounded-md"
                  style={{
                    backgroundColor: s.hex,
                    border: s.border ? "1px solid rgba(255,255,255,0.18)" : "none",
                  }}
                />
                <div className="flex w-full items-baseline justify-between border-b border-white/10 pb-3">
                  <span className="font-clash text-lg text-white">{s.name}</span>
                  <span className="font-mono text-[12px] uppercase tracking-wider text-white/40">{s.hex}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.p
            {...item(SWATCHES.length + 1)}
            className="mt-10 max-w-[40ch] font-clash text-xl leading-relaxed text-white/70"
          >
            Strategy, logo system, type, color, voice, and sonic identity. One coherent decision,
            applied everywhere.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
