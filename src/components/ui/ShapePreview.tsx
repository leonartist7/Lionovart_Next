"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { polygonClip, polygonRim, polygonVertices, PREVIEW_SHAPES, previewShape, SHAPE_PREVIEW_EVENT, type PreviewShape } from "@/lib/shape-preview";
import "./shape-preview.css";

const options = [
  { value: "original", en: "Original", fr: "Original" },
  { value: "pentagon", en: "Pentagon", fr: "Pentagone" },
  { value: "hexagon", en: "Hexagon", fr: "Hexagone" },
  { value: "heptagon", en: "Heptagon", fr: "Heptagone" },
] as const;

const subscribe = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  window.addEventListener(SHAPE_PREVIEW_EVENT, notify);
  return () => {
    window.removeEventListener("popstate", notify);
    window.removeEventListener(SHAPE_PREVIEW_EVENT, notify);
  };
};
const readShape = () => previewShape(new URLSearchParams(window.location.search).get("shape"));
const serverShape = () => null;

function selectShape(shape: PreviewShape) {
  const url = new URL(window.location.href);
  url.searchParams.set("shape", shape);
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(SHAPE_PREVIEW_EVENT));
}

export default function ShapePreview() {
  const shape = useSyncExternalStore(subscribe, readShape, serverShape);
  const { locale } = useLanguage();
  const fr = locale === "fr";

  useEffect(() => {
    const root = document.documentElement;
    const sides = shape ? PREVIEW_SHAPES[shape] : 0;
    if (sides && shape) {
      root.dataset.shapePreview = shape;
      root.style.setProperty("--preview-polygon", polygonClip(sides));
      root.style.setProperty("--preview-edge", polygonRim(sides, 48.5));
      root.style.setProperty("--preview-bevel", polygonRim(sides, 44));
      window.dispatchEvent(new Event(SHAPE_PREVIEW_EVENT));
    }
    return () => {
      if (!sides) return;
      delete root.dataset.shapePreview;
      root.style.removeProperty("--preview-polygon");
      root.style.removeProperty("--preview-edge");
      root.style.removeProperty("--preview-bevel");
      window.dispatchEvent(new Event(SHAPE_PREVIEW_EVENT));
    };
  }, [shape]);

  if (!shape) return null;
  return (
    <div className="shape-preview-controls" data-shape-preview-controls role="group" aria-label={fr ? "Comparer les formes" : "Compare shapes"}>
      {options.map(option => {
        const sides = PREVIEW_SHAPES[option.value];
        return (
          <button key={option.value} type="button" aria-pressed={shape === option.value}
            data-preview-option={option.value} onClick={() => selectShape(option.value)}>
            <svg viewBox="0 0 100 100" aria-hidden="true">
              {sides ? <polygon points={polygonVertices(sides, 40).map(point => point.join(",")).join(" ")} />
                : <circle cx="50" cy="50" r="40" />}
            </svg>
            {fr ? option.fr : option.en}
          </button>
        );
      })}
    </div>
  );
}
