"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

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

  return (
    <section
      id="showcase"
      aria-labelledby="showcase-title"
      data-art-directed="light"
      className="relative z-10 overflow-visible bg-bg-surface-light pt-12 pb-0 text-[#111111] sm:pt-16 lg:pt-20"
    >
      <header className="relative z-20 mx-auto mb-5 flex max-w-[1280px] flex-col gap-5 px-5 sm:mb-7 sm:px-8 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div>
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red sm:text-[11px]">
            {t.showcase.eyebrow}
          </p>
          <h2
            id="showcase-title"
            className="max-w-[12ch] font-clash text-[clamp(2.65rem,11vw,5.8rem)] font-semibold uppercase leading-[0.86] tracking-[-0.045em]"
            style={{ wordSpacing: "0.22em" }}
          >
            {t.showcase.heading}
          </h2>
        </div>
        <p className="max-w-[38ch] font-body text-[14px] leading-[1.65] text-black/55 sm:text-[16px] lg:pb-1">
          {t.showcase.description}
        </p>
      </header>

      <ImageStreamHero
        images={SHOWCASE_IMAGES.map((src, index) => ({
          src,
          alt: titles[index] ?? "LIONOVART showcase",
        }))}
        cards={8}
        speed={38}
        axis={50}
        className="relative z-10 h-[18rem] w-full overflow-visible sm:h-[24rem] lg:h-[30rem]"
      />
    </section>
  );
}
