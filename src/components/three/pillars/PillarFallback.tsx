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
      className="grid w-full grid-cols-1 items-stretch justify-items-center gap-5 px-3 py-4 [perspective:1400px] md:gap-6 lg:grid-cols-3"
      role="img"
      aria-label="LION, NOVA and ART glass pillar cards"
    >
      {PILLAR_ORDER.map((id, index) => {
        const cfg = PILLARS[id];
        return (
          <div
            key={id}
            className="group relative w-full max-w-[390px] overflow-hidden rounded-[28px] border border-white/[0.16] bg-[#09090b]/90 px-7 pb-8 pt-7 shadow-[0_36px_90px_-42px_rgba(0,0,0,0.95)] transition-transform duration-700 ease-out hover:-translate-y-3 lg:min-h-[300px]"
            style={{
              transform: `rotateY(${index === 0 ? "-9deg" : index === 2 ? "9deg" : "0deg"}) rotateX(7deg) rotateZ(${index === 0 ? "-0.6deg" : index === 2 ? "0.6deg" : "0deg"})`,
              boxShadow: `0 42px 90px -38px rgba(0,0,0,0.98), 0 0 75px -32px ${cfg.secondary}aa, inset 0 1px 0 rgba(255,255,255,0.28), inset 18px 0 34px -30px ${cfg.glow}99`,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-5 -bottom-5 h-8 rounded-[50%] blur-xl"
              style={{ background: cfg.secondary, opacity: 0.24, transform: "translateZ(-34px) scaleX(0.9)" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[28px] p-[1px]"
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
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[28px]"
              style={{
                background: `linear-gradient(118deg, ${cfg.glow}18 0%, transparent 22%, transparent 58%, ${cfg.secondary}10 78%, transparent 100%)`,
                mixBlendMode: "screen",
                transform: "translateZ(8px)",
              }}
            />
            <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full blur-3xl" style={{ background: cfg.secondary, opacity: 0.12 }} />
            <div
              aria-hidden
              className="pointer-events-none absolute left-[12%] right-[8%] top-0 h-px blur-[1px]"
              style={{ background: `linear-gradient(90deg, transparent, ${cfg.glow}, ${cfg.secondary}, transparent)`, boxShadow: `0 0 18px 4px ${cfg.secondary}99`, opacity: 0.9 }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-[14%] right-0 h-[38%] w-px blur-[1px]"
              style={{ background: `linear-gradient(180deg, transparent, ${cfg.glow}, ${cfg.secondary}, transparent)`, boxShadow: `0 0 15px 3px ${cfg.secondary}88`, opacity: 0.7 }}
            />
            <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-[34%]" style={{ background: `linear-gradient(90deg, ${cfg.glow}, ${cfg.secondary}, transparent)`, boxShadow: `0 0 16px 3px ${cfg.secondary}cc`, opacity: 0.98 }} />
            <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-[28%] w-px" style={{ background: `linear-gradient(180deg, ${cfg.glow}, ${cfg.secondary}, transparent)`, boxShadow: `0 0 16px 3px ${cfg.secondary}cc`, opacity: 0.9 }} />
            <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-2 w-2 rounded-full blur-[1px]" style={{ background: cfg.glow, boxShadow: `0 0 20px 8px ${cfg.secondary}`, opacity: 1 }} />
            <div className="relative z-10 flex min-h-[245px] flex-col" style={{ transform: "translateZ(24px)" }}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.32em]" style={{ color: cfg.secondary }}>
                  {id === "LION" ? "Lead with confidence" : id === "NOVA" ? "Move with innovation" : "Direct the emotion"}
                </p>
                <span className="font-mono text-[9px] tracking-[0.25em] text-white/25">0{index + 1}</span>
              </div>
              <h3 className="mt-auto font-clash text-[clamp(3.4rem,6vw,5rem)] font-semibold uppercase leading-[0.78] tracking-[-0.07em] text-white">{id}</h3>
              <p className="mt-5 max-w-[28ch] font-body text-[13px] leading-[1.55] text-white/60">
              {id === "LION" && "Brand worlds, positioning and growth strategy with a point of view."}
              {id === "NOVA" && "AI OS, voice agents and automation that give time back."}
              {id === "ART" && "Identity, film, content, web and apps built as one world."}
              </p>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
