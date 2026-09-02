"use client";

import { useEffect, useState } from "react";
import { useNovaStore } from "@/lib/stores/nova-store";
import { LiquidGlass } from "./LiquidGlass";

const LINKS = [
  { id: "proof", label: "Proof" },
  { id: "systems", label: "Systems" },
  { id: "results", label: "Numbers" },
  { id: "process", label: "Process" },
] as const;

export default function AiPageNav() {
  const [active, setActive] = useState<string>(LINKS[0].id);
  const [visible, setVisible] = useState(false);
  const openNova = useNovaStore((state) => state.openNova);

  useEffect(() => {
    const sections = LINKS.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const candidate = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (candidate) setActive(candidate.target.id);
      },
      { rootMargin: "-32% 0px -55%", threshold: [0, 0.15, 0.4] },
    );
    sections.forEach((section) => observer.observe(section));

    // The nav must not share the screen with the hero's own CTA — three
    // floating call-to-action systems stacking inside the first chapter is
    // what made this page feel cluttered. Hold until the hero has fully left.
    // The threshold is cached rather than measured per scroll event, so the
    // listener never reads layout in the hot path.
    let releaseAt = 0;
    const measure = () => {
      const hero = document.getElementById("outcome");
      releaseAt = hero
        ? hero.offsetTop + hero.offsetHeight - window.innerHeight * 0.25
        : window.innerHeight * 1.8;
    };
    const onScroll = () => setVisible(window.scrollY > releaseAt);
    measure();
    onScroll();

    const onResize = () => {
      measure();
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 transition-[opacity,transform] duration-500 md:bottom-auto md:top-24 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 md:-translate-y-4"
      }`}
    >
      <nav aria-label="AI page navigation">
      <LiquidGlass still className="pointer-events-auto mx-auto w-fit max-w-full rounded-full p-1.5" >
        <div className="flex items-center gap-1">
        <span className="sr-only">AI page navigation</span>
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            aria-current={active === link.id ? "location" : undefined}
            className={`relative min-h-10 rounded-full px-2.5 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white sm:px-4 md:text-[14px] ${
              active === link.id ? "bg-white/10 text-white" : "text-white/58 hover:text-white"
            }`}
          >
            {link.label}
            {active === link.id && (
              <span aria-hidden className="absolute inset-x-3 -bottom-px h-px bg-[var(--ai-gold)] shadow-[0_0_9px_var(--ai-gold)]" />
            )}
          </a>
        ))}
        <button
          type="button"
          onClick={() => openNova("nav", true)}
          className="min-h-10 whitespace-nowrap rounded-full bg-brand-red px-3.5 py-2.5 text-[13px] font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:px-5 md:text-[14px]"
        >
          <span className="md:hidden">Talk</span>
          <span className="hidden md:inline">Talk to Nova</span>
        </button>
        </div>
      </LiquidGlass>
      </nav>
    </div>
  );
}
