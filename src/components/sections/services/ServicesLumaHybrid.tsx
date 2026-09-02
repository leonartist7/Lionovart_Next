"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

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

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function ServiceGlyph({ id }: { id: string }) {
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

function Header({
  eyebrow,
  heading,
  headingAccent,
}: Pick<ServicesLumaHybridProps, "eyebrow" | "heading" | "headingAccent">) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red sm:text-[11px]">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-[10ch] font-clash text-[clamp(2.8rem,7vw,6.7rem)] font-semibold uppercase leading-[0.84] tracking-[-0.055em] text-white">
        {heading} <span className="text-brand-red">{headingAccent}</span>
      </h2>
    </div>
  );
}

function AnimatedServiceCard({
  service,
  index,
  count,
  progress,
}: {
  service: LumaHybridServiceItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const x = useTransform(progress, (value) => {
    const target = value * Math.max(1, count - 1);
    return `${(index - target) * 62}vw`;
  });
  const scale = useTransform(progress, (value) => {
    const target = value * Math.max(1, count - 1);
    const distance = Math.abs(index - target);
    return clamp(1.025 - distance * 0.11, 0.82, 1.025);
  });
  const opacity = useTransform(progress, (value) => {
    const target = value * Math.max(1, count - 1);
    const distance = Math.abs(index - target);
    return clamp(1 - distance * 0.58, 0.12, 1);
  });
  const y = useTransform(progress, (value) => {
    const target = value * Math.max(1, count - 1);
    return Math.min(Math.abs(index - target) * 18, 34);
  });
  const rotateY = useTransform(progress, (value) => {
    const target = value * Math.max(1, count - 1);
    return clamp((index - target) * -5, -8, 8);
  });
  const detailOpacity = useTransform(progress, (value) => {
    const target = value * Math.max(1, count - 1);
    return clamp(1 - Math.abs(index - target) * 2.7, 0, 1);
  });

  return (
    <div className="pointer-events-none absolute left-1/2 top-[57%] w-[min(58vw,760px)] -translate-x-1/2 -translate-y-1/2">
      <motion.article
        style={{ x, y, scale, opacity, rotateY }}
        className="relative h-[min(58vh,590px)] min-h-[430px] overflow-hidden rounded-[clamp(1.5rem,2.5vw,2.5rem)] border border-black/10 bg-[#f7f4ef] text-[#111111] shadow-[0_40px_100px_-44px_rgba(0,0,0,0.9)] [transform-style:preserve-3d] will-change-transform"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(229,25,42,0.12),transparent_34%)]" />
        <div className="absolute inset-y-0 left-0 w-px bg-black/10" />

        <div className="relative grid h-full grid-cols-[0.88fr_1.12fr]">
          <div className="relative flex flex-col justify-between border-r border-black/10 p-[clamp(1.5rem,3vw,3rem)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-brand-red">
                LIONOVART / {service.number}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            </div>

            <div className="relative mx-auto h-[clamp(9rem,16vw,14rem)] w-[clamp(9rem,16vw,14rem)] text-black/75">
              <ServiceGlyph id={service.id} />
              <div className="absolute inset-0 -z-10 scale-75 rounded-full bg-brand-red/[0.06] blur-2xl" />
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/35">
              Scroll / explore
            </span>
          </div>

          <div className="relative flex flex-col justify-center p-[clamp(1.75rem,3.6vw,4rem)]">
            <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-brand-red">
              {service.number}
            </span>
            <h3 className="mt-3 max-w-[11ch] font-clash text-[clamp(2.2rem,5vw,5.2rem)] font-semibold uppercase leading-[0.84] tracking-[-0.05em]">
              {service.title}
            </h3>

            <motion.div style={{ opacity: detailOpacity }} className="mt-7">
              <p className="max-w-[38ch] font-body text-[clamp(0.95rem,1.35vw,1.15rem)] font-medium leading-[1.65] text-black/60">
                {service.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
                {service.deliverables.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-black/12 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.11em] text-black/48"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

function MobileCard({ service }: { service: LumaHybridServiceItem }) {
  return (
    <article className="snap-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#f7f4ef] text-[#111111] shadow-[0_30px_80px_-45px_rgba(0,0,0,0.95)]">
      <div className="relative flex min-h-[14rem] items-center justify-center border-b border-black/10 bg-[radial-gradient(circle_at_50%_45%,rgba(229,25,42,0.12),transparent_48%)]">
        <div className="h-32 w-32 text-black/75 sm:h-36 sm:w-36">
          <ServiceGlyph id={service.id} />
        </div>
        <span className="absolute left-5 top-5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-brand-red">
          LIONOVART / {service.number}
        </span>
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="max-w-[12ch] font-clash text-[2.3rem] font-semibold uppercase leading-[0.88] tracking-[-0.045em] sm:text-[3rem]">
          {service.title}
        </h3>
        <p className="mt-5 font-body text-[15px] font-medium leading-[1.65] text-black/60 sm:text-[16px]">
          {service.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {service.deliverables.map((item) => (
            <span
              key={item}
              className="rounded-full border border-black/12 px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-black/48"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function ServicesLumaHybrid({
  eyebrow,
  heading,
  headingAccent,
  items,
}: ServicesLumaHybridProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!items.length) return;
    const next = Math.round(value * Math.max(0, items.length - 1));
    setActiveIndex((current) => (current === next ? current : next));
  });

  if (!items.length) return null;

  const staticDesktopRail = (
    <div className="hidden lg:block py-24">
      <Header eyebrow={eyebrow} heading={heading} headingAccent={headingAccent} />
      <div className="mt-12 flex snap-x snap-mandatory gap-8 overflow-x-auto px-[8vw] pb-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((service) => (
          <div key={service.id} className="w-[min(52vw,42rem)] shrink-0 snap-center">
            <MobileCard service={service} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section id="services" data-art-directed="dark" className="relative bg-[#0b0b0b] text-white">
      <div className="lg:hidden">
        <div className="pb-8 pt-20 sm:pb-10 sm:pt-24">
          <Header eyebrow={eyebrow} heading={heading} headingAccent={headingAccent} />
        </div>

        <div className="mb-4 flex items-center justify-between px-5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 sm:px-8">
          <span>Swipe to explore</span>
          <span className="text-brand-red">
            {String(mobileIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
        </div>

        <div
          data-lenis-prevent
          onScroll={(event) => {
            const element = event.currentTarget;
            const maxScroll = element.scrollWidth - element.clientWidth;
            if (maxScroll <= 0) return;
            const next = Math.round((element.scrollLeft / maxScroll) * (items.length - 1));
            setMobileIndex((current) => (current === next ? current : next));
          }}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[7vw] pb-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
        >
          {items.map((service) => (
            <div key={service.id} className="w-[86vw] max-w-[36rem] shrink-0 snap-center">
              <MobileCard service={service} />
            </div>
          ))}
        </div>
      </div>

      {reduceMotion ? (
        staticDesktopRail
      ) : (
        <div
          ref={sectionRef}
          className="relative hidden lg:block"
          style={{ height: `${Math.max(280, items.length * 48)}vh` }}
        >
          <div className="sticky top-0 h-screen overflow-hidden bg-[#0b0b0b]">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(229,25,42,0.14),transparent_35%)]" />
            <div aria-hidden className="absolute left-1/2 top-[54%] h-[70vh] w-px -translate-x-1/2 -translate-y-1/2 bg-white/[0.05]" />

            <div className="absolute left-0 right-0 top-[clamp(2.5rem,7vh,5.5rem)] z-20">
              <Header eyebrow={eyebrow} heading={heading} headingAccent={headingAccent} />
            </div>

            <div className="absolute inset-0 [perspective:1400px]">
              {items.map((service, index) => (
                <AnimatedServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  count={items.length}
                  progress={scrollYProgress}
                />
              ))}
            </div>

            <div className="absolute bottom-7 left-0 right-0 z-30 mx-auto flex max-w-[1440px] items-end justify-between px-12">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
                  One system / six disciplines
                </p>
                <div className="mt-3 flex w-[min(34vw,30rem)] gap-1.5">
                  {items.map((service, index) => (
                    <span
                      key={service.id}
                      className={`h-[2px] flex-1 transition-colors duration-300 ${
                        index <= activeIndex ? "bg-brand-red" : "bg-white/12"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-baseline gap-3 font-mono font-bold">
                <span className="text-[1.6rem] text-brand-red">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-[10px] tracking-[0.2em] text-white/28">
                  / {String(items.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
