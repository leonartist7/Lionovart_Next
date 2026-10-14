"use client";

import { usePublicCopy } from "@/hooks/usePublicCopy";
import { IMAGINE_BENEFITS } from "./imagine-benefits";
import BenefitSculpture from "./BenefitSculpture";
import styles from "./what-we-do/DisciplineSplit3D.module.css";

export function ImagineHeading() {
  const tr = usePublicCopy();
  return <><h2>{tr("Your image speaks first.")}</h2><p>{tr("Let it speak well of the work behind it.")}</p></>;
}

export default function ImagineCardFace({ index }: { index: number }) {
  const tr = usePublicCopy();
  const item = IMAGINE_BENEFITS[index];
  if (!item) return null;
  return <div className={styles.benefitContent} data-imagine-card={index}>
    <header><h3>{tr(item.detail)}</h3><p>{tr(item.body)}</p></header>
    <div className={styles.benefitArtwork} aria-hidden="true"><BenefitSculpture kind={index} /></div>
    <div className={styles.benefitDetails}>
      <ul>{item.points.map(point => <li key={point}>{tr(point)}</li>)}</ul>
      <p className={styles.benefitMetric}><strong>{item.stat.qualifier && <small>{tr(item.stat.qualifier)}</small>}{tr(item.stat.value)}<span>{item.stat.unit}</span></strong><span>{tr(item.stat.label)}</span></p>
    </div>
  </div>;
}

export function ImagineMotionFallback() {
  return <section className={styles.imagineFallback} aria-label="Imagine" data-imagine-fallback>
    <header><ImagineHeading /></header>
    <div>{IMAGINE_BENEFITS.map((item, index) => <article key={item.title}><ImagineCardFace index={index} /></article>)}</div>
  </section>;
}
