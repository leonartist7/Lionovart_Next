"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./SeasonalCampaigns.module.css";
import CampaignMarquee from "./CampaignMarquee";

const campaigns = [
  { en: ["Festive season", "A season worth remembering.", "Gift collections, festive menus, celebrations and window displays. One creative direction, connected across every format.", "NOV — DEC 2026"], fr: ["Les fêtes", "Une saison qui marque les esprits.", "Coffrets cadeaux, menus de fête, événements et vitrines. Une direction créative cohérente sur tous vos supports.", "NOV — DÉC 2026"], word: "Celebrate", wordFr: "Célébrer", end: "2026-12-31" },
  { en: ["Black Friday", "Make your offer impossible to miss.", "Promotional visuals, motion and a focused landing page. Bring your offer together before Black Friday and Cyber Monday.", "27 & 30 NOV 2026"], fr: ["Black Friday", "Donnez toute sa place à votre offre.", "Visuels promotionnels, animations et page dédiée. Préparez une campagne cohérente pour le Black Friday et le Cyber Monday.", "27 & 30 NOV 2026"], word: "Stand out", wordFr: "Se démarquer", end: "2026-11-30" },
  { en: ["New beginnings", "Introduce your next chapter.", "A new service, a fresh identity, a membership or product launch. Start the year with a clear idea and a confident presence.", "JAN 2027"], fr: ["Nouveau départ", "Ouvrez votre prochain chapitre.", "Nouveau service, identité renouvelée, abonnement ou lancement de produit. Commencez l’année avec une idée claire et une présence affirmée.", "JAN 2027"], word: "Begin again", wordFr: "Se réinventer", end: "2027-01-31" },
] as const;

export default function SeasonalCampaigns({ compact = false }: { compact?: boolean }) {
  const { locale } = useLanguage();
  const fr = locale === "fr";
  const [selected, setSelected] = useState(0);
  // The current campaign remains explicit; no fabricated scarcity or countdown.
  const campaign = campaigns[selected];
  const [label, title, description, dates] = fr ? campaign.fr : campaign.en;

  if (compact) return <CampaignMarquee />;

  return (
    <section id="seasonal" className={styles.section} data-nav-surface="dark" aria-label={fr ? "Campagnes saisonnières" : "Seasonal campaigns"}>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>{fr ? "Préparez votre prochain temps fort" : "Prepare for your next big moment"}</span>
        <h2>{fr ? "La prochaine saison" : "The next season"}<br /><em>{fr ? "commence maintenant." : "starts now."}</em></h2>
        <p>{fr ? "Votre prochaine collection, votre lancement, votre période la plus attendue. Créons les contenus qui donneront envie d’en faire partie." : "Your festive collection. Your next launch. Your busiest season. Create the content that makes people want to be part of it."}</p>
        <Link href="/call" className={styles.link}>{fr ? "Parlons de votre campagne" : "Let’s plan your campaign"}<span aria-hidden="true">↗</span></Link>
      </div>
      <div className={styles.preview}>
        <div className={styles.options} aria-label={fr ? "Choisir une occasion" : "Choose an occasion"}>
          {campaigns.map((item, i) => <button key={item.end} type="button" aria-pressed={selected === i} onClick={() => setSelected(i)}>{(fr ? item.fr : item.en)[0]}</button>)}
        </div>
        <div className={styles.poster} data-campaign={selected} aria-hidden="true">
          <span className={styles.posterTop}>LIONOVART / {label}</span>
          <span className={styles.orbit} /><span className={styles.orbitTwo} />
          <strong>{fr ? campaign.wordFr : campaign.word}<span>.</span></strong>
          <span className={styles.posterBottom}>{fr ? "Direction créative illustrative" : "Illustrative creative direction"}</span>
        </div>
        <div className={styles.caption} aria-live="polite"><span className={styles.eyebrow}>{dates}</span><h3>{title}</h3><p>{description}</p></div>
      </div>
    </section>
  );
}
