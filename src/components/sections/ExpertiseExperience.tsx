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
const OPENING_COPY_END = 0.205;
const OPENING_END = 0.292;
const STREAM_UNMOUNT = 0.294;
const SERVICE_START = 0.31;
const SERVICE_END = 0.92;

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
      style={{
        touchAction: "pan-y",
        cursor: canSwipe ? "grab" : "default",
      }}
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

function ReducedMotionExperience({
  services,
  eyebrow,
  heading,
  headingAccent,
}: {
  services: Array<{
    id: string;
    number: string;
    short: string;
    title: string;
    description: string;
    deliverables: readonly string[];
    image: string;
    media: readonly string[];
  }>;
  eyebrow: string;
  heading: string;
  headingAccent: string;
}) {
  const openNova = useNovaStore((state) => state.openNova);

  return (
    <section
      id="services"
      data-art-directed="light"
      className="relative overflow-visible bg-bg-surface-light text-[#111111]"
    >
      <div className="mx-auto max-w-[1280px] px-5 pb-14 pt-20 text-center sm:px-8 lg:pt-28">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red sm:text-[11px]">
          {eyebrow}
        </p>
        <h2 className="mx-auto mt-4 max-w-[10ch] font-clash text-[clamp(3rem,9vw,7rem)] font-semibold uppercase leading-[0.84] tracking-[-0.055em]">
          {heading} <span className="text-brand-red">{headingAccent}</span>
        </h2>
        <img
          src="/images/lionovart-icon.svg"
          alt="Lionovart"
          className="mx-auto mt-10 h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
        />
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

      <div id="offer" className="mx-auto max-w-[900px] px-5 py-20 text-center sm:px-8 lg:py-28">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red">
          Everything, handled
        </p>
        <h3 className="mx-auto mt-4 max-w-[14ch] font-clash text-[clamp(2.6rem,7vw,5.8rem)] font-semibold uppercase leading-[0.88] tracking-[-0.05em]">
          Your entire brand &amp; growth team. <span className="text-brand-red">One Partnership.</span>
        </h3>
        <p className="mx-auto mt-6 max-w-[48ch] font-body text-[16px] leading-[1.7] text-black/60 sm:text-[18px]">
          More visibility. More clients. Less you have to manage.
        </p>
        <button
          type="button"
          onClick={() => openNova("offer", true)}
          className="mt-8 rounded-full bg-brand-red px-7 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-4"
        >
          Get your free brand audit
        </button>
      </div>
    </section>
  );
}

