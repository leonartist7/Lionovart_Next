"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import GoldThreads from "@/components/ui/GoldThreads";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import styles from "./CompactIntroduction.module.css";

const STAT_VALUES = ["15+", "10+", "100%"];

export default function CompactIntroduction({ embedded = false }: { embedded?: boolean }) {
  const { t } = useLanguage();
  const tr = usePublicCopy();
  const copy = t.compactComparison;
  return (
    <section id={embedded ? undefined : "about"} data-about-content={embedded} aria-labelledby="innovation-heading" className={styles.section} data-scroll-title-skip data-nav-surface="light">
      {!embedded && <GoldThreads />}
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h2 id="innovation-heading" className={styles.heading}>
            {copy.heading}<br /><span>{copy.headingAccent}</span>
          </h2>
          <p className={styles.description}>{tr("I’m Leonardo, founder and creative director of LIONOVART. I work with you directly, from the first conversation to the final details.")}</p>
          <p className={styles.description}>{tr("Before we talk about design, I take the time to understand what you’ve built, what matters to you and where you want to go. You deserve a brand that feels like you.")}</p>
          <Link href="/about#founder" className={styles.link} data-sound-hover>
            {tr("Get to know me")}<span aria-hidden="true">↗</span>
          </Link>
          <dl className={styles.stats}>
            {copy.stats.map((label, index) => <div key={label}><dt>{label}</dt><dd>{STAT_VALUES[index]}</dd></div>)}
          </dl>
        </div>
        <figure className={styles.portrait}>
          <Image src="/images/Leon-Studioshot.avif" alt={tr("Leonardo, founder and creative director of LIONOVART")} width={1024} height={1024} sizes={embedded ? "(max-width: 919px) 104px, 256px" : "(max-width: 919px) 90vw, 42vw"} className={styles.portraitImage} />
          <figcaption>{tr("Leonardo / Founder & creative director")}</figcaption>
        </figure>
      </div>
    </section>
  );
}
