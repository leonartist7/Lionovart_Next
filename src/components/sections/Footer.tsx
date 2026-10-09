"use client";

import { usePublicCopy } from "@/hooks/usePublicCopy";

import { Link } from "@/i18n/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import { CONTACT_EMAIL } from "@/lib/contact";
import styles from "./Footer.module.css";
import FooterLion from "./FooterLion";

export type FooterVariant = "standard" | "curtain" | "compact";

function CompactFooter({ year }: { year: number }) {
  const tr = usePublicCopy();
  const { t } = useLanguage();
  return <footer id="footer-compact" className={styles.compact} data-art-directed="dark">
    <section id="footer-finale" className={styles.finale} aria-label="LIONOVART">
      <div className={styles.finaleInner}>
        <div className={styles.brandRow}>
          <div className={styles.brandCopy}>
            <h2 className={styles.wordmark}>LIONOVART</h2>
            <p className={styles.signature}>{tr("The art of innovating brands")}</p>
          </div>
          <FooterLion />
        </div>
        <div className={styles.finaleUtility}>
          <a className={styles.contact} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <nav aria-label={tr("Footer")} className={styles.legal}>
            <Link href="/careers">{tr("Careers")}</Link>
            <Link href="/privacy">{t.footer.privacy}</Link>
            <Link href="/terms">{t.footer.terms}</Link>
          </nav>
          <p className={styles.copyright}>&copy; {year} LIONOVART. {t.footer.copyright}</p>
        </div>
      </div>
    </section>
  </footer>;
}

/**
 * Compact is the homepage signature: wordmark, original lion and essential links.
 * Standard/curtain variants remain available for legacy/internal surfaces.
 */
export default function Footer({ variant = "standard" }: { variant?: FooterVariant }) {
  const tr = usePublicCopy();
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const isCurtain = variant === "curtain";

  if (variant === "compact") {
    return <CompactFooter year={year} />;
  }

  return (
    <footer
      id={isCurtain ? "footer-curtain" : undefined}
      className={`relative z-0 overflow-hidden bg-brand-red ${isCurtain ? "sticky bottom-0" : ""}`}
    >
      <StickyFooterMarquee goldHorizon={isCurtain} />
      <div
        className={`relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-6 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-8 md:py-3 ${
          isCurtain ? "" : "border-t border-black/20"
        }`}
      >
        <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.08em] text-white/80 sm:text-[11px]">
          &copy; {year} LIONOVART. {t.footer.copyright}
        </p>
        <nav
          aria-label={tr("Footer")}
          className="flex gap-5 text-[10px] uppercase tracking-[0.12em] sm:text-[11px]"
        >
          <Link
            href="/careers"
            className="text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-red"
          >{tr("Careers")}</Link>
          <Link
            href="/privacy"
            className="text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-red"
          >
            {t.footer.privacy}
          </Link>
          <Link
            href="/terms"
            className="text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-red"
          >
            {t.footer.terms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
