"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { useWorkBrowse } from "./selected-work/WorkBrowse";
import { GALLERY_SERVICE_LABELS } from "./selected-work/gallery";
import GalleryWalkthrough from "./GalleryWalkthrough";
import styles from "./CompactWork.module.css";

export default function CompactWork({ servicesCurves = false }: { servicesCurves?: boolean }) {
  const browse = useWorkBrowse();
  return <WorkGrid key={browse.industry + "/" + browse.style} servicesCurves={servicesCurves} />;
}

function WorkGrid({ servicesCurves }: { servicesCurves: boolean }) {
  const tr = usePublicCopy();
  const projects = useWorkBrowse().galleryProjects;
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedIndex = projects.findIndex(work => work.slug === selectedSlug);
  const selected = projects[selectedIndex];
  const movePreview = (direction: number) => {
    if (!projects.length) return;
    const next = (selectedIndex + direction + projects.length) % projects.length;
    setSelectedSlug(projects[next].slug);
  };
  return <Dialog.Root open={Boolean(selected)} onOpenChange={open => { if (!open) setSelectedSlug(null); }}>
    <GalleryWalkthrough projects={projects} onSelect={setSelectedSlug} previewOpen={!!selected} servicesCurves={servicesCurves} />
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
