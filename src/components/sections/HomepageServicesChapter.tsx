"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type WheelEvent,
} from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";
import { getWhatsAppUrl } from "@/lib/contact";
import { useNovaStore } from "@/lib/stores/nova-store";

const C =
  "https://res.cloudinary.com/dgio9uutc/image/upload/f_auto,q_auto,w_1400,c_fill,g_auto";

const SHOWCASE_IMAGES = [
  `${C}/v1775277351/1_1_bv3shm.avif`,
  `${C}/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif`,
  `${C}/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif`,
  `${C}/v1775277351/Thumb_2_p6ksrb.avif`,
  `${C}/v1775277352/Frame_1_zhyago.avif`,
  `${C}/v1775277350/image_19_rnwg8w.avif`,
];

const SERVICE_MEDIA = {
  branding: [
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788597999/file_000000001c9c81fb8bd4a06f71a06689_bvbs1u.png",
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788597999/file_00000000ab1481fb8dd9ba5c71e1aaca_rrkxkm.png",
  ],
  web: [
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788597999/file_00000000e45c81fba7af87e8b7a51816_up2a1x.png",
  ],
  "content-studio": [
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788598000/file_00000000f8dc81fbbe335744557355d8_ubjo6l.png",
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788597999/file_00000000bf3881fb942a5a0baa94d39e_s6i9nr.png",
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788632076/file_00000000d10481fb9c86e5f71d0fd0ff_panutn.png",
  ],
  print: [
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788597999/file_00000000e62081fbbcea8b364c3f054a_kbfw2s.png",
  ],
  "smart-systems": [
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788598000/file_00000000225c81fb91564ecf983dbedc_bwkdxw.png",
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788597999/file_000000002cdc81fbad91bd28dfba9b26_izxq37.png",
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788597999/file_00000000dc1481fb842d017383dbdf50_r7nbvn.png",
  ],
  growth: [
    "https://res.cloudinary.com/dgio9uutc/image/upload/v1788597998/file_00000000a83881fb9a5978fa38c01c44_joinmm.png",
  ],
} as const;

