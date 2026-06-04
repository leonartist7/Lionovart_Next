"use client";

/**
 * Acts 4-7 for /services/video: Process, Value stack, Proof, CTA close.
 * Concrete (not abstracted) for the Video flagship; the shared ServicePageShell
 * gets extracted once the Social flagship exists, per SERVICE_PAGES_SPEC.md.
 * All copy/numbers are placeholders until final copy + real terms land.
 */

import { useNovaStore } from "@/lib/stores/nova-store";
import { motion, useReducedMotion } from "framer-motion";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

const PROCESS = [
  { n: "01", t: "Brief", d: "We pull the one idea worth filming out of your business." },
  { n: "02", t: "Concept", d: "Treatment, shotlist, sound. The film exists on paper first." },
  { n: "03", t: "Shoot", d: "Lean crew, cinema discipline, no wasted frame." },
  { n: "04", t: "Deliver", d: "One hero cut plus every aspect ratio your channels need." },
];

const STACK = [
  "1 hero brand film (up to 90s)",
  "4 social cut-downs (9:16 + 1:1)",
  "Motion titles + lower thirds",
  "Licensed sound design + mix",
  "Color grade to your brand",
  "Raw selects archived 12 months",
];

export default function VideoLowerActs() {
  const reduce = useReducedMotion();
  const openNova = useNovaStore((s) => s.openNova);
  // The voice agent (Nova) handles every lead, no form. CTA opens it and auto-starts.
  const go = () => openNova("hero", true);

  const motionProps = reduce ? {} : reveal;

  return (
    <>
      {/* ── Act 4 — Process ─────────────────────────────────────────── */}
      <section className="bg-bg-dark px-6 py-28 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <motion.h2
            {...motionProps}
            className="mb-16 font-clash font-semibold uppercase leading-[0.95] tracking-tight text-white"
            style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
          >
            How the film gets made
          </motion.h2>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
            {PROCESS.map((step) => (
              <motion.div key={step.n} {...motionProps} className="bg-bg-dark p-7 md:p-8">
                <span className="font-clash text-brand-red" style={{ fontSize: "clamp(1.4rem,3vw,2rem)" }}>
                  {step.n}
                </span>
                <h3 className="mt-5 font-clash text-2xl font-semibold text-white">{step.t}</h3>
                <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-white/55">{step.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Act 5 — Value stack ─────────────────────────────────────── */}
      <section className="bg-bg-dark px-6 pb-28 md:pb-36">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 md:grid-cols-2">
          <motion.div {...motionProps}>
            <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/50">The package</p>
            <h2
              className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-white"
              style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}
            >
              The Reel Sprint
            </h2>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-white/60">
              One sprint, a full film system your brand can post for months. Built fast, priced for
              founders, made to look like money.
            </p>
          </motion.div>

          <motion.div
            {...motionProps}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10"
          >
            <ul className="divide-y divide-white/10">
              {STACK.map((item) => (
                <li key={item} className="flex items-center gap-4 py-4">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                  <span className="text-[16px] text-white/85">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Founder rate</p>
                <p className="font-clash text-brand-red" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>
                  $[price]
                </p>
              </div>
              <LiquidMetalButton label="Start your film" width={190} onClick={go} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Act 6 — Proof slot (placeholder → real testimonial) ─────── */}
      <section className="bg-bg-dark px-6 py-28 md:py-32">
        <motion.figure {...motionProps} className="mx-auto max-w-4xl text-center">
          <blockquote
            className="font-clash font-medium leading-[1.15] text-white"
            style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)" }}
          >
            &ldquo;[ A client says, in one cinematic line, that the film changed how their
            market sees them. ]&rdquo;
          </blockquote>
          <figcaption className="mt-8 text-[13px] uppercase tracking-[0.18em] text-white/45">
            [ Name ], [ Role ], [ Business ]
          </figcaption>
        </motion.figure>
      </section>

      {/* ── Act 7 — CTA close (peak-end beat) ───────────────────────── */}
      <section className="relative overflow-hidden bg-bg-dark px-6 py-36 md:py-48">
        <div className="mx-auto max-w-5xl text-center">
          <motion.h2
            {...motionProps}
            className="font-clash font-semibold uppercase leading-[0.92] tracking-tight text-white"
            style={{ fontSize: "clamp(2.8rem, 9vw, 8rem)" }}
          >
            Let&rsquo;s make yours <span className="text-brand-red">roar</span>.
          </motion.h2>
          <motion.div {...motionProps} className="mt-12 flex flex-col items-center gap-5">
            <LiquidMetalButton label="Start your film" width={210} onClick={go} />
            <p className="text-[12px] uppercase tracking-[0.2em] text-white/40">
              [ Limited founder slots this month ]
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
