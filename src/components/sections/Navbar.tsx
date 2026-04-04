"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Proof", href: "#proof" },
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
        className="fixed top-0 left-0 right-0 z-50 overflow-hidden"
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
          className="absolute inset-0 bg-nav-glass backdrop-blur-md border-b border-white/5"
          animate={{ opacity: isPastHero ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ pointerEvents: "none" }}
        />

        {/* Nav inner */}
        <div className="relative mx-auto flex max-w-[1200px] items-center px-4 py-4 md:px-6">

          {/* ── Logo ──
               Before hero passes: left-aligned.
               After hero passes: centered.    */}
          <motion.div
            animate={
              isPastHero
                ? { x: "-50%", left: "50%", position: "absolute" }
                : { x: "0%", left: "0%", position: "relative" }
            }
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="z-50"
          >
            <Link href="/">
              <span
                className={cn(
                  "text-xl font-bold uppercase tracking-widest transition-colors duration-300",
                  heroMode ? "text-white" : "text-text-main"
                )}
              >
                LIONOVART
              </span>
            </Link>
          </motion.div>

          {/* ── Desktop Nav Links — fade out when past hero ── */}
          <AnimatePresence>
            {!isPastHero && (
              <motion.ul
                key="nav-links"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="ml-auto hidden items-center gap-8 md:flex"
              >
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group relative text-sm font-medium uppercase tracking-wider text-white/90 transition-colors hover:text-white"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 h-[1px] w-full origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
                    </Link>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>

          {/* ── Desktop CTA ── */}
          <AnimatePresence>
            {!isPastHero && (
              <motion.div
                key="cta"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="ml-6 hidden md:block"
              >
                <Link
                  href="#contact"
                  className="rounded-[20px] border border-white/70 bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-brand-red hover:scale-105"
                >
                  Connect Now
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Burger Menu ── */}
          <AnimatePresence>
            {(isPastHero || true) && (
              <motion.button
                key="burger"
                initial={{ opacity: 0 }}
                animate={{ opacity: isPastHero ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={cn(
                  "relative z-50 ml-auto",
                  isPastHero ? "flex" : "flex md:hidden"
                )}
                aria-label="Toggle menu"
                style={{ pointerEvents: isPastHero ? "auto" : "none" }}
              >
                {isMobileOpen ? (
                  <X className="h-6 w-6 text-text-main" />
                ) : (
                  <Menu className="h-6 w-6 text-text-main" />
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Mobile-only burger — always visible when NOT past hero */}
          {!isPastHero && (
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="relative z-50 ml-auto md:hidden"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          )}
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
                <Link
                  href="#contact"
                  onClick={() => setIsMobileOpen(false)}
                  className="mt-4 inline-block rounded-[20px] bg-brand-red px-8 py-4 text-lg font-semibold uppercase tracking-wider text-white transition-all hover:brightness-110"
                >
                  Connect Now
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
