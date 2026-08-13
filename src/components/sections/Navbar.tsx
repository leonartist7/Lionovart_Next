"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hrefForTitle } from "@/lib/service-routes";
import { useLenis } from "lenis/react";
import { getWhatsAppUrl } from "@/lib/contact";
import { MenuBurgerLottie } from "@/components/ui/menu-burger-lottie";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

/** Pixels to clear the fixed navbar when scrolling to a section. */
const SCROLL_OFFSET = -88;

/** Nav links â†’ section anchors (resolved via data-nova-section or DOM id). */
const NAV_LINKS = [
  { label: "We", target: "about" },
  { label: "Expertise", target: "services", hasDropdown: true },
  { label: "Work", target: "work" },
  { label: "Results", target: "testimonials" },
];

/**
 * Expertise dropdown stagger. Items fade/slide in topâ†’down on open and fade
 * out topâ†’down (staggerDirection 1) on close â€” a slow, smooth cascade rather
 * than a sharp snap.
 */
// Outer card (glass band / mobile group): on CLOSE the items cascade out first
// (afterChildren) then the card height-collapses slowly & smoothly; on OPEN the
// card expands first (beforeChildren) then items cascade in.
const CARD_VARIANTS = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.4, ease: "easeInOut" as const, when: "afterChildren" as const },
  },
  show: {
    opacity: 1,
    height: "auto" as const,
    transition: { duration: 0.3, ease: "easeOut" as const, when: "beforeChildren" as const },
  },
};
// Inner container â€” only orchestrates the topâ†’down item stagger.
const STAGGER_VARIANTS = {
  hidden: { transition: { staggerChildren: 0.05, staggerDirection: 1 as const } },
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};
// Flat list (mobile/burger Expertise) â€” combines height-collapse + stagger on a
// single element whose direct children are the service buttons.
const FLAT_LIST_VARIANTS = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.35,
      ease: "easeInOut" as const,
      when: "afterChildren" as const,
      staggerChildren: 0.05,
      staggerDirection: 1 as const,
    },
  },
  show: {
    opacity: 1,
    height: "auto" as const,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
      when: "beforeChildren" as const,
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};
const SERVICE_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: -6, transition: { duration: 0.35, ease: "easeInOut" as const } },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export default function Navbar() {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [squareCorners, setSquareCorners] = useState(false);
  const [heroThreshold, setHeroThreshold] = useState(600);
  const [isVisible, setIsVisible] = useState(true);
  const [expertiseOpen, setExpertiseOpen] = useState(false);
  const [mobileExpertiseOpen, setMobileExpertiseOpen] = useState(false);
  const { scrollY } = useScroll();
  const navChromeOpacity = useTransform(scrollY, [2, 96], [0, 1]);
  const { t, locale } = useLanguage();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = useLenis() as any;
  const router = useRouter();

  const services: string[] = (t.services?.items ?? []).map((s: { title: string }) => s.title);

  const ctaLabel = t.nav.cta;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const isSquare = window.localStorage.getItem("lionovart-corner-style") === "square";
      setSquareCorners(isSquare);
      document.documentElement.dataset.cornerStyle = isSquare ? "square" : "rounded";
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleCornerStyle = () => {
    setSquareCorners((current) => {
      const next = !current;
      const style = next ? "square" : "rounded";
      document.documentElement.dataset.cornerStyle = style;
      window.localStorage.setItem("lionovart-corner-style", style);
      return next;
    });
  };

  const scrollToTarget = (target: string) => {
    const el = document.querySelector<HTMLElement>(`[data-nova-section="${target}"], #${target}`);
    if (!el) return;
    if (lenis?.scrollTo) lenis.scrollTo(el, { offset: SCROLL_OFFSET });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMobileOpen(false);
    setMobileExpertiseOpen(false);
    setExpertiseOpen(false);
  };

  // Expertise item click: go to the service page if it exists, else scroll to
  // the homepage Services section (services without a page yet).
  const goToService = (title: string) => {
    const href = hrefForTitle(title);
    if (!href) {
      scrollToTarget("services");
      return;
    }
    setIsMobileOpen(false);
    setMobileExpertiseOpen(false);
    setExpertiseOpen(false);
    router.push(href);
  };

  const openNavCta = () => {
    setIsMobileOpen(false);
    setMobileExpertiseOpen(false);
    setExpertiseOpen(false);
    window.open(getWhatsAppUrl(), "_blank", "noopener,noreferrer");
  };

  // Mega-menu hover controller: a small close delay bridges the gap between the
  // "Expertise" trigger and the band so the panel stays open across it.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openExpertise = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setExpertiseOpen(true);
  };
  const scheduleCloseExpertise = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setExpertiseOpen(false), 140);
  };

  // Refs to avoid stale closures in scroll handler
  const isInLumaRef      = useRef(false);
  const isVisibleRef     = useRef(true);
  const hideAtRef        = useRef(0);      // tracks lowest scrollY when hidden
  const lastScrollRef    = useRef(0);
  const isMobileOpenRef  = useRef(false);
  // After a language change the page reflows and nudges scroll â€” don't let that
  // auto-close the mobile menu. Suppress scroll-close briefly.
  const suppressCloseUntil = useRef(0);

  const setNavVisible = (val: boolean) => {
    isVisibleRef.current = val;
    setIsVisible(val);
  };

  // Keep isMobileOpenRef in sync so the scroll handler never sees stale state
  useEffect(() => {
    isMobileOpenRef.current = isMobileOpen;
  }, [isMobileOpen]);

  // Language change reflows the layout â†’ suppress the scroll-driven menu close
  // for a moment so the menu stays open after picking a language.
  useEffect(() => {
    suppressCloseUntil.current = Date.now() + 800;
  }, [locale]);

  // Close the Expertise band the moment we leave hero mode (links â†’ burger).
  useEffect(() => {
    if (isPastHero) setExpertiseOpen(false);
  }, [isPastHero]);

  useEffect(() => {
    const calc = () => {
      setHeroThreshold(window.innerHeight * 0.62);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // â”€â”€ Hide navbar when the Luma / ONE VISION section is in view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const el = document.getElementById("luma-showcase");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInLumaRef.current = entry.isIntersecting;
        // Always restore navbar when leaving the section
        if (!entry.isIntersecting) setNavVisible(true);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = lastScrollRef.current;
    const delta = latest - prev;
    lastScrollRef.current = latest;

    setIsPastHero(latest > heroThreshold);
    setIsScrolled(latest > 2);

    // Close mobile menu on any scroll â‰¥ 5px â€” unless a recent language change
    // is reflowing the page (which would otherwise close it spuriously).
    if (
      isMobileOpenRef.current &&
      Math.abs(delta) >= 5 &&
      Date.now() >= suppressCloseUntil.current
    ) {
      setIsMobileOpen(false);
    }

    if (!isInLumaRef.current) return;

    if (delta > 0) {
      // Scrolling down â†’ hide; keep tracking the lowest position
      if (isVisibleRef.current) setNavVisible(false);
      hideAtRef.current = latest;
    } else if (delta < 0) {
      // Scrolling up â†’ restore once user moves â‰¥15 px upward
      if (!isVisibleRef.current && hideAtRef.current - latest >= 15) {
        setNavVisible(true);
      }
    }
  });

  const heroMode = !isPastHero;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3"
      animate={{ y: isVisible ? 0 : "-120%" }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="relative w-full max-w-[1400px]">

        {/* â”€â”€ Nav bar pill â”€â”€ */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full rounded-xl shadow-sm"
        >
          {/* Navbar is transparent over the hero (no red bar) â€” the dark glass
              layer below fades in once scrolled. Red is reserved for the CTA. */}

          {/* Glass layer â€” fades in after hero.
              backdrop-blur-md (12px) instead of -xl (24px): near-identical
              for a thin bar over content, ~half the per-frame blur cost.
              backdrop-filter is forced to `none` while the bar sits at
              opacity 0 in hero mode, so it computes nothing until revealed. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            // backdrop-filter forced to `none` in hero mode (computes nothing
            // until revealed) + isolate as its own GPU layer so Lenis scroll
            // re-uses the cached blur instead of re-rasterizing every frame.
            style={{
              opacity: navChromeOpacity,
              backgroundColor: "rgba(0,0,0,0.20)",
              pointerEvents: "none",
              backdropFilter: isScrolled ? undefined : "none",
              WebkitBackdropFilter: isScrolled ? undefined : "none",
              transform: "translateZ(0)",
              contain: "paint",
            }}
          />

          {/* Nav inner row */}
          <div className="relative mx-auto flex w-full items-center justify-between px-4 pt-2 pb-1 lg:px-7">

            {/* Icon at the left edge, with the wordmark held at true center. */}
            <Link href="/" className="relative z-40 inline-flex shrink-0 items-center">
              <img
                src="/images/Icon.avif"
                alt="Lionovart home"
                className="h-[2rem] w-[2rem] rounded-full object-cover sm:h-[2.25rem] sm:w-[2.25rem] lg:h-[2.5rem] lg:w-[2.5rem]"
              />
            </Link>

            <Link href="/" className="absolute left-1/2 z-40 -translate-x-1/2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/LOGO.svg"
                alt="LIONOVART"
                data-nav-logo
                className="h-[1.375rem] w-auto sm:h-[1.5rem] lg:h-[1.625rem]"
              />
            </Link>

            {/*
              Desktop nav links â€” hero mode only.
              AnimatePresence fades them out during the redâ†’glass transition.
            */}
            <AnimatePresence>
              {heroMode && (
                <motion.div
                  key="desktop-links"
                  className="hidden xl:flex flex-1 items-center justify-start pl-[3.5rem]"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                >
                  <ul className="flex items-center justify-start gap-6 xl:gap-8">
                    {NAV_LINKS.map((link) => (
                      <li
                        key={link.target}
                        className="relative"
                        onMouseEnter={link.hasDropdown ? openExpertise : undefined}
                        onMouseLeave={link.hasDropdown ? scheduleCloseExpertise : undefined}
                      >
                        <button
                          type="button"
                          onClick={() => scrollToTarget(link.target)}
                          aria-expanded={link.hasDropdown ? expertiseOpen : undefined}
                          className="group relative flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.15em] text-white/90 transition-colors hover:text-white"
                        >
                          {link.label}
                          {link.hasDropdown && (
                            <svg
                              width="10" height="10" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                              className={`transition-transform duration-200 ${expertiseOpen ? "rotate-180" : ""}`}
                              aria-hidden="true"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          )}
                          <span className="absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Language switcher and menu */}
            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 lg:gap-5">
              {/* Language switcher â€” visible in hero (red) mode, hidden after transition */}
              <AnimatePresence>
                {heroMode && (
                  <motion.div
                    key="lang-hero"
                    className="hidden sm:block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <LanguageSwitcher isHeroMode={true} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile burger â€” always visible on small screens */}
              <MenuBurgerLottie
                isOpen={isMobileOpen}
                onToggle={() => setIsMobileOpen((v) => !v)}
                className="lg:hidden"
              />

              <span className="hidden lg:flex">
                <MenuBurgerLottie
                  isOpen={isMobileOpen}
                  onToggle={() => setIsMobileOpen((v) => !v)}
                />
              </span>
            </div>
          </div>
        </motion.header>

        {/*
          â”€â”€ Expertise mega-band (desktop hero) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Full-width white liquid-glass panel that emerges from BEHIND the bar
          (-z-10) and overlays the page. Opens on hover of the Expertise zone;
          on close the items cascade out topâ†’down, then the card height-collapses.
        */}
        <AnimatePresence>
          {expertiseOpen && heroMode && services.length > 0 && (
            <motion.div
              key="expertise-band"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={CARD_VARIANTS}
              onMouseEnter={openExpertise}
              onMouseLeave={scheduleCloseExpertise}
              className="hidden lg:block absolute left-[15%] right-[15%] top-0 -z-10 overflow-hidden rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.78)",
                backdropFilter: "blur(28px) saturate(1.8)",
                WebkitBackdropFilter: "blur(28px) saturate(1.8)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              <motion.div
                variants={STAGGER_VARIANTS}
                className="mx-auto grid max-w-[700px] grid-cols-2 gap-2 px-8 pt-[92px] pb-9"
              >
                {services.map((title) => (
                  <motion.button
                    key={title}
                    variants={SERVICE_ITEM_VARIANTS}
                    type="button"
                    onClick={() => goToService(title)}
                    className="rounded-xl px-5 py-4 text-left text-[17px] font-semibold tracking-wide text-black/75 transition-colors hover:bg-black/[0.06] hover:text-black"
                  >
                    {title}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/*
          â”€â”€ Mobile dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Lives OUTSIDE motion.header so overflow-hidden doesn't clip it.
          Shares the same max-w wrapper so width is inherited.
          Mobile:  left-[15%] right-[15%]  â€” 70% width, centered.
          Desktop: centered pill, fixed 260 px wide.
          Links:   horizontal, underline-only on hover, pushed below the bar.
        */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="absolute top-0 left-[15%] right-[15%] lg:left-1/4 lg:right-1/4 lg:w-auto -z-10 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(28px) saturate(1.8)",
                WebkitBackdropFilter: "blur(28px) saturate(1.8)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              {/* vertical on mobile/tablet, horizontal on desktop */}
              <nav className="flex flex-col lg:flex-row items-center justify-center px-6 pt-[82px] pb-8 gap-5 lg:gap-x-6">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.target}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2, delay: i * 0.06 }}
                    className="flex flex-col items-center"
                    onMouseEnter={link.hasDropdown ? () => setMobileExpertiseOpen(true) : undefined}
                    onMouseLeave={link.hasDropdown ? () => setMobileExpertiseOpen(false) : undefined}
                  >
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => scrollToTarget(link.target)}
                        className="group relative flex items-center py-1.5 text-[15px] font-semibold uppercase tracking-[0.12em] text-black/70 hover:text-black transition-colors whitespace-nowrap"
                      >
                        {link.label}
                        <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black/80 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                      </button>
                      {link.hasDropdown && (
                        <button
                          type="button"
                          onClick={() => setMobileExpertiseOpen((v) => !v)}
                          aria-label="Toggle expertise list"
                          aria-expanded={mobileExpertiseOpen}
                          className="p-1 text-black/60 hover:text-black"
                        >
                          <svg
                            width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            className={`transition-transform duration-200 ${mobileExpertiseOpen ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {link.hasDropdown && mobileExpertiseOpen && (
                        <motion.div
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          variants={FLAT_LIST_VARIANTS}
                          className="flex flex-col items-center gap-2 overflow-hidden"
                        >
                          {services.map((title) => (
                            <motion.button
                              key={title}
                              variants={SERVICE_ITEM_VARIANTS}
                              type="button"
                              onClick={() => goToService(title)}
                              className="text-[15px] font-semibold tracking-wide text-black/65 hover:text-black transition-colors"
                            >
                              {title}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25, delay: NAV_LINKS.length * 0.06 }}
                  className="flex w-full justify-center lg:w-auto"
                >
                  <button
                    type="button"
                    onClick={openNavCta}
                    className="w-full rounded-full bg-brand-red px-6 py-2.5 text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#c8121f] lg:w-auto"
                  >
                    {ctaLabel}
                  </button>
                </motion.div>

                {/* Language switcher */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2, delay: (NAV_LINKS.length + 1) * 0.06 }}
                >
                  <LanguageSwitcher isHeroMode={false} />
                </motion.div>

                <motion.button
                  type="button"
                  onClick={toggleCornerStyle}
                  aria-label={`Use ${squareCorners ? "rounded" : "square"} corners`}
                  aria-pressed={squareCorners}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2, delay: (NAV_LINKS.length + 2) * 0.06 }}
                  className="group flex items-center gap-2 border border-black/15 bg-black/[0.04] px-3 py-2 text-black/70 transition-colors hover:border-black/30 hover:bg-black/[0.08] hover:text-black"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                    Sharp
                  </span>
                  <span
                    aria-hidden="true"
                    className={`relative h-4 w-7 border border-black/25 bg-black/10 transition-colors ${
                      squareCorners ? "bg-black/20" : "rounded-full"
                    }`}
                  >
                    <span
                      className={`absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 bg-black transition-[left,border-radius] duration-200 ${
                        squareCorners ? "left-[14px]" : "left-[2px] rounded-full"
                      }`}
                    />
                  </span>
                </motion.button>

              </nav>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
