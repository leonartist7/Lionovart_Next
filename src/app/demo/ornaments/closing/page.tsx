import ClosingCTA from "@/components/sections/ClosingCTA";
import { NextIntlClientProvider } from "next-intl";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { locales } from "@/lib/i18n";
import { playfairDisplay } from "@/lib/fonts";
import ReviewControls from "./ReviewControls";

/** Material comparison without the homepage's scroll handoff or navigation overlay. */
export default function ClosingRibbonReview() {
  return <NextIntlClientProvider locale="en" messages={locales.en}><LanguageProvider><main className={playfairDisplay.variable} data-closing-review><ReviewControls>
    <ClosingCTA workShowcase />
  </ReviewControls></main></LanguageProvider></NextIntlClientProvider>;
}
