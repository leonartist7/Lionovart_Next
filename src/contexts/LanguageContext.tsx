"use client";

import { createContext, useCallback, useContext, ReactNode } from "react";
import { useLocale, useMessages } from "next-intl";
import { useRouter } from "next/navigation";
import { locales, type Locale, type Translations } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const activeLocale = useLocale();
  const locale: Locale = activeLocale in locales ? activeLocale as Locale : "en";
  const messages = useMessages() as Translations;

  const setLocale = useCallback((next: Locale) => {
    if (next === locale || typeof window === "undefined") return;

    const segments = window.location.pathname.split("/").filter(Boolean);
    if (segments[0] in locales) segments.shift();
    const pathname = segments.length ? `/${segments.join("/")}` : "/";
    const prefix = next === "en" ? "" : `/${next}`;
    router.push(`${prefix}${pathname === "/" ? "" : pathname}${window.location.search}${window.location.hash}`);
  }, [locale, router]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: messages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
