import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|portal|admin|discover|demo/selected-work|demo/typography|_next|_vercel|.*\\..*).*)"],
};
