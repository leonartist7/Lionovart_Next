"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useServicesStyle } from "@/components/sections/services/servicesVariantStore";

const SERVICES_STATIC = [
  { id: "branding",      number: "01", imgUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&q=80", imgAlt: "Brand Identity" },
  { id: "web",           number: "02", imgUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=900&q=80", imgAlt: "Web Development" },
  { id: "video",         number: "03", imgUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=900&q=80", imgAlt: "Video Production" },
  { id: "social",        number: "04", imgUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=900&q=80", imgAlt: "Social Media" },
  { id: "print",         number: "05", imgUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&q=80", imgAlt: "Print Branding" },
  { id: "smart-systems", number: "06", imgUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80", imgAlt: "Smart Systems & AI" },
  { id: "growth",        number: "07", imgUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80", imgAlt: "Growth Marketing" },
];

export default function Services(props: any) {
  const { t } = useLanguage();

  const eyebrow     = props.eyebrow      || t.services.eyebrow;
  const heading     = props.heading      || t.services.heading;
  const headingAccent = props.headingAccent || t.services.headingAccent;

  const SERVICES = props.items
    ? props.items.map((item: any, i: number) => ({
        ...SERVICES_STATIC[i],
        ...item,
        id:          SERVICES_STATIC[i]?.id     ?? String(i),
        number:      SERVICES_STATIC[i]?.number ?? String(i + 1).padStart(2, "0"),
        imgUrl:      SERVICES_STATIC[i]?.imgUrl,
        imgAlt:      SERVICES_STATIC[i]?.imgAlt,
        deliverables: item.deliverables ?? [],
      }))
    : SERVICES_STATIC.map((s, i) => ({
        ...s,
        title:        t.services.items[i]?.title        ?? "",
        description:  t.services.items[i]?.description  ?? "",
        deliverables: (t.services.items[i]?.deliverables as readonly string[] | undefined) ?? [],
      }));

  const [activeIndex, setActiveIndex] = useState(0);
  const active = SERVICES[activeIndex] ?? SERVICES[0];

  // TEMP eval — flat vs neumorphic styling, flipped live via <ServicesVariantToggle>.
  const neu = useServicesStyle() === "neumorphic";

  /* ── Desktop: useScroll on the tall scroll zone ─────────────── */
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: desktopScrollRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const idx = Math.min(SERVICES.length - 1, Math.max(0, Math.floor(p * SERVICES.length)));
    setActiveIndex(idx);
  });

  /* ── Mobile: IntersectionObserver on each card ───────────────── */
  const mobileRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Cooldown prevents the accordion expand/collapse layout shift from triggering
  // a cascade of observer callbacks (the "up and down" feedback loop).
  const lastObserverSetAt = useRef<number>(0);
  useEffect(() => {
    const observers = mobileRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && Date.now() - lastObserverSetAt.current > 500) {
            setActiveIndex(i);
            lastObserverSetAt.current = Date.now();
          }
        },
        { rootMargin: "-30% 0px -30% 0px", threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [SERVICES.length]);

  return (
    <section id="services" className="relative bg-bg-surface-light">

      {/* ── Section Header ─────────────────────────────────────── */}
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 pt-[60px] md:pt-[80px] pb-[40px] md:pb-[40px] lg:pb-0 flex flex-col items-center text-center">
        <motion.p
          className="text-brand-red text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          className="text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#111111] max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {heading} <span className="text-brand-red">{headingAccent}</span>
        </motion.h2>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DESKTOP LAYOUT (lg+)
          Tall scroll zone — sticky two-column panel inside.
          Left: names list · Right: active detail
      ══════════════════════════════════════════════════════════ */}
      <div
        ref={desktopScrollRef}
        className="hidden lg:block relative"
        style={{ height: `${SERVICES.length * 85}vh` } as React.CSSProperties}
      >
        {/* Sticky wrapper */}
        <div className="sticky top-0 h-screen flex items-start lg:pt-[10vh] overflow-hidden">
          <div className="mx-auto max-w-[1280px] w-full px-8 xl:px-12 grid grid-cols-[1fr_1fr] gap-12 xl:gap-20 items-center h-[80vh]">

            {/* ── Left: name list ─────────────────────────────── */}
            <div className="flex flex-col justify-center h-full">
              {SERVICES.map((s: any, i: number) => {
                const isActive = i === activeIndex;
                return (
                  <div key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveIndex(i);
                        const el = desktopScrollRef.current;
                        if (el) {
                          const top = el.getBoundingClientRect().top + window.scrollY;
                          const perService = (el.offsetHeight / SERVICES.length);
                          window.scrollTo({ top: top + i * perService + perService * 0.5, behavior: "smooth" });
                        }
                      }}
                      className={`group flex items-baseline gap-4 text-left w-full py-[clamp(8px,1.2vh,18px)] transition-all duration-500 ${
                        neu && isActive
                          ? "rounded-2xl px-4 shadow-[3px_3px_8px_rgba(0,0,0,0.10),-3px_-3px_8px_rgba(255,255,255,0.95)]"
                          : ""
                      }`}
                    >
                      <span
                        className={`font-mono text-[11px] xl:text-[12px] tracking-widest shrink-0 transition-all duration-500 ${
                          isActive ? "text-brand-red opacity-100" : "text-brand-red opacity-10"
                        }`}
                      >
                        {s.number}
                      </span>
                      <span
                        className={`font-bold uppercase leading-none font-clash text-[clamp(1.6rem,2.8vw,2.6rem)] transition-colors duration-500 ${
                          isActive ? "text-[#111111]" : "text-[#e2e2e2] group-hover:text-[#aaa]"
                        }`}
                      >
                        {s.title}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── Right: active service detail ────────────────── */}
            <div className="relative h-full">
              <AnimatePresence>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex flex-col gap-5 justify-center"
                >
                  {/* Description + tags */}
                  <div className="flex flex-col gap-4">
                    <p className="text-[#111] text-[17px] xl:text-[19px] font-semibold leading-[1.7]">
                      {active.description}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {active.deliverables.map((tag: string) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1.5 text-[12px] xl:text-[13px] font-bold uppercase tracking-wider text-brand-red"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Image card */}
                  <div className="w-full rounded-[18px] xl:rounded-[22px] overflow-hidden flex-1 min-h-0 max-h-[200px] xl:max-h-[240px] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.14)]">
                    <img
                      src={active.imgUrl}
                      alt={active.imgAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MOBILE / TABLET LAYOUT (<lg)
          Vertical list — IntersectionObserver activates each item.
          Active item expands: description → tags → image.
      ══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden mx-auto max-w-[640px] px-4 md:px-8 pb-[80px]">
        {SERVICES.map((s: any, i: number) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={s.id}
              ref={(el) => { mobileRefs.current[i] = el; }}
              className=""
            >
              {/* Title row */}
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`flex items-baseline gap-3 w-full text-left py-9 md:py-11 transition-all duration-500 ${
                  neu && isActive
                    ? "rounded-2xl px-4 shadow-[3px_3px_8px_rgba(0,0,0,0.10),-3px_-3px_8px_rgba(255,255,255,0.95)]"
                    : ""
                }`}
              >
                <span
                  className={`font-mono text-[11px] tracking-widest shrink-0 transition-colors duration-400 ${
                    isActive ? "text-brand-red" : "text-brand-red/15"
                  }`}
                >
                  {s.number}
                </span>
                <span
                  className={`font-bold uppercase leading-none font-clash transition-all duration-400 ${
                    isActive
                      ? "text-[#111] text-[1.75rem] sm:text-[2.2rem]"
                      : "text-[#d8d8d8] text-[1.6rem] sm:text-[2rem]"
                  }`}
                >
                  {s.title}
                </span>
              </button>

              {/* Expandable content */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8 flex flex-col gap-4">
                      {/* Description */}
                      <p className="text-[#111] text-[15px] sm:text-[16px] md:text-[17px] font-semibold leading-[1.7]">
                        {s.description}
                      </p>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {s.deliverables.map((tag: string) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-brand-red"
                          >
                            <span className="w-1 h-1 rounded-full bg-brand-red shrink-0" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      {/* Image — below tags */}
                      <div className="w-full aspect-[16/9] max-h-[150px] sm:max-h-[180px] md:max-h-[210px] rounded-[14px] overflow-hidden shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)]">
                        <img
                          src={s.imgUrl}
                          alt={s.imgAlt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {/* Bottom border */}
        <div className="border-t border-[#e0e0e0]" />
      </div>

    </section>
  );
}
