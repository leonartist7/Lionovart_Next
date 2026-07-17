"use client";

/**
 * HeroImageCycler — small bottom-center pill with prev/next arrows + counter.
 *
 * Lives inside the hero (HeroRevealWrapper) so it inherits the wrapper's
 * scroll-driven opacity/translate — fades in with the hero and pushes off
 * with the section. Visible on all devices.
 *
 * Focal-point picker toggle is rendered ONLY in development. In production
 * builds, `process.env.NODE_ENV === "production"` is inlined by Next/SWC,
 * so the toggle and its handler are dead-code-eliminated.
 */

import { useHeroImageStore } from "@/lib/stores/hero-image-store";

const IS_DEV = process.env.NODE_ENV !== "production";

export function HeroImageCycler() {
  const { images, currentIndex, next, prev, pickerActive, togglePicker } =
    useHeroImageStore();

  // Nothing to cycle through — render nothing.
  if (images.length <= 1) return null;

  return (
    <div
      className="pointer-events-auto absolute bottom-5 left-1/2 z-[20] -translate-x-1/2 select-none md:bottom-7"
      role="group"
      aria-label="Hero image cycler"
    >
      <div className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1.5 ring-1 ring-white/15 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous hero image"
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c917]/60"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18 9 12l6-6" />
          </svg>
        </button>

        <span className="w-[34px] text-center text-[11px] font-medium tabular-nums tracking-wider text-white/70">
          {currentIndex + 1}<span className="text-white/35">/</span>{images.length}
        </span>

        <button
          type="button"
          onClick={next}
          aria-label="Next hero image"
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c917]/60"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>

        {/* Dev-only focal point picker toggle. Stripped from production bundles. */}
        {IS_DEV && (
          <>
            <span aria-hidden="true" className="mx-1 h-3 w-px bg-white/15" />
            <button
              type="button"
              onClick={togglePicker}
              aria-label="Toggle focal point picker"
              aria-pressed={pickerActive}
              title="Dev: drag to set focal point"
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-base leading-none transition-colors hover:bg-white/10",
                pickerActive ? "text-[#f0c917]" : "text-white/45 hover:text-white",
              ].join(" ")}
            >
              ⊹
            </button>
          </>
        )}
      </div>
    </div>
  );
}
