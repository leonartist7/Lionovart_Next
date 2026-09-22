import { defineRouting } from "next-intl/routing";

export const LOCALES = ["en", "fr", "es", "it", "ja", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "en",
  // English retains established URLs; other locales are indexable at /fr, /es, etc.
  localePrefix: "as-needed",
  // URLs are authoritative: shared English links never redirect by browser preference.
  localeDetection: false,
});

export const localeDetails: Record<Locale, { label: string; htmlLang: string; flag: string }> = {
  en: { label: "English", htmlLang: "en-CA", flag: "https://flagcdn.com/w40/ca.png" },
  fr: { label: "Français", htmlLang: "fr-FR", flag: "https://flagcdn.com/w40/fr.png" },
  es: { label: "Español", htmlLang: "es", flag: "https://flagcdn.com/w40/es.png" },
  it: { label: "Italiano", htmlLang: "it-IT", flag: "https://flagcdn.com/w40/it.png" },
  ja: { label: "日本語", htmlLang: "ja-JP", flag: "https://flagcdn.com/w40/jp.png" },
  ko: { label: "한국어", htmlLang: "ko-KR", flag: "https://flagcdn.com/w40/kr.png" },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
