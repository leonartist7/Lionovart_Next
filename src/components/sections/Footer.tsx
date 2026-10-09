"use client";

import { usePublicCopy } from "@/hooks/usePublicCopy";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import { useNovaStore } from "@/lib/stores/nova-store";
import { CONTACT_EMAIL } from "@/lib/contact";
import styles from "./Footer.module.css";
import FooterLion from "./FooterLion";

export type FooterVariant = "standard" | "curtain" | "compact";

const expertiseLinks = [
  { label: "Brand & identity", href: "/services/brand" },
  { label: "Web & platforms", href: "/services/web" },
  { label: "Film & content", href: "/services/content-studio" },
  { label: "Experiences & innovation", href: "/services" },
] as const;

function ExpertiseLinks() {
  const tr = usePublicCopy();
  return (
    <ul className={styles.linkList}>
      {expertiseLinks.map((item) => (
        <li key={tr(item.label)}>
          <Link href={item.href} className={styles.footerLink}>
            <span>{tr(item.label)}</span>
            <span aria-hidden="true" className={styles.linkArrow}>↗</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ConnectLinks() {
  const tr = usePublicCopy();
  return (
    <ul className={styles.linkList}>
      <li>
        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.footerLink}>
          <span>{CONTACT_EMAIL}</span>
          <span aria-hidden="true" className={styles.linkArrow}>↗</span>
        </a>
      </li>
      <li>
        <Link href="/call" className={styles.footerLink}>
          <span>{tr("Book a conversation")}</span>
          <span aria-hidden="true" className={styles.linkArrow}>↗</span>
        </Link>
      </li>
    </ul>
  );
}

function LocationList() {
  const tr = usePublicCopy();
  return (
    <ul className={styles.locationList}>
      <li>Calgary</li>
      <li>Grenoble</li>
      <li className={styles.worldwide}>{tr("Available worldwide")}</li>
    </ul>
  );
}

function CompactFooter({ year }: { year: number }) {
  const tr = usePublicCopy();
  const { t } = useLanguage();
  const openNova = useNovaStore((state) => state.openNova);
  return (
    <footer
      id="footer-compact"
      className={styles.compact}
      data-art-directed="dark"
    >
      <section id="footer-finale" className={styles.finale}>
        <div className={styles.atmosphere} aria-hidden="true" />

        <div className={styles.finaleInner}>
          <div className={styles.metaRow}>
            <p className={styles.eyebrow}>{tr("Got something worth building?")}</p>
            <p className={styles.coordinates}>LION / NOVA / ART · 2026</p>
          </div>

          <div className={styles.heroRow}>
            <h2 className={styles.statement}>
              <span className={styles.statementLead}>{tr("Let's make it")}</span>
              <span className={styles.statementStroke}>{tr("impossible")}</span>
              <span>{tr("to ignore.")}</span>
            </h2>
            <FooterLion />
          </div>

          <div className={styles.actionRow}>
            <p className={styles.disciplines}>{tr("Brand")}<span>·</span>{tr("Digital")}<span>·</span>{tr("Film")}<span>·</span>{tr("Experiences")}<span>·</span>{tr("Innovation")}</p>

            <button
              type="button"
              className={styles.primaryCta}
              onClick={() => openNova("offer", true)}
              aria-label={tr("Start a project with LIONOVART")}
            >
              <span>{tr("Start something")}</span>
              <span className={styles.ctaIcon} aria-hidden="true">↗</span>
            </button>
          </div>

          <div className={styles.desktopDirectory}>
            <div className={styles.directoryBrand}>
              <Image
                src="/images/LOGO.svg"
                alt="LIONOVART"
                width={180}
                height={29}
                className={styles.logo}
              />
              <p className={styles.signature}>{tr("The art of innovation.")}</p>
            </div>

            <div className={styles.directoryGroup}>
              <p className={styles.directoryLabel}>{tr("Expertise")}</p>
              <ExpertiseLinks />
            </div>

            <div className={styles.directoryGroup}>
              <p className={styles.directoryLabel}>{tr("Connect")}</p>
              <ConnectLinks />
            </div>

            <div className={styles.directoryGroup}>
              <p className={styles.directoryLabel}>{tr("Based")}</p>
              <LocationList />
            </div>
          </div>

          <div className={styles.mobileDirectory}>
            <div className={styles.mobileBrand}>
              <Image
                src="/images/LOGO.svg"
                alt="LIONOVART"
                width={160}
                height={26}
                className={styles.logo}
              />
              <p className={styles.signature}>{tr("The art of innovation.")}</p>
            </div>

            <details className={styles.mobileDisclosure}>
              <summary>
                <span>{tr("Expertise")}</span>
                <span aria-hidden="true" className={styles.disclosurePlus}>+</span>
              </summary>
              <ExpertiseLinks />
            </details>

            <details className={styles.mobileDisclosure}>
              <summary>
                <span>{tr("Connect")}</span>
                <span aria-hidden="true" className={styles.disclosurePlus}>+</span>
              </summary>
              <ConnectLinks />
            </details>

            <details className={styles.mobileDisclosure}>
              <summary>
                <span>{tr("Based")}</span>
                <span aria-hidden="true" className={styles.disclosurePlus}>+</span>
              </summary>
              <LocationList />
            </details>
          </div>

          <div className={styles.finaleUtility}>
            <p className={styles.copyright}>
              &copy; {year} LIONOVART. {t.footer.copyright}
            </p>
            <nav aria-label={tr("Footer")} className={styles.legal}>
              <Link href="/careers">{tr("Careers")}</Link>
              <Link href="/privacy">{t.footer.privacy}</Link>
              <Link href="/terms">{t.footer.terms}</Link>
            </nav>
          </div>
        </div>
      </section>
    </footer>
  );
}

/**
 * Compact is the production homepage close: cinematic brand statement + utility footer.
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
