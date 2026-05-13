"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useLanguage } from "@/contexts/LanguageContext";

const SEPARATOR = " • ";

function MarqueeTrack({ items }: { items: readonly string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 25,
      ease: "none",
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, []);

  const text = items.join(SEPARATOR) + SEPARATOR;

  return (
    <div ref={trackRef} className="flex shrink-0 whitespace-nowrap">
      {/* Duplicate the text block for a seamless infinite loop */}
      <span className="shrink-0 px-2 text-[22px] font-semibold uppercase tracking-wider text-white md:text-[24px]">
        {text}
      </span>
      <span className="shrink-0 px-2 text-[22px] font-semibold uppercase tracking-wider text-white md:text-[24px]">
        {text}
      </span>
    </div>
  );
}

export default function MarqueeSlanted() {
  const { t } = useLanguage();

  return (
    <section className="relative z-10 overflow-visible">
      <div
        className="overflow-hidden bg-brand-red py-4 md:py-5 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.5)]"
      >
        <MarqueeTrack items={t.marquee.items} />
      </div>
    </section>
  );
}
