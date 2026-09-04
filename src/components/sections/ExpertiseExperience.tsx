"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getWhatsAppUrl } from "@/lib/contact";
import { useNovaStore } from "@/lib/stores/nova-store";

const C = "https://res.cloudinary.com/dgio9uutc/image/upload/f_auto,q_auto,w_1600,c_fill,g_auto";

const SERVICE_META = [
  { id: "branding", number: "01", short: "BRAND", image: `${C}/v1775277351/1_1_bv3shm.avif` },
  { id: "web", number: "02", short: "WEB", image: `${C}/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif` },
  { id: "content-studio", number: "03", short: "CONTENT", image: `${C}/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif` },
  { id: "print", number: "04", short: "PRINT", image: `${C}/v1775277351/Thumb_2_p6ksrb.avif` },
  { id: "smart-systems", number: "05", short: "SYSTEMS", image: `${C}/v1775277352/Frame_1_zhyago.avif` },
  { id: "growth", number: "06", short: "GROWTH", image: `${C}/v1775277350/image_19_rnwg8w.avif` },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

type Service = {
  id: string;
  number: string;
  short: string;
  image: string;
  title: string;
  description: string;
  deliverables: readonly string[];
};

const PARTNERSHIP_CIRCLE =
  "aspect-square w-[max(136vw,88svh)] shrink-0 rounded-full bg-brand-red sm:w-[max(112vw,90svh)] lg:w-[min(80vw,92svh)]";

function PartnershipCopy({ onStart, onTalk }: { onStart: () => void; onTalk: () => void }) {
  return (
    <div className="relative z-10 w-full max-w-[1180px] px-5 text-center text-white sm:px-8">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.32em] text-white/65 sm:text-[10px]">
        Everything, handled
      </p>
      <h3 className="mx-auto mt-4 max-w-[11ch] text-balance font-clash text-[clamp(3.25rem,7vw,5.25rem)] font-semibold uppercase leading-[0.77] tracking-[-0.07em]">
        One partnership.
      </h3>
      <p className="mx-auto mt-7 max-w-[46ch] text-pretty font-body text-[15px] leading-[1.65] text-white/74 sm:text-[18px]">
        Brand, digital, content, systems and growth working as one — less for you to coordinate, more momentum for the brand.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-white px-7 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Start your brand
        </button>
        <button
          type="button"
          onClick={onTalk}
          className="rounded-full border border-white/30 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Talk to us
        </button>
      </div>
    </div>
  );
}

