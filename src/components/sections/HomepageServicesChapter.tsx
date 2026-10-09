"use client";

import { usePublicCopy } from "@/hooks/usePublicCopy";

import ServicesCurves from "./ServicesCurves";
import { ServicesArrivalLayer } from "./ServicesArrival";
import { useServicesCarouselPreview } from "./ServicesPreview";
import styles from "./ServicesCarouselPreview.module.css";
import ServicesWorkNavigation from "./ServicesWorkNavigation";

import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,

  useScroll,
} from "framer-motion";
import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type WheelEvent,
} from "react";
import { useLanguage } from "@/contexts/LanguageContext";

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
const SERVICE_COUNT = SERVICE_META.length;

const EASE = [0.16, 1, 0.3, 1] as const;
const SERVICE_START = 0;
const SERVICE_END = 1;

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
            sizes="(max-width: 1023px) 92vw, 64svh"
            className="pointer-events-none object-contain"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default function HomepageServicesChapter() {
  const tr = usePublicCopy();
  const carouselPreview = useServicesCarouselPreview();
  const { t } = useLanguage();
  const reduceMotion = useHydratedReducedMotion() ?? false;
  const chapterRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const services = SERVICE_META.map((meta, index) => ({
    ...meta,
    title: t.services.items[index]?.title ?? "",
    description: t.services.items[index]?.description ?? "",
    deliverables:
      (t.services.items[index]?.deliverables as readonly string[] | undefined) ?? [],
    media: SERVICE_MEDIA[meta.id],
  }));

  const activeService = services[activeIndex] ?? services[0];
  const { scrollYProgress } = useScroll({
    target: reduceMotion ? undefined : chapterRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduceMotion) return;
    const normalized = clamp(
      (value - SERVICE_START) / (SERVICE_END - SERVICE_START),
      0,
      0.999,
    );
    const next = Math.min(
      SERVICE_COUNT - 1,
      Math.floor(normalized * SERVICE_COUNT),
    );
    setActiveIndex((current) => (current === next ? current : next));
  });

  const goToService = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const element = chapterRef.current;
      if (!element) return;
      const next = carouselPreview ? (index % SERVICE_COUNT + SERVICE_COUNT) % SERVICE_COUNT : clamp(index, 0, SERVICE_COUNT - 1);
      if (reduceMotion) {
        setActiveIndex(next);
        element.querySelector<HTMLElement>(`[data-service-static="${SERVICE_META[next].id}"]`)?.scrollIntoView({ behavior, block: "center" });
        return;
      }
      const sectionTop = element.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, element.offsetHeight - window.innerHeight);
      const ratio = (next + 0.5) / SERVICE_COUNT;
      const targetProgress = SERVICE_START + ratio * (SERVICE_END - SERVICE_START);
      window.scrollTo({ top: sectionTop + travel * targetProgress, behavior });
    },
    [carouselPreview, reduceMotion],
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
      goToService(activeIndex + 1);
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
        aria-label={tr("Our services")}
      data-art-directed="light"
        className="relative isolate overflow-hidden bg-bg-surface-light text-[#111111]"
      >
        <ServicesCurves />
        <h2 className="sr-only">{tr("Our services")}</h2>

        <div ref={chapterRef} data-services-static className="mx-auto grid max-w-[1280px] gap-px bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service.id} data-service-static={service.id} className="bg-bg-surface-light p-7 text-center sm:p-9">
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
        <ServicesWorkNavigation services={services} activeIndex={activeIndex} onSelect={goToService} />
      </section>
    );
  }

  return (
    <section
      id="services"
      data-art-directed="light"
      data-carousel-preview={carouselPreview}
      className={`${styles.chapter} relative z-20 isolate overflow-clip text-[#111111]`}
    >
      <h2 className="sr-only">{tr("Our services")}</h2>

      <div ref={chapterRef} data-services-runway className="relative h-[330svh] sm:h-[310svh] lg:h-[340vh]">
      <div
        className="sticky top-0 h-svh overflow-hidden outline-none"
        tabIndex={0}
        role="region"
        aria-label={tr("Explore Lionovart expertise")}
        onWheel={handleWheel}
        onKeyDown={handleKeys}
        style={{ overscrollBehaviorX: "contain" }}
      >
        <ServicesArrivalLayer>
          <ServicesCurves />
        </ServicesArrivalLayer>

        <div className="absolute inset-0 z-40">
          <span className="sr-only" aria-live="polite">{activeService.title}</span>

          <div data-service-panel
            className={`${styles.panel} absolute inset-x-0 bottom-[10.5svh] top-[4.5svh] mx-auto max-w-[1500px] px-4 sm:px-8 lg:bottom-[12vh] lg:top-[9vh] lg:px-12`}>
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
              className="flex h-full flex-col items-center justify-center gap-7 sm:gap-9 lg:gap-[clamp(2.75rem,5.5svh,5rem)]"
            >
              {!carouselPreview && <div data-service-media className="relative order-1 aspect-video w-[min(92vw,61svh)] overflow-hidden rounded-[1.15rem] border border-black/[0.07] bg-black/[0.04] shadow-[0_24px_62px_-42px_rgba(0,0,0,0.34)] lg:w-[min(70vw,64svh)] lg:rounded-[1.55rem]">
                <ServiceMediaCarousel
                  key={activeService.id}
                  images={activeService.media}
                  alt={`${activeService.title} service visual`}
                />
              </div>}

              <div className="order-2 flex min-w-0 flex-col justify-center text-center">
                <div>
                    <h3 data-service-title className="mx-auto max-w-[13ch] font-clash text-[clamp(2.15rem,8.6vw,3.75rem)] font-semibold uppercase leading-[0.86] tracking-[-0.052em] sm:text-[clamp(2.45rem,7.5vw,4.5rem)] lg:max-w-[11ch] lg:text-[clamp(3.2rem,5vw,6.2rem)]">
                      {activeService.title}
                    </h3>
                    <p data-service-description className="mx-auto mt-4 max-w-[36ch] font-body text-[13px] font-medium leading-[1.52] text-black/60 sm:mt-5 sm:text-[15px] lg:mt-6 lg:max-w-[38ch] lg:text-[18px] lg:leading-[1.62]">
                      {activeService.description}
                    </p>
                    <div data-service-tags className="mx-auto mt-5 flex max-h-[4.6rem] max-w-[38rem] flex-wrap justify-center gap-1.5 overflow-hidden sm:mt-6 sm:max-h-none sm:gap-2 lg:mt-7 lg:max-w-[40rem]">
                      {activeService.deliverables.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-black/[0.09] bg-white/32 px-2.5 py-1.5 font-mono text-[7.5px] font-bold uppercase tracking-[0.09em] text-black/46 sm:px-3 sm:text-[8.5px] lg:text-[9px]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>


      </div>
      </div>
      <ServicesWorkNavigation services={services} activeIndex={activeIndex} onSelect={goToService} />
    </section>
  );
}
