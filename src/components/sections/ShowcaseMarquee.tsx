"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const SpatialBrandWorld = dynamic(() => import("@/components/sections/SpatialBrandWorld"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[26rem] items-center justify-center bg-[#050505] font-mono text-[9px] uppercase tracking-[0.22em] text-white/35 sm:h-[32rem] lg:h-[38rem]">
      Entering brand world…
    </div>
  ),
});

const C = "https://res.cloudinary.com/dgio9uutc/image/upload/f_auto,q_auto,w_1400,c_fill,g_auto";

const SHOWCASE_IMAGES = [
  `${C}/v1775277351/1_1_bv3shm.avif`,
  `${C}/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif`,
  `${C}/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif`,
  `${C}/v1775277351/Thumb_2_p6ksrb.avif`,
  `${C}/v1775277352/Frame_1_zhyago.avif`,
  `${C}/v1775277350/image_19_rnwg8w.avif`,
];

export default function ShowcaseMarquee() {
  const { t } = useLanguage();
  const titles = t.services.items.map((item) => item.title);
  const [direction, setDirection] = useState<"stream" | "spatial">("stream");
  const spatial = direction === "spatial";

  return (
    <section
      id="showcase"
      aria-labelledby="showcase-title"
      data-art-directed={spatial ? "dark" : "light"}
      data-showcase-direction={direction}
      className={`relative z-10 overflow-visible transition-colors duration-700 ${
        spatial
          ? "bg-[#050505] text-white"
          : "bg-bg-surface-light text-[#111111]"
      }`}
    >
      <header className="relative z-20 mx-auto flex max-w-[1280px] flex-col gap-5 px-5 pb-5 pt-12 sm:px-8 sm:pb-7 sm:pt-16 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-8 lg:pt-20">
        <div>
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red sm:text-[11px]">
            {t.showcase.eyebrow}
          </p>
          <button
            type="button"
            onClick={() => setDirection((current) => (current === "stream" ? "spatial" : "stream"))}
            className="group block max-w-[12ch] cursor-default text-left outline-none focus-visible:ring-1 focus-visible:ring-brand-red/70 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
            aria-label={`Switch showcase direction. Current direction: ${direction}`}
            title=""
          >
            <h2
              id="showcase-title"
              className={`font-clash text-[clamp(2.65rem,11vw,5.8rem)] font-semibold uppercase leading-[0.86] tracking-[-0.045em] transition-colors duration-500 ${
                spatial ? "text-white" : "text-[#111111]"
              }`}
              style={{ wordSpacing: "0.22em" }}
            >
              {t.showcase.heading}
            </h2>
          </button>
        </div>
        <p
          className={`max-w-[38ch] font-body text-[14px] leading-[1.65] transition-colors duration-500 sm:text-[16px] lg:pb-1 ${
            spatial ? "text-white/50" : "text-black/55"
          }`}
        >
          {spatial
            ? "Follow the signal from raw idea to complete brand world. Scroll through the system, then isolate each discipline."
            : t.showcase.description}
        </p>
      </header>

      <span className="sr-only" aria-live="polite">
        Showcase direction changed to {direction}.
      </span>

      {spatial ? (
        <SpatialBrandWorld />
      ) : (
        <ImageStreamHero
          images={SHOWCASE_IMAGES.map((src, index) => ({
            src,
            alt: titles[index] ?? "LIONOVART showcase",
          }))}
          cards={8}
          speed={38}
          axis={50}
          className="relative z-10 h-[18rem] w-full overflow-visible sm:h-[24rem] lg:h-[30rem]"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
            <img
              src="/images/lionovart-icon.svg"
              alt="Lionovart emblem"
              className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24 lg:h-28 lg:w-28"
              decoding="async"
            />
          </div>
        </ImageStreamHero>
      )}
    </section>
  );
}
