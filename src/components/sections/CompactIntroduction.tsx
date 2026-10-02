"use client";

import { Link } from "@/i18n/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./CompactIntroduction.module.css";

// Preserve the current homepage's credibility figures; this layout change
// does not establish their provenance or turn them into new client results.
const STAT_VALUES = ["15+", "10+", "100%"];

export default function CompactIntroduction() {
  const { t } = useLanguage();
  const copy = t.compactComparison;

  return (
    <section id="about" aria-labelledby="innovation-heading" className={styles.section} data-scroll-title-skip>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <h2 id="innovation-heading" className={styles.heading}>
            {copy.heading}<br /><span>{copy.headingAccent}</span>
          </h2>
          <p className={styles.description}>{copy.description}</p>
          <dl className={styles.stats}>
            {copy.stats.map((label, index) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{STAT_VALUES[index]}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div id="comparison" data-nova-section="comparison" className={styles.comparison}>
          <table className={styles.table}>
            <caption className={styles.srOnly}>{copy.caption}</caption>
            <colgroup><col className={styles.brandColumn} /><col /></colgroup>
            <thead><tr>
              <th id="compact-lionovart" scope="col">LIONOVART</th>
              <th id="compact-others" scope="col">{copy.others}</th>
            </tr></thead>
            {copy.rows.map((row, index) => (
              <tbody key={row.topic}>
                <tr><th id={`compact-topic-${index}`} scope="rowgroup" colSpan={2} className={styles.topic}>{row.topic}</th></tr>
                <tr>
                  <td headers={`compact-lionovart compact-topic-${index}`}>{row.lionovart}</td>
                  <td headers={`compact-others compact-topic-${index}`}>{row.others}</td>
                </tr>
              </tbody>
            ))}
          </table>
          <div className={styles.comparisonFooter}>
            <p>{copy.scope}</p>
            <Link href="/about" locale="en" className={styles.link}>
              {copy.link}<span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
