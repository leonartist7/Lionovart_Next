"use client";

import { usePublicCopy } from "@/hooks/usePublicCopy";
import { IMAGINE_BENEFITS } from "./imagine-benefits";
import { BenefitCard } from "./PawRevealStack";
import styles from "./what-we-do/DisciplineSplit3D.module.css";

export function ImagineHeading() {
  const tr = usePublicCopy();
  return <><h2>{tr("Your image speaks first.")}</h2><p>{tr("Let it speak well of the work behind it.")}</p></>;
}

export default function ImagineCardFace({ index }: { index: number }) {
  const item = IMAGINE_BENEFITS[index];
  if (!item) return null;
  return <div className={styles.imagineCardWrapper} data-imagine-card={index}>
    <BenefitCard item={item} index={index} />
  </div>;
}

export function ImagineMotionFallback() {
  return <section className={styles.imagineFallback} aria-label="Imagine" data-imagine-fallback>
    <header><ImagineHeading /></header>
    <div>{IMAGINE_BENEFITS.map((item, index) => <article key={item.title}><ImagineCardFace index={index} /></article>)}</div>
  </section>;
}
