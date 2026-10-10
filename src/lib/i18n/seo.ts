import type { Metadata } from "next";
import { OG_IMAGE, SITE, SITE_URL } from "@/lib/seo/config";
import { LOCALES, type Locale } from "@/i18n/routing";

const DESCRIPTION: Record<Locale, string> = {
  en: SITE.description,
  fr: "LIONOVART est une agence créative pour les fondateurs ambitieux : identité de marque, sites web, vidéo, contenu et systèmes propulsés par l’IA.",
  es: "LIONOVART es una agencia creativa para fundadores ambiciosos: identidad de marca, sitios web, vídeo, contenido y sistemas con IA.",
  it: "LIONOVART è un’agenzia creativa per fondatori ambiziosi: identità di marca, siti web, video, contenuti e sistemi basati sull’IA.",
  ja: "LIONOVARTは、意欲ある創業者のためのクリエイティブエージェンシーです。ブランド、Webサイト、映像、コンテンツ、AIシステムを提供します。",
  ko: "LIONOVART는 야심 찬 창업자를 위한 크리에이티브 에이전시입니다. 브랜드, 웹사이트, 영상, 콘텐츠 및 AI 시스템을 만듭니다.",
};

const PAGE_LABELS: Record<Locale, Record<string, string>> = {
  en: { "/": "Creative Agency", "/services": "Services", "/services/brand": "Brand Identity & Strategy", "/services/web": "Web & App Development", "/services/content-studio": "Content Studio", "/services/print": "Print & Physical Branding", "/services/ai": "Smart Systems & AI", "/pricing": "Pricing", "/audit": "Brand Audit", "/audit/thanks": "Thank You", "/call": "Book a Call", "/careers": "Careers", "/careers/apply": "Talent Application", "/privacy": "Privacy", "/terms": "Terms", "/calgary": "Calgary", "/grenoble": "Grenoble", "/demo/services-gallery": "Services Gallery", "/v2": "LIONOVART" },
  fr: { "/": "Agence créative", "/services": "Services", "/services/brand": "Identité et stratégie de marque", "/services/web": "Développement web et applications", "/services/content-studio": "Studio de contenu", "/services/print": "Imprimé et identité physique", "/services/ai": "Systèmes intelligents et IA", "/pricing": "Tarifs", "/audit": "Audit de marque", "/audit/thanks": "Merci", "/call": "Réserver un appel", "/careers": "Carrières", "/careers/apply": "Candidature talent", "/privacy": "Confidentialité", "/terms": "Conditions", "/calgary": "Calgary", "/grenoble": "Grenoble", "/demo/services-gallery": "Galerie de services", "/v2": "LIONOVART" },
  es: { "/": "Agencia creativa", "/services": "Servicios", "/services/brand": "Identidad y estrategia de marca", "/services/web": "Desarrollo web y de aplicaciones", "/services/content-studio": "Estudio de contenido", "/services/print": "Impresión e identidad física", "/services/ai": "Sistemas inteligentes e IA", "/pricing": "Precios", "/audit": "Auditoría de marca", "/audit/thanks": "Gracias", "/call": "Reservar una llamada", "/careers": "Carreras", "/careers/apply": "Solicitud de talento", "/privacy": "Privacidad", "/terms": "Términos", "/calgary": "Calgary", "/grenoble": "Grenoble", "/demo/services-gallery": "Galería de servicios", "/v2": "LIONOVART" },
  it: { "/": "Agenzia creativa", "/services": "Servizi", "/services/brand": "Identità e strategia di marca", "/services/web": "Sviluppo web e app", "/services/content-studio": "Studio di contenuti", "/services/print": "Stampa e identità fisica", "/services/ai": "Sistemi intelligenti e IA", "/pricing": "Prezzi", "/audit": "Audit del brand", "/audit/thanks": "Grazie", "/call": "Prenota una chiamata", "/careers": "Carriere", "/careers/apply": "Candidatura talento", "/privacy": "Privacy", "/terms": "Termini", "/calgary": "Calgary", "/grenoble": "Grenoble", "/demo/services-gallery": "Galleria dei servizi", "/v2": "LIONOVART" },
  ja: { "/": "クリエイティブエージェンシー", "/services": "サービス", "/services/brand": "ブランドアイデンティティと戦略", "/services/web": "Web・アプリ開発", "/services/content-studio": "コンテンツスタジオ", "/services/print": "印刷・フィジカルブランディング", "/services/ai": "スマートシステムとAI", "/pricing": "料金", "/audit": "ブランド監査", "/audit/thanks": "ありがとうございます", "/call": "相談を予約", "/careers": "採用情報", "/careers/apply": "タレント応募", "/privacy": "プライバシー", "/terms": "利用規約", "/calgary": "カルガリー", "/grenoble": "グルノーブル", "/demo/services-gallery": "サービスギャラリー", "/v2": "LIONOVART" },
  ko: { "/": "크리에이티브 에이전시", "/services": "서비스", "/services/brand": "브랜드 아이덴티티 및 전략", "/services/web": "웹 및 앱 개발", "/services/content-studio": "콘텐츠 스튜디오", "/services/print": "인쇄 및 오프라인 브랜딩", "/services/ai": "스마트 시스템 및 AI", "/pricing": "가격", "/audit": "브랜드 진단", "/audit/thanks": "감사합니다", "/call": "상담 예약", "/careers": "채용", "/careers/apply": "인재 지원", "/privacy": "개인정보 처리방침", "/terms": "이용 약관", "/calgary": "캘거리", "/grenoble": "그르노블", "/demo/services-gallery": "서비스 갤러리", "/v2": "LIONOVART" },
};

