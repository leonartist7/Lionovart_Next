"use client";

import { useLocale, useTranslations } from "next-intl";
import CountUpResult from "./CountUpResult";
import styles from "./ClientResults.module.css";

// Design-preview values, not measured client outcomes. Replace this complete
// dataset AND its visible disclosure together when verified results exist.
const PREVIEW_RESULTS = [
  { id: "revenue", value: 1_200_000, divisor: 1_000_000, decimals: 1, prefix: "€", unit: "M", suffix: "+" },
  { id: "customers", value: 2_400, suffix: "+" },
  { id: "hours", value: 8_500, suffix: "+" },
  { id: "conversion", value: 2.3, decimals: 1, suffix: "×" },
  { id: "returning", value: 38, prefix: "+", suffix: "%" },
] as const;

export default function ClientResults() {
  const t = useTranslations("results");
  const locale = useLocale();

  return (
    <section
      id="client-results"
      aria-labelledby="client-results-title"
      aria-describedby="client-results-disclosure"
      data-results-kind="illustrative"
      className={styles.section}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id="client-results-title" className={styles.heading}>
            {t("heading")}
          </h2>
          <p className={styles.subtitle}>{t("subtitle")}</p>
          <p id="client-results-disclosure" className={styles.disclosure}>
            {t("disclosure")}
          </p>
        </header>

        <dl className={styles.metrics}>
          {PREVIEW_RESULTS.map((result) => (
            <div
              key={result.id}
              data-result={result.id}
              className={result.id === "revenue" ? styles.featured : styles.metric}
            >
              <dt className={styles.label}>
                {t(`${result.id}.label`)}
                {result.id === "revenue" && (
                  <span className={styles.featuredCaption}>{t("revenue.caption")}</span>
                )}
              </dt>
              <dd className={styles.value}>
                <CountUpResult {...result} locale={locale} />
              </dd>
            </div>
          ))}
        </dl>

        <p className={styles.footnote}>{t("footnote")}</p>
      </div>
    </section>
  );
}
