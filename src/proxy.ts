import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const internationalize = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // Serve the approved complete Work page at its existing shareable URL.
  if (request.nextUrl.pathname === "/work") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/work-showcase.html";
    const response = NextResponse.rewrite(destination);
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  return internationalize(request);
}

export const config = {
  matcher: ["/((?!api|portal|admin|discover|demo/selected-work|demo/typography|_next|_vercel|.*\\..*).*)"],
};
