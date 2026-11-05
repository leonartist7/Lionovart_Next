"use client";

import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import styles from "./RakbankMark.module.css";

type View = "board" | "detail" | "film";
type Playback = "idle" | "shader" | "cut";

export function RakbankMark({ film, poster }: { film: string; poster: string }) {
  const t = useTranslations("selectedWork.rakbankMark");
  const [view, setView] = useState<View>("board");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playback, setPlayback] = useState<Playback>("idle");
  const board = useRef<HTMLImageElement>(null);
  const detail = useRef<HTMLImageElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const active = useRef<AbortController | null>(null);
  const mainAction = useRef<HTMLButtonElement>(null);
  useEffect(() => () => active.current?.abort(), []);

  function show(next: View) {
    active.current?.abort();
    active.current = null;
    output.current?.replaceChildren();
    setPending(false);
    setFailed(false);
    setPlayback("idle");
    setView(next);
  }

  async function follow(fromHotspot = false) {
    const from = board.current, to = detail.current, layer = output.current;
    if (!from || !to || !layer || active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const { signal } = controller;
    setPending(true);
    setFailed(false);
    let mode: Playback = "cut";
    try {
      await Promise.all([from.decode(), to.decode()]);
      if (signal.aborted) return;
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        try {
          const { revealWithHex } = await import("@/lib/acty-hex");
          if (signal.aborted) return;
          const canvas = document.createElement("canvas");
          canvas.dataset.markCanvas = "";
          canvas.style.visibility = "hidden";
          layer.replaceChildren(canvas);
          await revealWithHex(canvas, from, to, {
            signal, duration: 550,
            onFrame: progress => {
              canvas.style.visibility = "visible";
              if (progress === 1) mode = "shader";
            },
          });
        } catch {
          // Either source also works as a native still when GL cannot draw the pass.
        }
      }
      if (signal.aborted) return;
      // Keep the final drawing in place until its identical DOM image is visible.
      flushSync(() => { setView("detail"); setPlayback(mode); });
      if (fromHotspot && document.hasFocus()) mainAction.current?.focus({ preventScroll: true });
    } catch {
      if (!signal.aborted) setFailed(true);
    } finally {
      if (active.current === controller) {
        layer.replaceChildren();
        active.current = null;
        if (!signal.aborted) setPending(false);
      }
    }
  }

  function primary() {
    if (view === "board") void follow();
    else show("board");
  }

  return <div className={styles.study} data-rakbank-mark data-view={view} data-renderer={playback}>
    <div className={styles.stage}>
      {view === "film" ? <video className={styles.film} src={film} poster={poster}
        controls muted playsInline autoPlay preload="metadata" aria-label={t("film")} />
        : <>
          <Image ref={board} src="/images/rakbank-follow/board.webp" fill unoptimized loading="eager"
            alt={t("boardAlt")} className={styles.image} hidden={view !== "board"} />
          <Image ref={detail} src="/images/rakbank-follow/app-detail.webp" fill unoptimized loading="eager"
            alt={t("detailAlt")} className={styles.image} hidden={view !== "detail"} />
          <div ref={output} className={styles.output} aria-hidden="true" />
          {view === "board" && <button type="button" className={styles.hotspot} data-mark-hotspot
            aria-label={t("follow")} aria-disabled={pending} onClick={() => void follow(true)} />}
        </>}
    </div>
    <div className={styles.panel}>
      <div className={styles.caption} aria-live="polite" aria-atomic="true">
        <p className={styles.title}>{t(view === "board" ? "overview" : view === "detail" ? "detail" : "film")}</p>
        {view !== "film" && <p className={styles.note}>{t(view === "board" ? "invitation" : "detailCaption")}</p>}
      </div>
      <div className={styles.actions}>
        <button ref={mainAction} type="button" className={styles.action} data-mark-back={view !== "board" ? "" : undefined}
          aria-disabled={pending} onClick={primary}>
          {view !== "board" && <ArrowLeft aria-hidden="true" />}
          {t(view === "board" ? "follow" : "back")}
          {view === "board" && <ArrowUpRight aria-hidden="true" />}
        </button>
        {view !== "film" && <button type="button" className={styles.filmLink}
          data-mark-film onClick={() => { show("film"); mainAction.current?.focus({ preventScroll: true }); }}>
          <Play aria-hidden="true" />{t("watch")}
        </button>}
      </div>
      {failed && <p className={styles.note} role="status">{t("error")}</p>}
    </div>
  </div>;
}