export default function ExpertiseExperience() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion() ?? false;
  const openNova = useNovaStore((state) => state.openNova);
  const chapterRef = useRef<HTMLElement>(null);
  const wheelLockRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOpeningCopy, setShowOpeningCopy] = useState(true);
  const [showStream, setShowStream] = useState(true);
  const [showOpeningLogo, setShowOpeningLogo] = useState(true);

  const services = SERVICE_META.map((meta, index) => ({
    ...meta,
    title: t.services.items[index]?.title ?? "",
    description: t.services.items[index]?.description ?? "",
    deliverables:
      (t.services.items[index]?.deliverables as readonly string[] | undefined) ?? [],
    image: SHOWCASE_IMAGES[index % SHOWCASE_IMAGES.length],
    media: SERVICE_MEDIA[meta.id],
  }));

  const partnershipIndex = services.length;
  const partnership = activeIndex === partnershipIndex;
  const activeService = services[Math.min(activeIndex, services.length - 1)] ?? services[0];

  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.075, 0.185], [1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.19], [0, -58]);

  const streamOpacity = useTransform(
    scrollYProgress,
    [0, 0.105, 0.22, 0.276],
    [1, 1, 0.32, 0],
  );
  const streamScale = useTransform(scrollYProgress, [0, 0.276], [1, 1.055]);

  const logoScale = useTransform(
    scrollYProgress,
    [0, 0.115, 0.225, 0.27, OPENING_END],
    [1, 1.04, 2.9, 0.92, 0.52],
  );
  const logoY = useTransform(
    scrollYProgress,
    [0, 0.225, 0.27, OPENING_END],
    [0, 0, "27svh", "42svh"],
  );
  const logoOpacity = useTransform(
    scrollYProgress,
    [0, 0.274, OPENING_END, SERVICE_START + 0.008],
    [1, 1, 0.42, 0],
  );

  const serviceStageOpacity = useTransform(
    scrollYProgress,
    [0.278, SERVICE_START, 0.965, 1],
    [0, 1, 1, 0],
  );
  const selectorOpacity = useTransform(
    scrollYProgress,
    [0.282, SERVICE_START + 0.012],
    [0, 1],
  );
  const selectorScaleX = useTransform(
    scrollYProgress,
    [0.282, SERVICE_START + 0.016],
    [0.12, 1],
  );
  const selectorScaleY = useTransform(
    scrollYProgress,
    [0.282, 0.297, SERVICE_START + 0.016],
    [0.82, 1.04, 1],
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const shouldShowOpeningCopy = value < OPENING_COPY_END;
    setShowOpeningCopy((current) =>
      current === shouldShowOpeningCopy ? current : shouldShowOpeningCopy,
    );

    const shouldShowStream = value < STREAM_UNMOUNT;
    setShowStream((current) => (current === shouldShowStream ? current : shouldShowStream));

    const shouldShowOpeningLogo = value < SERVICE_START + 0.014;
    setShowOpeningLogo((current) =>
      current === shouldShowOpeningLogo ? current : shouldShowOpeningLogo,
    );

    if (value < SERVICE_START) {
      setActiveIndex((current) => (current === 0 ? current : 0));
      return;
    }

    const normalized = clamp(
      (value - SERVICE_START) / (SERVICE_END - SERVICE_START),
      0,
      1,
    );
    const next = Math.round(normalized * partnershipIndex);
    setActiveIndex((current) => (current === next ? current : next));
  });

  const goToState = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const element = chapterRef.current;
      if (!element) return;
      const next = clamp(index, 0, partnershipIndex);
      const sectionTop = element.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, element.offsetHeight - window.innerHeight);
      const ratio = partnershipIndex === 0 ? 0 : next / partnershipIndex;
      const targetProgress = SERVICE_START + ratio * (SERVICE_END - SERVICE_START);
      window.scrollTo({ top: sectionTop + travel * targetProgress, behavior });
    },
    [partnershipIndex],
  );

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.08;
    if (!horizontalIntent || Math.abs(event.deltaX) < 10) return;

    event.preventDefault();
    const now = performance.now();
    if (now - wheelLockRef.current < 260) return;
    wheelLockRef.current = now;
    goToState(activeIndex + (event.deltaX > 0 ? 1 : -1));
  };

  const handleKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToState(activeIndex + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToState(activeIndex - 1);
    }
  };

  if (reduceMotion) {
    return (
      <ReducedMotionExperience
        services={services}
        eyebrow={t.services.eyebrow}
        heading={t.services.heading}
        headingAccent={t.services.headingAccent}
      />
    );
  }

  return (
    <section
      ref={chapterRef}
      id="services"
      data-art-directed="light"
      className="relative isolate h-[305svh] overflow-visible bg-bg-surface-light text-[#111111] lg:h-[315vh]"
    >
      <div
        className="sticky top-0 h-svh overflow-visible bg-bg-surface-light outline-none"
        tabIndex={0}
        role="region"
        aria-label="Explore Lionovart expertise"
        onWheel={handleWheel}
        onKeyDown={handleKeys}
        style={{ overscrollBehaviorX: "contain" }}
      >
        <motion.div
          aria-hidden="true"
          style={{ opacity: serviceStageOpacity }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(229,25,42,0.045),transparent_34%)]"
        />

        {showOpeningCopy && (
          <motion.header
            style={{ opacity: titleOpacity, y: titleY }}
            className="pointer-events-none absolute inset-x-0 top-[6.5svh] z-30 mx-auto max-w-[1280px] px-5 text-center sm:top-[7vh] sm:px-8 lg:px-12"
          >
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-brand-red sm:text-[11px]">
              {t.services.eyebrow}
            </p>
            <h2 className="mx-auto mt-3 max-w-[10ch] font-clash text-[clamp(3rem,10vw,7.4rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">
              {t.services.heading}{" "}
              <span className="text-brand-red">{t.services.headingAccent}</span>
            </h2>
          </motion.header>
        )}

        {showStream && (
          <motion.div
            style={{ opacity: streamOpacity, scale: streamScale }}
            className="absolute inset-x-0 top-[27svh] z-10 transform-gpu sm:top-[27vh] lg:top-[25vh]"
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
              className="h-[19rem] w-full overflow-visible sm:h-[26rem] lg:h-[31rem]"
            />
          </motion.div>
        )}

        {showOpeningLogo && (
          <motion.div
            aria-hidden="true"
            style={{ scale: logoScale, y: logoY, opacity: logoOpacity }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-50 h-20 w-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-brand-red shadow-[0_20px_52px_-28px_rgba(229,25,42,0.4)] transform-gpu sm:h-24 sm:w-24 lg:h-28 lg:w-28"
          >
            <img
              src="/images/lionovart-icon.svg"
              alt=""
              className="h-full w-full object-cover"
              decoding="async"
            />
          </motion.div>
        )}

        <motion.div style={{ opacity: serviceStageOpacity }} className="absolute inset-0 z-20">
          <span className="sr-only" aria-live="polite">
            {partnership ? "One Partnership" : activeService.title}
          </span>

          <motion.div
            animate={{ opacity: partnership ? 0 : 1, y: partnership ? -8 : 0 }}
            transition={{ duration: 0.26, ease: EASE }}
            aria-hidden={partnership}
            className="absolute inset-x-0 top-[8svh] mx-auto h-[74svh] max-w-[1500px] px-5 sm:px-8 lg:top-[10vh] lg:h-[71vh] lg:px-12"
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.03}
              dragMomentum={false}
              dragDirectionLock
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) < 44) return;
                goToState(activeIndex + (info.offset.x < 0 ? 1 : -1));
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
          </motion.div>

          <motion.div
            animate={{ opacity: partnership ? 1 : 0, y: partnership ? 0 : 10 }}
            transition={{ duration: 0.3, ease: EASE }}
            id="offer"
            aria-hidden={!partnership}
            className={`absolute inset-x-0 top-1/2 mx-auto w-full max-w-[1040px] -translate-y-[52%] px-5 text-center sm:px-8 ${
              partnership ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <div className="mx-auto flex h-20 w-fit min-w-20 items-center justify-center rounded-full border border-white/65 bg-white/34 px-7 shadow-[0_20px_56px_-28px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl sm:h-24 sm:min-w-24 sm:px-9">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black/75 sm:text-[12px]">
                One Partnership
              </span>
            </div>
            <p className="mt-8 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-brand-red sm:text-[10px]">
              Everything, handled
            </p>
            <h3 className="mx-auto mt-4 max-w-[15ch] font-clash text-[clamp(2.5rem,7vw,6.5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.055em]">
              Your entire brand &amp; growth team.
            </h3>
            <p className="mx-auto mt-5 max-w-[42ch] font-body text-[15px] font-medium leading-[1.7] text-black/58 sm:text-[18px]">
              More visibility. More clients. <span className="text-brand-red">Less you have to manage.</span>
            </p>
            <div className="mx-auto mt-7 flex max-w-[34rem] flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => openNova("offer", true)}
                className="rounded-full bg-brand-red px-7 py-4 text-[11px] font-bold uppercase tracking-[0.13em] text-white transition duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-4"
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
                className="rounded-full border border-black/16 bg-white/35 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.13em] text-[#111111] transition duration-300 hover:border-brand-red/45 hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-4"
              >
                Talk to us
              </button>
            </div>
          </motion.div>

          <motion.nav
            style={{
              opacity: selectorOpacity,
              scaleX: selectorScaleX,
              scaleY: selectorScaleY,
              transformOrigin: "center center",
            }}
            aria-label="Services"
            className="absolute inset-x-0 bottom-[4.5svh] z-40 mx-auto max-w-[min(94vw,860px)] px-2 sm:bottom-[5vh]"
          >
            <div className="relative flex items-center justify-center gap-1 overflow-hidden rounded-full border border-white/65 bg-[radial-gradient(circle_at_18%_-20%,rgba(255,255,255,0.82),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.5),rgba(255,255,255,0.17))] p-1.5 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-[14px] backdrop-saturate-150 sm:gap-1.5 sm:p-1.5 sm:backdrop-blur-[18px]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-px h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
              />
              {services.map((service, index) => {
                const selected = !partnership && index === activeIndex;
                return (
                  <button
                    key={service.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => goToState(index)}
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
                aria-pressed={partnership}
                onClick={() => goToState(partnershipIndex)}
                className={`relative flex h-9 min-w-9 items-center justify-center rounded-full border border-transparent px-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.1em] transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/45 focus-visible:ring-offset-1 sm:h-10 sm:px-3.5 sm:text-[9px] ${
                  partnership
                    ? "scale-[1.02] bg-white/78 text-black shadow-[0_8px_22px_-14px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.96)] ring-1 ring-white/80"
                    : "bg-white/0 text-black/44 hover:bg-white/30 hover:text-black/70"
                }`}
              >
                <span className="hidden sm:inline">All</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </motion.nav>
        </motion.div>
      </div>
    </section>
  );
}
