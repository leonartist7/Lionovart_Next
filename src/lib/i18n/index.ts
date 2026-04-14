import { en } from "./locales/en";
import { fr } from "./locales/fr";
import { es } from "./locales/es";
import { it } from "./locales/it";
import { ko } from "./locales/ko";

export type Locale = "en" | "fr" | "es" | "it" | "ko";

export const locales: Record<Locale, typeof en> = { en, fr, es, it, ko };

export type { Translations } from "./locales/en";
