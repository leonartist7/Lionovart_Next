"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { useIntroLifecycle } from "@/components/ui/IntroLifecycle";

const chapters = {
  innovation: { target: "[data-brand-statement]", runway: "[data-card-exit]", progress: .46 },
  "service-cards": { target: "[data-opening-benefits]", runway: "[data-card-exit]", progress: .31 },
  "selected-work": { target: "#selected-work", runway: "[data-gallery-runway]", progress: .14 },
} as const;

export type ReviewChapter = keyof typeof chapters;

function chapterTop(chapter: ReviewChapter) {
  const world = document.querySelector<HTMLElement>("[data-service-world]");
  if (!world?.dataset.storyLayoutReason || world.dataset.storyLayoutReason === "pending") return;
  const { target, runway, progress } = chapters[chapter];
  const flow = world.dataset.storyStatic === "true";
  const anchor = world.querySelector(flow ? target : runway);
  if (!anchor) return;
  const bounds = anchor.getBoundingClientRect();
  const top = scrollY + bounds.top;
  if (flow) {
    const navHeight = document.querySelector<HTMLElement>("[data-nav-state]")?.offsetHeight ?? 0;
    return top - Math.max(navHeight, 64) - 12;
  }
  if (chapter === "selected-work") {
    return top + progress * Math.max(1, bounds.height - innerHeight * .85);
  }
  return top - innerHeight + progress * (bounds.height + innerHeight);
}

/** Enter the real chapter after its scroll geometry settles, then yield to the reader. */
export default function ReviewChapterLanding({ chapter }: { chapter: ReviewChapter }) {
  const { released } = useIntroLifecycle();
  const lenis = useLenis();
  const completed = useRef<ReviewChapter | null>(null);

  useEffect(() => {
    if (!released || completed.current === chapter || location.hash) return;

    let disposed = false, frame = 0, stableFrames = 0, previousTop: number | undefined;
    const start = performance.now();

    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("keydown", keyboard);
    };
    const interrupt = () => {
      completed.current = chapter;
      stop();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) interrupt();
    };

    const land = () => {
      if (disposed || completed.current === chapter) return;
      const measured = chapterTop(chapter);
      const top = measured === undefined ? undefined : Math.max(0, Math.round(measured));
      stableFrames = top !== undefined && top === previousTop ? stableFrames + 1 : 0;
      previousTop = top;

      if (top !== undefined && stableFrames >= 3 && (document.fonts.status === "loaded" || performance.now() - start > 900)) {
        completed.current = chapter;
        stop();
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(top, { immediate: true, force: true, userData: { navigation: true } });
        } else window.scrollTo({ top, behavior: "instant" });
        return;
      }
      if (performance.now() - start < 1800) frame = requestAnimationFrame(land);
      else stop();
    };

    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("pointerdown", interrupt, { passive: true });
    window.addEventListener("keydown", keyboard);
    frame = requestAnimationFrame(land);

    return () => { disposed = true; stop(); };
  }, [chapter, lenis, released]);

  return null;
}
