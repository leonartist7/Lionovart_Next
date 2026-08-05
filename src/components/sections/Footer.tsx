"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";

/** The closing CTA owns the final visual moment; this footer carries the signature and legal links. */
export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-0 overflow-hidden bg-brand-red/80">
      <StickyFooterMarquee />
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
            className="text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-brand-red"
          >
            {t.footer.privacy}
          </Link>
          <Link
            href="/terms"
            className="text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-brand-red"
          >
            {t.footer.terms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
