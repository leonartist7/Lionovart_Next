"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import GoldThreads from "@/components/ui/GoldThreads";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import styles from "./CompactIntroduction.module.css";

const STAT_VALUES = ["15+", "10+", "100%"];

export default function CompactIntroduction() {
  const { t } = useLanguage();
  const tr = usePublicCopy();
  const copy = t.compactComparison;
  return (
    <section id="about" aria-labelledby="innovation-heading" className={styles.section} data-scroll-title-skip data-nav-surface="light">
      <GoldThreads />
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h2 id="innovation-heading" className={styles.heading}>
            {copy.heading}<br /><span>{copy.headingAccent}</span>
          </h2>
          <p className={styles.description}>{tr("I’m Leonardo, founder and creative director of LIONOVART. I work with you directly, from the first conversation to the final details.")}</p>
          <p className={styles.description}>{tr("Brand identity, film and digital experiences come together around one clear direction. When your project needs specialist skills, I bring the right people into the work.")}</p>
          <Link href="/about#founder" className={styles.link} data-sound-hover>
            {tr("Get to know me")}<span aria-hidden="true">↗</span>
          </Link>
          <dl className={styles.stats}>
            {copy.stats.map((label, index) => <div key={label}><dt>{label}</dt><dd>{STAT_VALUES[index]}</dd></div>)}
          </dl>
        </div>
        <figure className={styles.portrait}>
          <Image src="/images/Leon-Studioshot.avif" alt={tr("Leonardo, founder and creative director of LIONOVART")} width={1024} height={1024} sizes="(max-width: 919px) 90vw, 42vw" className={styles.portraitImage} />
          <figcaption>{tr("Leonardo / Founder & creative director")}</figcaption>
        </figure>
      </div>
    </section>
  );
}