const SERVICE_META = [
  { id: "branding", number: "01", short: "Brand" },
  { id: "web", number: "02", short: "Web" },
  { id: "content-studio", number: "03", short: "Content" },
  { id: "print", number: "04", short: "Print" },
  { id: "smart-systems", number: "05", short: "Systems" },
  { id: "growth", number: "06", short: "Growth" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;
const INTRO_END = 0.055;
const SERVICE_START = 0.07;
const SERVICE_END = 0.64;
const PARTNERSHIP_START = 0.645;
const PARTNERSHIP_PEAK = 0.735;
const COPY_FADE_START = 0.79;
const COPY_END = 0.825;
const MORPH_START = 0.835;
const LOGO_START = 0.885;
const STREAM_START = 0.9;
const WHY_US_START = 0.94;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function ServiceMediaCarousel({
  images,
  alt,
}: {
  images: readonly string[];
  alt: string;
}) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const canSwipe = images.length > 1;
  const currentImage = images[mediaIndex] ?? images[0];

  if (!currentImage) return null;

  const move = (direction: 1 | -1) => {
    if (!canSwipe) return;
    setMediaIndex((current) =>
      (current + direction + images.length) % images.length,
    );
  };

  return (
    <motion.div
      drag={canSwipe ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.055}
      dragMomentum={false}
      dragDirectionLock
      dragPropagation={false}
      onPointerDown={(event) => event.stopPropagation()}
      onDragEnd={(_, info) => {
        if (!canSwipe || Math.abs(info.offset.x) < 42) return;
        move(info.offset.x < 0 ? 1 : -1);
      }}
      style={{ touchAction: "pan-y", cursor: canSwipe ? "grab" : "default" }}
      className="relative h-full w-full select-none"
      role={canSwipe ? "group" : undefined}
      aria-label={canSwipe ? `${alt} media gallery` : undefined}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, x: 14, scale: 1.012 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -14, scale: 0.994 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="absolute inset-0"
        >
          <Image
            src={currentImage}
            alt={alt}
            fill
            loading="lazy"
            decoding="async"
            draggable={false}
            sizes="(max-width: 1023px) 94vw, 30vw"
            className="pointer-events-none object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default function HomepageServicesChapter() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion() ?? false;
  const openNova = useNovaStore((state) => state.openNova);
  const chapterRef = useRef<HTMLElement>(null);
  const wheelLockRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const services = SERVICE_META.map((meta, index) => ({
    ...meta,
    title: t.services.items[index]?.title ?? "",
    description: t.services.items[index]?.description ?? "",
    deliverables:
      (t.services.items[index]?.deliverables as readonly string[] | undefined) ?? [],
    image: SHOWCASE_IMAGES[index % SHOWCASE_IMAGES.length],
    media: SERVICE_MEDIA[meta.id],
  }));

  const activeService = services[activeIndex] ?? services[0];
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.022, 0.048, INTRO_END],
    [1, 1, 0.18, 0],
  );
  const introY = useTransform(scrollYProgress, [0, INTRO_END], [0, -34]);

  const serviceOpacity = useTransform(
    scrollYProgress,
    [INTRO_END, SERVICE_START, SERVICE_END, PARTNERSHIP_START + 0.028],
    [0, 1, 1, 0],
  );
  const serviceY = useTransform(
    scrollYProgress,
    [SERVICE_END - 0.012, PARTNERSHIP_START + 0.035],
    [0, -18],
  );

  const circleOpacity = useTransform(
    scrollYProgress,
    [PARTNERSHIP_START - 0.012, PARTNERSHIP_START + 0.022, 1],
    [0, 1, 1],
  );
  const circleScale = useTransform(
    scrollYProgress,
    [PARTNERSHIP_START, PARTNERSHIP_PEAK, MORPH_START, 0.95, 1],
    [0.42, 1, 1, 0.29, 0.21],
  );
  const circleShadow = useTransform(
    scrollYProgress,
    [PARTNERSHIP_START, PARTNERSHIP_PEAK, 0.94],
    [0.22, 0.6, 0.28],
  );
  const partnershipCopyOpacity = useTransform(
    scrollYProgress,
    [PARTNERSHIP_START + 0.018, PARTNERSHIP_START + 0.06, COPY_FADE_START, COPY_END],
    [0, 1, 1, 0],
  );
  const partnershipCopyScale = useTransform(
    scrollYProgress,
    [PARTNERSHIP_START + 0.018, PARTNERSHIP_PEAK, COPY_END],
    [0.97, 1, 0.985],
  );

  const logoOpacity = useTransform(
    scrollYProgress,
    [LOGO_START - 0.018, LOGO_START, LOGO_START + 0.035, 1],
    [0, 0, 1, 1],
  );
  const streamOpacity = useTransform(
    scrollYProgress,
    [STREAM_START, STREAM_START + 0.035, 1],
    [0, 1, 1],
  );
  const streamScale = useTransform(
    scrollYProgress,
    [STREAM_START, 1],
    [0.975, 1.015],
  );
  const whyUsOpacity = useTransform(
    scrollYProgress,
    [WHY_US_START, WHY_US_START + 0.03, 1],
    [0, 1, 1],
  );
  const whyUsY = useTransform(
    scrollYProgress,
    [WHY_US_START, 0.985],
    [34, 0],
  );

  const selectorOpacity = useTransform(
    scrollYProgress,
    [SERVICE_START - 0.012, SERVICE_START + 0.022, SERVICE_END - 0.016, PARTNERSHIP_START + 0.02],
    [0, 1, 1, 0],
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value < SERVICE_START) {
      setActiveIndex((current) => (current === 0 ? current : 0));
      return;
    }

    const normalized = clamp(
      (value - SERVICE_START) / (SERVICE_END - SERVICE_START),
      0,
      0.999,
    );
    const next = Math.min(
      services.length - 1,
      Math.floor(normalized * services.length),
    );
    setActiveIndex((current) => (current === next ? current : next));
  });

  const goToService = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const element = chapterRef.current;
      if (!element) return;
      const next = clamp(index, 0, services.length - 1);
      const sectionTop = element.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, element.offsetHeight - window.innerHeight);
      const ratio = (next + 0.5) / services.length;
      const targetProgress = SERVICE_START + ratio * (SERVICE_END - SERVICE_START);
      window.scrollTo({ top: sectionTop + travel * targetProgress, behavior });
    },
    [services.length],
  );

  const goToPartnership = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const element = chapterRef.current;
      if (!element) return;
      const sectionTop = element.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, element.offsetHeight - window.innerHeight);
      window.scrollTo({
        top: sectionTop + travel * (PARTNERSHIP_START + 0.05),
        behavior,
      });
    },
    [],
  );

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.08;
    if (!horizontalIntent || Math.abs(event.deltaX) < 10) return;
    event.preventDefault();
    const now = performance.now();
    if (now - wheelLockRef.current < 260) return;
    wheelLockRef.current = now;
    goToService(activeIndex + (event.deltaX > 0 ? 1 : -1));
  };

  const handleKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (activeIndex === services.length - 1) goToPartnership();
      else goToService(activeIndex + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToService(activeIndex - 1);
    }
  };

  if (reduceMotion) {
    return (
      <section
        id="services"
        data-art-directed="light"
        className="overflow-hidden bg-bg-surface-light text-[#111111]"
      >
        <div className="mx-auto max-w-[1280px] px-5 py-20 text-center sm:px-8 lg:py-28">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red">
            {t.services.eyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-[10ch] font-clash text-[clamp(3rem,9vw,7rem)] font-semibold uppercase leading-[0.84] tracking-[-0.055em]">
            {t.services.heading}{" "}
            <span className="text-brand-red">{t.services.headingAccent}</span>
          </h2>
        </div>

        <div className="mx-auto grid max-w-[1280px] gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service.id} className="bg-bg-surface-light p-7 text-center sm:p-9">
              <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-black/35">
                {service.number}
              </span>
              <h3 className="mx-auto mt-5 max-w-[13ch] font-clash text-[2.25rem] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">
                {service.title}
              </h3>
              <p className="mx-auto mt-4 max-w-[36ch] font-body text-[15px] leading-[1.65] text-black/58">
                {service.description}
              </p>
            </article>
          ))}
        </div>

        <div className="relative flex min-h-[92svh] items-center justify-center overflow-hidden px-5 py-16">
          <div className="flex aspect-square w-[152vw] shrink-0 items-center justify-center rounded-full bg-brand-red px-[19vw] text-center text-white sm:w-[124vmin] sm:px-[13vmin]">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/72">
                One Partnership
              </p>
              <h3 className="mx-auto mt-5 max-w-[13ch] font-clash text-[clamp(2.2rem,7vw,4.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.045em]">
                Your entire brand<br />Growth team
              </h3>
              <p className="mx-auto mt-6 font-body text-[14px] font-medium leading-[1.7] text-white/82 sm:text-[18px]">
                <span className="block">More visibility. More clients.</span>
                <span className="block">Less you have to manage.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface-light px-4 pb-8 text-center">
          <h2 className="font-clash text-[clamp(4.2rem,18vw,12rem)] font-bold uppercase leading-[0.8] tracking-[-0.055em] text-black/15">
            WHY US<span className="text-brand-red">?</span>
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={chapterRef}
      id="services"
      data-art-directed="light"
      className="relative isolate h-[395svh] overflow-clip bg-bg-surface-light text-[#111111] lg:h-[410vh]"
    >
      <div
        className="sticky top-0 h-svh overflow-hidden bg-bg-surface-light outline-none"
        tabIndex={0}
        role="region"
        aria-label="Explore Lionovart expertise"
        onWheel={handleWheel}
        onKeyDown={handleKeys}
        style={{ overscrollBehaviorX: "contain" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_76%,rgba(229,25,42,0.04),transparent_36%)]"
        />

        <motion.header
          style={{ opacity: introOpacity, y: introY }}
          className="pointer-events-none absolute inset-x-0 top-1/2 z-30 mx-auto -translate-y-1/2 px-5 text-center sm:px-8"
        >
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-brand-red sm:text-[11px]">
            {t.services.eyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-[10ch] font-clash text-[clamp(3.2rem,10vw,7.4rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">
            {t.services.heading}{" "}
            <span className="text-brand-red">{t.services.headingAccent}</span>
          </h2>
        </motion.header>

        <motion.div
          style={{ opacity: serviceOpacity, y: serviceY }}
          className="absolute inset-0 z-20"
        >
          <span className="sr-only" aria-live="polite">{activeService.title}</span>

          <div className="absolute inset-x-0 bottom-[10.5svh] top-[4.5svh] mx-auto max-w-[1500px] px-4 sm:px-8 lg:bottom-[12vh] lg:top-[9vh] lg:px-12">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.03}
              dragMomentum={false}
              dragDirectionLock
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) < 44) return;
                goToService(activeIndex + (info.offset.x < 0 ? 1 : -1));
              }}
              style={{ touchAction: "pan-y" }}
              className="grid h-full grid-cols-1 grid-rows-[minmax(13rem,32svh)_auto] content-center items-center gap-4 sm:grid-rows-[minmax(14rem,34svh)_auto] sm:gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(28rem,1.28fr)_minmax(0,0.82fr)] lg:grid-rows-1 lg:gap-[clamp(1.5rem,3vw,4rem)]"
            >
              <div className="relative order-1 h-full min-h-0 overflow-hidden rounded-[1.15rem] border border-black/[0.07] bg-black/[0.04] shadow-[0_24px_62px_-42px_rgba(0,0,0,0.34)] lg:h-auto lg:aspect-[4/3] lg:rounded-[1.55rem]">
                <ServiceMediaCarousel
                  key={activeService.id}
                  images={activeService.media}
                  alt={`${activeService.title} service visual`}
                />
              </div>

              <div className="order-2 flex min-w-0 flex-col justify-center text-center">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.26, ease: EASE }}
                  >
                    <h3 className="mx-auto max-w-[13ch] font-clash text-[clamp(2.15rem,8.6vw,3.75rem)] font-semibold uppercase leading-[0.86] tracking-[-0.052em] sm:text-[clamp(2.45rem,7.5vw,4.5rem)] lg:max-w-[11ch] lg:text-[clamp(3.2rem,5vw,6.2rem)]">
                      {activeService.title}
                    </h3>
                    <p className="mx-auto mt-3 max-w-[36ch] font-body text-[13px] font-medium leading-[1.52] text-black/60 sm:mt-4 sm:text-[15px] lg:mt-5 lg:max-w-[38ch] lg:text-[18px] lg:leading-[1.62]">
                      {activeService.description}
                    </p>
                    <div className="mx-auto mt-4 flex max-h-[4.6rem] max-w-[38rem] flex-wrap justify-center gap-1.5 overflow-hidden sm:mt-5 sm:max-h-none sm:gap-2 lg:mt-6 lg:max-w-[40rem]">
                      {activeService.deliverables.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-black/[0.09] bg-white/32 px-2.5 py-1.5 font-mono text-[7.5px] font-bold uppercase tracking-[0.09em] text-black/46 sm:px-3 sm:text-[8.5px] lg:text-[9px]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="relative order-3 hidden aspect-[4/3] overflow-hidden rounded-[1.55rem] border border-black/[0.07] bg-black/[0.04] shadow-[0_28px_72px_-42px_rgba(0,0,0,0.3)] lg:block">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={activeService.image}
                    initial={{ opacity: 0, scale: 1.018 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeService.image}
                      alt={`${activeService.title} selected work`}
                      fill
                      loading="lazy"
                      sizes="30vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />
                <div className="absolute bottom-5 left-5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white drop-shadow-md">
                  Selected work / {activeService.short}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.nav
          style={{ opacity: selectorOpacity }}
          aria-label="Services"
          className="absolute bottom-[3.2svh] left-1/2 z-40 w-fit max-w-[calc(100vw-1rem)] -translate-x-1/2 sm:bottom-[4vh]"
        >
          <div className="relative flex items-center justify-center gap-0.5 overflow-hidden rounded-full border border-white/55 bg-white/[0.2] p-1 shadow-[0_16px_42px_-28px_rgba(20,20,20,0.42),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.2)] backdrop-blur-[26px] backdrop-saturate-200 sm:gap-1 sm:p-1.5">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_-35%,rgba(255,255,255,0.72),transparent_42%),linear-gradient(145deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]"
            />
            {services.map((service, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => goToService(index)}
                  className={`relative z-10 flex h-8 min-w-8 items-center justify-center rounded-full px-2 font-mono text-[7.5px] font-bold uppercase tracking-[0.09em] transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/35 sm:h-9 sm:min-w-9 sm:px-3 sm:text-[8.5px] ${
                    selected
                      ? "scale-[1.015] bg-white/70 text-black shadow-[0_7px_18px_-13px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.96)] ring-1 ring-white/80"
                      : "text-black/46 hover:bg-white/24 hover:text-black/72"
                  }`}
                >
                  <span className="hidden sm:inline">{service.short}</span>
                  <span className="sm:hidden">{service.number}</span>
                </button>
              );
            })}
            <button
              type="button"
              aria-label="One Partnership"
              onClick={() => goToPartnership()}
              className="relative z-10 flex h-8 min-w-8 items-center justify-center rounded-full px-2 font-mono text-[7.5px] font-bold uppercase tracking-[0.09em] text-black/46 transition hover:bg-white/24 hover:text-black/72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/35 sm:h-9 sm:min-w-9 sm:px-3 sm:text-[8.5px]"
            >
              <span className="hidden sm:inline">All</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </motion.nav>

        <motion.div
          style={{ opacity: streamOpacity, scale: streamScale }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[48%] z-10 -translate-y-1/2 transform-gpu"
        >
          <ImageStreamHero
            images={SHOWCASE_IMAGES.map((src, index) => ({
              src,
              alt: t.services.items[index]?.title ?? "Lionovart selected work",
            }))}
            cards={7}
            speed={30}
            axis={50}
            path={{
              cardWidth: 17.5,
              cardHeight: 23.5,
              birthHeight: 3.4,
              exitHeight: 40,
              railBirth: -5.5,
              railExit: 32,
              fan: 2.7,
              turnBirth: 5,
              turnExit: 23,
              stops: 18,
            }}
            className="h-[20rem] w-full overflow-visible sm:h-[27rem] lg:h-[32rem]"
          />
        </motion.div>

        <motion.div
          style={{ opacity: whyUsOpacity, y: whyUsY }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[2.4svh] z-20 overflow-hidden px-2 text-center sm:bottom-[1.5vh]"
        >
          <h2 className="whitespace-nowrap font-clash text-[clamp(4.6rem,19vw,17rem)] font-bold uppercase leading-[0.78] tracking-[-0.06em] text-black/[0.14]">
            WHY US<span className="text-brand-red">?</span>
          </h2>
        </motion.div>

        <motion.div
          style={{ opacity: circleOpacity, scale: circleScale }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-30 aspect-square w-[152vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red sm:w-[124vmin] lg:w-[128vmin] xl:w-[132vmin]"
        >
          <motion.div
            aria-hidden="true"
            style={{ opacity: circleShadow }}
            className="absolute inset-0 rounded-full shadow-[0_46px_120px_-52px_rgba(229,25,42,0.68),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-34px_90px_rgba(105,0,14,0.12)]"
          />

          <motion.div
            style={{ opacity: partnershipCopyOpacity, scale: partnershipCopyScale }}
            className="pointer-events-auto absolute inset-0 flex items-center justify-center px-[20vw] text-center text-white sm:px-[14vmin] lg:px-[13vmin]"
          >
            <div className="w-full max-w-[720px]">
              <p className="font-mono text-[8px] font-bold uppercase tracking-[0.31em] text-white/70 sm:text-[10px]">
                One Partnership
              </p>
              <h3 className="mx-auto mt-4 max-w-[13ch] font-clash text-[clamp(2.05rem,7.5vw,4.2rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] sm:mt-5 lg:text-[clamp(2.8rem,4.1vw,4.15rem)]">
                <span className="block">Your entire brand</span>
                <span className="mt-[0.1em] block">Growth team</span>
              </h3>
              <p className="mx-auto mt-4 font-body text-[12.5px] font-medium leading-[1.5] text-white/82 sm:mt-5 sm:text-[16px] lg:text-[17px]">
                <span className="block">More visibility. More clients.</span>
                <span className="mt-1 block text-white">Less you have to manage.</span>
              </p>
              <div className="mx-auto mt-5 flex max-w-[29rem] flex-row flex-wrap justify-center gap-2 sm:mt-6 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => openNova("offer", true)}
                  className="rounded-full bg-white px-5 py-2.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-brand-red shadow-[0_10px_26px_-20px_rgba(0,0,0,0.42)] transition duration-300 hover:scale-[1.012] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-red sm:px-6 sm:py-3 sm:text-[9.5px]"
                >
                  Get your free brand audit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      getWhatsAppUrl(
                        "Hi Leon — I'd like to talk about the brand & growth partnership.",
                      ),
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="rounded-full border border-white/32 bg-white/[0.07] px-5 py-2.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md transition duration-300 hover:border-white/55 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-6 sm:py-3 sm:text-[9.5px]"
                >
                  Talk to us
                </button>
              </div>
            </div>
          </motion.div>

          <motion.img
            src="/images/lionovart-icon.svg"
            alt=""
            aria-hidden="true"
            style={{ opacity: logoOpacity }}
            className="absolute inset-0 h-full w-full rounded-full object-cover"
            decoding="async"
          />
        </motion.div>
      </div>
    </section>
  );
}
