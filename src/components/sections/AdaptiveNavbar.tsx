"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { Menu, X } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/contact";
import { MenuBurgerLottie } from "@/components/ui/menu-burger-lottie";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./AdaptiveNavbar.module.css";

const SCROLL_OFFSET = -88;
const HERO_THRESHOLD_RATIO = 0.62;
const GLASS_THRESHOLD = 2;
const MOBILE_CLOSE_DELTA = 5;
const LUMA_REVEAL_DELTA = 15;

const NAV_LINKS = [
  { label: "We", target: "about" },
  { label: "Expertise", target: "services", hasDropdown: true },
  { label: "Work", target: "work" },
  { label: "Results", target: "testimonials" },
];

const CARD_VARIANTS = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.32, ease: "easeInOut" as const, when: "afterChildren" as const },
  },
  show: {
    opacity: 1,
    height: "auto" as const,
    transition: { duration: 0.26, ease: "easeOut" as const, when: "beforeChildren" as const },
  },
};

const STAGGER_VARIANTS = {
  hidden: { transition: { staggerChildren: 0.045, staggerDirection: 1 as const } },
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.025 } },
};

const FLAT_LIST_VARIANTS = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.28,
      ease: "easeInOut" as const,
      when: "afterChildren" as const,
      staggerChildren: 0.04,
      staggerDirection: 1 as const,
    },
  },
  show: {
    opacity: 1,
    height: "auto" as const,
    transition: {
      duration: 0.24,
      ease: "easeOut" as const,
      when: "beforeChildren" as const,
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const SERVICE_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: -5, transition: { duration: 0.24, ease: "easeInOut" as const } },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" as const } },
};

const REDUCED_CARD_VARIANTS = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0 } },
  show: { opacity: 1, height: "auto" as const, transition: { duration: 0 } },
};

const REDUCED_ITEM_VARIANTS = {
  hidden: { opacity: 0, transition: { duration: 0 } },
  show: { opacity: 1, transition: { duration: 0 } },
};

export type NavbarProps = {
  lightweightMenu?: boolean;
};

function LightweightMenuToggle({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label="Toggle menu"
      className="relative z-[60] flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-lg transition-transform duration-150 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 motion-reduce:transition-none"
    >
      {isOpen ? (
        <X className="h-6 w-6 text-white" aria-hidden />
      ) : (
        <Menu className="h-6 w-6 text-white" aria-hidden />
      )}
    </button>
  );
}

