"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/contact";

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" },
  { label: "Results", href: "#proof" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [heroThreshold, setHeroThreshold] = useState(600);
  const { scrollY } = useScroll();

  /* Calculate 70% of hero section height on mount / resize */
  useEffect(() => {
    const calc = () => setHeroThreshold(window.innerHeight * 0.7);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 60);
    setIsPastHero(latest > heroThreshold);
  });

  /* ── Determine visual mode ──
   *  heroMode  = red background, white text (top of page)
   *  glassMode = glass blur backdrop (past 70% of hero)
   *  Transition: circular clip-path ripple expanding from center
   */
  const heroMode = !isPastHero;

  return (
    <>
      {/* ── The nav bar itself ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-[4px] left-3 right-3 z-50 rounded-2xl overflow-hidden shadow-sm"
      >
        {/* ── Red layer ──
         *  Starts fully visible (circle covers whole nav).
         *  When past hero: the circle collapses from the center outward
         *  (shrinks from 150% → 0%) while opacity fades, revealing the
         *  glass layer behind it.
         * ─────────────────────────────────────────────────────────── */}
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-brand-red"
          initial={{ clipPath: "circle(150% at 50% 50%)", opacity: 1 }}
          animate={
            isPastHero
              ? { clipPath: "circle(0% at 50% 50%)", opacity: 0 }
              : { clipPath: "circle(150% at 50% 50%)", opacity: 1 }
          }
          transition={{
            clipPath: { duration: 0.75, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.5, ease: "easeOut", delay: 0.15 },
          }}
          style={{ pointerEvents: "none" }}
        />

        {/* ── Glass layer (fades in after hero) ── */}
        <motion.div
          aria-hidden
          className="absolute inset-0 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] inset-shadow-sm inset-shadow-white/5"
          animate={{
            opacity: isPastHero ? 1 : 0,
            backgroundColor: "rgba(10, 10, 10, 0.75)" // Deep premium dark glass
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ pointerEvents: "none" }}
        />

        {/* Nav inner */}
        <div className="relative mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10">

          {/* ── Logo ──
               Permanently sits on the left on desktop.
               On mobile, it moves to the center when scrolling past hero. */}
          <motion.div
            animate={
              isPastHero && typeof window !== "undefined" && window.innerWidth < 1024
                ? { left: "50%", x: "-50%", position: "absolute" }
                : { left: "24px", x: "0%", position: "relative" }
            }
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="z-40 lg:!static lg:!transform-none lg:flex-1 lg:!left-auto text-left"
          >
            <Link href="/" className="inline-flex items-center gap-2">
              {/* Lion head */}
              <motion.img
                src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775553451/Lion_emblem2PGbCnR_-_Imgur_t6jkfg.avif"
                alt="Lionovart logo"
                aria-hidden="true"
                animate={{
                  opacity: heroMode ? 1 : 0,
                  width: heroMode ? 28 : 0,
                  marginRight: heroMode ? 0 : -8,
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="h-7 object-contain shrink-0 overflow-hidden transition-all duration-300 lg:opacity-100 lg:w-[28px] lg:mr-0"
                style={{
                  filter: "brightness(0) invert(1)"
                }}
              />
              <motion.span
                animate={{
                  color: "#ffffff" // Always white
                }}
                className="text-xl font-bold uppercase tracking-[0.2em] text-white transition-opacity duration-300 opacity-100 lg:pointer-events-auto"
              >
                LIONOVART
              </motion.span>
            </Link>
          </motion.div>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden lg:flex flex-auto items-center justify-center gap-10">
            <AnimatePresence>
              <motion.div
                key="nav-links"
                initial={{ opacity: 0, y: -6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  // Do not hardcode "display", let CSS handle the responsive 'hidden' vs 'flex' so mobile avoids overlap
                }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              >
                <ul className="flex items-center justify-center gap-[3.5rem]">
                  {NAV_LINKS.map((link) => (
                    <li key={link.label}>
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
            </AnimatePresence>
          </div>

          {/* ── Desktop CTA & Burger Wrapper ── */}
          <div className="flex flex-1 items-center justify-end gap-6">
            <div className="hidden lg:block shrink-0">
              <AnimatePresence>
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    // Do not hardcode 'display: block' string overriding tailwind hidden classes on mobile
                  }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                >
                  <LiquidMetalButton
                    label="Start Now"
                    onClick={() => window.open(getWhatsAppUrl(), "_blank", "noopener,noreferrer")}
                    width={140}
                    variant="white"
                    textColor="#000000"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile-only burger, completely hidden on desktop since the links are always there */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="relative z-[60] lg:hidden transition-opacity duration-300"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-bg-brand-black/95 backdrop-blur-xl"
          >
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col items-center gap-8"
            >
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="text-3xl font-bold uppercase tracking-wider text-text-main transition-colors hover:text-brand-red"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <LiquidMetalButton
                  label="Start Now"
                  variant="white"
                  textColor="#000000"
                  width={200}
                  onClick={() => {
                    window.open(getWhatsAppUrl(), "_blank", "noopener,noreferrer");
                    setIsMobileOpen(false);
                  }}
                />
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
