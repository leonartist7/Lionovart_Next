import ClosingCTA from "@/components/sections/ClosingCTA";
import styles from "@/components/sections/ProcessLionJourney.module.css";
import { NextIntlClientProvider } from "next-intl";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { locales } from "@/lib/i18n";
import { playfairDisplay } from "@/lib/fonts";
import ReviewControls from "./ReviewControls";

/** Material comparison without the homepage's scroll handoff or navigation overlay. */
export default function ClosingRibbonReview() {
  return <NextIntlClientProvider locale="en" messages={locales.en}><LanguageProvider><main className={playfairDisplay.variable} data-closing-review><ReviewControls>
    <ClosingCTA workShowcase lionDock={<div className={styles.dock}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.staticPoster} src="/models/lion/lion-poster.png?v=hid-20260914" alt="" width={900} height={900} />
    </div>} />
  </ReviewControls></main></LanguageProvider></NextIntlClientProvider>;
}
