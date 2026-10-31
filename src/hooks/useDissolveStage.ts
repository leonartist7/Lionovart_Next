'use client';
import { useEffect, useState, useRef } from 'react';
import { usePinnedScene } from '@/components/sections/service-world/PinnedScene';
import { chapterOpacity } from '@/components/sections/chapter-dissolve';

/** Fixed visual stage, ordinary document runway, complete static accessibility fallback. */
export function useDissolveStage() {
  const scene = usePinnedScene();
  const runway = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const anchor = runway.current, surface = stage.current;
    if (!anchor || !surface) return;
    if (scene?.target) {
      surface.dataset.dissolvePinned = 'false';
      return scene.register({ anchor, surface, onActive: setActive });
    }
    const media = matchMedia('(prefers-reduced-motion: reduce), (max-height: 560px)');
    let frame = 0, wasActive = false;
    const sync = () => {
      frame = 0;
      const bounds = anchor.getBoundingClientRect();
      const opacity = media.matches ? 1 : chapterOpacity(bounds.top, bounds.bottom, innerHeight);
      const visible = bounds.top < innerHeight && bounds.bottom > 0;
      const playing = visible && opacity > .7 && !document.hidden;
      surface.dataset.dissolvePinned = String(!media.matches);
      surface.style.opacity = String(opacity);
      surface.style.visibility = opacity > .001 ? 'visible' : 'hidden';
      surface.style.pointerEvents = opacity > .7 ? 'auto' : 'none';
      surface.inert = opacity <= .7;
      surface.dataset.chapterActive = String(playing);
      if (playing !== wasActive) { wasActive = playing; setActive(playing); }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const observer = new ResizeObserver(schedule); observer.observe(anchor);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule); window.addEventListener('pageshow', schedule);
    document.addEventListener('visibilitychange', schedule); media.addEventListener('change', schedule);
    void document.fonts.ready.then(schedule); sync();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.removeEventListener('pageshow', schedule);
      document.removeEventListener('visibilitychange', schedule); media.removeEventListener('change', schedule);
      surface.style.removeProperty('opacity'); surface.style.removeProperty('visibility'); surface.style.removeProperty('pointer-events');
      surface.inert = false; delete surface.dataset.dissolvePinned;
    };
  }, [runway, stage, scene]);
  return { runway, stage, active };
}
