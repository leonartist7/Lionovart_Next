"use client";

/**
 * Scene 6 — the deliverables. A clean vertical column of separate frosted cards
 * (no overlap, no pin), each revealed on scroll. The final card is a bridge to
 * the Printing page — the physical/commercial upsell. Transform + opacity only;
 * RevealOnScroll handles reduced-motion.
 */

import Link from "next/link";
import RevealOnScroll from "./RevealOnScroll";
import { SERVICE_ROUTES } from "@/lib/service-routes";

const PRINT = SERVICE_ROUTES.find((s) => s.id === "print");

export default function GlassStack({
  eyebrow,
  heading,
  cards,
}: {
  eyebrow: string;
  heading: string;
  cards: string[];
}) {
  return (
    <section className="relative z-10 mx-auto flex max-w-[680px] flex-col px-6 py-[16vh]">
      <div className="mb-12 text-center">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-red">
          {eyebrow}
        </p>
        <h2
          className="font-clash font-semibold uppercase leading-[0.95] text-text-main"
          style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}
        >
          {heading}
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {cards.map((label, i) => (
          <RevealOnScroll key={label} delay={i * 0.06} amount={0.4}>
            <div className="glass-surface flex items-center justify-between rounded-2xl px-7 py-6">
              <span className="font-clash text-xl font-medium text-text-main md:text-2xl">
                {label}
              </span>
              <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </RevealOnScroll>
        ))}

        {/* Bridge card → Printing (physical / commercial upsell). */}
        <RevealOnScroll delay={cards.length * 0.06} amount={0.4}>
          <Link
            href={PRINT?.href ?? "/services/print"}
            className="group flex items-center justify-between rounded-2xl border border-brand-red/40 bg-brand-red/[0.06] px-7 py-6 transition-colors hover:bg-brand-red/[0.12]"
          >
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-red">
                Take it physical
              </p>
              <span className="font-clash text-xl font-medium text-text-main md:text-2xl">
                {PRINT?.name ?? "Print & Physical Branding"}
              </span>
              <p className="mt-1 max-w-[40ch] font-body text-[13px] leading-snug text-white/55">
                Cards, packaging, signage — presence beyond the screen.
              </p>
            </div>
            <span className="ml-4 shrink-0 text-2xl text-brand-red transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