const OPEN_GRAPH_LOCALE: Record<Locale, string> = {
  en: "en_CA",
  fr: "fr_FR",
  es: "es_ES",
  it: "it_IT",
  ja: "ja_JP",
  ko: "ko_KR",
};

export function localizedPath(locale: Locale, pathname: string) {
  const path = pathname === "/" ? "" : pathname;
  return locale === "en" ? path || "/" : `/${locale}${path}`;
}

export function getLocalizedPageMetadata(locale: Locale, pathname: string): Metadata {
  const path = pathname || "/";
  if (path === "/about") {
    const title = locale === "fr" ? "À propos — L’art de l’innovation" : "About — The art of innovation";
    const description = locale === "fr" ? "Découvrez LIONOVART : une agence créative et numérique indépendante qui unit stratégie de marque, design, technologie et expériences réelles sous une même direction créative." : "Inside LIONOVART: an independent creative and digital agency connecting brand strategy, design, technology and real-world experiences under one creative direction.";
    const aboutPath = locale === "fr" ? "/fr/about" : "/about";
    return {
      title,
      description,
      alternates: { canonical: aboutPath, languages: { en: "/about", fr: "/fr/about" } },
      openGraph: { title: `${title} | ${SITE.name}`, description, url: `${SITE_URL}${aboutPath}`, siteName: SITE.name, locale: locale === "fr" ? "fr_FR" : "en_CA", type: "website", images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE.name }] },
      twitter: { card: "summary_large_image", title: `${title} | ${SITE.name}`, description, images: [OG_IMAGE] },
    };
  }
  const englishOnlyCareers = path.startsWith("/careers") && locale !== "en" && locale !== "fr";
  const urlPath = localizedPath(locale, path);
  const canonicalPath = englishOnlyCareers ? path : urlPath;
  // The parent layout applies the site title template. Keeping this as the
  // page label avoids a duplicated “| LIONOVART” in the browser title.
  const pageTitle = PAGE_LABELS[locale][path] ?? SITE.name;
  const isEnglishHome = locale === "en" && path === "/";
  const title = isEnglishHome ? { absolute: SITE.title } : pageTitle;
  const socialTitle = isEnglishHome ? SITE.title : `${pageTitle} | ${SITE.name}`;
  const languages = Object.fromEntries(LOCALES.map((code) => [code, localizedPath(code, path)]));

  return {
    title,
    description: DESCRIPTION[locale],
    alternates: { canonical: canonicalPath, languages: englishOnlyCareers ? undefined : languages },
    openGraph: {
      title: socialTitle,
      description: DESCRIPTION[locale],
      url: `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath}`,
      siteName: SITE.name,
      locale: OPEN_GRAPH_LOCALE[locale],
      type: "website",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: { card: "summary_large_image", title: socialTitle, description: DESCRIPTION[locale], images: [OG_IMAGE] },
    robots: path === "/careers/apply" || englishOnlyCareers ? { index: false, follow: true } : undefined,
  };
}
