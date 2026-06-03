"use client";

/**
 * ServicesVariantToggle — TEMPORARY eval scaffold.
 *
 * Fixed floating panel (bottom-left, stacked above the About eval panel) for
 * flipping the Services section between flat and neumorphic styling live.
 * Clicking smooth-scrolls Services into view.
 *
 * Remove together with servicesVariantStore once the style is chosen.
 */

import {
  setServicesStyle,
  useServicesStyle,
  type ServicesStyle,
} from "./servicesVariantStore";

const STYLE_OPTS: { id: ServicesStyle; label: string }[] = [
  { id: "flat", label: "Flat" },
  { id: "neumorphic", label: "Neumorphic" },
];

function scrollToServices() {
  document
    .querySelector('[data-nova-section="services"]')
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export default function ServicesVariantToggle() {
  const style = useServicesStyle();

  return (
    <div className="fixed bottom-24 left-5 z-[60]">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur-md">
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/35">
          Services · eval
        </span>

        <div className="flex items-center gap-2">
          <span className="w-12 text-[10px] uppercase tracking-wide text-white/40">Style</span>
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            {STYLE_OPTS.map((o) => {
              const active = o.id === style;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setServicesStyle(o.id);
                    scrollToServices();
                  }}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-300 ${
                    active ? "bg-[#f0c917] text-black" : "text-white/55 hover:text-white/85"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
