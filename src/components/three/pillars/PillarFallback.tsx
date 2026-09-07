"use client";

import { PILLARS, PILLAR_ORDER } from "./config/pillars";

/**
 * PillarFallback — polished static representation when WebGL cannot
 * initialize (directive §16). Pure CSS glass: smoked centre, per-pillar
 * edge gradient, restrained glow. Never a blank canvas or spinner.
 */
export default function PillarFallback() {
  return (
    <div
      className="grid w-full grid-cols-1 items-stretch justify-items-center gap-6 lg:grid-cols-3"
      role="img"
      aria-label="LION, NOVA and ART glass pillar cards"
    >
      {PILLAR_ORDER.map((id) => {
        const cfg = PILLARS[id];
        return (
          <div
            key={id}
            className="relative w-full max-w-[380px] overflow-hidden rounded-[22px] border border-white/10 bg-[#0a0a0c]/90 p-7"
            style={{
              boxShadow: `0 30px 80px -30px ${cfg.secondary}55, inset 0 1px 0 rgba(255,255,255,0.18)`,
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[22px] p-[1.5px]"
              style={{
                background: `linear-gradient(135deg, ${cfg.glow}, ${cfg.secondary} 35%, ${cfg.primary} 70%, ${cfg.secondary})`,
                WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                maskComposite: "exclude",
                opacity: 0.9,
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(90% 60% at 50% 0%, ${cfg.secondary}26 0%, transparent 60%), radial-gradient(120% 90% at 50% 110%, ${cfg.primary}33 0%, transparent 55%)`,
              }}
            />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: cfg.secondary }}>
              {id === "LION" ? "Lead" : id === "NOVA" ? "Move" : "Direct"}
            </p>
            <h3 className="mt-3 font-clash text-4xl font-bold uppercase tracking-tight text-white">{id}</h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-white/60">
              {id === "LION" && "Brand worlds, positioning and growth strategy with a point of view."}
              {id === "NOVA" && "AI OS, voice agents and automation that give time back."}
              {id === "ART" && "Identity, film, content, web and apps built as one world."}
            </p>
          </div>
        );
      })}
    </div>
  );
}
