"use client";

import { Fragment } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

function CrownSeparator() {
  return (
    <span className="mx-1.5 inline-flex shrink-0 items-center text-brand-gold md:mx-2.5" aria-hidden="true">
      <svg
        viewBox="0 0 32 24"
        className="h-[17px] w-[23px] md:h-[19px] md:w-[26px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 5.5 10.7 12 16 3.5 21.3 12 28 5.5l-1.7 12H5.7L4 5.5Z"
          fill="currentColor"
          fillOpacity="0.22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M6.5 20.5h19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function MarqueeTrack({ items }: { items: readonly string[] }) {
  const text = items.map((item, index) => (
    <Fragment key={`${item}-${index}`}>
      <span>{item}</span>
      <CrownSeparator />
    </Fragment>
  ));

  return (
    <div className="imagine-marquee__track">
      <div className="imagine-marquee__group">
        <span className="imagine-marquee__text flex shrink-0 items-center px-2 text-[clamp(1rem,0.75rem+0.9vw,1.3125rem)] font-semibold uppercase tracking-wider text-white">
          {text}
        </span>
        <span className="imagine-marquee__text flex shrink-0 items-center px-2 text-[clamp(1rem,0.75rem+0.9vw,1.3125rem)] font-semibold uppercase tracking-wider text-white" aria-hidden="true">
          {text}
        </span>
      </div>
      <div className="imagine-marquee__group" aria-hidden="true">
        <span className="imagine-marquee__text flex shrink-0 items-center px-2 text-[clamp(1rem,0.75rem+0.9vw,1.3125rem)] font-semibold uppercase tracking-wider text-white">
          {text}
        </span>
        <span className="imagine-marquee__text flex shrink-0 items-center px-2 text-[clamp(1rem,0.75rem+0.9vw,1.3125rem)] font-semibold uppercase tracking-wider text-white">
          {text}
        </span>
      </div>
    </div>
  );
}

export default function MarqueeSlanted() {
  const { t } = useLanguage();

  return (
    <section className="imagine-marquee relative z-20">
      <div className="imagine-marquee__band overflow-hidden bg-brand-red py-4 md:py-5">
        <MarqueeTrack items={t.marquee.items} />
      </div>
    </section>
  );
}
