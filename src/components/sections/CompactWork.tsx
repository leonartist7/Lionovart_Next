"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowLeft, ArrowRight, Play, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import ServicesCurves from "./ServicesCurves";
import { useWorkBrowse } from "./selected-work/WorkBrowse";
import { GALLERY_SERVICE_LABELS, type GalleryWork } from "./selected-work/gallery";
import styles from "./CompactWork.module.css";

const subscribeSize = (notify: () => void) => {
  const media = window.matchMedia("(min-width: 1000px)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const desktopSnapshot = () => window.matchMedia("(min-width: 1000px)").matches;

function WorkThumbnail({ work }: { work: GalleryWork }) {
  const [hovering, setHovering] = useState(false);
  const reduced = useHydratedReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (hovering && !reduced) void video.current?.play().catch(() => {});
    else video.current?.pause();
  }, [hovering, reduced]);
  return <div className={styles.media}
    onPointerEnter={event => { if (event.pointerType === "mouse") setHovering(true); }}
    onPointerLeave={() => setHovering(false)}>
    <Image src={work.poster} alt={work.name} fill loading="lazy"
      sizes="(min-width: 1600px) 500px, (min-width: 1000px) 30vw, 46vw"
      className={work.fit === "contain" ? styles.contain : styles.cover} />
    {work.video && hovering && !reduced && <video ref={video} src={work.video} poster={work.poster}
      className={styles.film} muted loop playsInline preload="none" aria-hidden="true" />}
    {work.video && <span className={styles.play} aria-hidden="true"><Play /></span>}
  </div>;
}

export default function CompactWork({ servicesCurves = false }: { servicesCurves?: boolean }) {
  const browse = useWorkBrowse();
  return <WorkGrid key={browse.industry + "/" + browse.style} servicesCurves={servicesCurves} />;
}

function WorkGrid({ servicesCurves }: { servicesCurves: boolean }) {
  const tr = usePublicCopy();
  const reduced = useHydratedReducedMotion();
  const t = useTranslations("selectedWork");
  const browse = useWorkBrowse();
  const wide = useSyncExternalStore(subscribeSize, desktopSnapshot, () => false);
  const [page, setPage] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const section = useRef<HTMLElement>(null);
  const projects = browse.galleryProjects;
  const size = wide ? 6 : 4;
  const pages = Math.max(1, Math.ceil(projects.length / size));
  const currentPage = Math.min(page, pages - 1);
  const first = currentPage * size;
  const visible = projects.slice(first, first + size);
  const selectedIndex = projects.findIndex(work => work.slug === selectedSlug);
  const selected = projects[selectedIndex];
  const movePreview = (direction: number) => {
    const next = (selectedIndex + direction + projects.length) % projects.length;
    setSelectedSlug(projects[next].slug);
  };
  const movePage = (direction: number) => {
    setPage(Math.min(pages - 1, Math.max(0, currentPage + direction)));
    section.current?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
  };

  useEffect(() => {
    if (window.location.hash !== "#selected-work") return;
    let frame = 0;
    const land = () => { frame = requestAnimationFrame(() => section.current?.scrollIntoView({ behavior: "instant", block: "start" })); };
    if (document.documentElement.dataset.splashComplete === "true") land();
    else window.addEventListener("lionovart:splash-complete", land, { once: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("lionovart:splash-complete", land); };
  }, []);

  return <Dialog.Root open={Boolean(selected)} onOpenChange={open => { if (!open) setSelectedSlug(null); }}>
    <section ref={section} id="selected-work" data-gallery="compact" data-art-directed="light"
      data-scroll-title-skip aria-labelledby="selected-work-heading" className={styles.section}>
      {servicesCurves && <ServicesCurves continuation />}
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 id="selected-work-heading">{t("eyebrow")}</h2>
          <span className={styles.total}>{String(projects.length).padStart(2, "0")}</span>
        </header>
        <div className={styles.grid} data-work-preview-grid>
          {visible.map(work => <article key={work.assetId} className={styles.card} data-work-card data-work-slug={work.slug}>
            <Dialog.Trigger className={styles.cardButton} onClick={() => setSelectedSlug(work.slug)}
              aria-label={tr("View work") + ": " + work.name}>
              <WorkThumbnail work={work} />
              <span className={styles.caption}><span>{work.name}</span><ArrowRight aria-hidden="true" /></span>
            </Dialog.Trigger>
          </article>)}
        </div>
        <div className={styles.footer}>
          <p role="status" aria-live="polite">{first + 1}–{Math.min(first + size, projects.length)} <span>/ {projects.length}</span></p>
          <div className={styles.pager}>
            <button type="button" disabled={currentPage === 0} aria-label={tr("Previous works")}
              onClick={() => movePage(-1)}><ArrowLeft aria-hidden="true" /></button>
            <button type="button" disabled={currentPage === pages - 1} aria-label={tr("Next works")}
              onClick={() => movePage(1)}><span>{tr("More work")}</span><ArrowRight aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </section>
    <Dialog.Portal>
      <Dialog.Backdrop className={styles.backdrop} />
      <Dialog.Popup className={styles.preview} data-work-preview
        onKeyDown={event => {
          if (event.target instanceof Element && event.target.closest("video")) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault(); movePreview(event.key === "ArrowRight" ? 1 : -1);
          }
        }}>
        {selected && <>
          <header className={styles.previewHeader}>
            <div><Dialog.Title className={styles.previewTitle}>{selected.name}</Dialog.Title>
              <Dialog.Description className={styles.previewDescription}>
                {selected.services.map(id => tr(GALLERY_SERVICE_LABELS[id] ?? id)).join(" · ")}
              </Dialog.Description>
            </div>
            <Dialog.Close className={styles.iconButton} aria-label={tr("Close preview")}><X aria-hidden="true" /></Dialog.Close>
          </header>
          <div className={styles.previewMedia}>
            {selected.video ? <video key={selected.assetId} src={selected.video} poster={selected.poster}
              controls muted playsInline preload="metadata" aria-label={selected.name} />
              : <Image key={selected.assetId} src={selected.poster} alt={selected.name} fill
                sizes="(min-width: 1600px) 1400px, 94vw" className={styles.contain} />}
          </div>
          <footer className={styles.previewFooter}>
            <button type="button" className={styles.iconButton} aria-label={tr("Previous work")} onClick={() => movePreview(-1)}><ArrowLeft aria-hidden="true" /></button>
            <span aria-live="polite">{selectedIndex + 1} / {projects.length}</span>
            <button type="button" className={styles.iconButton} aria-label={tr("Next work")} onClick={() => movePreview(1)}><ArrowRight aria-hidden="true" /></button>
          </footer>
        </>}
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
