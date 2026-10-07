"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Work.module.css";

export default function WorkDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = overflow; trigger?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className={styles.dialog} aria-labelledby="work-dialog-title" onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={event => {
    if (event.key !== "Tab") return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')).filter(item => item.getClientRects().length > 0);
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }}>
    <div className={styles.dialogHead}><h2 id="work-dialog-title">{title}</h2><button autoFocus type="button" onClick={onClose} aria-label="Close panel" className={styles.close}>×</button></div>
    {children}
  </dialog>;
}