export default function AdaptiveNavbar({ lightweightMenu = false }: NavbarProps) {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [expertiseOpen, setExpertiseOpen] = useState(false);
  const [mobileExpertiseOpen, setMobileExpertiseOpen] = useState(false);

  const { scrollY } = useScroll();
  const navTop = useTransform(scrollY, [0, 40], [40, 0]);
  const navChromeOpacity = useTransform(scrollY, [GLASS_THRESHOLD, 96], [0, 1]);
  const reducedMotion = Boolean(useReducedMotion());
  const { t, locale } = useLanguage();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = useLenis() as any;

  const services: string[] = (t.services?.items ?? []).map((service: { title: string }) => service.title);
  const ctaLabel = t.nav.cta;
  const useLightweightMenu = lightweightMenu || reducedMotion;

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroThresholdRef = useRef(600);
  const isPastHeroRef = useRef(false);
  const isScrolledRef = useRef(false);
  const isInLumaRef = useRef(false);
  const isVisibleRef = useRef(true);
  const hideAtRef = useRef(0);
  const lastScrollRef = useRef(0);
  const isMobileOpenRef = useRef(false);
  const suppressCloseUntil = useRef(0);

  const setNavVisible = (nextVisible: boolean) => {
    if (isVisibleRef.current === nextVisible) return;
    isVisibleRef.current = nextVisible;
    setIsVisible(nextVisible);
  };

  const syncThresholdState = (latest: number) => {
    const nextPastHero = latest > heroThresholdRef.current;
    if (nextPastHero !== isPastHeroRef.current) {
      isPastHeroRef.current = nextPastHero;
      setIsPastHero(nextPastHero);
      if (nextPastHero) setExpertiseOpen(false);
    }

    const nextScrolled = latest > GLASS_THRESHOLD;
    if (nextScrolled !== isScrolledRef.current) {
      isScrolledRef.current = nextScrolled;
      setIsScrolled(nextScrolled);
    }
  };

  const scrollToTarget = (target: string) => {
    const element = document.querySelector<HTMLElement>(`[data-nova-section="${target}"], #${target}`);
    if (!element) return;

    if (lenis?.scrollTo) lenis.scrollTo(element, { offset: SCROLL_OFFSET });
    else element.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });

    setIsMobileOpen(false);
    setMobileExpertiseOpen(false);
    setExpertiseOpen(false);
  };

  const goToService = (_title: string) => scrollToTarget("services");

  const openNavCta = () => {
    setIsMobileOpen(false);
    setMobileExpertiseOpen(false);
    setExpertiseOpen(false);
    window.open(getWhatsAppUrl(), "_blank", "noopener,noreferrer");
  };

  const openExpertise = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setExpertiseOpen(true);
  };

  const scheduleCloseExpertise = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setExpertiseOpen(false), 120);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    isMobileOpenRef.current = isMobileOpen;
  }, [isMobileOpen]);

  useEffect(() => {
    suppressCloseUntil.current = Date.now() + 800;
  }, [locale]);

  useEffect(() => {
    const updateHeroThreshold = () => {
      heroThresholdRef.current = window.innerHeight * HERO_THRESHOLD_RATIO;
      syncThresholdState(scrollY.get());
    };

    updateHeroThreshold();
    window.addEventListener("resize", updateHeroThreshold, { passive: true });
    return () => window.removeEventListener("resize", updateHeroThreshold);
    // scrollY is a stable MotionValue; syncThresholdState intentionally reads refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollY]);

  useEffect(() => {
    const element = document.getElementById("luma-showcase");
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInLumaRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) setNavVisible(true);
      },
      { threshold: 0 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollRef.current;
    const delta = latest - previous;
    lastScrollRef.current = latest;

    syncThresholdState(latest);

    if (
      isMobileOpenRef.current &&
      Math.abs(delta) >= MOBILE_CLOSE_DELTA &&
      Date.now() >= suppressCloseUntil.current
    ) {
      setIsMobileOpen(false);
    }

    if (!isInLumaRef.current) return;

    if (delta > 0) {
      setNavVisible(false);
      hideAtRef.current = latest;
    } else if (delta < 0 && hideAtRef.current - latest >= LUMA_REVEAL_DELTA) {
      setNavVisible(true);
    }
  });

  const heroMode = !isPastHero;
  const cardVariants = reducedMotion ? REDUCED_CARD_VARIANTS : CARD_VARIANTS;
  const flatListVariants = reducedMotion ? REDUCED_CARD_VARIANTS : FLAT_LIST_VARIANTS;
  const itemVariants = reducedMotion ? REDUCED_ITEM_VARIANTS : SERVICE_ITEM_VARIANTS;

  return (
    <motion.div
      className="fixed left-0 right-0 z-50 flex justify-center px-3"
      style={{ top: navTop }}
      animate={{ y: isVisible ? 0 : "-120%" }}
      transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        className={`${styles.shell} ${heroMode ? styles.expanded : styles.compact}`}
        data-nav-state={heroMode ? "expanded" : "compact"}
        data-nav-glass={isScrolled ? "active" : "inactive"}
      >
        <motion.header
          initial={reducedMotion ? false : { opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.42, ease: "easeOut" }}
          className={`relative w-full ${styles.header}`}
        >
          <motion.div
            aria-hidden
            className={styles.glass}
            style={{
              opacity: navChromeOpacity,
              backdropFilter: isScrolled ? undefined : "none",
              WebkitBackdropFilter: isScrolled ? undefined : "none",
            }}
          />

          <div className="relative mx-auto flex w-full items-center justify-between px-3.5 py-1.5 sm:px-4 xl:px-6 xl:py-2">
            <Link href="/" className="relative z-40 inline-flex shrink-0 items-center">
              <Image
                src="/images/Icon.avif"
                alt="Lionovart home"
                width={40}
                height={40}
                priority
                sizes="40px"
                className="h-[2rem] w-[2rem] rounded-full object-cover sm:h-[2.25rem] sm:w-[2.25rem] xl:h-[2.5rem] xl:w-[2.5rem]"
              />
            </Link>

            <Link href="/" className="absolute left-1/2 z-40 -translate-x-1/2">
              <Image
                src="/images/LOGO.svg"
                alt="LIONOVART"
                width={480}
                height={77}
                priority
                sizes="180px"
                data-nav-logo
                className="h-[1.375rem] w-auto sm:h-[1.5rem] xl:h-[1.625rem]"
              />
            </Link>

            <AnimatePresence initial={false}>
              {heroMode && (
                <motion.div
                  key="desktop-links"
                  className="hidden flex-1 items-center justify-start pl-[3.5rem] xl:flex"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.18 } }}
                >
                  <ul className="flex items-center justify-start gap-7 2xl:gap-8">
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
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`transition-transform duration-200 motion-reduce:transition-none ${expertiseOpen ? "rotate-180" : ""}`}
                              aria-hidden="true"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          )}
                          <span className="absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-1 items-center justify-end gap-2 xl:gap-5">
              <AnimatePresence initial={false}>
                {heroMode && (
                  <motion.div
                    key="lang-hero"
                    className="hidden xl:block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.2 }}
                  >
                    <LanguageSwitcher isHeroMode={true} />
                  </motion.div>
                )}
              </AnimatePresence>

              {useLightweightMenu ? (
                <LightweightMenuToggle
                  isOpen={isMobileOpen}
                  onToggle={() => setIsMobileOpen((value) => !value)}
                />
              ) : (
                <MenuBurgerLottie
                  isOpen={isMobileOpen}
                  onToggle={() => setIsMobileOpen((value) => !value)}
                />
              )}
            </div>
          </div>
        </motion.header>

        <AnimatePresence>
          {expertiseOpen && heroMode && services.length > 0 && (
            <motion.div
              key="expertise-band"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={cardVariants}
              onMouseEnter={openExpertise}
              onMouseLeave={scheduleCloseExpertise}
              className={`absolute left-[15%] right-[15%] top-0 -z-10 hidden overflow-hidden xl:block ${styles.panelGlass}`}
            >
              <motion.div
                variants={reducedMotion ? undefined : STAGGER_VARIANTS}
                className="mx-auto grid max-w-[700px] grid-cols-2 gap-2 px-8 pb-9 pt-[92px]"
              >
                {services.map((title) => (
                  <motion.button
                    key={title}
                    variants={itemVariants}
                    type="button"
                    onClick={() => goToService(title)}
                    className="rounded-xl px-5 py-4 text-left text-[17px] font-semibold tracking-wide text-black/75 transition-colors hover:bg-black/[0.05] hover:text-black"
                  >
                    {title}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { y: "-100%", opacity: 0.98 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { y: "-100%", opacity: 0.98 }}
              transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={`absolute top-0 -z-10 ${styles.menuPanel} ${styles.panelGlass}`}
            >
              <nav className="flex flex-col items-center justify-center gap-5 px-6 pb-8 pt-[78px] xl:flex-row xl:gap-x-6 xl:pt-[84px]">
                {NAV_LINKS.map((link, index) => (
                  <motion.div
                    key={link.target}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                    transition={{ duration: reducedMotion ? 0 : 0.18, delay: reducedMotion ? 0 : index * 0.045 }}
                    className="flex flex-col items-center"
                    onMouseEnter={link.hasDropdown ? () => setMobileExpertiseOpen(true) : undefined}
                    onMouseLeave={link.hasDropdown ? () => setMobileExpertiseOpen(false) : undefined}
                  >
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => scrollToTarget(link.target)}
                        className="group relative flex items-center whitespace-nowrap py-1.5 text-[15px] font-semibold uppercase tracking-[0.12em] text-black/70 transition-colors hover:text-black"
                      >
                        {link.label}
                        <span className="absolute bottom-0 left-0 right-0 h-[1.5px] origin-left scale-x-0 bg-black/70 transition-transform duration-200 group-hover:scale-x-100 motion-reduce:transition-none" />
                      </button>

                      {link.hasDropdown && (
                        <button
                          type="button"
                          onClick={() => setMobileExpertiseOpen((value) => !value)}
                          aria-label="Toggle expertise list"
                          aria-expanded={mobileExpertiseOpen}
                          className="flex min-h-11 min-w-11 items-center justify-center text-black/60 transition-colors hover:text-black"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-200 motion-reduce:transition-none ${mobileExpertiseOpen ? "rotate-180" : ""}`}
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
                          variants={flatListVariants}
                          className="flex flex-col items-center gap-2 overflow-hidden"
                        >
                          {services.map((title) => (
                            <motion.button
                              key={title}
                              variants={itemVariants}
                              type="button"
                              onClick={() => goToService(title)}
                              className="min-h-11 px-2 text-[15px] font-semibold tracking-wide text-black/65 transition-colors hover:text-black"
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
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.2,
                    delay: reducedMotion ? 0 : NAV_LINKS.length * 0.045,
                  }}
                  className="flex w-full justify-center xl:w-auto"
                >
                  <button
                    type="button"
                    onClick={openNavCta}
                    className="min-h-11 w-full rounded-full bg-brand-red px-6 py-2.5 text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#c8121f] xl:w-auto"
                  >
                    {ctaLabel}
                  </button>
                </motion.div>

                <motion.div
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.18,
                    delay: reducedMotion ? 0 : (NAV_LINKS.length + 1) * 0.045,
                  }}
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
