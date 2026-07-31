"use client";

import Link from "next/link";
import { getWhatsAppUrl, CONTACT_EMAIL } from "@/lib/contact";
import { useLanguage } from "@/contexts/LanguageContext";
import { SERVICE_ROUTES } from "@/lib/service-routes";
import { useLandingFlow } from "@/contexts/LandingFlowContext";

/**
 * Global footer â€” slim, professional. The closing CTA now lives in its own
 * <ClosingCTA/> section (one per page), so the footer is just navigation +
 * legal: brand/contact column, link columns, and a legal bar (Â© left,
 * Privacy/Terms right).
 */
export default function Footer() {
  const flow = useLandingFlow();
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const landingBase = flow === "inverse" ? "/inverse" : "/";
  const exploreLinks = [
    { label: t.footer.about, href: `${landingBase}#about` },
    { label: t.footer.whyUs, href: `${landingBase}#comparison` },
    { label: t.footer.howWeWork, href: `${landingBase}#process` },
    { label: t.footer.results, href: `${landingBase}#testimonials` },
  ];

  return (
    <footer className="relative z-0 border-t border-border-dark bg-[#000000]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-[1.5fr_0.85fr_1.2fr] md:gap-10">
          {/* Brand + contact */}
          <div className="flex flex-col gap-5">
            <span className="font-clash text-2xl font-bold uppercase tracking-tight text-white">
              LIONOVART
            </span>
            <p className="max-w-[34ch] font-body text-[14px] leading-[1.6] text-text-muted">
              {t.footer.tagline}
            </p>
            <div className="mt-1 flex flex-col gap-2">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[14px] text-white/80 transition-colors hover:text-brand-red"
              >
                {CONTACT_EMAIL}
              </a>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-white/80 transition-colors hover:text-brand-red"
              >
                {t.footer.whatsapp}
              </a>
            </div>
          </div>

          {/* Explore */}
          <FooterCol heading={t.footer.explore}>
            {exploreLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterCol>

          {/* Available services */}
          <FooterCol heading={t.footer.services}>
            {SERVICE_ROUTES.filter((service) => service.ready).map((service) => (
              <FooterLink key={service.id} href={service.href}>
                {service.name}
              </FooterLink>
            ))}
          </FooterCol>
        </div>

        {/* Legal bar */}
        <div className="mt-14 flex flex-col-reverse items-center gap-4 border-t border-border-dark pt-8 sm:flex-row sm:justify-between">
          <p className="text-[12px] uppercase tracking-wider text-text-muted">
            &copy; {year} LIONOVART. {t.footer.copyright}
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-[12px] uppercase tracking-wider text-text-muted transition-colors hover:text-white"
            >
              {t.footer.privacy}
            </Link>
            <Link
              href="/terms"
              className="text-[12px] uppercase tracking-wider text-text-muted transition-colors hover:text-white"
            >
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">
        {heading}
      </h3>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[14px] text-white/80 transition-colors hover:text-brand-red"
    >
      {children}
    </Link>
  );
}
