"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

const MARQUEE_ITEMS = [
  "Branding & Identity",
  "Web Design & Dev",
  "Video Production",
  "Motion Graphics",
  "Social Media",
  "UI/UX Design",
  "Creative Strategy",
  "Content Creation",
];

const SEPARATOR = " • ";

function MarqueeTrack() {
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

  const text = MARQUEE_ITEMS.join(SEPARATOR) + SEPARATOR;

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
  return (
    <section className="relative z-10 overflow-visible">
      <div
        className="overflow-hidden bg-brand-red py-4 md:py-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <MarqueeTrack />
      </div>
    </section>
  );
}
