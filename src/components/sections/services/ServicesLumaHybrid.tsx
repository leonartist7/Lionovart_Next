"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export type LumaHybridServiceItem = {
  id: string;
  number: string;
  title: string;
  description: string;
  deliverables: readonly string[];
};

type ServicesLumaHybridProps = {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  items: LumaHybridServiceItem[];
};

type StageItem = LumaHybridServiceItem & {
  shortLabel: string;
  isOverview?: boolean;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function shortLabelFor(item: LumaHybridServiceItem) {
  const map: Record<string, string> = {
    branding: "BRAND",
    web: "WEB",
    "content-studio": "CONTENT",
    print: "PRINT",
    "smart-systems": "AI",
    growth: "GROWTH",
  };
  return map[item.id] ?? item.title.split(/\s+/)[0]?.toUpperCase() ?? item.number;
}

function ServiceGlyph({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 160 160",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: "h-full w-full",
  };
  const strokeProps = {
    stroke: "currentColor",
    strokeWidth: 1.35,
    vectorEffect: "non-scaling-stroke" as const,
  };

  if (id === "all") {
    return (
      <svg {...common}>
        <circle cx="80" cy="80" r="52" {...strokeProps} />
        <circle cx="80" cy="80" r="32" {...strokeProps} />
        <circle cx="80" cy="80" r="12" {...strokeProps} />
        <path d="M80 10V150M10 80H150" {...strokeProps} />
        <path d="M30 30L130 130M130 30L30 130" {...strokeProps} opacity="0.45" />
        <circle cx="80" cy="80" r="4" fill="currentColor" />
      </svg>
    );
  }

  if (id === "branding") {
    return (
      <svg {...common}>
        <circle cx="80" cy="80" r="48" {...strokeProps} />
        <circle cx="80" cy="80" r="28" {...strokeProps} />
        <path d="M80 12V148M12 80H148" {...strokeProps} />
        <path d="M42 42L118 118M118 42L42 118" {...strokeProps} opacity="0.35" />
        <circle cx="80" cy="80" r="5" fill="currentColor" />
      </svg>
    );
  }

  if (id === "web") {
    return (
      <svg {...common}>
        <rect x="22" y="30" width="116" height="100" rx="6" {...strokeProps} />
        <path d="M22 52H138M50 52V130M110 52V130" {...strokeProps} />
        <path d="M34 41H54M115 41H126" {...strokeProps} strokeWidth="2" />
        <circle cx="80" cy="88" r="16" {...strokeProps} />
        <circle cx="80" cy="88" r="4" fill="currentColor" />
      </svg>
    );
  }

  if (id === "content-studio") {
    return (
      <svg {...common}>
        <rect x="20" y="34" width="120" height="92" rx="6" {...strokeProps} />
        <path d="M65 61L104 80L65 99V61Z" fill="currentColor" />
        <path d="M30 22V34M50 22V34M70 22V34M90 22V34M110 22V34M130 22V34" {...strokeProps} />
        <path d="M30 126V138M50 126V138M70 126V138M90 126V138M110 126V138M130 126V138" {...strokeProps} />
      </svg>
    );
  }

  if (id === "print") {
    return (
      <svg {...common}>
        <rect x="46" y="24" width="78" height="104" rx="4" {...strokeProps} />
        <rect x="34" y="36" width="78" height="104" rx="4" {...strokeProps} />
        <path d="M50 58H92M50 70H85M50 102H96M50 114H79" {...strokeProps} strokeWidth="2" />
        <path d="M24 36H40M34 26V42M112 140H132M122 130V150" {...strokeProps} />
      </svg>
    );
  }

  if (id === "smart-systems") {
    return (
      <svg {...common}>
        <path d="M39 44L80 27L121 47L130 91L98 130H56L27 93L39 44Z" {...strokeProps} />
        <path d="M39 44L76 70L121 47M27 93L76 70L98 130M130 91L76 70L80 27" {...strokeProps} />
        <circle cx="76" cy="70" r="8" fill="currentColor" />
        <circle cx="39" cy="44" r="4" fill="currentColor" />
        <circle cx="121" cy="47" r="4" fill="currentColor" />
        <circle cx="98" cy="130" r="4" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M24 128H136M31 121L59 91L79 103L127 49" {...strokeProps} strokeWidth="2" />
      <path d="M106 49H127V70" {...strokeProps} strokeWidth="2" />
      <circle cx="59" cy="91" r="6" fill="currentColor" />
      <circle cx="79" cy="103" r="6" fill="currentColor" />
      <circle cx="127" cy="49" r="6" fill="currentColor" />
      <path d="M34 32H76M34 44H61" {...strokeProps} opacity="0.5" />
    </svg>
  );
}

function StageVisual({ item, side }: { item: StageItem; side: "left" | "right" }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${side}-${item.id}`}
        initial={{ opacity: 0, scale: 0.72, filter: "blur(14px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.82, filter: "blur(10px)" }}
        transition={{ duration: 0.72, ease: EASE }}
        className="relative h-full w-full"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[clamp(8rem,15vw,14rem)] w-[clamp(8rem,15vw,14rem)] text-black/70">
            <ServiceGlyph id={item.id} />
            <div aria-hidden className="absolute inset-[18%] -z-10 rounded-full bg-brand-red/[0.07] blur-2xl" />
          </div>
        </div>

        <span className="absolute left-0 top-0 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-brand-red/90 sm:text-[10px]">
          {side === "left" ? "Signal" : "System"} / {item.number}
        </span>
        <span className="absolute bottom-0 left-0 font-mono text-[9px] uppercase tracking-[0.2em] text-black/30">
          LIONOVART / {item.shortLabel}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

function ContentStage({ item, serviceCount }: { item: StageItem; serviceCount: number }) {
  const capabilityLine = item.isOverview
    ? "One system / six disciplines"
    : item.deliverables.slice(0, 4).join(" · ");

  return (
    <div className="grid h-full w-full grid-cols-[0.82fr_1.5fr_0.82fr] items-center gap-8 lg:gap-12">
      <motion.div
        className="relative h-[34vh] max-h-[330px] min-h-[250px] border-y border-black/10 py-6"
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, ease: EASE }}
      >
        <StageVisual item={item} side="left" />
      </motion.div>

      <div className="flex min-w-0 flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`center-${item.id}`}
            initial={{ opacity: 0, y: 26, scale: 0.92, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, scale: 0.96, filter: "blur(8px)" }}
            transition={{ duration: 0.72, ease: EASE }}
            className="flex w-full flex-col items-center"
          >
            <div className="mb-5 flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-brand-red sm:text-[10px]">
              <span>{item.isOverview ? "00" : item.number}</span>
              <span className="h-px w-8 bg-brand-red/45" />
              <span>{item.isOverview ? `${serviceCount} disciplines` : "Active discipline"}</span>
            </div>

            <h3 className="max-w-[12ch] font-clash text-[clamp(2.9rem,6.3vw,6.8rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em] text-[#111111]">
              {item.title}
            </h3>

            <p className="mt-7 max-w-[48ch] font-body text-[clamp(0.95rem,1.35vw,1.15rem)] font-medium leading-[1.65] text-black/55">
              {item.description}
            </p>

            <p className="mt-6 max-w-[52ch] font-mono text-[9px] font-bold uppercase tracking-[0.17em] text-black/38 sm:text-[10px]">
              {capabilityLine || "Strategy · systems · execution · growth"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        className="relative h-[34vh] max-h-[330px] min-h-[250px] border-y border-black/10 py-6"
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, ease: EASE }}
      >
        <StageVisual item={item} side="right" />
      </motion.div>
    </div>
  );
}

function StaticMobile({ eyebrow, heading, headingAccent, items }: ServicesLumaHybridProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const overview: StageItem = {
    id: "all",
    number: "00",
    shortLabel: "ALL",
    title: "One system",
    description:
      "Strategy, identity, digital, content, intelligent systems and growth — designed to work as one connected brand engine.",
    deliverables: [],
    isOverview: true,
  };
  const stageItems = [overview, ...items.map((item) => ({ ...item, shortLabel: shortLabelFor(item) }))];
  const active = stageItems[activeIndex] ?? overview;

  return (
    <div className="min-h-[100svh] bg-bg-surface-light px-5 pb-20 pt-16 text-[#111111] sm:px-8 sm:pt-20">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-[9ch] font-clash text-[clamp(3rem,14vw,5.6rem)] font-semibold uppercase leading-[0.82] tracking-[-0.055em]">
        {heading} <span className="text-brand-red">{headingAccent}</span>
      </h2>

      <div className="mt-14">
        <div className="mx-auto h-32 w-32 text-black/70 sm:h-40 sm:w-40">
          <ServiceGlyph id={active.id} />
        </div>
        <div className="mt-9 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <h3 className="mx-auto max-w-[11ch] font-clash text-[clamp(2.6rem,11vw,4.6rem)] font-semibold uppercase leading-[0.84] tracking-[-0.05em]">
                {active.title}
              </h3>
              <p className="mx-auto mt-6 max-w-[34rem] font-body text-[15px] font-medium leading-[1.65] text-black/55 sm:text-[17px]">
                {active.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div data-lenis-prevent className="-mx-5 mt-12 flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8">
        {stageItems.map((item, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={selected}
              className={`shrink-0 rounded-full border px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition-colors ${
                selected
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-black/12 bg-black/[0.025] text-black/52"
              }`}
            >
              {item.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ServicesLumaHybrid({ eyebrow, heading, headingAccent, items }: ServicesLumaHybridProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stageChromeRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteractive, setIsInteractive] = useState(false);
  const interactiveRef = useRef(false);

  const stageItems = useMemo<StageItem[]>(() => {
    const overview: StageItem = {
      id: "all",
      number: "00",
      shortLabel: "ALL",
      title: "One system",
      description:
        "Strategy, identity, digital, content, intelligent systems and growth — designed to work as one connected brand engine.",
      deliverables: [],
      isOverview: true,
    };
    return [overview, ...items.map((item) => ({ ...item, shortLabel: shortLabelFor(item) }))];
  }, [items]);

  const active = stageItems[activeIndex] ?? stageItems[0];

  useEffect(() => {
    if (activeIndex > stageItems.length - 1) setActiveIndex(0);
  }, [activeIndex, stageItems.length]);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stickyRef.current ||
        !introRef.current ||
        !emblemRef.current ||
        !glowRef.current ||
        !selectorRef.current ||
        !anchorRef.current ||
        !contentRef.current ||
        !stageChromeRef.current
      ) {
        return;
      }

      const selector = selectorRef.current;
      const content = contentRef.current;
      const chrome = stageChromeRef.current;

      if (reduceMotion) {
        gsap.set(introRef.current, { opacity: 0 });
        gsap.set(emblemRef.current, { opacity: 0 });
        gsap.set(glowRef.current, { opacity: 1 });
        gsap.set(selector, { opacity: 1 });
        gsap.set(content, { opacity: 1, scale: 1, filter: "blur(0px)" });
        gsap.set(chrome, { opacity: 1 });
        selector.style.setProperty("--selector-scale", "1");
        interactiveRef.current = true;
        setIsInteractive(true);
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px) and (max-width: 1439px)",
          isLarge: "(min-width: 1440px)",
        },
        (context) => {
          const conditions = context.conditions as Record<string, boolean>;
          const emblemEntry = conditions.isLarge ? 350 : 310;
          const emblemRest = conditions.isLarge ? 270 : 240;
          const selectorSize = 56;

          const getDelta = () => {
            const emblemRect = emblemRef.current!.getBoundingClientRect();
            const anchorRect = anchorRef.current!.getBoundingClientRect();
            return {
              x: anchorRect.left + anchorRect.width / 2 - (emblemRect.left + emblemRect.width / 2),
              y: anchorRect.top + anchorRect.height / 2 - (emblemRect.top + emblemRect.height / 2),
            };
          };

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.055,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const nextInteractive = self.progress >= 0.5;
                if (nextInteractive !== interactiveRef.current) {
                  interactiveRef.current = nextInteractive;
                  setIsInteractive(nextInteractive);
                }
              },
            },
          });

          timeline.set(emblemRef.current!, {
            y: () => window.innerHeight * 0.78,
            width: emblemEntry,
            height: emblemEntry,
            opacity: 1,
          });
          timeline.set(selector, { opacity: 0, "--selector-scale": 0 });
          timeline.set(content, { opacity: 0, scale: 0.58, filter: "blur(22px)" });
          timeline.set(chrome, { opacity: 0 });

          timeline.to(introRef.current!, { y: "48vh", scale: 0.16, opacity: 0, duration: 0.14, ease: "power3.in" }, 0.02);
          timeline.to(emblemRef.current!, { y: 0, width: emblemRest, height: emblemRest, duration: 0.22, ease: "power3.out" }, 0.04);
          timeline.to(
            emblemRef.current!,
            {
              width: selectorSize,
              height: selectorSize,
              x: () => getDelta().x,
              y: () => getDelta().y,
              duration: 0.18,
              ease: "power2.inOut",
            },
            0.23,
          );

          timeline.fromTo(glowRef.current!, { opacity: 0 }, { opacity: 1, duration: 0.13, ease: "power1.out" }, 0.27);
          timeline.fromTo(
            content,
            { opacity: 0, scale: 0.58, filter: "blur(22px)" },
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.23, ease: "power2.out" },
            0.28,
          );
          timeline.to(emblemRef.current!, { opacity: 0, duration: 0.035 }, 0.355);
          timeline.to(selector, { opacity: 1, duration: 0.035 }, 0.355);
          timeline.to(selector, { "--selector-scale": 1, duration: 0.09, ease: "back.out(1.55)" }, 0.36);
          timeline.to(chrome, { opacity: 1, duration: 0.08 }, 0.42);
          timeline.set({}, {}, 1.2);
        },
      );

      return () => mm.revert();
    },
    { scope: stickyRef, dependencies: [reduceMotion] },
  );

  if (!items.length) return null;

  return (
    <section
      ref={sectionRef}
      id="services"
      data-art-directed="light"
      className="relative bg-bg-surface-light text-[#111111] lg:h-[360vh]"
    >
      <div className="lg:hidden">
        <StaticMobile eyebrow={eyebrow} heading={heading} headingAccent={headingAccent} items={items} />
      </div>

      <div
        ref={stickyRef}
        className="relative hidden h-[100svh] overflow-hidden bg-bg-surface-light lg:sticky lg:top-0 lg:block"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.42]"
          style={{
            backgroundImage:
              "linear-gradient(to right, transparent calc(25% - .5px), rgba(17,17,17,.055) 25%, transparent calc(25% + .5px), transparent calc(50% - .5px), rgba(17,17,17,.055) 50%, transparent calc(50% + .5px), transparent calc(75% - .5px), rgba(17,17,17,.055) 75%, transparent calc(75% + .5px))",
          }}
        />

        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute bottom-[-22vh] left-1/2 h-[76vh] w-[92vw] -translate-x-1/2 opacity-0 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 55% 42% at 50% 50%, rgba(229,25,42,.16) 0%, rgba(229,25,42,.055) 38%, transparent 72%)",
          }}
        />

        <div
          ref={stageChromeRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-40 mx-auto flex max-w-[1500px] items-start justify-between px-10 pt-[5.5vh] opacity-0 lg:px-14"
        >
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red">
              {eyebrow}
            </p>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-black/32">
              LIONOVART / SERVICE SYSTEM
            </p>
          </div>
          <p className="max-w-[25ch] text-right font-mono text-[9px] uppercase leading-[1.55] tracking-[0.16em] text-black/30">
            Scroll to reveal / select to explore
          </p>
        </div>

        <div
          ref={introRef}
          className="pointer-events-none absolute inset-x-0 top-[13vh] z-10 mx-auto flex max-w-[1500px] flex-col items-center px-6 text-center"
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red">
            {eyebrow}
          </p>
          <h2 className="mt-5 font-clash text-[clamp(5.5rem,11vw,11rem)] font-semibold uppercase leading-[0.78] tracking-[-0.07em] text-[#111111]">
            {heading}
            <br />
            <span className="text-brand-red">{headingAccent}</span>
          </h2>
          <div className="mt-7 flex items-center gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black/34">
            <span>One vision</span>
            <span className="h-px w-10 bg-black/15" />
            <span>Six disciplines</span>
          </div>
        </div>

        <div
          ref={contentRef}
          className="pointer-events-none absolute inset-x-0 top-[20vh] z-20 mx-auto h-[52vh] max-h-[560px] max-w-[1420px] px-10 opacity-0 lg:px-14"
          style={{ willChange: "transform, opacity, filter" }}
        >
          <ContentStage item={active} serviceCount={items.length} />
        </div>

        <div
          ref={emblemRef}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[48%] z-30 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-[0_28px_90px_-34px_rgba(229,25,42,.44)]"
          style={{ willChange: "transform, width, height, opacity" }}
        >
          <img src="/images/lionovart-icon.svg" alt="" className="h-full w-full object-cover" decoding="async" />
        </div>

        <div
          ref={anchorRef}
          aria-hidden
          className="pointer-events-none absolute bottom-[9vh] left-1/2 z-0 h-14 w-14 -translate-x-1/2 opacity-0"
        />

        <div
          ref={selectorRef}
          className="absolute bottom-[7.5vh] left-1/2 z-50 -translate-x-1/2 opacity-0"
        >
          <div className="flex items-center justify-center gap-2.5 lg:gap-3">
            {stageItems.map((item, index) => {
              const selected = index === activeIndex;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!isInteractive) return;
                    setActiveIndex(index);
                  }}
                  disabled={!isInteractive}
                  aria-pressed={selected}
                  animate={{
                    width: selected ? 154 : 48,
                    backgroundColor: selected ? "#e5192a" : "rgba(17,17,17,0.055)",
                    borderColor: selected ? "#e5192a" : "rgba(17,17,17,0.12)",
                  }}
                  transition={{ duration: 0.48, ease: EASE }}
                  className="relative flex h-12 shrink-0 items-center justify-center overflow-hidden rounded-full border backdrop-blur-sm disabled:cursor-default sm:h-[3.25rem]"
                  style={{
                    transform: "scale(var(--selector-scale, 0))",
                    transformOrigin: "center",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {selected ? (
                      <motion.span
                        key={`selected-${item.id}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.36, ease: EASE }}
                        className="whitespace-nowrap px-4 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-white"
                      >
                        {item.shortLabel}
                      </motion.span>
                    ) : (
                      <motion.span
                        key={`idle-${item.id}`}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-black/46"
                      >
                        {item.shortLabel.slice(0, 3)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
