"use client";
import { Link } from "@/i18n/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./Comparison.module.css";

export default function Comparison() {
  const { t } = useLanguage();
  const copy = t.compactComparison;
  return (
    <section
      id="comparison"
      className={styles.section}
      aria-labelledby="comparison-heading"
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h2 id="comparison-heading">{copy.heading}</h2>
          </div>
          <p className={styles.body}>{copy.body}</p>
        </header>
        <div className={styles.comparison}>
          <div className={styles.providers} aria-hidden="true">
            <span>{copy.others}</span>
            <span>{copy.studio}</span>
          </div>
          {copy.rows.map((row) => (
            <div key={row.topic} className={styles.row}>
              <h3>{row.topic}</h3>
              <div className={styles.pair}>
                <p>
                  <span className={styles.providerLabel}>{copy.others}: </span>
                  {row.others}
                </p>
                <p>
                  <span className={styles.providerLabel}>{copy.studio}: </span>
                  {row.studio}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.foot}>
          <p>{copy.qualifier}</p>
          <Link id="about" href="/about">
            {copy.link}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
