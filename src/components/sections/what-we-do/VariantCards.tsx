"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface Discipline {
  label: string;
  kicker: string;
  body: string;
}

/** Optional video upgrades a card to hover-play + lightbox playback. */
export interface DisciplineMedia {
  image: string;
  video?: string;
}

interface Props {
  statement: string;
  disciplines: readonly Discipline[];
  media: readonly DisciplineMedia[];
}

export default function DisciplineCards({ statement, disciplines, media }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* ── Lightbox: Esc to close + lock background scroll ── */
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex]);

  /* ── Hover-to-play (only when a card has a video) ── */
  const playPreview = (e: React.MouseEvent<HTMLElement>) => {
    const v = e.currentTarget.querySelector("video");
    if (v) void v.play().catch(() => {});
  };
  const stopPreview = (e: React.MouseEvent<HTMLElement>) => {
    const v = e.currentTarget.querySelector("video");
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          isMobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
          isReduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop, isReduced } = ctx.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            isReduced: boolean;
          };
          const headlineEl = rootRef.current?.querySelector<HTMLElement>(".vc-headline");
          const cards = gsap.utils.toArray<HTMLElement>(".vc-card");

          if (isReduced || !headlineEl) {
            return; // rendered in final state by default
          }

          // Cinematic statement — line + word reveal
          const split = new SplitText(headlineEl, {
            type: "lines, words",
            linesClass: "overflow-hidden",
          });
          gsap.set(headlineEl, { opacity: 1 });

          const revealHeadline = () =>
            gsap.from(split.words, {
              yPercent: 115,
              duration: 1,
              stagger: 0.04,
              ease: "power4.out",
            });

          const revealCards = () =>
            gsap.fromTo(
              cards,
              { y: 48, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 1,
                stagger: 0.14,
                ease: "power3.out",
              }
            );

          const revealImages = () =>
            gsap.from(".vc-card-img", {
              clipPath: "inset(0 0 100% 0)",
              scale: 1.2,
              duration: 1.1,
              stagger: 0.14,
              ease: "power3.out",
            });

          if (isDesktop) {
            // Compose-on-enter. The section-level pin + fade-out hand-off
            // lives in WhatWeDo.tsx (the whole section is the sticky unit).
            gsap.set(cards, { autoAlpha: 0 });
            const tl = gsap.timeline({
              scrollTrigger: { trigger: rootRef.current, start: "top 78%", once: true },
            });
            tl.add(revealHeadline(), 0)
              .add(revealImages(), 0.25)
              .add(revealCards(), 0.3);
          } else {
            // Mobile / tablet — staggered reveal on entry, no pin
            gsap.set(cards, { autoAlpha: 0 });
            ScrollTrigger.create({
              trigger: headlineEl,
              start: "top 82%",
              once: true,
              onEnter: () => revealHeadline(),
            });
            cards.forEach((card, i) => {
              const img = card.querySelector<HTMLElement>(".vc-card-img");
              const tl = gsap.timeline({
                scrollTrigger: { trigger: card, start: "top 88%", once: true },
                delay: i * 0.06,
              });
              tl.to(card, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, 0).from(
                img,
                { clipPath: "inset(0 0 100% 0)", scale: 1.2, duration: 1, ease: "power3.out" },
                0.1
              );
            });
          }

          return () => split.revert();
        }
      );

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [] }
  );

  const active = openIndex !== null ? media[openIndex] : null;

  return (
    <div ref={rootRef}>
      <h2 className="vc-headline mx-auto max-w-[18ch] text-center font-clash text-[2rem] font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-[2.6rem] md:text-[3.4rem] lg:text-[4rem]">
        {statement}
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-3 md:gap-6">
        {disciplines.map((d, i) => {
          const m = media[i % media.length];
          const hasVideo = !!m.video;
          return (
            <button
              type="button"
              key={i}
              onClick={() => setOpenIndex(i)}
              onMouseEnter={hasVideo ? playPreview : undefined}
              onMouseLeave={hasVideo ? stopPreview : undefined}
              aria-label={`${d.label} — ${hasVideo ? "watch" : "view"} ${d.kicker}`}
              className="vc-card group relative block w-full cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-black text-left transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:border-[#f0c917]/35 hover:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c917]/60"
            >
              {/* inset hairline — brightens to gold on hover */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 rounded-3xl ring-1 ring-inset ring-white/10 transition-colors duration-500 group-hover:ring-[#f0c917]/40"
              />
              {/* media — image now; hover-plays video when present */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {hasVideo ? (
                  <video
                    src={m.video}
                    poster={m.image}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="vc-card-img h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                  />
                ) : (
                  <img
                    src={m.image}
                    alt={d.label}
                    loading="lazy"
                    className="vc-card-img h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                  />
                )}
                {/* base legibility gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                {/* gold sheen on hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(240,201,23,0.18),transparent_60%)]" />
                {/* affordance — play glyph for video, arrow for image */}
                <div className="absolute right-4 top-4 z-10 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {hasVideo ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="relative p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-[#f0c917]/80">0{i + 1}</span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
                    {d.kicker}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
                </div>
                <h3 className="mt-3 font-clash text-[1.6rem] font-bold uppercase leading-none tracking-tight text-white md:text-[1.8rem]">
                  {d.label}
                </h3>
                <p className="mt-2.5 font-body text-[15px] leading-relaxed text-white/55 transition-colors duration-500 group-hover:text-white/75">
                  {d.body}
                </p>
                {/* gold underline grows on hover */}
                <span aria-hidden="true" className="mt-5 block h-px w-10 bg-[#f0c917]/50 transition-all duration-500 group-hover:w-20 group-hover:bg-[#f0c917]" />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Lightbox ── */}
      {active && openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={disciplines[openIndex].label}
          onClick={() => setOpenIndex(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md md:p-8"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpenIndex(null)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#f0c917]/50 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1000px] overflow-hidden rounded-2xl border border-white/10 bg-black"
          >
            <div className="relative aspect-video w-full bg-black">
              {active.video ? (
                <video
                  src={active.video}
                  poster={active.image}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                <img
                  src={active.image}
                  alt={disciplines[openIndex].label}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 p-5 md:p-6">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#f0c917]/80">
                {disciplines[openIndex].kicker}
              </span>
              <h3 className="font-clash text-[1.4rem] font-bold uppercase tracking-tight text-white md:text-[1.7rem]">
                {disciplines[openIndex].label}
              </h3>
              <p className="w-full font-body text-[14px] leading-relaxed text-white/60 md:text-[15px]">
                {disciplines[openIndex].body}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
