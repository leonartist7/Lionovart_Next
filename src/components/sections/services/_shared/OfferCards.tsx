"use client";

/**
 * Shared offer block. 1-2 offers (project and/or monthly). Featured offer gets
 * the red treatment. CTAs open the Nova voice agent (no form). Reduced-motion safe.
 */

import { useNovaStore } from "@/lib/stores/nova-store";
import { motion, useReducedMotion } from "framer-motion";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

export interface Offer {
  kind: string; // "Project" | "Monthly" | "Retainer" ...
  title: string;
  blurb: string;
  items: string[];
  priceLabel: string; // e.g. "From"
  price: string; // e.g. "$[price]"
  priceSuffix?: string; // e.g. "/mo"
  ctaLabel: string;
  featured?: boolean;
  tag?: string; // e.g. "Most chosen"
}

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

export default function OfferCards({
  eyebrow,
  heading,
  offers,
}: {
  eyebrow: string;
  heading: string;
  offers: Offer[];
}) {
  const reduce = useReducedMotion();
  const openNova = useNovaStore((s) => s.openNova);
  const go = () => openNova("hero", true);
  const mp = reduce ? {} : reveal;
  const grid = offers.length === 1 ? "max-w-2xl" : "md:grid-cols-2";

  return (
    <section className="bg-bg-dark px-6 pb-28 md:pb-36">
      <div className="mx-auto max-w-[1400px]">
        <motion.div {...mp} className="mb-12 max-w-2xl">
          <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/50">{eyebrow}</p>
          <h2
            className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-white"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4.6rem)" }}
          >
            {heading}
          </h2>
        </motion.div>

        <div className={`grid gap-6 ${grid}`}>
          {offers.map((o) => (
            <motion.div
              key={o.title}
              {...mp}
              className={`relative flex flex-col rounded-2xl p-8 md:p-10 ${
                o.featured
                  ? "border border-brand-red/40 bg-brand-red/[0.06]"
                  : "border border-white/10 bg-white/[0.03]"
              }`}
            >
              {o.tag && (
                <span className="absolute right-6 top-6 rounded-full border border-brand-red/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-red">
                  {o.tag}
                </span>
              )}
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">{o.kind}</p>
              <h3 className="mt-2 font-clash text-3xl font-semibold text-white md:text-4xl">{o.title}</h3>
              <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-white/60">{o.blurb}</p>
              <ul className="mt-7 flex-1 divide-y divide-white/10">
                {o.items.map((item) => (
                  <li key={item} className="flex items-center gap-4 py-3.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                    <span className="text-[15px] text-white/85">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">{o.priceLabel}</p>
                  <p className="font-clash text-brand-red" style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>
                    {o.price}
                    {o.priceSuffix && <span className="text-[0.5em] text-white/50">{o.priceSuffix}</span>}
                  </p>
                </div>
                <LiquidMetalButton label={o.ctaLabel} width={200} onClick={go} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
