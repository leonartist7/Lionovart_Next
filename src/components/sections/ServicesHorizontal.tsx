"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export type HorizontalServiceItem = {
  id: string;
  number: string;
  title: string;
  description: string;
  deliverables: readonly string[];
  href?: string;
  imgUrl: string;
  imgAlt: string;
};

function ServiceSignal({ id, active }: { id: string; active: boolean }) {
  const common = {
    className: "h-full w-full",
    viewBox: "0 0 120 120",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (id === "branding") {
    return (
      <motion.div aria-hidden className="services-horizontal__signal" data-active={active}>
        <svg {...common}>
          <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="1" />
          <circle cx="60" cy="60" r="24" stroke="currentColor" strokeWidth="1" />
          <path d="M60 8V112M8 60H112" stroke="currentColor" strokeWidth="1" />
          <circle cx="60" cy="60" r="4" fill="currentColor" />
        </svg>
      </motion.div>
    );
  }

  if (id === "web") {
    return (
      <motion.div aria-hidden className="services-horizontal__signal" data-active={active}>
        <svg {...common}>
          <rect x="15" y="22" width="90" height="76" rx="3" stroke="currentColor" />
          <path d="M15 38H105M34 38V98M80 38V98" stroke="currentColor" />
          <path d="M23 30H41M88 30H97" stroke="currentColor" strokeWidth="2" />
          <circle cx="57" cy="67" r="10" stroke="currentColor" />
        </svg>
      </motion.div>
    );
  }

  if (id === "content-studio") {
    return (
      <motion.div aria-hidden className="services-horizontal__signal" data-active={active}>
        <svg {...common}>
          <rect x="14" y="25" width="92" height="70" rx="4" stroke="currentColor" />
          <path d="M50 46L78 60L50 74V46Z" fill="currentColor" />
          <path d="M20 17V25M36 17V25M52 17V25M68 17V25M84 17V25M100 17V25M20 95V103M36 95V103M52 95V103M68 95V103M84 95V103M100 95V103" stroke="currentColor" />
        </svg>
      </motion.div>
    );
  }

  if (id === "print") {
    return (
      <motion.div aria-hidden className="services-horizontal__signal" data-active={active}>
        <svg {...common}>
          <rect x="32" y="20" width="62" height="78" rx="2" stroke="currentColor" />
          <rect x="22" y="30" width="62" height="78" rx="2" stroke="currentColor" />
          <path d="M14 30H27M22 22V35M79 108H92M84 103V116" stroke="currentColor" />
          <path d="M34 46H70M34 55H64M34 79H72" stroke="currentColor" strokeWidth="2" />
        </svg>
      </motion.div>
    );
  }

  if (id === "smart-systems") {
    return (
      <motion.div aria-hidden className="services-horizontal__signal" data-active={active}>
        <svg {...common}>
          <path d="M29 33L60 20L91 35L98 68L74 97H42L20 69L29 33Z" stroke="currentColor" />
          <path d="M29 33L57 52L91 35M20 69L57 52L74 97M98 68L57 52L60 20" stroke="currentColor" />
          <circle cx="57" cy="52" r="6" fill="currentColor" />
          <circle cx="29" cy="33" r="3" fill="currentColor" />
          <circle cx="91" cy="35" r="3" fill="currentColor" />
          <circle cx="74" cy="97" r="3" fill="currentColor" />
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div aria-hidden className="services-horizontal__signal" data-active={active}>
      <svg {...common}>
        <path d="M17 95H103M22 91L45 68L60 77L95 34" stroke="currentColor" strokeWidth="2" />
        <path d="M79 34H95V50" stroke="currentColor" strokeWidth="2" />
        <circle cx="45" cy="68" r="5" fill="currentColor" />
        <circle cx="60" cy="77" r="5" fill="currentColor" />
        <circle cx="95" cy="34" r="5" fill="currentColor" />
      </svg>
    </motion.div>
  );
}

export default function ServicesHorizontal({ items }: { items: HorizontalServiceItem[] }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const visibility = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visibility.set(entry.target, entry.intersectionRatio);

        let nextIndex = activeIndexRef.current;
        let bestRatio = 0;
        cardRefs.current.forEach((card, index) => {
          const ratio = card ? visibility.get(card) ?? 0 : 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            nextIndex = index;
          }
        });

        if (bestRatio >= 0.44 && nextIndex !== activeIndexRef.current) {
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
        }
      },
      { root: rail, threshold: [0.35, 0.44, 0.58, 0.72, 0.86] },
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });
    return () => observer.disconnect();
  }, [items.length]);

  const moveTo = useCallback(
    (index: number) => {
      const next = Math.min(items.length - 1, Math.max(0, index));
      cardRefs.current[next]?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    [items.length, reduceMotion],
  );

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.65, ease: EASE }}
      className="services-horizontal relative overflow-hidden pb-[clamp(5rem,10vw,9rem)] pt-7 sm:pt-10 lg:pt-14"
    >
      <div aria-hidden className="services-horizontal__ambient" />

      <div className="mx-auto mb-5 flex max-w-[1280px] items-center justify-between px-4 sm:mb-7 sm:px-8 lg:px-12">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-black/40">
          Swipe or drag to explore
        </p>
        <p className="font-mono text-[10px] font-bold tabular-nums tracking-[0.2em] text-brand-red">
          {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </p>
      </div>

      <div
        ref={railRef}
        role="region"
        aria-label="Services gallery"
        tabIndex={0}
        data-lenis-prevent
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveTo(activeIndex + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveTo(activeIndex - 1);
          }
        }}
        className="services-horizontal__rail"
      >
        {items.map((service, index) => {
          const active = index === activeIndex;
          return (
            <motion.article
              key={service.id}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              aria-current={active ? "true" : undefined}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: active ? 1 : 0.58,
                      scale: active ? 1 : 0.975,
                      y: active ? 0 : 8,
                    }
              }
              transition={{ duration: 0.55, ease: EASE }}
              className="services-horizontal__card group"
            >
              <div className="relative aspect-video overflow-hidden bg-[#171717]">
                <Image
                  src={service.imgUrl}
                  alt={service.imgAlt}
                  fill
                  sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 72vw, 46vw"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-aria-[current=true]:scale-[1.025]"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />
                <div aria-hidden className="absolute inset-0 ring-1 ring-inset ring-white/10" />

                <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-5 sm:top-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-white/75">
                    Lionovart / {service.number}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 h-20 w-20 text-white/70 sm:bottom-4 sm:right-4 sm:h-24 sm:w-24">
                  <ServiceSignal id={service.id} active={active} />
                </div>
              </div>

              <div className="flex min-h-[19rem] flex-col p-5 sm:min-h-[20rem] sm:p-7 lg:p-8">
                <div className="mb-5 flex items-start gap-3 sm:gap-4">
                  <span className="mt-1 shrink-0 font-mono text-[10px] font-bold tracking-[0.2em] text-brand-red">
                    {service.number}
                  </span>
                  <h3 className="max-w-[14ch] font-clash text-[clamp(1.55rem,3.4vw,2.45rem)] font-bold uppercase leading-[0.95] tracking-[-0.025em] text-white">
                    {service.title}
                  </h3>
                </div>

                <p className="max-w-[48ch] text-[14px] font-medium leading-[1.65] text-white/66 sm:text-[15px]">
                  {service.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
                  {service.deliverables.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/12 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-white/56"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {service.href ? (
                  <Link
                    href={service.href}
                    className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:text-brand-red focus-visible:text-brand-red"
                  >
                    Explore service <span aria-hidden>&rarr;</span>
                  </Link>
                ) : null}
              </div>
            </motion.article>
          );
        })}
      </div>

      <div className="mx-auto mt-6 flex max-w-[1280px] items-center px-4 sm:mt-8 sm:px-8 lg:px-12">
        <div className="flex flex-1 gap-1.5" aria-label="Choose a service">
          {items.map((service, index) => (
            <button
              key={service.id}
              type="button"
              onClick={() => moveTo(index)}
              aria-label={`Show ${service.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className="group h-7 flex-1 py-3 focus-visible:outline-none"
            >
              <span className="block h-px w-full bg-black/15 transition-all duration-500 group-aria-[current=true]:h-0.5 group-aria-[current=true]:bg-brand-red group-focus-visible:bg-brand-red" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
