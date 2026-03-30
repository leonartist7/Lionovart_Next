"use client";

import { useState, useEffect } from "react";
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

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
          isScrolled
            ? "bg-nav-glass backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        )}
      >
        {/* Nav inner — always relative so absolute children are contained */}
        <div className="relative mx-auto flex max-w-[1200px] items-center px-4 py-4 md:px-6">

          {/* ── Logo ──
               Before hero passes: left-aligned (default flow).
               After hero passes: absolutely centered in the nav bar.    */}
          <motion.div
            animate={isPastHero ? { x: "-50%", left: "50%", position: "absolute" } : { x: "0%", left: "0%", position: "relative" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="z-50"
          >
            <Link href="/">
              <span className="text-xl font-bold uppercase tracking-widest text-text-main">
                LIONOVART
              </span>
            </Link>
          </motion.div>

          {/* ── Desktop Nav Links — fade out when past hero ── */}
          <AnimatePresence>
            {!isPastHero && (
              <motion.ul
                key="nav-links"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="ml-auto hidden items-center gap-8 md:flex"
              >
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium uppercase tracking-wider text-text-muted transition-colors hover:text-text-main"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>

          {/* ── Desktop CTA — fade out when past hero ── */}
          <AnimatePresence>
            {!isPastHero && (
              <motion.div
                key="cta"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="ml-6 hidden md:block"
              >
                <Link
                  href="#contact"
                  className="rounded-[20px] bg-brand-red px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:brightness-110 hover:scale-105"
                >
                  Book a Call
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Burger Menu — appears on right when past hero (all screens) or always on mobile ── */}
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
                  /* Always visible on mobile, only visible on desktop when past hero */
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
                <X className="h-6 w-6 text-text-main" />
              ) : (
                <Menu className="h-6 w-6 text-text-main" />
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
                  Book a Call
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
