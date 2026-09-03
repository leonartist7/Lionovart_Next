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

/** The canonical emotional close. Video is poster-only on mobile and auto-pauses offscreen. */
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
      className="relative overflow-hidden bg-[#0a0a0a] px-6 pb-16 pt-28 text-center text-white md:pb-20 md:pt-36"
    >
      <VideoBackdrop
        src={FOOTER_CLIP}
        className="absolute inset-0 z-0"
        overlayClassName="bg-black/70"
      />

      <div className="relative z-40 mx-auto flex max-w-[1280px] flex-col items-center gap-8 md:gap-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red md:text-[13px]">
          One partnership — fully done for you
        </p>

        <div className="w-full">
          <HeroCycling
            staticText={t.hero.staticText}
            words={words}
            fontSize="clamp(2.6rem, 9.5vw, 7rem)"
            cyclingFontSize="clamp(3.2rem, 12.5vw, 9.5rem)"
            imageFontSize="clamp(2.86rem, 10.45vw, 7.7rem)"
          />
        </div>

        <p className="max-w-[46ch] font-body text-[15px] leading-[1.6] text-white/70 md:text-[18px]">
          Brand, web, content, AI and print — built and run for you.
        </p>

        <div className="mt-2 flex items-center gap-5">
          {crest && <BrandCrest className="h-12 w-auto md:h-14" />}
          <TrailAttractionTarget>
            <LiquidMetalButton
              label="Start your brand"
              width={220}
              onClick={() => openNova("offer", true)}
            />
          </TrailAttractionTarget>
        </div>
      </div>
    </section>
  );
}
