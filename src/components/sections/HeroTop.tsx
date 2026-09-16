"use client";
import HeroClientProof from "./HeroClientProof";
import HeroSitePeek from "@/components/ui/HeroSitePeek";
import { useLanguage } from "@/contexts/LanguageContext";
import { LionSlot, useLionJourney } from "./lion-journey/LionJourney";

export default function HeroTop() {
  const journey = useLionJourney();
  const { t, locale } = useLanguage();
  return <section ref={journey?.hero} className="lion-hero" aria-labelledby="hero-heading">
    <LionSlot />
    <div className="lion-content">
    <div ref={journey?.copy} className="lion-copy">
      <h1 id="hero-heading" className="lion-headline" data-scroll-title-skip>
        {locale === "en" ? <><span>MAKE</span><span>YOUR BRAND</span><span className="lion-roar"><button type="button" className="roar-demo-trigger" aria-label="ROAR — opening demo controls" aria-expanded={journey?.demoOpen ?? false} aria-controls="opening-demo-panel" onClick={() => journey?.setDemoOpen(true)}>ROAR</button></span></> : <>{t.hero.staticText.map(line => <span key={line}>{line}</span>)}<span className="lion-roar"><button type="button" className="roar-demo-trigger" aria-label="Opening demo controls" aria-expanded={journey?.demoOpen ?? false} aria-controls="opening-demo-panel" onClick={() => journey?.setDemoOpen(true)}>{t.hero.cyclingWords[0]}</button></span></>}
      </h1>
    </div>
    <p className="lion-description">{t.hero.subtitle}</p>
    <div className="lion-cta"><HeroSitePeek /><HeroClientProof /></div>
    <a className="lion-trust lion-scroll" href="#what-we-build">Step inside our world <span aria-hidden="true">↓</span></a>
    </div>
  </section>;
}
