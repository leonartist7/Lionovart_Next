"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/contact";
import { MenuBurgerLottie } from "@/components/ui/menu-burger-lottie";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Navbar() {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [heroThreshold, setHeroThreshold] = useState(600);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();
  const { t } = useLanguage();

  const NAV_LINKS = [
    { label: t.nav.we, href: "#about" },
    { label: t.nav.services, href: "#services" },
    { label: t.nav.results, href: "#proof" },
  ];

  // Refs to avoid stale closures in scroll handler
  const isInLumaRef      = useRef(false);
  const isVisibleRef     = useRef(true);
  const hideAtRef        = useRef(0);      // tracks lowest scrollY when hidden
  const lastScrollRef    = useRef(0);
  const isMobileOpenRef  = useRef(false);

  const setNavVisible = (val: boolean) => {
    isVisibleRef.current = val;
    setIsVisible(val);
  };

  // Keep isMobileOpenRef in sync so the scroll handler never sees stale state
  useEffect(() => {
    isMobileOpenRef.current = isMobileOpen;
  }, [isMobileOpen]);

  useEffect(() => {
    const calc = () => setHeroThreshold(window.innerHeight * 0.5);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // ── Hide navbar when the Luma / ONE VISION section is in view ────────────────
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

    // Close mobile menu on any scroll ≥ 5px
    if (isMobileOpenRef.current && Math.abs(delta) >= 5) {
      setIsMobileOpen(false);
    }

    if (!isInLumaRef.current) return;

    if (delta > 0) {
      // Scrolling down → hide; keep tracking the lowest position
      if (isVisibleRef.current) setNavVisible(false);
      hideAtRef.current = latest;
    } else if (delta < 0) {
      // Scrolling up → restore once user moves ≥15 px upward
      if (!isVisibleRef.current && hideAtRef.current - latest >= 15) {
        setNavVisible(true);
      }
    }
  });

  const heroMode = !isPastHero;

  return (
    <motion.div
      className="fixed top-[3px] left-0 right-0 z-50 flex justify-center px-3"
      animate={{ y: isVisible ? 0 : "-120%" }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="relative w-full max-w-[1400px]">

        {/* ── Nav bar pill ── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full rounded-xl shadow-sm"
        >
          {/* Red hero layer */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-brand-red rounded-xl"
            initial={{ clipPath: "circle(150% at 50% 50%)", opacity: 1 }}
            animate={
              isPastHero
                ? { clipPath: "circle(0% at 50% 50%)", opacity: 0 }
                : { clipPath: "circle(150% at 50% 50%)", opacity: 1 }
            }
            transition={{
              clipPath: { duration: 0.75, ease: [0.4, 0, 0.2, 1] },
              opacity:  { duration: 0.5,  ease: "easeOut", delay: 0.15 },
            }}
            style={{ pointerEvents: "none" }}
          />

          {/* Glass layer — fades in after hero */}
          <motion.div
            aria-hidden
            className="absolute inset-0 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            animate={{
              opacity: isPastHero ? 1 : 0,
              backgroundColor: "rgba(0,0,0,0.20)",
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ pointerEvents: "none" }}
          />

          {/* Nav inner row */}
          <div className="relative mx-auto flex w-full items-center justify-between px-4 pt-2 pb-1 lg:px-7">

            {/* Logo */}
            <div className="z-40 flex flex-1 items-center">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="hidden sm:inline-flex">
                  <img
                    src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775553451/Lion_emblem2PGbCnR_-_Imgur_t6jkfg.avif"
                    alt="Lionovart logo"
                    aria-hidden="true"
                    className="h-14 w-14 object-contain shrink-0"
                    style={{ filter: "brightness(1) invert(0)" }}
                  />
                </span>
                <span className="text-base sm:text-xl font-bold uppercase tracking-[0.08em] text-white">
                  LIONOVART
                </span>
              </Link>
            </div>

            {/*
              Desktop nav links — hero mode only.
              AnimatePresence fades them out during the red→glass transition.
            */}
            <AnimatePresence>
              {heroMode && (
                <motion.div
                  key="desktop-links"
                  className="hidden lg:flex flex-auto items-center justify-center"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                >
                  <ul className="flex items-center justify-center gap-[3.5rem]">
                    {NAV_LINKS.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group relative text-[13px] font-semibold uppercase tracking-[0.15em] text-white/90 transition-colors hover:text-white"
                        >
                          {link.label}
                          <span className="absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Language switcher + CTA (always) + burger(s) */}
            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 lg:gap-5">
              {/* Language switcher — visible in hero (red) mode, hidden after transition */}
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

              {/* Hero image cycler relocated to HeroImageCycler inside the hero. */}

              {/* CTA — always visible */}
              <div className="shrink-0">
                <LiquidMetalButton
                  label={t.nav.cta}
                  onClick={() => window.open(getWhatsAppUrl(), "_blank", "noopener,noreferrer")}
                  width={140}
                  variant="white"
                  textColor="#ff0000ff"
                  noShadow
                />
              </div>

              {/* Mobile burger — always visible on small screens */}
              <MenuBurgerLottie
                isOpen={isMobileOpen}
                onToggle={() => setIsMobileOpen((v) => !v)}
                className="lg:hidden"
              />

              {/*
                Desktop burger — hidden on mobile (span is hidden lg:flex).
                Fades in smoothly when transitioning from hero → glass mode.
              */}
              <motion.span
                className="hidden lg:flex"
                animate={{ opacity: heroMode ? 0 : 1 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                style={{ pointerEvents: heroMode ? "none" : "auto" }}
              >
                <MenuBurgerLottie
                  isOpen={isMobileOpen}
                  onToggle={() => setIsMobileOpen((v) => !v)}
                />
              </motion.span>
            </div>
          </div>
        </motion.header>

        {/*
          ── Mobile dropdown ──────────────────────────────────────────────────
          Lives OUTSIDE motion.header so overflow-hidden doesn't clip it.
          Shares the same max-w wrapper so width is inherited.
          Mobile:  left-[15%] right-[15%]  — 70% width, centered.
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
                    key={link.href}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2, delay: i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="group relative flex items-center py-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-black/70 hover:text-black transition-colors whitespace-nowrap"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black/80 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                    </Link>
                  </motion.div>
                ))}

                {/* Language switcher */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2, delay: NAV_LINKS.length * 0.06 }}
                >
                  <LanguageSwitcher isHeroMode={false} />
                </motion.div>

              </nav>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
