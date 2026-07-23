"use client";

/** TEMP eval scaffold — mobile/tablet portrait position. Remove with the store. */
import { setImagePos, useImagePos, type ImagePos } from "./aboutVariantStore";

const OPTS: { id: ImagePos; label: string }[] = [
  { id: "top",    label: "Top" },
  { id: "bottom", label: "Bottom" },
];

function scrollToAbout() {
  document.querySelector('[data-nova-section="about"]')
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export default function AboutVariantToggle() {
  const pos = useImagePos();
  return (
    <div className="fixed bottom-5 left-5 z-[60]">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur-md">
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/35">
          Photo · mobile
        </span>
        <div className="flex items-center gap-2">
          <span className="w-12 text-[10px] uppercase tracking-wide text-white/40">Pos</span>
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            {OPTS.map((o) => {
              const active = o.id === pos;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { setImagePos(o.id); scrollToAbout(); }}
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
