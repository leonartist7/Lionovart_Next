"use client";

import { useEffect, useRef } from "react";

/**
 * Watches every `[data-nova-section]` element on the page and notifies NOVA
 * when the most-visible section changes. Quietly throttles so we don't spam
 * the agent with context messages while the user scrolls quickly.
 *
 * The agent receives messages like:
 *   "[CONTEXT] User is now viewing the SERVICES section."
 *
 * which the NOVA system prompt knows to treat as ambient context (reference
 * only if natural, never interrupt mid-thought).
 */
export function usePageSectionTracker(opts: {
  enabled: boolean;
  pushContextMessage: (note: string) => void;
}) {
  const { enabled, pushContextMessage } = opts;
  const lastSentSectionRef = useRef<string | null>(null);
  const sendTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSectionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nova-section]"),
    );
    if (elements.length === 0) return;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-nova-section");
          if (!id) continue;
          visibility.set(id, entry.intersectionRatio);
        }

        // Pick the section with the highest visibility above 0.4
        let bestId: string | null = null;
        let bestRatio = 0;
        visibility.forEach((ratio, id) => {
          if (ratio >= 0.4 && ratio > bestRatio) {
            bestId = id;
            bestRatio = ratio;
          }
        });

        if (!bestId) return;
        if (bestId === lastSentSectionRef.current) return;
        if (bestId === pendingSectionRef.current) return;

        // Debounce — wait 1.2s of stable visibility before notifying the agent
        pendingSectionRef.current = bestId;
        if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
        sendTimerRef.current = setTimeout(() => {
          const sectionId = pendingSectionRef.current;
          if (!sectionId || sectionId === lastSentSectionRef.current) return;
          lastSentSectionRef.current = sectionId;
          pendingSectionRef.current = null;
          pushContextMessage(
            `[CONTEXT] User is now viewing the ${sectionId.toUpperCase()} section.`,
          );
        }, 1200);
      },
      {
        threshold: [0.4, 0.6, 0.8],
        rootMargin: "0px",
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
      lastSentSectionRef.current = null;
      pendingSectionRef.current = null;
    };
  }, [enabled, pushContextMessage]);
}
