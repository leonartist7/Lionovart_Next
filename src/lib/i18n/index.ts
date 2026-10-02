import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import es from "@/messages/es.json";
import it from "@/messages/it.json";
import ja from "@/messages/ja.json";
import ko from "@/messages/ko.json";
import { type Locale } from "@/i18n/routing";
import reviewStatus from "./review-status.json";

export { LOCALES, type Locale } from "@/i18n/routing";

/**
 * Deployable message catalogs. These JSON files are the sole runtime source
 * and are synchronized with Tolgee. The legacy TypeScript files are retained
 * only as a one-time migration source and must not be edited for new copy.
 */
const deployable = <T>(locale: Exclude<Locale, "en">, messages: T): T =>
  reviewStatus[locale]?.status === "approved" ? messages : en as T;

export const locales: Record<Locale, typeof en> = {
  en,
  fr: deployable("fr", fr) as typeof en,
  es: deployable("es", es) as typeof en,
  it: deployable("it", it) as typeof en,
  ja: deployable("ja", ja) as typeof en,
  ko: deployable("ko", ko) as typeof en,
};

export type Translations = typeof en;
