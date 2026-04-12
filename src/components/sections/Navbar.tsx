"use client";

import { useState, useEffect } from "react";
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

const NAV_LINKS = [
  { label: "We", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Results", href: "#proof" },
];

export default function Navbar() {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [heroThreshold, setHeroThreshold] = useState(600);
  const { scrollY } = useScroll();

  useEffect(() => {
    const calc = () => setHeroThreshold(window.innerHeight * 0.5);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsPastHero(latest > heroThreshold);
  });

  const heroMode = !isPastHero;

  return (
    // Fixed centering shell — caps bar width on large screens
    <div className="fixed top-[3px] left-0 right-0 z-50 flex justify-center px-3">
      {/* overflow-visible so dropdown can escape below the bar */}
      <div className="relative w-full max-w-[1400px]">

        {/* ── Nav bar pill ── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full rounded-xl overflow-hidden shadow-sm"
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
              opacity: { duration: 0.5, ease: "easeOut", delay: 0.15 },
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
                <motion.img
                  src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775553451/Lion_emblem2PGbCnR_-_Imgur_t6jkfg.avif"
                  alt="Lionovart logo"
                  aria-hidden="true"
                  animate={{
                    opacity: heroMode ? 1 : 0,
                    width: heroMode ? 56 : 0,
                    marginRight: heroMode ? 0 : -8,
                  }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="h-14 object-contain shrink-0 overflow-hidden"
                  style={{ filter: "brightness(1) invert(0)" }}
                />
                {/*
                  tracking-[0.08em] — tighter than the previous 0.2em,
                  still distinct from nav links (0.15em) and body text.
                  This gives the brand name its own tight, bold identity.
                */}
                <span className="text-xl font-bold uppercase tracking-[0.08em] text-white">
                  LIONOVART
                </span>
              </Link>
            </div>

            {/* Desktop nav links — lg+ */}
            <div className="hidden lg:flex flex-auto items-center justify-center">
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
            </div>

            {/* CTA + burger */}
            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 lg:gap-5">
              <div className="shrink-0 origin-right scale-[0.85] sm:scale-100 transition-transform">
                <LiquidMetalButton
                  label="Start Now"
                  onClick={() => window.open(getWhatsAppUrl(), "_blank", "noopener,noreferrer")}
                  width={140}
                  variant="white"
                  textColor="#ff0000ff"
                />
              </div>

              <MenuBurgerLottie
                isOpen={isMobileOpen}
                onToggle={() => setIsMobileOpen((v) => !v)}
                className="lg:hidden transition-opacity duration-300"
              />
            </div>
          </div>
        </motion.header>

        {/*
          ── Mobile dropdown ──────────────────────────────────────────────────
          Lives OUTSIDE motion.header so overflow-hidden doesn't clip it.
          Shares the same max-w wrapper so width is inherited.

          "Sliding from behind" effect:
          • top-0 — flush with the top of the wrapper (same as bar)
          • -z-10 — behind the bar visually
          • y: "-100%" → 0 — slides down from above, emerging under the bar
          • pt-[72px] — pushes link content below the bar height (~64-72px)
          • 30% narrower: left-[15%] right-[15%], centered
          • White liquid-glass: rgba(255,255,255,0.75) + heavy blur

          Link text is text-[14px] — bigger and more readable on all devices.
        */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="absolute top-0 left-[15%] right-[15%] -z-10 rounded-xl overflow-hidden lg:hidden"
              style={{
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(28px) saturate(1.8)",
                WebkitBackdropFilter: "blur(28px) saturate(1.8)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              {/* pt-[62px] clears the bar; links are horizontal */}
              <nav className="flex flex-row items-center justify-center gap-1 px-4 pt-[62px] pb-4">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2, delay: i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      // text-[14px] — noticeably bigger than before (was 12px)
                      className="flex items-center px-5 py-2.5 text-[14px] font-semibold uppercase tracking-[0.12em] text-black/75 hover:text-black hover:bg-black/[0.06] rounded-lg transition-colors whitespace-nowrap"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
