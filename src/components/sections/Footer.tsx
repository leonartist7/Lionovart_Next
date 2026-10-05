"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import { useNovaStore } from "@/lib/stores/nova-store";
import { CONTACT_EMAIL } from "@/lib/contact";
import styles from "./Footer.module.css";

export type FooterVariant = "standard" | "curtain" | "compact";

function ExpertiseLinks() {
  const { t } = useLanguage();
  const expertiseLinks = [
    { label: t.siteNavigation.brand, href: "/services/brand" },
    { label: t.siteNavigation.web, href: "/services/web" },
    { label: t.siteNavigation.film, href: "/services/content-studio" },
    { label: t.siteNavigation.experiences, href: "/services" },
  ];
  return (
    <ul className={styles.linkList}>
      {expertiseLinks.map((item) => (
        <li key={item.label}>
          <Link href={item.href} className={styles.footerLink}>
            <span>{item.label}</span>
            <span aria-hidden="true" className={styles.linkArrow}>
              ↗
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ConnectLinks() {
  const { t } = useLanguage();
  return (
    <ul className={styles.linkList}>
      <li>
        <Link href="/about" className={styles.footerLink}>
          <span>{t.siteNavigation.about}</span>
          <span aria-hidden="true" className={styles.linkArrow}>
            ↗
          </span>
        </Link>
      </li>
      <li>
        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.footerLink}>
          <span>{CONTACT_EMAIL}</span>
          <span aria-hidden="true" className={styles.linkArrow}>
            ↗
          </span>
        </a>
      </li>
      <li>
        <Link href="/call" className={styles.footerLink}>
          <span>{t.siteNavigation.book}</span>
          <span aria-hidden="true" className={styles.linkArrow}>
            ↗
          </span>
        </Link>
      </li>
    </ul>
  );
}

function LocationList() {
  const { t } = useLanguage();
  return (
    <ul className={styles.locationList}>
      <li>Calgary</li>
      <li>Grenoble</li>
      <li className={styles.worldwide}>{t.siteNavigation.worldwide}</li>
    </ul>
  );
}

function CompactFooter({
  year,
  about = false,
}: {
  year: number;
  about?: boolean;
}) {
  const { t } = useLanguage();
  const openNova = useNovaStore((state) => state.openNova);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");

    if (reducedMotion.matches || !finePointer.matches) return;

    let frame = 0;

    const updateSpotlight = (event: PointerEvent) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = footer.getBoundingClientRect();
        footer.style.setProperty(
          "--footer-x",
          `${event.clientX - rect.left}px`,
        );
        footer.style.setProperty("--footer-y", `${event.clientY - rect.top}px`);
      });
    };

    const showSpotlight = () =>
      footer.style.setProperty("--footer-spotlight-opacity", "1");
    const hideSpotlight = () =>
      footer.style.setProperty("--footer-spotlight-opacity", "0");

    footer.addEventListener("pointerenter", showSpotlight);
    footer.addEventListener("pointermove", updateSpotlight);
    footer.addEventListener("pointerleave", hideSpotlight);

    return () => {
      window.cancelAnimationFrame(frame);
      footer.removeEventListener("pointerenter", showSpotlight);
      footer.removeEventListener("pointermove", updateSpotlight);
      footer.removeEventListener("pointerleave", hideSpotlight);
    };
  }, []);

  return (
    <footer
      id="footer-compact"
      ref={footerRef}
      className={`${styles.compact} ${about ? styles.aboutFooter : ""}`}
      data-art-directed="dark"
    >
      <section
        id="closing-cta"
        data-nova-section="closing-cta"
        className={`${styles.finale} ${about ? styles.aboutFinale : ""}`}
      >
        <div className={styles.atmosphere} aria-hidden="true" />

        <div className={styles.lionBase} aria-hidden="true">
          <Image
            src="/images/LION-CIRCLE.avif"
            alt=""
            fill
            sizes="(max-width: 767px) 92vw, 58vw"
            quality={62}
            className={styles.lionImage}
          />
        </div>

        <div className={styles.lionSpotlight} aria-hidden="true">
          <div className={styles.lionBase}>
            <Image
              src="/images/LION-CIRCLE.avif"
              alt=""
              fill
              sizes="(max-width: 767px) 92vw, 58vw"
              quality={62}
              className={styles.lionImageSpot}
            />
          </div>
        </div>

        <div className={styles.finaleInner}>
          <div className={styles.metaRow}>
            <p className={styles.eyebrow}>
              {about
                ? t.aboutPage.closingLabel
                : "Got something worth building?"}
            </p>
            <p className={styles.coordinates}>LION / NOVA / ART · 2026</p>
          </div>

          {about ? (
            <h2 className={styles.aboutStatement}>
              {t.aboutPage.closingHeading}
            </h2>
          ) : (
            <h2 className={styles.statement}>
              <span className={styles.statementLead}>Let&apos;s make it</span>
              <span className={styles.statementStroke}>impossible</span>
              <span>to ignore.</span>
            </h2>
          )}

          <div className={styles.actionRow}>
            {about ? (
              <p className={styles.aboutBody}>{t.aboutPage.closingBody}</p>
            ) : (
              <p className={styles.disciplines}>
                Brand <span>·</span> Digital <span>·</span> Film <span>·</span>{" "}
                Experiences <span>·</span> Innovation
              </p>
            )}

            <button
              type="button"
              className={styles.primaryCta}
              onClick={() => openNova("offer", true)}
              aria-label={
                about
                  ? t.aboutPage.closingCta
                  : "Start a project with LIONOVART"
              }
            >
              <span>{about ? t.aboutPage.closingCta : "Start something"}</span>
              <span className={styles.ctaIcon} aria-hidden="true">
                ↗
              </span>
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
              <p className={styles.signature}>{t.siteNavigation.signature}</p>
            </div>

            <div className={styles.directoryGroup}>
              <p className={styles.directoryLabel}>
                {t.siteNavigation.expertise}
              </p>
              <ExpertiseLinks />
            </div>

            <div className={styles.directoryGroup}>
              <p className={styles.directoryLabel}>
                {t.siteNavigation.connect}
              </p>
              <ConnectLinks />
            </div>

            <div className={styles.directoryGroup}>
              <p className={styles.directoryLabel}>{t.siteNavigation.based}</p>
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
              <p className={styles.signature}>{t.siteNavigation.signature}</p>
            </div>

            <details className={styles.mobileDisclosure}>
              <summary>
                <span>{t.siteNavigation.expertise}</span>
                <span aria-hidden="true" className={styles.disclosurePlus}>
                  +
                </span>
              </summary>
              <ExpertiseLinks />
            </details>

            <details className={styles.mobileDisclosure}>
              <summary>
                <span>{t.siteNavigation.connect}</span>
                <span aria-hidden="true" className={styles.disclosurePlus}>
                  +
                </span>
              </summary>
              <ConnectLinks />
            </details>

            <details className={styles.mobileDisclosure}>
              <summary>
                <span>{t.siteNavigation.based}</span>
                <span aria-hidden="true" className={styles.disclosurePlus}>
                  +
                </span>
              </summary>
              <LocationList />
            </details>
          </div>
        </div>
      </section>

      <div className={styles.utility}>
        <div className={styles.utilityInner}>
          <span className={styles.wordmark}>LIONOVART®</span>

          <p className={styles.copyright}>
            &copy; {year} LIONOVART. {t.siteNavigation.copyright}
          </p>

          <nav aria-label={t.siteNavigation.legal} className={styles.legal}>
            <Link href="/privacy">{t.siteNavigation.privacy}</Link>
            <Link href="/terms">{t.siteNavigation.terms}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/**
 * Compact is the production homepage close: cinematic brand statement + utility footer.
 * Standard/curtain variants remain available for legacy/internal surfaces.
 */
export default function Footer({
  variant = "standard",
  about = false,
}: {
  variant?: FooterVariant;
  about?: boolean;
}) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const isCurtain = variant === "curtain";

  if (variant === "compact") {
    return <CompactFooter year={year} about={about} />;
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
          &copy; {year} LIONOVART. {t.siteNavigation.copyright}
        </p>
        <nav
          aria-label={t.siteNavigation.legal}
          className="flex gap-5 text-[10px] uppercase tracking-[0.12em] sm:text-[11px]"
        >
          <Link
            href="/privacy"
            className="text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-red"
          >
            {t.siteNavigation.privacy}
          </Link>
          <Link
            href="/terms"
            className="text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-red"
          >
            {t.siteNavigation.terms}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
