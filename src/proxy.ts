import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextResponse, type NextRequest } from "next/server";

const localize = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = localize(request);
  const firstSegment = request.nextUrl.pathname.split("/")[1];
  // English already has physical routes in (site). Rewriting those to /en
  // re-enters default-locale canonicalization in Next 16 and redirects to itself.
  if (!routing.locales.some(locale => locale === firstSegment) && response.headers.has("x-middleware-rewrite")) {
    const headers = new Headers(request.headers);
    headers.set("X-NEXT-INTL-LOCALE", routing.defaultLocale);
    const next = NextResponse.next({ request: { headers } });
    const links = response.headers.get("Link");
    if (links) next.headers.set("Link", links);
    response.cookies.getAll().forEach(cookie => next.cookies.set(cookie));
    return next;
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|portal|admin|discover|demo/selected-work|demo/typography|demo/ornaments|_next|_vercel|.*\\..*).*)"],
};
