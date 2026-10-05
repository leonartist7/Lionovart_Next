import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import AboutPage from "../../(site)/about/page";
import Home from "../../(site)/page";
import AuditPage from "../../(site)/audit/page";
import AuditThanksPage from "../../(site)/audit/thanks/page";
import CallPage from "../../(site)/call/page";
import PricingPage from "../../(site)/pricing/page";
import PrivacyPage from "../../(site)/privacy/page";
import TermsPage from "../../(site)/terms/page";
import ServicesIndexPage from "../../(site)/services/page";
import AiServicePage from "../../(site)/services/ai/page";
import BrandServicePage from "../../(site)/services/brand/page";
import ContentStudioPage from "../../(site)/services/content-studio/page";
import PrintServicePage from "../../(site)/services/print/page";
import WebServicePage from "../../(site)/services/web/page";
import ServicesGalleryDemoPage from "../../(site)/demo/services-gallery/page";
import V2Page from "../../(site)/v2/page";
import { getLocalizedPageMetadata } from "@/lib/i18n/seo";
import { isLocale, type Locale } from "@/i18n/routing";

type Page = (props: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) => ReactNode | Promise<ReactNode>;

const pages: Record<string, Page> = {
  "/": Home,
  "/about": AboutPage,
  "/audit": AuditPage,
  "/audit/thanks": AuditThanksPage,
  "/call": CallPage,
  "/pricing": PricingPage,
  "/privacy": PrivacyPage,
  "/terms": TermsPage,
  "/services": ServicesIndexPage,
  "/services/ai": AiServicePage,
  "/services/brand": BrandServicePage,
  "/services/content-studio": ContentStudioPage,
  "/services/print": PrintServicePage,
  "/services/web": WebServicePage,
  "/demo/services-gallery": ServicesGalleryDemoPage,
  "/v2": V2Page,
  // City landing pages intentionally share the canonical homepage composition.
  "/calgary": Home,
  "/grenoble": Home,
};

function pathFrom(slug: string[] | undefined) {
  return slug?.length ? `/${slug.join("/")}` : "/";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug?: string[] }> }): Promise<Metadata> {
  const { locale: requestedLocale, slug } = await params;
  if (!isLocale(requestedLocale)) return {};
  return getLocalizedPageMetadata(requestedLocale, pathFrom(slug));
}

export default async function LocalizedPublicPage({ params, searchParams }: { params: Promise<{ locale: string; slug?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const PageComponent = pages[pathFrom(slug)];
  if (!PageComponent) notFound();
  return <PageComponent key={locale as Locale} searchParams={searchParams} />;
}
