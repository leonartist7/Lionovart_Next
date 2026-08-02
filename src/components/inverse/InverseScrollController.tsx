"use client";

import { useLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], [data-lenis-prevent]",
    ),
  );
};

export default function InverseScrollController({
  children,
}: {
  children: ReactNode;
}) {
  const lenis = useLenis();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!lenis) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRestoration = window.history.scrollRestoration;
    let cancelled = false;

    root.classList.add("inverse-flow");
    body.classList.add("inverse-flow");
    window.history.scrollRestoration = "manual";

    const scrollToCurrentHash = (immediate: boolean) => {
      if (!window.location.hash) return false;
      const hashTarget = document.querySelector<HTMLElement>(window.location.hash);
      if (!hashTarget) return false;
      const top = hashTarget.getBoundingClientRect().top + window.scrollY;
      const startFromBottom = Math.max(0, top + hashTarget.offsetHeight - window.innerHeight);
      lenis.scrollTo(startFromBottom, { immediate, force: true });
      return true;
    };

    const settleAtStartingPoint = async () => {
      await document.fonts?.ready;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (cancelled) return;

      lenis.resize();
      ScrollTrigger.refresh();

      if (!scrollToCurrentHash(true)) {
        lenis.scrollTo("bottom", { immediate: true, force: true });
      }

      requestAnimationFrame(() => {
        if (cancelled) return;
        ScrollTrigger.update();
        setReady(true);
        root.dataset.inverseReady = "true";
      });
    };

    void settleAtStartingPoint();

    const onHistoryNavigation = () => {
      requestAnimationFrame(() => scrollToCurrentHash(false));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;

      const viewportStep = Math.max(240, window.innerHeight * 0.82);
      let destination: number | null = null;

      switch (event.key) {
        case "ArrowDown":
          destination = lenis.targetScroll - 120;
          break;
        case "ArrowUp":
          destination = lenis.targetScroll + 120;
          break;
        case "PageDown":
          destination = lenis.targetScroll - viewportStep;
          break;
        case "PageUp":
          destination = lenis.targetScroll + viewportStep;
          break;
        case " ":
          destination = lenis.targetScroll + (event.shiftKey ? viewportStep : -viewportStep);
          break;
        case "Home":
          destination = lenis.limit;
          break;
        case "End":
          destination = 0;
          break;
        default:
          return;
      }

      event.preventDefault();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      lenis.scrollTo(
        destination,
        reducedMotion
          ? { immediate: true, force: true }
          : { duration: 0.85, force: true },
      );
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("hashchange", onHistoryNavigation);
    window.addEventListener("popstate", onHistoryNavigation);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("hashchange", onHistoryNavigation);
      window.removeEventListener("popstate", onHistoryNavigation);
      root.classList.remove("inverse-flow");
      body.classList.remove("inverse-flow");
      delete root.dataset.inverseReady;
      window.history.scrollRestoration = previousRestoration;
    };
  }, [lenis]);

  return (
    <div
      data-inverse-ready={ready ? "true" : "false"}
      className={ready ? "opacity-100" : "opacity-0"}
    >
      {children}
      {!ready && (
        <div aria-hidden="true" className="fixed inset-0 z-[1000] bg-bg-dark" />
      )}
    </div>
  );
}
