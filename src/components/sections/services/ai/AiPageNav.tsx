"use client";

import { useEffect, useState } from "react";
import { useNovaStore } from "@/lib/stores/nova-store";
import { LiquidGlass } from "./LiquidGlass";

const LINKS = [
  { id: "outcome", label: "Start" },
  { id: "systems", label: "Systems" },
  { id: "process", label: "Build" },
  { id: "results", label: "ROI" },
] as const;

/**
 * Section orientation for the AI page.
 *
 * This used to be a centred floating pill at `top-24`, directly under the
 * navbar. That put it in the same optical lane as every heading on the page, so
 * at most resting scroll positions it sat on top of an H2, and at the close it
 * clipped the reformed lion. Desktop now runs a slim rail down the left edge,
 * outside the reading column and outside the 3D composition, which removes the
 * collision entirely rather than negotiating with it.
 *
 * Mobile keeps the bottom bar: 390px has no side room for a rail, and the
 * bottom edge is free now that the global sticky CTA is hidden on this route.
 *
 * No brand red here. DESIGN.md rations it to the single most important thing on
 * screen, and this page already spends it on the hero and closing CTAs; a
 * persistent red button in fixed chrome would compete with both.
 */
export default function AiPageNav() {
  const [active, setActive] = useState("outcome");
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
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const shown = visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4";
  // The ROI chapter is the page's one opaque warm-white relief section, and the
  // rail sits over it at the left edge. White-on-cream is unreadable, so the
  // rail inverts there and borrows that section's own red accent, which also
  // keeps cyan off a background it has no contrast against.
  const onLight = active === "results";

  return (
    <>
      {/* Desktop: a rail at the edge of the frame, clear of both the copy and the world. */}
      <nav
        aria-label="AI page navigation"
        className={`pointer-events-none fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 transition-opacity duration-500 md:block lg:left-8 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <ul className="m-0 flex list-none flex-col gap-5 p-0">
          {LINKS.map((link) => {
            const isActive = active === link.id;
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className="pointer-events-auto group flex items-center gap-3 rounded-sm py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span
                    aria-hidden
                    className={`h-px transition-[width,background-color,box-shadow] duration-400 ${
                      isActive
                        ? onLight
                          ? "w-7 bg-brand-red"
                          : "w-7 bg-[var(--ai-cyan)] shadow-[0_0_9px_var(--ai-cyan)]"
                        : onLight
                          ? "w-3.5 bg-black/25 group-hover:w-5 group-hover:bg-black/55"
                          : "w-3.5 bg-white/30 group-hover:w-5 group-hover:bg-white/60"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 ${
                      isActive
                        ? onLight ? "text-[#111111]" : "text-white"
                        : onLight
                          ? "text-black/45 group-hover:text-black/80"
                          : "text-white/45 group-hover:text-white/80"
                    }`}
                  >
                    {link.label}
                  </span>
                </a>
              </li>
            );
          })}
          <li className="mt-1">
            <button
              type="button"
              onClick={() => openNova("nav", true)}
              className="pointer-events-auto flex items-center gap-3 rounded-sm py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span
                aria-hidden
                className={`h-px w-3.5 ${onLight ? "bg-brand-red/60" : "bg-[var(--ai-cyan)]/50"}`}
              />
              <span
                className={`text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 ${
                  onLight ? "text-brand-red hover:text-[#111111]" : "text-[var(--ai-cyan)] hover:text-white"
                }`}
              >
                Talk to Nova
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile: the bottom bar, unchanged in behaviour. */}
      <div
        className={`pointer-events-none fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 transition-[opacity,transform] duration-500 md:hidden ${shown}`}
      >
        <nav aria-label="AI page navigation">
          <LiquidGlass still className="pointer-events-auto mx-auto w-fit max-w-full rounded-full p-1.5">
            <div className="flex items-center gap-1">
              {LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  aria-current={active === link.id ? "location" : undefined}
                  className={`relative min-h-10 rounded-full px-2.5 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white sm:px-4 ${
                    active === link.id ? "bg-white/10 text-white" : "text-white/58"
                  }`}
                >
                  {link.label}
                  {active === link.id && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-px h-px bg-[var(--ai-cyan)] shadow-[0_0_9px_var(--ai-cyan)]"
                    />
                  )}
                </a>
              ))}
              <button
                type="button"
                onClick={() => openNova("nav", true)}
                className="min-h-10 whitespace-nowrap rounded-full border border-[var(--ai-cyan)]/40 px-3.5 py-2.5 text-[13px] font-semibold text-[var(--ai-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Talk
              </button>
            </div>
          </LiquidGlass>
        </nav>
      </div>
    </>
  );
}
