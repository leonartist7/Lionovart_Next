"use client";

/**
 * Print capabilities showcase — what we can make, not a catalogue. Mobile-first
 * single-column stack that becomes a 2-col bento on md, where "Premium finishes"
 * spans full width as the gold feature tile (foil/emboss connotation). Cards are
 * non-link (cursor-default) — this is a showcase, the page converts via Nova.
 * Reveal + reduced-motion handled by RevealOnScroll (transform + opacity only).
 */

import { CreditCard, Package, Signpost, Shirt, Stamp, type LucideIcon } from "lucide-react";
import RevealOnScroll from "@/components/sections/services/brand/branding/RevealOnScroll";

interface Category {
  icon: LucideIcon;
  title: string;
  blurb: string;
  /** The gold feature tile (Premium finishes). Spans full width on md, gold accent. */
  feature?: boolean;
}

const CATEGORIES: Category[] = [
  {
    icon: CreditCard,
    title: "Business cards & stationery",
    blurb: "The handshake, in your hand.",
  },
  {
    icon: Package,
    title: "Packaging",
    blurb: "Unboxing is a brand moment.",
  },
  {
    icon: Signpost,
    title: "Signage & large-format",
    blurb: "Be unmissable in physical space.",
  },
  {
    icon: Shirt,
    title: "Merch & apparel",
    blurb: "Brand people actually wear.",
  },
  {
    icon: Stamp,
    title: "Premium finishes",
    blurb: "Foil, emboss, spot-UV — the details they feel.",
    feature: true,
  },
];

export default function CategoryShowcase() {
  return (
    <section className="bg-bg-dark px-6 py-28 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <RevealOnScroll>
          <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-brand-red">
            What we make
          </p>
          <h2
            className="max-w-[18ch] font-clash font-semibold uppercase leading-[0.95] text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", letterSpacing: "-0.03em" }}
          >
            From the card to the whole physical brand.
          </h2>
        </RevealOnScroll>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {CATEGORIES.map((cat, i) => (
            <RevealOnScroll
              key={cat.title}
              delay={i * 0.06}
              amount={0.3}
              className={cat.feature ? "md:col-span-2" : undefined}
            >
              <Tile {...cat} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tile({ icon: Icon, title, blurb, feature }: Category) {
  return (
    <article
      className={`group flex h-full cursor-default flex-col rounded-2xl border bg-[#161616] p-7 transition duration-200 hover:-translate-y-1 md:p-9 ${
        feature
          ? "border-brand-gold/40 hover:border-brand-gold hover:shadow-[0_18px_50px_-20px_rgba(240,201,23,0.45)] md:flex-row md:items-end md:justify-between md:gap-8"
          : "border-border-dark hover:border-brand-red hover:shadow-[0_18px_50px_-24px_rgba(229,25,42,0.45)]"
      }`}
    >
      {/* Sample thumb — gradient placeholder. // TODO: swap asset (public/images/* or Cloudinary). */}
      <div
        className={`mb-7 flex aspect-[16/9] w-full items-center justify-center rounded-xl ${
          feature
            ? "bg-gradient-to-br from-brand-gold/20 via-[#161616] to-[#0d0d0d] md:mb-0 md:w-1/2"
            : "bg-gradient-to-br from-white/[0.07] via-[#161616] to-[#0d0d0d]"
        }`}
        aria-hidden="true"
      >
        <Icon
          className={feature ? "text-brand-gold" : "text-white/80"}
          size={feature ? 44 : 36}
          strokeWidth={1.5}
        />
      </div>

      <div className={feature ? "md:max-w-[26ch]" : undefined}>
        {feature && (
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-brand-gold">
            Premium
          </p>
        )}
        <h3
          className={`font-clash font-medium text-white ${
            feature ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          }`}
        >
          {title}
        </h3>
        <p className="mt-2 max-w-[46ch] text-[15px] leading-[1.6] text-white/70 md:text-[16px]">
          {blurb}
        </p>
      </div>
    </article>
  );
}
