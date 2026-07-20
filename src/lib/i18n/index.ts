import { en } from "./locales/en";
import { fr } from "./locales/fr";
import { es } from "./locales/es";
import { it } from "./locales/it";
import { ko } from "./locales/ko";
import { ja } from "./locales/ja";

export type Locale = "en" | "fr" | "es" | "it" | "ko" | "ja";

export const locales: Record<Locale, typeof en> = { en, fr, es, it, ko, ja };

export type { Translations } from "./locales/en";
