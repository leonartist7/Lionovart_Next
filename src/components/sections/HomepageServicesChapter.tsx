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
const INTRO_END = 0.105;
const SERVICE_START = 0.09;
const SERVICE_END = 0.685;
const PARTNERSHIP_START = 0.69;
const PARTNERSHIP_PEAK = 0.79;
const MORPH_START = 0.855;
const STREAM_START = 0.885;

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

  const introOpacity = useTransform(scrollYProgress, [0, 0.055, INTRO_END], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, INTRO_END], [0, -42]);

  const serviceOpacity = useTransform(
    scrollYProgress,
    [0.055, SERVICE_START, SERVICE_END, PARTNERSHIP_START + 0.035],
    [0, 1, 1, 0],
  );
  const serviceY = useTransform(
    scrollYProgress,
    [SERVICE_END - 0.015, PARTNERSHIP_START + 0.04],
    [0, -22],
  );

  const circleOpacity = useTransform(
    scrollYProgress,
    [PARTNERSHIP_START - 0.012, PARTNERSHIP_START + 0.025, 0.985, 1],
    [0, 1, 1, 0],
  );
  const circleScale = useTransform(
    scrollYProgress,
    [PARTNERSHIP_START, PARTNERSHIP_PEAK, MORPH_START, 0.955],
    [0.46, 1, 1, 0.105],
  );
  const circleShadow = useTransform(
    scrollYProgress,
    [PARTNERSHIP_START, PARTNERSHIP_PEAK, 0.94],
    [0.28, 0.66, 0.34],
  );
  const partnershipCopyOpacity = useTransform(
    scrollYProgress,
    [PARTNERSHIP_START + 0.025, PARTNERSHIP_START + 0.075, MORPH_START - 0.018, MORPH_START + 0.032],
    [0, 1, 1, 0],
  );
  const partnershipCopyScale = useTransform(
    scrollYProgress,
    [PARTNERSHIP_START + 0.02, PARTNERSHIP_PEAK, MORPH_START],
    [0.96, 1, 0.985],
  );

  const logoOpacity = useTransform(
    scrollYProgress,
    [MORPH_START - 0.005, MORPH_START + 0.045, 1],
    [0, 1, 1],
  );
  const streamOpacity = useTransform(
    scrollYProgress,
    [STREAM_START, STREAM_START + 0.05, 1],
    [0, 1, 1],
  );
  const streamScale = useTransform(
    scrollYProgress,
    [STREAM_START, 1],
    [0.96, 1.02],
  );

  const selectorOpacity = useTransform(
    scrollYProgress,
    [SERVICE_START - 0.01, SERVICE_START + 0.025, SERVICE_END - 0.015, PARTNERSHIP_START + 0.035],
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
        top: sectionTop + travel * (PARTNERSHIP_START + 0.055),
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
      <section id="services" data-art-directed="light" className="overflow-hidden bg-bg-surface-light text-[#111111]">
        <div className="mx-auto max-w-[1280px] px-5 py-20 text-center sm:px-8 lg:py-28">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red">
            {t.services.eyebrow}
          </p>
          <h2 className="mx-auto mt-4 max-w-[10ch] font-clash text-[clamp(3rem,9vw,7rem)] font-semibold uppercase leading-[0.84] tracking-[-0.055em]">
            {t.services.heading} <span className="text-brand-red">{t.services.headingAccent}</span>
          </h2>
        </div>

        <div className="mx-auto grid max-w-[1280px] gap-px border-y border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-20">
          <div className="flex aspect-square w-[146vw] shrink-0 items-center justify-center rounded-full bg-brand-red px-[18vw] text-center text-white sm:w-[112vmin] sm:px-[12vmin]">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/72">One Partnership</p>
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
      </section>
    );
  }

  return (
    <section
      ref={chapterRef}
      id="services"
      data-art-directed="light"
      className="relative isolate h-[455svh] overflow-clip bg-bg-surface-light text-[#111111] lg:h-[475vh]"
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
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_76%,rgba(229,25,42,0.045),transparent_36%)]" />

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

          <div className="absolute inset-x-0 top-[8svh] mx-auto h-[74svh] max-w-[1500px] px-5 sm:px-8 lg:top-[10vh] lg:h-[71vh] lg:px-12">
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
              className="grid h-full grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(28rem,1.28fr)_minmax(0,0.82fr)] lg:gap-[clamp(1.5rem,3vw,4rem)]"
            >
              <div className="relative order-1 h-[29svh] min-h-[12rem] overflow-hidden rounded-[1.2rem] border border-black/8 bg-black/5 shadow-[0_28px_72px_-42px_rgba(0,0,0,0.38)] sm:h-[32svh] lg:h-auto lg:min-h-0 lg:aspect-[4/3] lg:rounded-[1.55rem]">
                <ServiceMediaCarousel
                  key={activeService.id}
                  images={activeService.media}
                  alt={`${activeService.title} service visual`}
                />
              </div>

              <div className="order-2 flex min-w-0 flex-col justify-center py-1 text-center">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.26, ease: EASE }}
                  >
                    <h3 className="mx-auto max-w-[13ch] font-clash text-[clamp(2.7rem,9vw,5.4rem)] font-semibold uppercase leading-[0.84] tracking-[-0.055em] lg:max-w-[11ch] lg:text-[clamp(3.2rem,5vw,6.2rem)]">
                      {activeService.title}
                    </h3>
                    <p className="mx-auto mt-5 max-w-[38ch] font-body text-[15px] font-medium leading-[1.62] text-black/62 sm:text-[17px] lg:text-[18px]">
                      {activeService.description}
                    </p>
                    <div className="mx-auto mt-6 flex max-w-[40rem] flex-wrap justify-center gap-2">
                      {activeService.deliverables.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-black/10 bg-white/24 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-black/48 sm:text-[9px]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="relative order-3 hidden aspect-[4/3] overflow-hidden rounded-[1.55rem] border border-black/8 bg-black/5 shadow-[0_28px_72px_-42px_rgba(0,0,0,0.34)] lg:block">
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
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/35" />
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
          className="absolute inset-x-0 bottom-[4.5svh] z-40 mx-auto max-w-[min(94vw,860px)] px-2 sm:bottom-[5vh]"
        >
          <div className="relative flex items-center justify-center gap-1 overflow-hidden rounded-full border border-white/65 bg-[radial-gradient(circle_at_18%_-20%,rgba(255,255,255,0.82),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.5),rgba(255,255,255,0.17))] p-1.5 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-[14px] backdrop-saturate-150 sm:gap-1.5 sm:p-1.5 sm:backdrop-blur-[18px]">
            {services.map((service, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => goToService(index)}
                  className={`relative flex h-9 min-w-9 items-center justify-center rounded-full border border-transparent px-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.1em] transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/45 focus-visible:ring-offset-1 sm:h-10 sm:min-w-10 sm:px-3.5 sm:text-[9px] ${
                    selected
                      ? "scale-[1.02] bg-white/78 text-black shadow-[0_8px_22px_-14px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.96)] ring-1 ring-white/80"
                      : "bg-white/0 text-black/44 hover:bg-white/30 hover:text-black/70"
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
              className="relative flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-black/44 transition hover:bg-white/30 hover:text-black/70 sm:h-10 sm:px-3.5 sm:text-[9px]"
            >
              <span className="hidden sm:inline">All</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </motion.nav>

        <motion.div
          style={{ opacity: streamOpacity, scale: streamScale }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 transform-gpu"
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
          style={{ opacity: circleOpacity, scale: circleScale }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-30 aspect-square w-[146vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red sm:w-[118vmin] lg:w-[114vmin] xl:w-[118vmin]"
        >
          <motion.div
            aria-hidden="true"
            style={{ opacity: circleShadow }}
            className="absolute inset-0 rounded-full shadow-[0_46px_120px_-52px_rgba(229,25,42,0.72),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-34px_90px_rgba(105,0,14,0.14)]"
          />

          <motion.div
            style={{ opacity: partnershipCopyOpacity, scale: partnershipCopyScale }}
            className="pointer-events-auto absolute inset-0 flex items-center justify-center px-[18vw] text-center text-white sm:px-[13vmin] lg:px-[12vmin]"
          >
            <div className="w-full max-w-[760px]">
              <p className="font-mono text-[8px] font-bold uppercase tracking-[0.32em] text-white/70 sm:text-[10px]">
                One Partnership
              </p>
              <h3 className="mx-auto mt-4 max-w-[13ch] font-clash text-[clamp(2.1rem,7.8vw,4.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.042em] sm:mt-5 lg:text-[clamp(3rem,4.6vw,4.5rem)]">
                <span className="block">Your entire brand</span>
                <span className="mt-[0.12em] block">Growth team</span>
              </h3>
              <p className="mx-auto mt-5 font-body text-[13px] font-medium leading-[1.55] text-white/82 sm:mt-6 sm:text-[17px] lg:text-[18px]">
                <span className="block">More visibility. More clients.</span>
                <span className="mt-1 block text-white">Less you have to manage.</span>
              </p>
              <div className="mx-auto mt-6 flex max-w-[33rem] flex-col justify-center gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={() => openNova("offer", true)}
                  className="rounded-full bg-white px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-brand-red shadow-[0_12px_32px_-20px_rgba(0,0,0,0.45)] transition duration-300 hover:scale-[1.015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-red sm:px-7 sm:py-4 sm:text-[11px]"
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
                  className="rounded-full border border-white/34 bg-white/8 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-md transition duration-300 hover:border-white/60 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-7 sm:py-4 sm:text-[11px]"
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
