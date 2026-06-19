"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const SEPARATOR = " • ";

/**
 * One slanted marquee band. `reverse` flips the scroll direction so the two
 * bands in the cross travel opposite ways.
 */
function CrossBand({ rotate, reverse }: { rotate: number; reverse?: boolean }) {
  const { t } = useLanguage();
  const text = t.marquee.items.join(SEPARATOR) + SEPARATOR;

  return (
    <div
      className="absolute left-1/2 top-1/2 w-[140%] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-brand-red py-3 md:py-4 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.5)]"
      style={{ rotate: `${rotate}deg` }}
    >
      <div
        className="flex shrink-0 whitespace-nowrap"
        style={{ animation: `marquee-left 25s linear infinite${reverse ? " reverse" : ""}` }}
      >
        <span className="shrink-0 px-2 text-[20px] font-semibold uppercase tracking-wider text-white md:text-[24px]">
          {text}
        </span>
        <span
          className="shrink-0 px-2 text-[20px] font-semibold uppercase tracking-wider text-white md:text-[24px]"
          aria-hidden="true"
        >
          {text}
        </span>
      </div>
    </div>
  );
}

/**
 * MarqueeCross — two slanted red marquee bands overlapping in an X, used as a
 * diagonal divider between the Problems and Offer sections. `overflow-hidden`
 * on the outer wrapper keeps the rotated bands from causing horizontal scroll.
 */
export default function MarqueeCross() {
  return (
    <section className="relative z-[3] h-[150px] overflow-hidden bg-bg-surface-light md:h-[220px]">
      <CrossBand rotate={-7} />
      <CrossBand rotate={7} reverse />
    </section>
  );
}
