import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, isLocale } from "@/i18n/routing";

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intl(request);
  const firstSegment = request.nextUrl.pathname.split("/")[1];
  // English public pages already live in (site). Rewriting them to /en can
  // become an external rewrite on hosts where Next normalizes localhost,
  // re-entering intl and redirecting /en back to the original English URL.
  // Retain intl's locale request headers, cookies and alternate links.
  if (!isLocale(firstSegment) && response.headers.has("x-middleware-rewrite")) {
    const headers = new Headers(response.headers);
    headers.delete("x-middleware-rewrite");
    return NextResponse.next({ headers });
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|portal|admin|discover|demo/selected-work|demo/typography|_next|_vercel|.*\\..*).*)",
  ],
};
