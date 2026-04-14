"use client";

import { useEffect, useRef } from "react";
import { useVisualEditor } from "@/lib/visual-editor-context";

/** Tags to skip — we don't want to select these */
const SKIP_TAGS = new Set([
  "HTML", "BODY", "HEAD", "SCRIPT", "STYLE", "NOSCRIPT",
  "META", "LINK", "TITLE", "SVG", "PATH", "DEFS",
]);

/** Skip elements that belong to the visual editor UI itself */
function isEditorElement(el: HTMLElement): boolean {
  return !!(
    el.closest("[data-visual-editor]") ||
    el.id?.startsWith("ve-") ||
    el.dataset.veSkip
  );
}

export function VisualEditorOverlay() {
  const { isInspecting, selectElement } = useVisualEditor();
  const hoverElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isInspecting) {
      // Clean up any stale outlines when inspector is turned off
      document.querySelectorAll("[data-ve-hover]").forEach((el) => {
        const h = el as HTMLElement;
        h.removeAttribute("data-ve-hover");
        h.style.outline = "";
        h.style.outlineOffset = "";
      });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (
        !target ||
        SKIP_TAGS.has(target.tagName) ||
        isEditorElement(target) ||
        target === hoverElRef.current
      ) return;

      // Remove previous hover
      if (hoverElRef.current && hoverElRef.current !== target) {
        const prev = hoverElRef.current;
        // Only remove if not selected
        if (!prev.hasAttribute("data-ve-selected")) {
          prev.removeAttribute("data-ve-hover");
          prev.style.outline = "";
          prev.style.outlineOffset = "";
        }
      }

      // Apply hover highlight
      target.setAttribute("data-ve-hover", "true");
      target.style.outline = "1px dashed rgba(239,68,68,0.6)";
      target.style.outlineOffset = "1px";
      hoverElRef.current = target;
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target || SKIP_TAGS.has(target.tagName) || isEditorElement(target)) return;

      // Prevent the click from doing its default action
      e.preventDefault();
      e.stopPropagation();

      selectElement(target);
    };

    // Use capture phase so we intercept before React's handlers
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick, { capture: true });

      // Clean up all hover outlines
      document.querySelectorAll("[data-ve-hover]").forEach((el) => {
        const h = el as HTMLElement;
        h.removeAttribute("data-ve-hover");
        h.style.outline = "";
        h.style.outlineOffset = "";
      });
    };
  }, [isInspecting, selectElement]);

  return null; // No DOM output needed — this is pure behavior
}
