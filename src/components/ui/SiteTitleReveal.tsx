"use client";

import { useLayoutEffect } from "react";

// Some art-directed sections expose a heading role instead of a native heading
// element, so include both forms across every route and site-level section.
const TITLE_SELECTOR =
  "h1, h2, h3, [role='heading'], [data-site-title-reveal]";
const LINE_TOLERANCE = 2;
const MUTED_OPACITY = 0.22;
const LINE_STAGGER = 0.14;
const WORD_STAGGER = 0.045;
const WORD_REVEAL_RANGE = 0.42;

type TitleRecord = {
  title: HTMLElement;
  originalChildren: Node[];
  words: HTMLElement[];
};

function isEligibleTitle(element: HTMLElement) {
  return !element.closest(
    "[role='dialog'], .sr-only, #services, #stronger-together, [data-scroll-title-skip]",
  );
}

function splitTitleIntoWords(title: HTMLElement): TitleRecord | null {
  const originalChildren = Array.from(title.childNodes).map((node) =>
    node.cloneNode(true),
  );
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      const isVisibleText = Boolean(node.nodeValue?.trim());
      const shouldSkip = parent?.closest(
        "script, style, .sr-only, [data-scroll-title-skip]",
      );

      return isVisibleText && !shouldSkip
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  let node = walker.nextNode();
  while (node) {
    textNodes.push(node as Text);
    node = walker.nextNode();
  }

  const words: HTMLElement[] = [];

  textNodes.forEach((textNode) => {
    const parts = textNode.nodeValue?.split(/(\s+)/) ?? [];
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      if (!part) return;

      if (/^\s+$/.test(part)) {
        fragment.append(document.createTextNode(part));
        return;
      }

      const word = document.createElement("span");
      word.className = "site-title-reveal-word";
      word.textContent = part;
      fragment.append(word);
      words.push(word);
    });

    textNode.replaceWith(fragment);
  });

  return words.length ? { title, originalChildren, words } : null;
}

function measureLines(record: TitleRecord) {
  let line = -1;
  let wordInLine = 0;
  let previousTop: number | null = null;

  record.words.forEach((word) => {
    const top = word.getBoundingClientRect().top;
    const isNewLine =
      previousTop === null || Math.abs(top - previousTop) > LINE_TOLERANCE;

    if (isNewLine) {
      line += 1;
      wordInLine = 0;
      previousTop = top;
    } else {
      wordInLine += 1;
    }

    word.style.setProperty("--site-title-line", String(line));
    word.style.setProperty("--site-title-word", String(wordInLine));
  });
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function updateTitleProgress(record: TitleRecord, viewportHeight: number) {
  const start = viewportHeight * 0.92;
  const end = viewportHeight * 0.42;
  const titleProgress = clamp(
    (start - record.title.getBoundingClientRect().top) / (start - end),
  );

  record.words.forEach((word) => {
    const line = Number(word.style.getPropertyValue("--site-title-line")) || 0;
    const wordInLine =
      Number(word.style.getPropertyValue("--site-title-word")) || 0;
    const phase = Math.min(0.64, line * LINE_STAGGER + wordInLine * WORD_STAGGER);
    const progress = clamp((titleProgress - phase) / WORD_REVEAL_RANGE);

    word.style.opacity = String(MUTED_OPACITY + (1 - MUTED_OPACITY) * progress);
    word.style.filter = `grayscale(${1 - progress})`;
  });
}

/**
 * Splits editorial headings into their visual lines after layout. Each line
 * scrubs from grey to full color word-by-word from left to right. Reversing
 * scroll direction reverses the same sequence, using the actual visual lines
 * on every screen size without character-level motion.
 */
export default function SiteTitleReveal() {
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const records = new Map<HTMLElement, TitleRecord>();
    const activeTitles = new Set<HTMLElement>();
    let measureFrame = 0;
    let revealFrame = 0;

    const scheduleReveal = () => {
      if (revealFrame) return;

      revealFrame = window.requestAnimationFrame(() => {
        revealFrame = 0;
        activeTitles.forEach((title) => {
          const record = records.get(title);
          if (record?.title.isConnected) {
            updateTitleProgress(record, window.innerHeight);
          }
        });
      });
    };

    const scheduleMeasure = () => {
      if (measureFrame) return;

      measureFrame = window.requestAnimationFrame(() => {
        measureFrame = 0;
        records.forEach((record) => {
          if (record.title.isConnected) measureLines(record);
        });
        scheduleReveal();
      });
    };

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const title = entry.target as HTMLElement;
          title.classList.toggle("site-title-reveal--active", entry.isIntersecting);
          if (entry.isIntersecting) activeTitles.add(title);
          else activeTitles.delete(title);
        });
        scheduleReveal();
      },
      { rootMargin: "100% 0px", threshold: 0 },
    );

    const resizeObserver = new ResizeObserver(scheduleMeasure);

    const collectTitles = () => {
      records.forEach((record, title) => {
        if (record.words.every((word) => title.contains(word))) return;

        intersectionObserver.unobserve(title);
        resizeObserver.unobserve(title);
        activeTitles.delete(title);
        records.delete(title);
        title.classList.remove("site-title-reveal", "site-title-reveal--active");
      });

      document.querySelectorAll<HTMLElement>(TITLE_SELECTOR).forEach((title) => {
        if (records.has(title) || !isEligibleTitle(title)) return;

        const record = splitTitleIntoWords(title);
        if (!record) return;

        records.set(title, record);
        title.classList.add("site-title-reveal");
        resizeObserver.observe(title);
        intersectionObserver.observe(title);
      });

      scheduleMeasure();
    };

    collectTitles();

    const mutationObserver = new MutationObserver(collectTitles);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", scheduleReveal, { passive: true });
    window.addEventListener("resize", scheduleMeasure);

    return () => {
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleReveal);
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      if (measureFrame) window.cancelAnimationFrame(measureFrame);
      if (revealFrame) window.cancelAnimationFrame(revealFrame);

      records.forEach((record) => {
        record.title.replaceChildren(
          ...record.originalChildren.map((node) => node.cloneNode(true)),
        );
        record.title.classList.remove(
          "site-title-reveal",
          "site-title-reveal--active",
        );
      });
    };
  }, []);

  return null;
}