function ReducedMotionExperience({ services }: { services: Service[] }) {
  const openNova = useNovaStore((state) => state.openNova);
  const openWhatsApp = () => {
    window.open(
      getWhatsAppUrl("Hi Leon — I'd like to talk about the brand & growth partnership."),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section id="services" className="bg-[#f2efe8] text-[#111111]">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:py-28">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red">Our expertise</p>
        <h2 className="mt-4 max-w-[9ch] font-clash text-[clamp(3.4rem,9vw,7.8rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em]">
          One system. <span className="text-brand-red">Six disciplines.</span>
        </h2>
      </div>
      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 pb-24 sm:px-8 md:grid-cols-2">
        {services.map((service) => (
          <article key={service.id} className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/55">
            <div className="relative aspect-[4/3] overflow-hidden bg-black">
              <Image src={service.image} alt={service.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-brand-red">{service.number}</span>
              <h3 className="mt-3 font-clash text-[2.4rem] font-semibold uppercase leading-[0.9] tracking-[-0.045em]">{service.title}</h3>
              <p className="mt-4 max-w-[46ch] font-body text-[15px] leading-[1.65] text-black/60">{service.description}</p>
            </div>
          </article>
        ))}
      </div>
      <div id="offer" className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-[#f2efe8]">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className={PARTNERSHIP_CIRCLE} />
        </div>
        <PartnershipCopy onStart={() => openNova("offer", true)} onTalk={openWhatsApp} />
      </div>
    </section>
  );
}

function ServiceRail({ services, activeIndex, onSelect }: { services: Service[]; activeIndex: number; onSelect: (index: number) => void }) {
  return (
    <nav aria-label="Expertise disciplines" className="absolute left-[2.2vw] top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <ul className="space-y-3">
        {services.map((service, index) => {
          const active = index === activeIndex;
          return (
            <li key={service.id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                className="group flex items-center gap-3 py-1 text-left"
                aria-current={active ? "step" : undefined}
              >
                <span className={`h-px transition-all duration-300 ${active ? "w-9 bg-brand-red" : "w-4 bg-black/25 group-hover:w-7 group-hover:bg-black/50"}`} />
                <span className={`font-mono text-[8px] font-bold uppercase tracking-[0.18em] transition-colors ${active ? "text-brand-red" : "text-black/34 group-hover:text-black/65"}`}>
                  {service.number} {service.short}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function ExpertiseExperience() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion() ?? false;
  const openNova = useNovaStore((state) => state.openNova);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const services: Service[] = SERVICE_META.map((meta, index) => ({
    ...meta,
    title: t.services.items[index]?.title ?? meta.short,
    description: t.services.items[index]?.description ?? "",
    deliverables: (t.services.items[index]?.deliverables as readonly string[] | undefined) ?? [],
  }));

  const partnershipIndex = services.length;
  const partnership = activeIndex === partnershipIndex;
  const activeService = services[Math.min(activeIndex, services.length - 1)] ?? services[0];

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(partnershipIndex, Math.floor(value * (partnershipIndex + 1)));
    setActiveIndex((current) => (current === next ? current : next));
  });

  const goToState = useCallback((index: number) => {
    const element = stageRef.current;
    if (!element) return;
    const next = Math.min(partnershipIndex, Math.max(0, index));
    const top = element.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, element.offsetHeight - window.innerHeight);
    const ratio = partnershipIndex === 0 ? 0 : next / partnershipIndex;
    window.scrollTo({ top: top + travel * ratio, behavior: "smooth" });
  }, [partnershipIndex]);

  const openWhatsApp = () => {
    window.open(
      getWhatsAppUrl("Hi Leon — I'd like to talk about the brand & growth partnership."),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      goToState(activeIndex + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      goToState(activeIndex - 1);
    }
  };

  if (reduceMotion) return <ReducedMotionExperience services={services} />;

  return (
    <section id="services" data-art-directed="light" className="relative isolate bg-[#f2efe8] text-[#111111]">
      <div ref={stageRef} className="relative" style={{ height: `${(partnershipIndex + 1) * 82}vh` }}>
        <div
          className="sticky top-0 h-svh overflow-hidden bg-[#f2efe8] outline-none"
          tabIndex={0}
          role="region"
          aria-label="Explore Lionovart expertise"
          onKeyDown={handleKeys}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_38%,rgba(229,25,42,0.08),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:auto,9vw_100%]" />
          <div aria-hidden className="pointer-events-none absolute -left-[4vw] top-[18vh] font-clash text-[clamp(8rem,22vw,24rem)] font-black uppercase leading-none tracking-[-0.08em] text-black/[0.025]">L</div>

          <motion.div
            animate={{ opacity: partnership ? 0 : 1 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-5 pt-[4.5svh] text-[#111111] sm:px-8 lg:px-12 xl:px-[4vw]"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-brand-red" />
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.27em] sm:text-[9px]">Our expertise</span>
            </div>
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-black/42 sm:text-[9px]">
              {partnership ? "THE FULL SYSTEM" : `${activeService.number} / ${String(services.length).padStart(2, "0")}`}
            </span>
          </motion.div>

          {!partnership && <ServiceRail services={services} activeIndex={activeIndex} onSelect={goToState} />}

          <span className="sr-only" aria-live="polite">{partnership ? "One Partnership" : activeService.title}</span>

          <AnimatePresence mode="wait" initial={false}>
            {partnership ? (
              <motion.div
                key="partnership"
                id="offer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.58, ease: EASE }}
                className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
              >
                <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, transform: "scale(0.86)" }}
                    animate={{ opacity: 1, transform: "scale(1)" }}
                    exit={{ opacity: 0, transform: "scale(0.94)" }}
                    transition={{ duration: 0.64, ease: EASE }}
                    className={PARTNERSHIP_CIRCLE}
                  />
                </div>
                <PartnershipCopy onStart={() => openNova("offer", true)} onTalk={openWhatsApp} />
              </motion.div>
            ) : (
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: EASE }}
                className="absolute inset-0 z-20"
              >
                <motion.div
                  initial={{ clipPath: "inset(9% 8% 9% 8% round 2.2rem)", scale: 0.975 }}
                  animate={{ clipPath: "inset(0% 0% 0% 0% round 1.5rem)", scale: 1 }}
                  exit={{ clipPath: "inset(8% 7% 8% 7% round 2rem)", scale: 0.985 }}
                  transition={{ duration: 0.62, ease: EASE }}
                  className="absolute bottom-[27svh] left-5 right-5 top-[14svh] overflow-hidden bg-[#111111] shadow-[0_46px_100px_-55px_rgba(0,0,0,0.58)] sm:left-8 sm:right-8 lg:bottom-[9vh] lg:left-[23vw] lg:right-[4vw] lg:top-[13vh]"
                >
                  <Image
                    src={activeService.image}
                    alt={activeService.title}
                    fill
                    priority={activeIndex < 2}
                    sizes="(max-width: 1023px) 94vw, 74vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.36),transparent_46%,rgba(0,0,0,0.12)),linear-gradient(180deg,rgba(0,0,0,0.08),transparent_55%,rgba(0,0,0,0.32))]" />
                  <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/20 px-3 py-2 backdrop-blur-md sm:right-7 sm:top-7">
                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/78">{activeService.short} / LIONOVART</span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
                    className="absolute inset-x-0 bottom-[7%] overflow-hidden"
                    aria-hidden
                  >
                    <div className="whitespace-nowrap font-clash text-[clamp(4.5rem,13vw,14rem)] font-black uppercase leading-[0.72] tracking-[-0.08em] text-white/[0.12]">{activeService.short}</div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.56, delay: 0.08, ease: EASE }}
                  className="absolute bottom-[15svh] left-5 z-30 max-w-[84vw] sm:left-8 lg:bottom-[15vh] lg:left-[8vw] lg:max-w-[32vw] xl:left-[9vw]"
                >
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-brand-red">Lionovart / {activeService.number}</span>
                  <h3 className="mt-3 font-clash text-[clamp(2.8rem,11vw,5.8rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em] text-[#111111] lg:text-[clamp(3.8rem,5.6vw,7.1rem)]">
                    {activeService.title}
                  </h3>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.52, delay: 0.16, ease: EASE }}
                  className="absolute bottom-[3.6svh] left-5 right-5 z-40 rounded-[1.2rem] border border-black/10 bg-[#f2efe8]/92 p-4 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:left-8 sm:right-8 sm:p-5 lg:bottom-[10vh] lg:left-auto lg:right-[6vw] lg:w-[min(34rem,34vw)] lg:p-6"
                >
                  <p className="font-body text-[13px] font-medium leading-[1.6] text-black/62 sm:text-[15px] lg:text-[16px]">{activeService.description}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 lg:mt-4">
                    {activeService.deliverables.slice(0, 5).map((item) => (
                      <span key={item} className="inline-flex items-center gap-1.5 font-mono text-[7px] font-bold uppercase tracking-[0.1em] text-black/46 sm:text-[8px]">
                        <span className="h-1 w-1 rounded-full bg-brand-red" />{item}
                      </span>
                    ))}
                  </div>
                </motion.div>

                <div className="absolute bottom-[2.4svh] right-5 z-30 flex items-center gap-2 lg:hidden">
                  {services.map((service, index) => (
                    <button key={service.id} type="button" onClick={() => goToState(index)} aria-label={`Show ${service.title}`} className={`h-1 rounded-full transition-all ${index === activeIndex ? "w-7 bg-brand-red" : "w-2 bg-black/20"}`} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
