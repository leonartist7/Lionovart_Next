"use client";

import Link from "next/link";
import { getWhatsAppUrl, CONTACT_EMAIL } from "@/lib/contact";
import { useLanguage } from "@/contexts/LanguageContext";
import { SERVICE_ROUTES } from "@/lib/service-routes";

const COMPANY_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Work", href: "/#work" },
  { label: "Results", href: "/#testimonials" },
  { label: "Services", href: "/services" },
];

/**
 * Global footer — slim, professional. The closing CTA now lives in its own
 * <ClosingCTA/> section (one per page), so the footer is just navigation +
 * legal: brand/contact column, link columns, and a legal bar (© left,
 * Privacy/Terms right).
 */
export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-0 border-t border-border-dark bg-[#000000]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
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
                WhatsApp
              </a>
            </div>
          </div>

          {/* Services */}
          <FooterCol heading="Services">
            {SERVICE_ROUTES.map((s) =>
              s.ready ? (
                <FooterLink key={s.id} href={s.href}>
                  {s.name}
                </FooterLink>
              ) : (
                <span
                  key={s.id}
                  className="flex items-center gap-2 text-[14px] text-white/35"
                >
                  {s.name}
                  <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em]">
                    Soon
                  </span>
                </span>
              ),
            )}
          </FooterCol>

          {/* Company */}
          <FooterCol heading="Company">
            {COMPANY_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterCol>

          {/* Legal */}
          <FooterCol heading="Legal">
            <FooterLink href="/privacy">{t.footer.privacy}</FooterLink>
            <FooterLink href="/terms">{t.footer.terms}</FooterLink>
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
