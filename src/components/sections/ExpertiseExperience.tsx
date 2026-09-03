"use client";

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

const SERVICE_VIDEO =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,f_auto,q_auto:eco/v1779845599/Footage_02_chsoa3.mp4";

const SERVICE_META = [
  { id: "branding", number: "01", short: "Brand" },
  { id: "web", number: "02", short: "Web" },
  { id: "content-studio", number: "03", short: "Content" },
  { id: "print", number: "04", short: "Print" },
  { id: "smart-systems", number: "05", short: "Systems" },
  { id: "growth", number: "06", short: "Growth" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

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
  const openingRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const services = SERVICE_META.map((meta, index) => ({
    ...meta,
    title: t.services.items[index]?.title ?? "",
    description: t.services.items[index]?.description ?? "",
    deliverables:
      (t.services.items[index]?.deliverables as readonly string[] | undefined) ?? [],
  }));

  const stateCount = services.length + 1;
  const partnershipIndex = services.length;
  const partnership = activeIndex === partnershipIndex;
  const activeService = services[Math.min(activeIndex, services.length - 1)] ?? services[0];

  const { scrollYProgress: openingProgress } = useScroll({
    target: openingRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: serviceProgress } = useScroll({
    target: serviceRef,
    offset: ["start start", "end end"],
  });

  const titleOpacity = useTransform(openingProgress, [0, 0.24, 0.48], [1, 1, 0]);
  const titleY = useTransform(openingProgress, [0, 0.48], [0, -80]);
  const streamOpacity = useTransform(openingProgress, [0, 0.38, 0.7], [1, 1, 0]);
  const streamScale = useTransform(openingProgress, [0, 0.5, 0.72], [1, 1.03, 1.12]);
  const logoScale = useTransform(
    openingProgress,
    [0, 0.34, 0.62, 1],
    [1, 1.08, 3.15, 0.62],
  );
  const logoY = useTransform(openingProgress, [0, 0.62, 1], [0, 0, "31svh"]);
  const logoShadow = useTransform(
    openingProgress,
    [0, 0.62, 1],
    [
      "0 18px 45px rgba(0,0,0,0.14)",
      "0 38px 90px rgba(229,25,42,0.18)",
      "0 16px 38px rgba(0,0,0,0.16)",
    ],
  );
  const bridgeOpacity = useTransform(openingProgress, [0.62, 0.9, 1], [0, 0.6, 1]);

  useMotionValueEvent(serviceProgress, "change", (value) => {
    const next = Math.min(
      partnershipIndex,
      Math.max(0, Math.round(value * partnershipIndex)),
    );
    setActiveIndex((current) => (current === next ? current : next));
  });

  const goToState = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const element = serviceRef.current;
      if (!element) return;
      const next = Math.min(partnershipIndex, Math.max(0, index));
      const rect = element.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const travel = Math.max(1, element.offsetHeight - window.innerHeight);
      const ratio = partnershipIndex === 0 ? 0 : next / partnershipIndex;
      window.scrollTo({ top: top + travel * ratio, behavior });
    },
    [partnershipIndex],
  );

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.08;
    if (!horizontalIntent || Math.abs(event.deltaX) < 12) return;

    event.preventDefault();
    const now = performance.now();
    if (now - wheelLockRef.current < 340) return;
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
      id="services"
      data-art-directed="light"
      className="relative isolate overflow-visible bg-bg-surface-light text-[#111111]"
    >
      <div ref={openingRef} className="relative h-[165svh] sm:h-[175vh]">
        <div className="sticky top-0 h-svh overflow-visible bg-bg-surface-light">
          <motion.header
            style={{ opacity: titleOpacity, y: titleY }}
            className="pointer-events-none absolute inset-x-0 top-[7svh] z-30 mx-auto max-w-[1280px] px-5 text-center sm:top-[8vh] sm:px-8 lg:top-[7vh] lg:px-12"
          >
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-brand-red sm:text-[11px]">
              {t.services.eyebrow}
            </p>
            <h2 className="mx-auto mt-3 max-w-[10ch] font-clash text-[clamp(3rem,10vw,7.4rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">
              {t.services.heading}{" "}
              <span className="text-brand-red">{t.services.headingAccent}</span>
            </h2>
          </motion.header>

          <motion.div
            style={{ opacity: streamOpacity, scale: streamScale }}
            className="absolute inset-x-0 top-[29svh] z-10 sm:top-[28vh] lg:top-[27vh]"
          >
            <ImageStreamHero
              images={SHOWCASE_IMAGES.map((src, index) => ({
                src,
                alt: t.services.items[index]?.title ?? "Lionovart selected work",
              }))}
              cards={6}
              speed={42}
              axis={50}
              path={{ cardWidth: 17, cardHeight: 23, exitHeight: 42 }}
              className="h-[19rem] w-full overflow-visible sm:h-[26rem] lg:h-[32rem]"
            />
          </motion.div>

          <motion.div
            aria-hidden="true"
            style={{ opacity: bridgeOpacity }}
            className="pointer-events-none absolute inset-x-0 bottom-[14svh] z-20 mx-auto h-px max-w-[min(38rem,72vw)] bg-gradient-to-r from-transparent via-brand-red/25 to-transparent"
          />

          <motion.div
            style={{ scale: logoScale, y: logoY, boxShadow: logoShadow }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-40 h-20 w-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full sm:h-24 sm:w-24 lg:h-28 lg:w-28"
          >
            <img
              src="/images/lionovart-icon.svg"
              alt="Lionovart emblem"
              className="h-full w-full object-cover"
              decoding="async"
            />
          </motion.div>
        </div>
      </div>

      <div
        ref={serviceRef}
        className="relative overflow-visible"
        style={{ height: `${Math.max(252, stateCount * 36)}vh` }}
      >
        <div
          className="sticky top-0 h-svh overflow-visible bg-bg-surface-light outline-none"
          tabIndex={0}
          role="region"
          aria-label="Explore Lionovart services"
          onWheel={handleWheel}
          onKeyDown={handleKeys}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_72%,rgba(229,25,42,0.08),transparent_32%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[8vw] top-[10svh] h-px bg-gradient-to-r from-transparent via-black/8 to-transparent"
          />

          <div className="absolute inset-x-0 top-[5svh] z-20 mx-auto flex max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.23em] text-black/35 sm:text-[10px]">
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

          <AnimatePresence mode="wait" initial={false}>
            {partnership ? (
              <motion.div
                key="partnership"
                id="offer"
                initial={{ opacity: 0, scale: 0.965, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                transition={{ duration: 0.48, ease: EASE }}
                className="absolute inset-x-0 top-1/2 z-20 mx-auto w-full max-w-[1040px] -translate-y-[52%] px-5 text-center sm:px-8"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.42, ease: EASE }}
                  className="mx-auto flex h-20 w-fit min-w-20 items-center justify-center rounded-full bg-brand-red px-7 shadow-[0_24px_70px_-24px_rgba(229,25,42,0.55)] sm:h-24 sm:min-w-24 sm:px-9"
                >
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white sm:text-[12px]">
                    One Partnership
                  </span>
                </motion.div>

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
            ) : (
              <motion.div
                key={`service-${activeService.id}`}
                initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.42, ease: EASE }}
                className="absolute inset-x-0 top-[11svh] z-10 mx-auto h-[72svh] max-w-[1500px] px-5 sm:px-8 lg:top-[12vh] lg:h-[70vh] lg:px-12"
              >
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.06}
                  dragDirectionLock
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) < 48) return;
                    goToState(activeIndex + (info.offset.x < 0 ? 1 : -1));
                  }}
                  style={{ touchAction: "pan-y" }}
                  className="grid h-full grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(26rem,1.24fr)_minmax(0,0.82fr)] lg:gap-[clamp(1.5rem,3vw,4rem)]"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -18, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.46, ease: EASE }}
                    className="relative order-1 h-[29svh] min-h-[12rem] overflow-hidden rounded-[1.35rem] border border-black/8 bg-[#111111] shadow-[0_34px_80px_-40px_rgba(0,0,0,0.48)] sm:h-[32svh] lg:h-auto lg:min-h-0 lg:aspect-[4/3] lg:rounded-[1.75rem]"
                  >
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    >
                      <source src={SERVICE_VIDEO} type="video/mp4" />
                    </video>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                    <div className="absolute left-4 top-4 font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-white/72 sm:left-5 sm:top-5 sm:text-[9px]">
                      Motion / {activeService.number}
                    </div>
                  </motion.div>

                  <div className="order-2 flex min-w-0 flex-col justify-center py-1 text-center lg:text-left">
                    <div className="mx-auto mb-4 h-14 w-14 text-black/52 sm:h-16 sm:w-16 lg:mx-0 lg:mb-6 lg:h-20 lg:w-20">
                      <ServiceSignal id={activeService.id} />
                    </div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-brand-red sm:text-[10px]">
                      Lionovart / {activeService.number}
                    </span>
                    <h3 className="mx-auto mt-3 max-w-[13ch] font-clash text-[clamp(2rem,8.5vw,4.8rem)] font-semibold uppercase leading-[0.86] tracking-[-0.05em] lg:mx-0 lg:text-[clamp(2.7rem,4.5vw,5.4rem)]">
                      {activeService.title}
                    </h3>
                    <p className="mx-auto mt-4 max-w-[42ch] font-body text-[14px] font-medium leading-[1.62] text-black/58 sm:text-[16px] lg:mx-0 lg:mt-5 lg:text-[17px]">
                      {activeService.description}
                    </p>
                    <div className="mx-auto mt-4 flex max-w-[44rem] flex-wrap justify-center gap-x-4 gap-y-2 lg:mx-0 lg:mt-5 lg:justify-start">
                      {activeService.deliverables.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-black/48 sm:text-[9px]"
                        >
                          <span className="h-1 w-1 rounded-full bg-brand-red" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 18, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.46, ease: EASE }}
                    className="relative order-3 hidden aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_34px_80px_-40px_rgba(0,0,0,0.42)] lg:block"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.img
                        key={SHOWCASE_IMAGES[activeIndex % SHOWCASE_IMAGES.length]}
                        src={SHOWCASE_IMAGES[activeIndex % SHOWCASE_IMAGES.length]}
                        alt={`${activeService.title} selected work`}
                        initial={{ opacity: 0, scale: 1.035 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.985 }}
                        transition={{ duration: 0.42, ease: EASE }}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </AnimatePresence>
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
                    <div className="absolute left-5 top-5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-black/45">
                      Selected work
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-x-0 bottom-[3.5svh] z-40 mx-auto flex max-w-[980px] items-center justify-center px-4 sm:bottom-[4.5vh] sm:px-8">
            <AnimatePresence mode="wait" initial={false}>
              {partnership ? (
                <motion.button
                  key="partnership-selector"
                  type="button"
                  onClick={() => goToState(partnershipIndex)}
                  initial={{ opacity: 0, scale: 0.72 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="h-12 rounded-full bg-brand-red px-6 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_45px_-18px_rgba(229,25,42,0.6)] sm:h-14 sm:px-8 sm:text-[10px]"
                >
                  One Partnership
                </motion.button>
              ) : (
                <motion.div
                  key="service-selectors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.84 }}
                  transition={{ duration: 0.32, ease: EASE }}
                  className="flex max-w-full items-center justify-center gap-1.5 rounded-full border border-black/8 bg-white/65 p-1.5 shadow-[0_20px_55px_-30px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:gap-2"
                >
                  {services.map((service, index) => {
                    const selected = index === activeIndex;
                    return (
                      <motion.button
                        key={service.id}
                        type="button"
                        onClick={() => goToState(index)}
                        aria-current={selected ? "true" : undefined}
                        aria-label={`Show ${service.title}`}
                        animate={{
                          width: selected ? "auto" : 38,
                          backgroundColor: selected ? "#e5192a" : "rgba(17,17,17,0.055)",
                          color: selected ? "#ffffff" : "rgba(17,17,17,0.58)",
                        }}
                        transition={{ duration: 0.28, ease: EASE }}
                        className="flex h-[38px] shrink-0 items-center justify-center overflow-hidden rounded-full px-0 font-mono text-[8px] font-bold uppercase tracking-[0.12em] outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 sm:h-11 sm:min-w-11 sm:text-[9px]"
                      >
                        <span className={selected ? "px-3 sm:px-4" : "px-0"}>
                          {selected ? service.short : service.number}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!partnership && (
            <div className="pointer-events-none absolute bottom-[10.5svh] left-1/2 z-30 -translate-x-1/2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-black/28 sm:bottom-[12vh] sm:text-[9px]">
              Scroll · swipe · trackpad
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
