"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const SEPARATOR = " • ";

function MarqueeTrack({ items }: { items: readonly string[] }) {
  const text = items.join(SEPARATOR) + SEPARATOR;

  return (
    <div className="imagine-marquee__track">
      <div className="imagine-marquee__group">
        <span className="imagine-marquee__text shrink-0 px-2 text-[22px] font-semibold uppercase tracking-wider text-white md:text-[24px]">
          {text}
        </span>
        <span className="imagine-marquee__text shrink-0 px-2 text-[22px] font-semibold uppercase tracking-wider text-white md:text-[24px]" aria-hidden="true">
          {text}
        </span>
      </div>
      <div className="imagine-marquee__group" aria-hidden="true">
        <span className="imagine-marquee__text shrink-0 px-2 text-[22px] font-semibold uppercase tracking-wider text-white md:text-[24px]">
          {text}
        </span>
        <span className="imagine-marquee__text shrink-0 px-2 text-[22px] font-semibold uppercase tracking-wider text-white md:text-[24px]">
          {text}
        </span>
      </div>
    </div>
  );
}

export default function MarqueeSlanted() {
  const { t } = useLanguage();

  return (
    <section className="imagine-marquee relative z-20 -mt-[5svh] overflow-visible">
      <div className="imagine-marquee__band overflow-hidden bg-brand-red py-4 md:py-5">
        <MarqueeTrack items={t.marquee.items} />
      </div>
    </section>
  );
}
