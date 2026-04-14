"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Locale } from "@/lib/i18n";

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "https://flagcdn.com/w40/ca.png" },
  { code: "fr", label: "FR", flag: "https://flagcdn.com/w40/fr.png" },
];

export function LanguageSwitcher({ isHeroMode }: { isHeroMode?: boolean }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/90 transition-colors hover:text-white hover:bg-white/10 select-none"
      >
        <img
          src={current.flag}
          alt={current.label}
          className="w-[18px] h-[13px] rounded-[2px] object-cover"
        />
        <span>{current.label}</span>
        {/* Chevron */}
        <svg
          className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 10 6"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown — z-[9999] escapes any stacking context */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-1.5 min-w-[96px] rounded-xl z-[9999]"
            style={{
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === locale;
              return (
                <li key={lang.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setLocale(lang.code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors rounded-xl ${
                      isActive
                        ? "text-white bg-white/15"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <img
                      src={lang.flag}
                      alt={lang.label}
                      className="w-[18px] h-[13px] rounded-[2px] object-cover"
                    />
                    {lang.label}
                    {isActive && (
                      <svg
                        className="ml-auto w-3 h-3 text-brand-red shrink-0"
                        fill="none"
                        viewBox="0 0 12 12"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
