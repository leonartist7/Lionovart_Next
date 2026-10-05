"use client";
import { useEffect, useRef } from "react";
import HeroSitePeek from "@/components/ui/HeroSitePeek";
import HeroTrustLine from "./HeroTrustLine";
import { useLanguage } from "@/contexts/LanguageContext";
import { LionSlot, useLionJourney } from "./lion-journey/LionJourney";

export default function HeroTop() {
  const journey = useLionJourney();
  const localHero = useRef<HTMLElement | null>(null);
  const mounted = journey?.hero ?? localHero;
  useEffect(() => {
    const node = mounted.current;
    node?.setAttribute("data-intro-hero-mounted", "");
    return () => node?.removeAttribute("data-intro-hero-mounted");
  }, [mounted]);
  const { t, locale } = useLanguage();
  return <section ref={mounted} className="lion-hero" aria-labelledby="hero-heading">
    <LionSlot />
    <div className="lion-content">
    <div ref={journey?.copy} className="lion-copy">
      <h1 id="hero-heading" className={`lion-headline${locale === "en" ? "" : " lion-headline-localized"}`} data-scroll-title-skip>
        {locale === "en" ? <><span className="lion-lets-make"><span>LET&apos;S</span>{" "}<span>MAKE</span></span><span className="lion-your-brand"><span>YOUR</span><span>BRAND</span></span><span className="lion-roar lion-roar-editorial"><span className="lion-roar-text">ROAR</span></span></> : <>{t.hero.staticText.map(line => <span key={line}>{line}</span>)}<span className="lion-roar"><span className="lion-roar-text">{t.hero.cyclingWords[0]}</span></span></>}
      </h1>
    </div>
    <p aria-label={locale === "en" ? t.hero.subtitle : undefined} className={`lion-description${locale === "ja" || locale === "ko" ? "" : " editorial-accent editorial-hero"}${locale === "en" ? " hero-positioning-copy" : ""}`}>{locale === "en" ? <><span className="lion-description-wide">{t.hero.subtitle}</span><span className="lion-description-compact"><span>Brand strategy, intelligent systems &amp; creative work</span><span>built to move your business forward.</span></span></> : t.hero.subtitle}</p>
    <div className="lion-cta"><HeroSitePeek /><HeroTrustLine text={t.hero.trustLine} /></div>
    </div>
  </section>;
}
