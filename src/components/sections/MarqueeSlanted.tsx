"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const SEPARATOR = " • ";

function MarqueeTrack({ items, reverse = false }: { items: readonly string[]; reverse?: boolean }) {
  const text = items.join(SEPARATOR) + SEPARATOR;

  return (
    <div
      className="flex shrink-0 whitespace-nowrap"
      style={{ animation: "marquee-left 25s linear infinite", animationDirection: reverse ? "reverse" : "normal" }}
    >
      <span className="shrink-0 px-2 text-[22px] font-semibold uppercase tracking-wider text-white md:text-[24px]">
        {text}
      </span>
      <span className="shrink-0 px-2 text-[22px] font-semibold uppercase tracking-wider text-white md:text-[24px]" aria-hidden="true">
        {text}
      </span>
    </div>
  );
}

export default function MarqueeSlanted({ reverse = false }: { reverse?: boolean }) {
  const { t } = useLanguage();

  return (
    <section className="relative z-10 overflow-visible">
      <div
        className="overflow-hidden bg-brand-red py-4 md:py-5 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.5)]"
      >
        <MarqueeTrack items={t.marquee.items} reverse={reverse} />
      </div>
    </section>
  );
}
