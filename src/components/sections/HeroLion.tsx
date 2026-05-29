"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

// ─────────────────────────────────────────────────────────────────────────────
// Hero centerpiece — the brand mark.
//
// Three variations are available; switch by changing the import + JSX below.
//   A) <HeroWordmark />  — the brand wordmark "LIONOVART", letter-by-letter
//      etched in with one light sweep and a single Sovereign Gold "O" moment.
//      Default. The most legible, most identifiable, most ownable.
//   B) <HeroDecree />    — a single rotating decree word ("ROAR", "REIGN",
//      "UNDENIABLE", "SOVEREIGN") at viewport-filling scale. Most kinetic.
//   C) <HeroMonogram />  — an architectural "L" etched as one continuous
//      stroke with a crown bar accent and Lacquer Red period.
//      Most heraldic, most reductive.
//
// All three are restrained, on-brand, and free of mascots/sparkles/parallax.
// ─────────────────────────────────────────────────────────────────────────────
import { HeroWordmark } from "@/components/ui/HeroWordmark";
// import { HeroDecree } from "@/components/ui/HeroDecree";
// import { HeroMonogram } from "@/components/ui/HeroMonogram";

const TOP_ITEMS = ["FREE TIME", "BRAND SUCCESS", "TRUSTED REPUTATION"];
const BOTTOM_ITEMS = ["IMPROVED PRESENCE", "MORE SALES", "PREMIUM IMAGE"];
const SEP = " • ";

function MarqueeRow({
  items,
  direction = "left",
  tweenRef,
}: {
  items: string[];
  direction?: "left" | "right";
  tweenRef?: React.MutableRefObject<gsap.core.Tween | null>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const text = items.join(SEP) + SEP;
  const xPct = direction === "left" ? -50 : 50;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const tween = gsap.fromTo(
      track,
      { xPercent: direction === "left" ? 0 : -50 },
      {
        xPercent: xPct,
        duration: 20,
        ease: "none",
        repeat: -1,
      }
    );

    if (tweenRef) tweenRef.current = tween;

    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-hidden">
      <div ref={trackRef} className="flex shrink-0 whitespace-nowrap">
        <span className="shrink-0 px-2 text-[18px] font-bold uppercase tracking-[0.15em] text-white/90 md:text-[22px]">
          {text}
        </span>
        <span className="shrink-0 px-2 text-[18px] font-bold uppercase tracking-[0.15em] text-white/90 md:text-[22px]">
          {text}
        </span>
      </div>
    </div>
  );
}

export default function HeroLion() {
  const topTweenRef = useRef<gsap.core.Tween | null>(null);
  const bottomTweenRef = useRef<gsap.core.Tween | null>(null);

  // Boost marquee speed on scroll via Lenis velocity
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onScroll = (e: any) => {
      const velocity = Math.abs(e?.velocity ?? 0);
      const scale = 1 + Math.min(velocity * 0.003, 4);
      if (topTweenRef.current) topTweenRef.current.timeScale(scale);
      if (bottomTweenRef.current) bottomTweenRef.current.timeScale(scale);

      // Decay back to normal speed
      gsap.to([topTweenRef.current, bottomTweenRef.current], {
        timeScale: 1,
        duration: 0.8,
        ease: "power2.out",
        overwrite: true,
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative flex min-h-[80vh] flex-col overflow-hidden md:min-h-screen">
      {/* Hero centerpiece — see the variation guide above. */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 md:px-6">
        <HeroWordmark />
        {/* <HeroDecree /> */}
        {/* <HeroMonogram /> */}
      </div>

      {/* Bottom Marquees */}
      <div className="relative z-10 flex flex-col gap-2 pb-10 md:pb-16">
        <MarqueeRow items={TOP_ITEMS} direction="left" tweenRef={topTweenRef} />
        <MarqueeRow
          items={BOTTOM_ITEMS}
          direction="right"
          tweenRef={bottomTweenRef}
        />
      </div>
    </section>
  );
}
