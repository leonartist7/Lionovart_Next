"use client";

import HeroCycling, { type Word } from "@/components/sections/HeroCycling";
import VideoBackdrop from "@/components/ui/VideoBackdrop";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { useNovaStore } from "@/lib/stores/nova-store";
import { useLanguage } from "@/contexts/LanguageContext";
import BrandCrest from "@/components/sections/services/brand/branding/BrandCrest";
import TrailAttractionTarget from "@/components/ui/TrailAttractionTarget";
import { EN_WORD_ART } from "@/lib/word-art";

const FOOTER_CLIP =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto:eco/v1779845599/Footage_02_chsoa3.mp4";

/** Compact emotional close. Video remains progressive and auto-pauses offscreen. */
export default function ClosingCTA({ crest = false }: { crest?: boolean }) {
  const { t, locale } = useLanguage();
  const openNova = useNovaStore((state) => state.openNova);
  const closingWordStrings = [
    t.hero.cyclingWords?.[0],
    t.hero.cyclingWords?.[3],
    t.hero.cyclingWords?.[5],
  ].filter(Boolean) as string[];

  const words: Word[] =
    locale === "en"
      ? EN_WORD_ART
      : closingWordStrings.map((content) => ({ content, type: "text" as const }));

  return (
    <section
      id="closing-cta"
      className="relative overflow-hidden bg-[#0a0a0a] px-5 pb-12 pt-20 text-center text-white sm:px-6 sm:pb-14 sm:pt-24 md:pb-16 md:pt-24 lg:pt-28"
    >
      <VideoBackdrop
        src={FOOTER_CLIP}
        className="absolute inset-0 z-0"
        overlayClassName="bg-black/70"
      />

      <div className="relative z-40 mx-auto flex max-w-[1120px] flex-col items-center gap-6 sm:gap-7 md:gap-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red sm:text-[11px] md:text-[12px]">
          One partnership — fully done for you
        </p>

        <div className="w-full">
          <HeroCycling
            staticText={t.hero.staticText}
            words={words}
            fontSize="clamp(2.2rem, 7.5vw, 5.4rem)"
            cyclingFontSize="clamp(2.75rem, 9.5vw, 7.1rem)"
            imageFontSize="clamp(2.5rem, 8.4vw, 6.25rem)"
          />
        </div>

        <p className="max-w-[44ch] font-body text-[14px] leading-[1.55] text-white/70 sm:text-[15px] md:text-[16px]">
          Brand, web, content, AI and print — built and run for you.
        </p>

        <div className="flex items-center gap-4 sm:gap-5">
          {crest && <BrandCrest className="h-11 w-auto md:h-12" />}
          <TrailAttractionTarget>
            <LiquidMetalButton
              label="Start your brand"
              width={210}
              onClick={() => openNova("offer", true)}
            />
          </TrailAttractionTarget>
        </div>
      </div>
    </section>
  );
}
