"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { getPublicCopy } from "@/lib/i18n/public-copy";

export function usePublicCopy() {
  const { locale } = useLanguage();
  return getPublicCopy(locale);
}
