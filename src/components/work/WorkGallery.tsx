"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { Link } from "@/i18n/navigation";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";
import { filterWork, industries, industryLabel, services, serviceLabel, workEntries, type WorkEntry } from "./catalog";
import WorkMedia from "./WorkMedia";
import WorkDialog from "./WorkDialog";
import { WorkClosing } from "./WorkShell";
import JellyRadio, { type JellyRadioItem } from "@/components/ui/jelly-radio/JellyRadio";
import styles from "./Work.module.css";

const industryOptions: JellyRadioItem[] = [{ value: "", label: "All industries" }, ...industries.map(item => ({ value: item.id, label: item.label }))];
const serviceOptions: JellyRadioItem[] = [{ value: "", label: "All services" }, ...services.map(item => ({ value: item.id, label: item.label }))];

function FilterChips({ title, items, value, onChange }: { title: string; items: JellyRadioItem[]; value: string; onChange: (value: string) => void }) {
  return <div className={styles.filterRow}><span className={styles.filterTitle}>{title}</span><div className={styles.filterScroll}>
    <JellyRadio items={items} value={value} onChange={onChange} ariaLabel={title}
      chipColor="#27272a" activeColor="#f5f5f5" textColor="#f5f5f5" activeTextColor="#18181b"
      // Keep wrapped rows stable: the registry's neighbor displacement assumes one horizontal row.
      size="md" gap={8} radius={18} swell={0} barge={0} shrink={0} jelly={1} bounce={0.25} stagger={22} stiffness={580} />
  </div></div>;
}

export function WorkCard({ entry, eager = false }: { entry: WorkEntry; eager?: boolean }) {
  const [previewPlayback, setPreviewPlayback] = useState<boolean>();
  const reduceMotion = useHydratedReducedMotion();
  const playing = previewPlayback ?? !reduceMotion;
  return <article className={styles.card} data-work-card data-work-slug={entry.slug} aria-label={`${entry.name} work`}>
    <WorkMedia entry={entry} eager={eager} previewPlayback={previewPlayback} />
    <ul className={styles.serviceLabels} aria-label="Services">{entry.serviceIds.map(id => <li key={id}>{serviceLabel(id)}</li>)}</ul>
    {entry.video && <button type="button" className={styles.previewControl} aria-label={`${playing ? "Pause" : "Play"} ${entry.name} preview`} onClick={() => setPreviewPlayback(!playing)}><span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span></button>}
  </article>;
}

export default function WorkGallery() {
  const params = useSearchParams();
  const industry = industries.some(item => item.id === params.get("industry")) ? params.get("industry")! : "";
  const service = services.some(item => item.id === params.get("service")) ? params.get("service")! : "";
  const limit = Math.min(workEntries.length, Math.max(12, Number(params.get("show")) || 12));
  const [sheet, setSheet] = useState(false);
  const [draftIndustry, setDraftIndustry] = useState(industry);
  const [draftService, setDraftService] = useState(service);
  const entries = filterWork(industry, service, "");
  const returnTo = `/work${params.size ? `?${params.toString()}` : ""}`;

  function update(values: Record<string, string>, resetLimit = true) {
    const next = new URLSearchParams(params.toString());
    next.delete("q");
    for (const [key, value] of Object.entries(values)) { if (value) next.set(key, value); else next.delete(key); }
    if (resetLimit) next.delete("show");
    window.history.replaceState(null, "", `${window.location.pathname}${next.size ? `?${next}` : ""}`);
  }
  useEffect(() => {
    let frame = 0;
    try {
      const stored = JSON.parse(sessionStorage.getItem("lionovart.work.return") ?? "null");
      if (stored?.path === returnTo && Number.isFinite(stored.y)) {
        frame = requestAnimationFrame(() => {
          window.scrollTo({ top: stored.y, behavior: "instant" });
          sessionStorage.removeItem("lionovart.work.return");
        });
      }
    } catch { /* Storage is optional. */ }
    return () => cancelAnimationFrame(frame);
  }, [returnTo]);
  function openFilters() { setDraftIndustry(industry); setDraftService(service); setSheet(true); }
  function reset() { update({ industry: "", service: "", q: "" }); }

  return <main id="work-main" className={styles.main}>
    <section className={styles.intro}><h1>Selected work.</h1></section>
    <section className={styles.filters} aria-label="Filter work">
      <div className={styles.galleryControls}>
      <div className={styles.industryFilters}>
        <FilterChips title="Industry" items={industryOptions} value={industry} onChange={value => update({ industry: value })} />
      </div>
      <div className={styles.filterActions}>
        <button type="button" aria-haspopup="dialog" aria-expanded={sheet} onClick={openFilters}>Filters{service ? " (1)" : ""} <span aria-hidden="true">☷</span></button>
        {(industry || service) && <button type="button" className={styles.clearFilters} onClick={reset}>Clear filters</button>}
      </div>
      </div>
      <p className={styles.srOnly} role="status" aria-live="polite">{entries.length} results · {industryLabel(industry)}{service ? ` · ${serviceLabel(service)}` : ""}</p>
    </section>
    {entries.length ? <>
      <div className={styles.grid}>{entries.slice(0, limit).map((entry, index) => <WorkCard key={entry.slug} entry={entry} eager={index === 0} />)}</div>
      <div className={styles.loadMore}><p className={styles.small}>Showing {Math.min(limit, entries.length)} of {entries.length}</p>{limit < entries.length && <button className={styles.secondary} type="button" onClick={() => update({ show: String(limit + 12) }, false)}>Load more <span aria-hidden="true">+</span></button>}</div>
    </> : <section className={styles.empty}><span aria-hidden="true">∅</span><h2>No matching work</h2><p className={styles.muted}>Try another industry or clear your filters.</p><button className={styles.secondary} onClick={reset}>Show all work</button></section>}
    <section className={styles.audit} aria-labelledby="audit-heading"><div className={styles.auditPreview} aria-label="Audit sample report placeholder"><span className={styles.eyebrow}>Sample report placement</span><div className={styles.reportSheet} aria-hidden="true"><span>BRAND AUDIT</span><b>01 / Overview</b><i /><i /><b>02 / Opportunities</b><i /><i /><b>03 / Next steps</b><i /></div></div><div><p className={styles.eyebrow}>An optional starting point</p><h2 id="audit-heading">Your brand audit.</h2><p className={styles.muted}>[Audit value and delivery details placeholder]</p><Link className={styles.textLink} href="/audit?source=work_gallery" onClick={() => trackFunnelEvent(FUNNEL_EVENT.WORK_AUDIT_OPENED)}>Explore the audit <span aria-hidden="true">↗</span></Link></div></section>
    <WorkClosing />
    {sheet && <WorkDialog title="Filter work" onClose={() => setSheet(false)}><p className={styles.muted}>Choose an industry. Refine by service if useful.</p><div className={styles.sheetFilters}>
      <FilterChips title="Industry" items={industryOptions} value={draftIndustry} onChange={setDraftIndustry} />
      <FilterChips title="Service" items={serviceOptions} value={draftService} onChange={setDraftService} />
    </div><div className={styles.sheetActions}><button type="button" className={styles.textLink} onClick={() => { setDraftIndustry(""); setDraftService(""); }}>Reset</button><button type="button" className={styles.primary} onClick={() => { update({ industry: draftIndustry, service: draftService }); setSheet(false); }}>Show {filterWork(draftIndustry, draftService, "").length} collections ↗</button></div></WorkDialog>}
  </main>;
}
