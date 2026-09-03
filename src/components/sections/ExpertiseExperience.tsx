"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  useCallback,
  useEffect,
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

const SERVICE_VIDEO_DESKTOP =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,f_auto,q_auto:eco/v1779845599/Footage_02_chsoa3.mp4";
const SERVICE_VIDEO_MOBILE =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_900,c_limit,f_auto,q_auto:eco/v1779845599/Footage_02_chsoa3.mp4";

const SERVICE_META = [
  { id: "branding", number: "01", short: "Brand" },
  { id: "web", number: "02", short: "Web" },
  { id: "content-studio", number: "03", short: "Content" },
  { id: "print", number: "04", short: "Print" },
  { id: "smart-systems", number: "05", short: "Systems" },
  { id: "growth", number: "06", short: "Growth" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;
const OPENING_END = 0.285;
const STREAM_UNMOUNT = 0.292;
const SERVICE_START = 0.305;
const SERVICE_END = 0.92;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function ServiceSignal({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 120 120",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: "h-full w-full",
  };

  if (id === "branding") {
    return (
      <svg {...common}>
        <circle cx="60" cy="60" r="38" stroke="currentColor" />
        <circle cx="60" cy="60" r="22" stroke="currentColor" />
        <path d="M60 8V112M8 60H112" stroke="currentColor" />
        <circle cx="60" cy="60" r="4" fill="currentColor" />
      </svg>
    );
  }

  if (id === "web") {
    return (
      <svg {...common}>
        <rect x="15" y="22" width="90" height="76" rx="4" stroke="currentColor" />
        <path d="M15 39H105M36 39V98M80 39V98" stroke="currentColor" />
        <circle cx="58" cy="68" r="10" stroke="currentColor" />
      </svg>
    );
  }

  if (id === "content-studio") {
    return (
      <svg {...common}>
        <rect x="14" y="25" width="92" height="70" rx="5" stroke="currentColor" />
        <path d="M50 46L78 60L50 74V46Z" fill="currentColor" />
        <path d="M22 17V25M38 17V25M54 17V25M70 17V25M86 17V25M102 17V25" stroke="currentColor" />
      </svg>
    );
  }

  if (id === "print") {
    return (
      <svg {...common}>
        <rect x="32" y="20" width="62" height="78" rx="3" stroke="currentColor" />
        <rect x="22" y="30" width="62" height="78" rx="3" stroke="currentColor" />
        <path d="M34 47H70M34 57H64M34 79H72" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (id === "smart-systems") {
    return (
      <svg {...common}>
        <path d="M29 33L60 20L91 35L98 68L74 97H42L20 69L29 33Z" stroke="currentColor" />
        <path d="M29 33L57 52L91 35M20 69L57 52L74 97M98 68L57 52L60 20" stroke="currentColor" />
        <circle cx="57" cy="52" r="6" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M17 95H103M22 91L45 68L60 77L95 34" stroke="currentColor" strokeWidth="2" />
      <path d="M79 34H95V50" stroke="currentColor" strokeWidth="2" />
      <circle cx="45" cy="68" r="5" fill="currentColor" />
      <circle cx="60" cy="77" r="5" fill="currentColor" />
      <circle cx="95" cy="34" r="5" fill="currentColor" />
    </svg>
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
          <article key={service.id} className="bg-bg-surface-light p-7 sm:p-9">
            <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-brand-red">
              {service.number}
            </span>
            <div className="mt-7 h-20 w-20 text-black/60">
              <ServiceSignal id={service.id} />
            </div>
            <h3 className="mt-7 max-w-[12ch] font-clash text-[2rem] font-semibold uppercase leading-[0.92] tracking-[-0.035em]">
              {service.title}
            </h3>
            <p className="mt-4 font-body text-[15px] leading-[1.65] text-black/58">
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const wheelLockRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showStream, setShowStream] = useState(true);
  const [serviceStageActive, setServiceStageActive] = useState(false);
  const chapterInView = useInView(chapterRef, { margin: "180px 0px" });

  const services = SERVICE_META.map((meta, index) => ({
    ...meta,
    title: t.services.items[index]?.title ?? "",
    description: t.services.items[index]?.description ?? "",
    deliverables:
      (t.services.items[index]?.deliverables as readonly string[] | undefined) ?? [],
    image: SHOWCASE_IMAGES[index % SHOWCASE_IMAGES.length],
  }));

  const partnershipIndex = services.length;
  const partnership = activeIndex === partnershipIndex;
  const activeService = services[Math.min(activeIndex, services.length - 1)] ?? services[0];

  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.095, 0.205], [1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.205], [0, -52]);

  const streamOpacity = useTransform(
    scrollYProgress,
    [0, 0.105, 0.22, 0.272],
    [1, 1, 0.34, 0],
  );
  const streamScale = useTransform(scrollYProgress, [0, 0.272], [1, 1.055]);

  // Opening emblem: center -> dramatic zoom -> selector anchor -> gone.
  // It does not remain mounted visually during the services chapter.
  const logoScale = useTransform(
    scrollYProgress,
    [0, 0.115, 0.225, 0.268, OPENING_END],
    [1, 1.04, 2.85, 1.05, 0.58],
  );
  const logoY = useTransform(
    scrollYProgress,
    [0, 0.225, 0.268, OPENING_END],
    [0, 0, "23svh", "31svh"],
  );
  const logoOpacity = useTransform(
    scrollYProgress,
    [0, 0.268, OPENING_END, SERVICE_START],
    [1, 1, 0.18, 0],
  );

  const serviceStageOpacity = useTransform(
    scrollYProgress,
    [0.268, SERVICE_START, 0.965, 1],
    [0, 1, 1, 0],
  );
  const selectorOpacity = useTransform(
    scrollYProgress,
    [0.272, SERVICE_START + 0.018],
    [0, 1],
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const shouldShowStream = value < STREAM_UNMOUNT;
    setShowStream((current) => (current === shouldShowStream ? current : shouldShowStream));

    const shouldRunServiceMedia = value > 0.285 && value < 0.975;
    setServiceStageActive((current) =>
      current === shouldRunServiceMedia ? current : shouldRunServiceMedia,
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (chapterInView && serviceStageActive && !partnership) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [chapterInView, serviceStageActive, partnership]);

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
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(229,25,42,0.055),transparent_34%)]"
        />

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

        <motion.div
          aria-hidden="true"
          style={{ scale: logoScale, y: logoY, opacity: logoOpacity }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-40 h-20 w-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-brand-red shadow-[0_20px_52px_-28px_rgba(229,25,42,0.46)] transform-gpu sm:h-24 sm:w-24 lg:h-28 lg:w-28"
        >
          <img
            src="/images/lionovart-icon.svg"
            alt=""
            className="h-full w-full object-cover"
            decoding="async"
          />
        </motion.div>

        <motion.div style={{ opacity: serviceStageOpacity }} className="absolute inset-0 z-20">
          <div className="absolute inset-x-0 top-[4.5svh] mx-auto flex max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-black/35 sm:text-[10px]">
              {partnership ? "The full system" : "One system / six disciplines"}
            </span>
            <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-brand-red sm:text-[10px]">
              {partnership
                ? "ONE PARTNERSHIP"
                : `${String(activeIndex + 1).padStart(2, "0")} / ${String(services.length).padStart(2, "0")}`}
            </span>
          </div>

          <span className="sr-only" aria-live="polite">
            {partnership ? "One Partnership" : activeService.title}
          </span>

          <motion.div
            animate={{ opacity: partnership ? 0 : 1, y: partnership ? -8 : 0 }}
            transition={{ duration: 0.26, ease: EASE }}
            aria-hidden={partnership}
            className="absolute inset-x-0 top-[10svh] mx-auto h-[72svh] max-w-[1500px] px-5 sm:px-8 lg:top-[11vh] lg:h-[70vh] lg:px-12"
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
              className="grid h-full grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(26rem,1.24fr)_minmax(0,0.82fr)] lg:gap-[clamp(1.5rem,3vw,4rem)]"
            >
              <div className="relative order-1 h-[29svh] min-h-[12rem] overflow-hidden rounded-[1.2rem] border border-black/8 bg-[#111111] shadow-[0_28px_72px_-42px_rgba(0,0,0,0.42)] sm:h-[32svh] lg:h-auto lg:min-h-0 lg:aspect-[4/3] lg:rounded-[1.55rem]">
                <video
                  ref={videoRef}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                >
                  <source media="(max-width: 767px)" src={SERVICE_VIDEO_MOBILE} type="video/mp4" />
                  <source src={SERVICE_VIDEO_DESKTOP} type="video/mp4" />
                </video>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/34 via-transparent to-black/8" />
                <div className="absolute left-4 top-4 font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-white/72 sm:left-5 sm:top-5 sm:text-[9px]">
                  Motion / {activeService.number}
                </div>
              </div>

              <div className="order-2 flex min-w-0 flex-col justify-center py-1 text-center lg:text-left">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={activeService.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.26, ease: EASE }}
                  >
                    <div className="mx-auto mb-4 h-14 w-14 text-black/52 sm:h-16 sm:w-16 lg:mx-0 lg:mb-5 lg:h-20 lg:w-20">
                      <ServiceSignal id={activeService.id} />
                    </div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-brand-red sm:text-[10px]">
                      Lionovart / {activeService.number}
                    </span>
                    <h3 className="mx-auto mt-3 max-w-[13ch] font-clash text-[clamp(2rem,8.2vw,4.7rem)] font-semibold uppercase leading-[0.86] tracking-[-0.05em] lg:mx-0 lg:text-[clamp(2.7rem,4.4vw,5.2rem)]">
                      {activeService.title}
                    </h3>
                    <p className="mx-auto mt-4 max-w-[42ch] font-body text-[14px] font-medium leading-[1.62] text-black/58 sm:text-[15px] lg:mx-0 lg:text-[16px]">
                      {activeService.description}
                    </p>
                    <div className="mx-auto mt-5 flex max-w-[38rem] flex-wrap justify-center gap-2 lg:mx-0 lg:justify-start">
                      {activeService.deliverables.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-black/12 bg-white/22 px-2.5 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-black/48 sm:text-[9px]"
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
            <div className="mx-auto flex h-20 w-fit min-w-20 items-center justify-center rounded-full bg-brand-red px-7 shadow-[0_22px_64px_-28px_rgba(229,25,42,0.5)] sm:h-24 sm:min-w-24 sm:px-9">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white sm:text-[12px]">
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
            style={{ opacity: selectorOpacity }}
            aria-label="Services"
            className="absolute inset-x-0 bottom-[4.5svh] z-40 mx-auto flex max-w-[min(96vw,840px)] items-center justify-center gap-1.5 px-3 sm:bottom-[5vh] sm:gap-2"
          >
            {services.map((service, index) => {
              const selected = !partnership && index === activeIndex;
              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => goToState(index)}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-3 font-mono text-[8px] font-bold uppercase tracking-[0.12em] transition-[background-color,color,border-color,width] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 sm:h-11 sm:min-w-11 sm:px-4 sm:text-[9px] ${
                    selected
                      ? "border-brand-red bg-brand-red text-white"
                      : "border-black/12 bg-white/58 text-black/45 hover:border-black/25 hover:text-black/70"
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
              className={`flex h-10 items-center justify-center rounded-full border px-3.5 font-mono text-[8px] font-bold uppercase tracking-[0.12em] transition-[background-color,color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 sm:h-11 sm:px-4 sm:text-[9px] ${
                partnership
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-black/12 bg-white/58 text-black/45 hover:border-black/25 hover:text-black/70"
              }`}
            >
              <span className="hidden sm:inline">All</span>
              <span className="sm:hidden">+</span>
            </button>
          </motion.nav>
        </motion.div>
      </div>
    </section>
  );
}
