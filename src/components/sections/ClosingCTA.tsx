"use client";

import HeroCycling, { type Word } from "@/components/sections/HeroCycling";
import VideoBackdrop from "@/components/ui/VideoBackdrop";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { useNovaStore } from "@/lib/stores/nova-store";
import { useLanguage } from "@/contexts/LanguageContext";
import BrandCrest from "@/components/sections/services/brand/branding/BrandCrest";

const FOOTER_CLIP =
  "https://res.cloudinary.com/dgio9uutc/video/upload/v1779845599/Footage_02_chsoa3.mp4";

/**
 * ClosingCTA — the single, canonical page close. Cinematic video backdrop +
 * the kinetic cycling-words headline + one liquid-metal button that opens Nova.
 * Used once per page (the footer is now navigation/legal only), so pages never
 * double-close. `crest` adds the brand crest beside the button (branding page).
 */
export default function ClosingCTA({ crest = false }: { crest?: boolean }) {
  const { t } = useLanguage();
  const openNova = useNovaStore((s) => s.openNova);
  const words: Word[] = (t.hero.cyclingWords || []).map((c: string) => ({
    content: c,
    type: "text" as const,
  }));

  return (
    <section
      id="closing-cta"
      className="relative isolate overflow-hidden bg-[#0a0a0a] px-6 py-28 text-center text-white md:py-36"
    >
      <VideoBackdrop src={FOOTER_CLIP} className="absolute inset-0 z-0" overlayClassName="bg-black/70" />

      <div className="relative z-10 mx-auto flex max-w-[1000px] flex-col items-center gap-8 md:gap-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red md:text-[13px]">
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

        <p className="max-w-[46ch] font-body text-[15px] leading-[1.6] text-white/70 md:text-[18px]">
          Brand, web, content, AI and print — built and run for you.
        </p>

        <div className="mt-2 flex items-center gap-5">
          {crest && <BrandCrest className="h-12 w-auto md:h-14" />}
          <LiquidMetalButton label="Start your brand" width={220} onClick={() => openNova("offer", true)} />
        </div>
      </div>
    </section>
  );
}
