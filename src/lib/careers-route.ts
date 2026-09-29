import { isLocale } from "@/i18n/routing";

export function isCareersPath(pathname: string | null | undefined) {
  if (!pathname) return false;
  const parts = pathname.split("/").filter(Boolean);
  const routeParts = parts.length > 0 && isLocale(parts[0]) ? parts.slice(1) : parts;
  const route = `/${routeParts.join("/")}`;
  return route === "/careers" || route.startsWith("/careers/");
}
