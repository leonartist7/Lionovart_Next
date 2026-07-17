"use client";

import { useState, useEffect, useRef } from "react";

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
  disciplines: readonly Discipline[];
  media: readonly DisciplineMedia[];
}

/* Progressive "liquid glass" frost: dense at the bottom (behind the text),
   dissolving upward into the clear mockup. Two stacked backdrop-blur layers
   with fading masks give the gradient depth. */
const GLASS_STRONG: React.CSSProperties = {
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  maskImage: "linear-gradient(to top, #000 0%, #000 22%, transparent 55%)",
  WebkitMaskImage: "linear-gradient(to top, #000 0%, #000 22%, transparent 55%)",
};
const GLASS_SUBTLE: React.CSSProperties = {
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
  maskImage: "linear-gradient(to top, #000 30%, transparent 70%)",
  WebkitMaskImage: "linear-gradient(to top, #000 30%, transparent 70%)",
};

export default function DisciplineCards({ disciplines, media }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* ── Mobile carousel: one card at a time, navigated by arrows + swipe.
     Desktop renders the plain 3-col grid (the track collapses via md:contents). ── */
  const count = disciplines.length;
  const [current, setCurrent] = useState(0);
  const go = (dir: number) =>
    setCurrent((c) => Math.min(count - 1, Math.max(0, c + dir)));

  const touchStartX = useRef<number | null>(null);
  const swipedRef = useRef(false);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swipedRef.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (
      touchStartX.current !== null &&
      Math.abs(e.touches[0].clientX - touchStartX.current) > 10
    )
      swipedRef.current = true;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) go(1);
    else if (dx > 50) go(-1);
    touchStartX.current = null;
  };

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

  const active = openIndex !== null ? media[openIndex] : null;

  return (
    <>
      {/* `.wwd-grid` / `.wwd-card` are the entrance hooks — the column→row
          (desktop) and vertical cascade (mobile) live in WhatWeDo.tsx. The
          GSAP transform sits on the `.wwd-card` wrapper so it never clobbers the
          inner button's hover transform. */}
      <div className="wwd-grid relative overflow-hidden lg:overflow-visible lg:grid lg:grid-cols-3 lg:gap-6 px-6 lg:px-0">
        {/* Mobile: horizontal carousel track (one card visible). On desktop
            `md:contents` drops the track from layout so the grid lays out the
            cards directly and the translateX is ignored. */}
        <div
          className="flex transition-transform duration-500 ease-out lg:contents"
          style={{ transform: `translateX(-${current * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
        {disciplines.map((d, i) => {
          const m = media[i % media.length];
          const hasVideo = !!m.video;
          return (
            <div key={i} className="wwd-card w-full shrink-0 lg:w-auto px-2 lg:px-0">
              <button
                type="button"
                onClick={() => {
                  if (swipedRef.current) return;
                  setOpenIndex(i);
                }}
                onMouseEnter={hasVideo ? playPreview : undefined}
                onMouseLeave={hasVideo ? stopPreview : undefined}
                aria-label={`${d.label} — ${hasVideo ? "watch" : "view"} ${d.kicker}`}
                className="group relative block h-[50vh] lg:h-auto lg:aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-black text-left transition-[border-color] duration-500 ease-out hover:border-[#f0c917]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c917]/60"
              >
                {/* media — full-bleed; hover-plays video when present */}
                {hasVideo ? (
                  <video
                    src={m.video}
                    poster={m.image}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover duration-[900ms] ease-out"
                  />
                ) : (
                  <img
                    src={m.image}
                    alt={d.label}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover duration-[900ms] ease-out"
                  />
                )}

                {/* progressive liquid-glass frost — rises from the bottom, fades up */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={GLASS_SUBTLE} />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={GLASS_STRONG} />

                {/* legibility tint */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

                {/* gold sheen on hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(120%_80%_at_50%_100%,rgba(240,201,23,0.18),transparent_60%)]" />

                {/* inset hairline — brightens to gold on hover */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 rounded-3xl ring-1 ring-inset ring-white/10 transition-colors duration-500 group-hover:ring-[#f0c917]/40"
                />

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

                {/* text — sits on the frosted band at the bottom */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-7">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold text-[#f0c917]/90">0{i + 1}</span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                      {d.kicker}
                    </span>
                    <span aria-hidden="true" className="h-px flex-1 bg-white/15" />
                  </div>
                  <h3 className="mt-3 font-clash text-[1.6rem] font-bold uppercase leading-none tracking-tight text-white md:text-[1.8rem]">
                    {d.label}
                  </h3>
                  <p className="mt-2.5 font-body text-[15px] leading-relaxed text-white/70 transition-colors duration-500 group-hover:text-white/85">
                    {d.body}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
        </div>

      </div>

      {/* Mobile-only nav arrows — centered below the card */}
      {count > 1 && (
        <div className="lg:hidden flex justify-end gap-4 mt-6 px-6">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => go(-1)}
            disabled={current === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-opacity disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18 9 12l6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => go(1)}
            disabled={current === count - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-opacity disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

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
    </>
  );
}
