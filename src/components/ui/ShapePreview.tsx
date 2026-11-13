"use client";

import { useEffect, useSyncExternalStore } from "react";
import { polygonClip, polygonRim, previewShape, SHAPE_PREVIEW_EVENT, SHAPE_SELECTION_EVENT } from "@/lib/shape-preview";
import "./shape-preview.css";

const subscribe = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  window.addEventListener(SHAPE_SELECTION_EVENT, notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener(SHAPE_SELECTION_EVENT, notify);
  };
};
const readShape = () => previewShape(new URLSearchParams(window.location.search).get("shape")) ?? "original";
const serverShape = () => "original" as const;

export function usePreviewShape() {
  return useSyncExternalStore(subscribe, readShape, serverShape);
}

export default function ShapePreview() {
  const shape = usePreviewShape();
  const hexagon = shape !== "original";

  useEffect(() => {
    if (!hexagon) return;
    const root = document.documentElement;
    root.dataset.shapePreview = "hexagon";
    root.style.setProperty("--preview-polygon", polygonClip(6));
    root.style.setProperty("--preview-edge", polygonRim(6, 48.5));
    root.style.setProperty("--preview-bevel", polygonRim(6, 44));
    window.dispatchEvent(new Event(SHAPE_PREVIEW_EVENT));
    return () => {
      delete root.dataset.shapePreview;
      root.style.removeProperty("--preview-polygon");
      root.style.removeProperty("--preview-edge");
      root.style.removeProperty("--preview-bevel");
      window.dispatchEvent(new Event(SHAPE_PREVIEW_EVENT));
    };
  }, [hexagon]);

  return null;
}
