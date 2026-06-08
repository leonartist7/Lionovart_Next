"use client";

import HeroCycling, { type Word } from "@/components/sections/HeroCycling";
import HeroEmailCapture from "@/components/ui/HeroEmailCapture";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * ClosingCTA — the page's final ask. Dark cinematic close that reuses the
 * kinetic cycling-words headline + the hero email-capture pill so the visitor
 * converts at the bottom (mirrors the hero promise).
 */
export default function ClosingCTA() {
  const { t } = useLanguage();
  const words: Word[] = (t.hero.cyclingWords || []).map((c: string) => ({
    content: c,
    color: "text-brand-red",
    type: "text" as const,
  }));

  return (
    <section
      id="closing-cta"
      className="relative bg-[#0a0a0a] text-white overflow-hidden px-6 py-24 md:py-32 text-center"
    >
      {/* Soft red glow, low */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(229,25,42,0.12) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 mx-auto flex max-w-[1000px] flex-col items-center gap-8 md:gap-10">
        <p className="text-brand-red text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em]">
          One partnership — fully done for you
        </p>

        <div className="w-full">
          <HeroCycling
            staticText={t.hero.staticText}
            words={words}
            fontSize="clamp(1.9rem, 6.5vw, 4.5rem)"
            cyclingFontSize="clamp(2.3rem, 9vw, 6rem)"
            forceAnimate
          />
        </div>

        <p className="font-body text-[15px] md:text-[18px] leading-[1.6] text-white/65 max-w-[46ch]">
          Brand, web, content, AI and print — built and run for you. Start with a
          free brand audit.
        </p>

        <div className="w-full">
          <HeroEmailCapture />
        </div>
      </div>
    </section>
  );
}
