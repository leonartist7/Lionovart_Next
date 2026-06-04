"use client";

/**
 * Lower acts for /services/content-studio: Process, two Offers, Proof, CTA close.
 * The merge in offer form: one umbrella service, two buying intents —
 * Films & Campaigns (project) and Content Engine (monthly retainer, highest LTV).
 * Concrete for this flagship; shared ServicePageShell gets extracted later.
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
  { n: "01", t: "Brief", d: "We find the one idea your market cannot ignore." },
  { n: "02", t: "Create", d: "Films, reels, graphics, copy. Made to look like money." },
  { n: "03", t: "Publish", d: "Every format your channels need, on schedule." },
  { n: "04", t: "Grow", d: "We read what works and double down every month." },
];

const PROJECT = [
  "1 hero brand film (up to 90s)",
  "4 social cut-downs (9:16 + 1:1)",
  "Motion titles + lower thirds",
  "Licensed sound design + mix",
  "Color grade to your brand",
];

const ENGINE = [
  "Content strategy + monthly calendar",
  "[N] reels + [N] posts / month",
  "Copywriting + creative direction",
  "On-brand graphics + edits",
  "Monthly performance report",
];

export default function OffersAndClose() {
  const reduce = useReducedMotion();
  const openNova = useNovaStore((s) => s.openNova);
  // The voice agent (Nova) handles every lead, no form. CTA opens it and auto-starts.
  const go = () => openNova("hero", true);

  const motionProps = reduce ? {} : reveal;

  return (
    <>
      {/* ── Process ─────────────────────────────────────────────────── */}
      <section className="bg-bg-dark px-6 py-28 md:py-36">
        <div className="mx-auto max-w-[1400px]">
          <motion.h2
            {...motionProps}
            className="mb-16 font-clash font-semibold uppercase leading-[0.95] tracking-tight text-white"
            style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
          >
            How it works
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

      {/* ── Two offers (the merge: one project, one monthly) ────────── */}
      <section className="bg-bg-dark px-6 pb-28 md:pb-36">
        <div className="mx-auto max-w-[1400px]">
          <motion.div {...motionProps} className="mb-12 max-w-2xl">
            <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/50">Two ways in</p>
            <h2
              className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-white"
              style={{ fontSize: "clamp(2.2rem, 6vw, 4.6rem)" }}
            >
              Make it once, or run it for months.
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Offer A — project */}
            <motion.div
              {...motionProps}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 md:p-10"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Project</p>
              <h3 className="mt-2 font-clash text-3xl font-semibold text-white md:text-4xl">
                Films &amp; Campaigns
              </h3>
              <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-white/60">
                One sprint, a full film system your brand can post for months.
              </p>
              <ul className="mt-7 flex-1 divide-y divide-white/10">
                {PROJECT.map((item) => (
                  <li key={item} className="flex items-center gap-4 py-3.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                    <span className="text-[15px] text-white/85">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">From</p>
                  <p className="font-clash text-brand-red" style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>
                    $[price]
                  </p>
                </div>
                <LiquidMetalButton label="Start a project" width={190} onClick={go} />
              </div>
            </motion.div>

            {/* Offer B — monthly retainer */}
            <motion.div
              {...motionProps}
              className="relative flex flex-col rounded-2xl border border-brand-red/40 bg-brand-red/[0.06] p-8 md:p-10"
            >
              <span className="absolute right-6 top-6 rounded-full border border-brand-red/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-red">
                Most chosen
              </span>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Monthly</p>
              <h3 className="mt-2 font-clash text-3xl font-semibold text-white md:text-4xl">
                Content Engine
              </h3>
              <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-white/60">
                We run your content end to end, so your brand stays top of mind every month.
              </p>
              <ul className="mt-7 flex-1 divide-y divide-white/10">
                {ENGINE.map((item) => (
                  <li key={item} className="flex items-center gap-4 py-3.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                    <span className="text-[15px] text-white/85">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">From</p>
                  <p className="font-clash text-brand-red" style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>
                    $[price]<span className="text-[0.5em] text-white/50">/mo</span>
                  </p>
                </div>
                <LiquidMetalButton label="Start your engine" width={200} onClick={go} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Proof slot (placeholder → real testimonial) ─────────────── */}
      <section className="bg-bg-dark px-6 py-28 md:py-32">
        <motion.figure {...motionProps} className="mx-auto max-w-4xl text-center">
          <blockquote
            className="font-clash font-medium leading-[1.15] text-white"
            style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)" }}
          >
            &ldquo;[ A client says, in one line, that the content changed how their
            market sees them. ]&rdquo;
          </blockquote>
          <figcaption className="mt-8 text-[13px] uppercase tracking-[0.18em] text-white/45">
            [ Name ], [ Role ], [ Business ]
          </figcaption>
        </motion.figure>
      </section>

      {/* ── CTA close (peak-end beat) — opens Nova ──────────────────── */}
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
            <LiquidMetalButton label="Talk to Nova" width={200} onClick={go} />
            <p className="text-[12px] uppercase tracking-[0.2em] text-white/40">
              Tell our voice agent what you need. She takes it from there.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
