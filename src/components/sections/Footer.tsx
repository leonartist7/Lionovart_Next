"use client";

import Link from "next/link";
import { type KeyboardEvent, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";

/** The closing CTA owns the final visual moment; this footer carries the signature and legal links. */
export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const [isRed, setIsRed] = useState(false);
  const focusOffsetClass = isRed
    ? "focus-visible:ring-offset-brand-red"
    : "focus-visible:ring-offset-black";

  const toggleFooterColor = () => setIsRed((current) => !current);

  const handleToggleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFooterColor();
    }
  };

  return (
    <footer
      className={`relative z-0 overflow-hidden transition-colors duration-500 motion-reduce:transition-none ${
        isRed ? "bg-brand-red/80" : "bg-black"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isRed}
        aria-label={
          isRed ? "Change footer color to black" : "Change footer color to red"
        }
        onClick={toggleFooterColor}
        onKeyDown={handleToggleKeyDown}
        className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      >
        <StickyFooterMarquee />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-3 border-t border-black/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-8 md:py-5">
        <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.08em] text-white/80 sm:text-[11px]">
          &copy; {year} LIONOVART. {t.footer.copyright}
        </p>
        <nav
          aria-label="Legal"
          className="flex gap-5 text-[10px] uppercase tracking-[0.12em] sm:text-[11px]"
        >
          <Link
            href="/privacy"
            className={`text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ${focusOffsetClass}`}
          >
            {t.footer.privacy}
          </Link>
          <Link
            href="/terms"
            className={`text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ${focusOffsetClass}`}
          >
            {t.footer.terms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
