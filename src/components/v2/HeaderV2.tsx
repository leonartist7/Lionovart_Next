"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWhatsAppUrl } from "@/lib/contact";

/* Sticky chrome: transparent over the dark hero, solid scrim once the
   page leaves the first screen so the white wordmark stays legible
   on cream chapters. */

type LenisLike = {
  scroll: number;
  on: (e: string, cb: () => void) => void;
  off: (e: string, cb: () => void) => void;
};

export default function HeaderV2() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
      const y = lenis?.scroll ?? window.scrollY ?? 0;
      setScrolled(y > 48);
    };
    update();
    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
    lenis?.on("scroll", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      lenis?.off("scroll", update);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled
          ? "border-b border-white/10 bg-[#0d0d0d]/88 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 md:px-12">
        <Link href="/" className="inline-flex items-center" aria-label="LIONOVART home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/LOGO.svg"
            alt="LIONOVART"
            className="h-6 w-auto md:h-7"
          />
        </Link>

        <a
          href={getWhatsAppUrl("Hello Leon, I'd like to start a project with LIONOVART.")}
          target="_blank"
          rel="noopener noreferrer"
          className="v2-display whitespace-nowrap rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:border-[#e5192a] hover:bg-[#e5192a] active:scale-[0.98] md:px-5 md:py-2.5 md:text-[12px]"
        >
          Start Your Project
        </a>
      </div>
    </header>
  );
}
