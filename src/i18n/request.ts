import { getRequestConfig } from "next-intl/server";
import { locales } from "@/lib/i18n";
import { isLocale, routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = requestedLocale && isLocale(requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  return { locale, messages: locales[locale] };
});
