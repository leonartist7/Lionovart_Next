"use client";

import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { safeGalleryPath, workServiceLabels, workEntries, workIndustryLabel, workStatus, type WorkEntry } from "./catalog";
import WorkMedia from "./WorkMedia";
import { WorkCard } from "./WorkGallery";
import { useWorkEnquiry, WorkClosing } from "./WorkShell";
import styles from "./Work.module.css";

export default function WorkProject({ entry }: { entry: WorkEntry }) {
  const params = useSearchParams();
  const returnTo = safeGalleryPath(params.get("from"));
  const enquire = useWorkEnquiry();
  const related = workEntries.filter(item => item.slug !== entry.slug && (entry.industry ? item.industry === entry.industry : item.serviceIds.some(id => entry.serviceIds.includes(id)))).slice(0, 2);
  return <main id="work-main" className={`${styles.main} ${styles.project}`}>
    <div className={styles.backBar}><Link href={returnTo} scroll={false}><span aria-hidden="true">←&nbsp;</span> Back to work</Link><span className={styles.small}>UX wireframe · sample content</span></div>
    <div className={styles.projectTitle}><div><p className={styles.eyebrow}>{workStatus(entry)} / {entry.number}</p><h1>{entry.name}</h1></div><button type="button" className={styles.secondary} onClick={() => enquire(entry)}>Discuss a project ↗</button></div>
    <WorkMedia entry={entry} playable />
    <dl className={styles.context}><div><dt>Industry</dt><dd>{workIndustryLabel(entry)}</dd></div><div><dt>Services</dt><dd>{workServiceLabels(entry).join(" · ")}</dd></div><div><dt>Status</dt><dd>{entry.kind === "work" ? "Project / concept classification pending" : workStatus(entry)}</dd></div></dl>
    <section className={styles.story}><p className={styles.eyebrow}>01 / Context</p><div><h2>[The need]</h2><p>[Project context placeholder. No client claims are represented in this wireframe.]</p></div><div><h2>[Design response]</h2><p>[Approach and design decisions placeholder.]</p></div></section>
    <section className={styles.applicationGrid} aria-label={entry.supportingPosters ? "Showcase film stills" : "Supporting applications"}><WorkMedia entry={entry} supporting /><WorkMedia entry={entry} supporting supportIndex={1} /></section>
    <section className={styles.story}><p className={styles.eyebrow}>02 / {entry.verifiedOutcome ? "Outcome" : "Applications"}</p><div><h2>{entry.verifiedOutcome ? "Verified outcome" : "[Intended applications]"}</h2><p>{entry.verifiedOutcome ?? "[Application context placeholder. Add verified results only when available.]"}</p></div></section>
    <WorkClosing entry={entry} />
    <section className={styles.related}><div className={styles.sectionHead}><h2>Related work</h2><Link href={returnTo} scroll={false}>Back to collection ↗</Link></div><div className={styles.grid}>{related.map(item => <WorkCard key={item.slug} entry={item} />)}</div></section>
  </main>;
}
