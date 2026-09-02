"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const SERVICES_STATIC = [
  { id: "branding", number: "01" },
  { id: "web", number: "02" },
  { id: "content-studio", number: "03" },
  { id: "print", number: "04" },
  { id: "smart-systems", number: "05" },
  { id: "growth", number: "06" },
];

/**
 * Archived editorial/sticky Services direction.
 * Kept out of the homepage bundle until intentionally reused on another page.
 */
export default function ServicesStickyEditorial(props: any) {
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.services.eyebrow;
  const heading = props.heading || t.services.heading;
  const headingAccent = props.headingAccent || t.services.headingAccent;

  const SERVICES = props.items
    ? props.items.map((item: any, i: number) => ({
        ...SERVICES_STATIC[i],
        ...item,
        id: SERVICES_STATIC[i]?.id ?? String(i),
        number: SERVICES_STATIC[i]?.number ?? String(i + 1).padStart(2, "0"),
        deliverables: item.deliverables ?? [],
      }))
    : SERVICES_STATIC.map((service, i) => ({
        ...service,
        title: t.services.items[i]?.title ?? "",
        description: t.services.items[i]?.description ?? "",
        deliverables:
          (t.services.items[i]?.deliverables as readonly string[] | undefined) ?? [],
      }));

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const active = SERVICES[activeIndex] ?? SERVICES[0];

  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: desktopScrollRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const index = Math.min(
      SERVICES.length - 1,
      Math.max(0, Math.floor(progress * SERVICES.length)),
    );

    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      setActiveIndex(index);
    }
  });

  const mobileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastObserverSetAt = useRef(0);

  useEffect(() => {
    const observers = mobileRefs.current.map((element, i) => {
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            i !== activeIndexRef.current &&
            Date.now() - lastObserverSetAt.current > 140
          ) {
            activeIndexRef.current = i;
            setActiveIndex(i);
            lastObserverSetAt.current = Date.now();
          }
        },
        { rootMargin: "-34% 0px -34% 0px", threshold: 0 },
      );

      observer.observe(element);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [SERVICES.length]);

  return (
    <section className="relative flex flex-col bg-bg-surface-light text-[#111111]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-4 pb-7 pt-[60px] text-center md:px-8 md:pb-9 md:pt-[80px]">
        <motion.p
          className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red md:text-[13px]"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {eyebrow}
        </motion.p>

        <motion.h2
          className="max-w-3xl font-clash text-[2.5rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#111111] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {heading} <span className="text-brand-red">{headingAccent}</span>
        </motion.h2>
      </div>

      <div
        ref={desktopScrollRef}
        className="relative hidden lg:block"
        style={{ height: `${SERVICES.length * 72}vh` } as CSSProperties}
      >
        <div className="sticky top-0 flex h-screen items-start overflow-hidden pt-[10vh]">
          <div className="mx-auto grid h-[78vh] w-full max-w-[1280px] grid-cols-[0.95fr_1.05fr] items-center gap-12 px-8 xl:gap-20 xl:px-12">
            <div className="flex h-full flex-col justify-center">
              {SERVICES.map((service: any, i: number) => {
                const isActive = i === activeIndex;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      const element = desktopScrollRef.current;
                      if (!element) return;

                      const top = element.getBoundingClientRect().top + window.scrollY;
                      const perService = element.offsetHeight / SERVICES.length;
                      window.scrollTo({
                        top: top + (i + 0.5) * perService,
                        behavior: "smooth",
                      });
                    }}
                    className="group flex w-full items-baseline gap-4 py-[clamp(8px,1.2vh,18px)] text-left transition-colors duration-500"
                  >
                    <span
                      className={`shrink-0 font-mono text-[11px] tracking-widest transition-opacity duration-500 xl:text-[12px] ${
                        isActive
                          ? "text-brand-red opacity-100"
                          : "text-brand-red opacity-10"
                      }`}
                    >
                      {service.number}
                    </span>
                    <span
                      className={`font-clash text-[clamp(1.6rem,2.8vw,2.6rem)] font-bold uppercase leading-none transition-colors duration-500 ${
                        isActive
                          ? "text-[#111111]"
                          : "text-[#e2e2e2] group-hover:text-[#aaa]"
                      }`}
                    >
                      {service.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex h-full items-center">
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-x-0 flex max-w-[34rem] flex-col gap-6 border-l border-black/10 pl-8 xl:pl-10"
                >
                  <p className="font-body text-[17px] font-semibold leading-[1.7] text-[#111111] xl:text-[19px]">
                    {active.description}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {active.deliverables.map((tag: string) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-brand-red xl:text-[13px]"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[640px] px-4 pb-20 md:px-8 lg:hidden">
        {SERVICES.map((service: any, i: number) => {
          const isActive = i === activeIndex;

          return (
            <motion.div
              layout="position"
              transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              key={service.id}
              ref={(element) => {
                mobileRefs.current[i] = element;
              }}
            >
              <button
                type="button"
                onClick={() => {
                  activeIndexRef.current = i;
                  lastObserverSetAt.current = Date.now();
                  setActiveIndex(i);
                }}
                className="flex w-full items-baseline gap-3 py-[clamp(2rem,6vw,3.5rem)] text-left transition-colors duration-500 ease-out"
              >
                <span
                  className={`shrink-0 font-mono text-[11px] tracking-widest transition-colors duration-400 ${
                    isActive ? "text-brand-red" : "text-brand-red/15"
                  }`}
                >
                  {service.number}
                </span>
                <span
                  className={`font-clash text-[1.7rem] font-bold uppercase leading-none transition-colors duration-400 sm:text-[2.1rem] ${
                    isActive ? "text-[#111111]" : "text-[#d8d8d8]"
                  }`}
                >
                  {service.title}
                </span>
              </button>

              <AnimatePresence mode="sync" initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-4 pb-7">
                      <p className="font-body text-[15px] font-semibold leading-[1.7] text-[#111111] sm:text-[16px] md:text-[17px]">
                        {service.description}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {service.deliverables.map((tag: string) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-red sm:text-[12px]"
                          >
                            <span className="h-1 w-1 shrink-0 rounded-full bg-brand-red" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        <div className="border-t border-[#e0e0e0]" />
      </div>
    </section>
  );
}
