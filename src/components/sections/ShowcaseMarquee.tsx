"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const C = "https://res.cloudinary.com/dgio9uutc/image/upload/f_auto,q_auto,w_1400,c_fill,g_auto";

const SHOWCASE_IMAGES = [
  `${C}/v1775277351/1_1_bv3shm.avif`,
  `${C}/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif`,
  `${C}/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif`,
  `${C}/v1775277351/Thumb_2_p6ksrb.avif`,
  `${C}/v1775277352/Frame_1_zhyago.avif`,
  `${C}/v1775277350/image_19_rnwg8w.avif`,
];

function ShowcaseRing({ titles }: { titles: string[] }) {
  return (
    <div className="showcase-marquee__track">
      {SHOWCASE_IMAGES.map((src, index) => {
        const title = titles[index] ?? "LIONOVART showcase";

        return (
          <figure
            key={src}
            style={{ "--showcase-index": index } as CSSProperties}
            className="showcase-marquee__card group relative overflow-hidden rounded-[18px] sm:rounded-[22px]"
          >
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={src}
                alt={`${title} — selected LIONOVART work`}
                fill
                loading="lazy"
                decoding="async"
                sizes="(max-width: 639px) 92vw, (max-width: 1023px) 70vw, 48vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_32%,rgba(0,0,0,0.88)_100%)]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-4 sm:p-5">
                <span className="max-w-[24ch] font-clash text-[17px] font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-[20px] lg:text-[22px]">
                  {title}
                </span>
                <span className="shrink-0 font-mono text-[10px] font-bold tracking-[0.22em] text-brand-red sm:text-[11px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </figcaption>
            </div>
          </figure>
        );
      })}
    </div>
  );
}

export default function ShowcaseMarquee() {
  const { t } = useLanguage();
  const titles = t.services.items.map((item) => item.title);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let isNearViewport = false;
    const syncAnimation = () => {
      viewport.dataset.active = String(
        isNearViewport && document.visibilityState === "visible",
      );
    };

    if (!("IntersectionObserver" in window)) {
      isNearViewport = true;
      syncAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry.isIntersecting;
        syncAnimation();
      },
      { rootMargin: "320px 0px", threshold: 0 },
    );

    observer.observe(viewport);
    document.addEventListener("visibilitychange", syncAnimation);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
    };
  }, []);

  return (
    <section
      id="showcase"
      aria-labelledby="showcase-title"
      data-art-directed="light"
      className="showcase-marquee__section relative overflow-hidden bg-bg-surface-light py-16 text-[#111111] sm:py-20 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,25,42,0.12),transparent_38%)]"
      />

      <header className="relative z-10 mx-auto mb-10 flex max-w-[1280px] flex-col gap-5 px-5 sm:mb-12 sm:px-8 lg:mb-16 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div>
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red sm:text-[11px]">
            {t.showcase.eyebrow}
          </p>
          <h2
            id="showcase-title"
            className="max-w-[12ch] font-clash text-[clamp(2.65rem,11vw,5.8rem)] font-semibold uppercase leading-[0.86] tracking-[-0.045em]"
          >
            {t.showcase.heading}
          </h2>
        </div>
        <p className="max-w-[38ch] font-body text-[14px] leading-[1.65] text-black/55 sm:text-[16px] lg:pb-1">
          {t.showcase.description}
        </p>
      </header>

      <div
        ref={viewportRef}
        data-active="false"
        className="showcase-marquee__viewport relative z-10"
        role="region"
        tabIndex={0}
        aria-label={t.showcase.eyebrow}
      >
        <ShowcaseRing titles={titles} />
      </div>

      <div className="relative z-10 mx-auto mt-8 flex max-w-[1280px] items-center gap-4 px-5 sm:px-8 lg:px-12">
        <span className="h-px flex-1 bg-black/10" />
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-black/40">
          LIONOVART / SELECTED WORK
        </span>
      </div>
    </section>
  );
}
