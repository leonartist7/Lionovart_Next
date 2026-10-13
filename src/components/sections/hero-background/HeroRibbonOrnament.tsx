"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { useIntroLifecycle } from "@/components/ui/IntroLifecycle";
import generated from "@/lib/pearl-gold/hero.generated.json";
import { layerProgress, revealPath, type RibbonGeometry } from "@/lib/pearl-gold/formation.mjs";
import styles from "./HeroRibbonOrnament.module.css";

type Props = { durationMs?: number; staggerMs?: number; startDelayMs?: number; /** Freeze the timeline for visual review, from 0 to 1. */ progress?: number };
const profiles = ["desktop", "tablet", "mobile"] as const;

/** The approved material stays static; only exact cubic reveal boundaries change. */
export default function HeroRibbonOrnament({ durationMs = 9000, staggerMs = 100, startDelayMs = 0, progress }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const finished = useRef(false);
  const { released } = useIntroLifecycle();
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const artwork = useMemo(() => profiles.map(profile => ({ profile, html: generated[profile].svg.replaceAll("ribbonINSTANCE", `ribbon-${id}`) })), [id]);

  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 767px)");
    const tablet = matchMedia("(min-width: 768px) and (max-aspect-ratio: 1/1)");
    const reviewParam = process.env.NODE_ENV === "development" ? new URLSearchParams(location.search).get("ornamentTime") : null;
    const reviewProgress = progress ?? (reviewParam !== null && Number.isFinite(Number(reviewParam)) ? Number(reviewParam) : undefined);
    const sets = profiles.map(profile => {
      const container = host.querySelector(`[data-profile="${profile}"]`)!;
      return { profile, layers: generated[profile].ribbons.map(ribbon => ({
        geometry: ribbon as unknown as RibbonGeometry,
        nodes: container.querySelectorAll<SVGPathElement>(`[data-reveal-ribbon="${ribbon.id}"], [data-shadow-caster="${ribbon.id}"], [data-receiver-ribbon="${ribbon.id}"]`),
      })) };
    });
    let frame = 0, last = 0, lastPaint = -Infinity, visible = false;
    const paint = (time: number, complete = false) => {
      for (const set of sets) {
        if (!complete && set.profile !== (mobile.matches ? "mobile" : tablet.matches ? "tablet" : "desktop")) continue;
        set.layers.forEach((layer, index) => {
          const p = complete ? 1 : layerProgress(time, index, { durationMs, staggerMs, startDelayMs, layerCount: set.layers.length });
          const d = revealPath(layer.geometry, p);
          layer.nodes.forEach(node => node.setAttribute("d", d));
        });
      }
      host.dataset.formation = complete ? "complete" : "forming";
      host.dataset.elapsed = String(Math.round(time));
    };
    const complete = () => { cancelAnimationFrame(frame); frame = 0; host.dataset.animationActive = "false"; finished.current = true; paint(durationMs + startDelayMs, true); };
    const tick = (now: number) => {
      frame = 0;
      if (last) elapsed.current += now - last;
      last = now;
      if (elapsed.current >= durationMs + startDelayMs) { complete(); return; }
      // Limit path writes on high-refresh screens; mobile needs only 30 paints/sec.
      if (now - lastPaint >= (mobile.matches || tablet.matches ? 1000 / 30 : 1000 / 60) - 1) {
        paint(elapsed.current); lastPaint = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); frame = 0; last = 0; lastPaint = -Infinity;
      host.dataset.animationActive = "false";
      if (reduced.matches) { complete(); return; }
      if (reviewProgress !== undefined) { paint(Math.max(0, Math.min(1, reviewProgress)) * durationMs + startDelayMs, reviewProgress >= 1); return; }
      if (finished.current) { complete(); return; }
      paint(elapsed.current);
      if (released && visible && !document.hidden) { host.dataset.animationActive = "true"; frame = requestAnimationFrame(tick); }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.01 });
    observer.observe(document.querySelector(".lion-hero") || host);
    reduced.addEventListener("change", sync);
    mobile.addEventListener("change", sync);
    tablet.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      reduced.removeEventListener("change", sync); mobile.removeEventListener("change", sync);
      tablet.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [released, durationMs, staggerMs, startDelayMs, progress]);

  return <div ref={root} className={styles.ornament} aria-hidden="true" data-hero-ribbons data-formation="waiting">
    {artwork.map(({ profile, html }) => <div key={profile} data-profile={profile} className={styles[profile]} dangerouslySetInnerHTML={{ __html: html }} />)}
  </div>;
}
