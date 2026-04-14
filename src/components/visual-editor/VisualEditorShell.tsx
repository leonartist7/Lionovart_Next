"use client";

import { useEffect } from "react";
import { useVisualEditor } from "@/lib/visual-editor-context";
import { InspectorPanel } from "./InspectorPanel";
import { LayersPanel } from "./LayersPanel";

/* ── Responsive viewport widths ─────────────────────────────── */
const VIEWPORT_WIDTHS = {
  base: "100%",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

/* ── Top toolbar ─────────────────────────────────────────────── */
function Toolbar() {
  const {
    isInspecting,
    setIsInspecting,
    showLayers,
    setShowLayers,
    activeBreakpoint,
    setActiveBreakpoint,
  } = useVisualEditor();

  return (
    <div className="fixed top-0 left-0 right-0 z-[9997] h-10 bg-[#111] border-b border-[#2a2a2a] flex items-center px-4 gap-3 select-none">
      {/* Brand */}
      <span className="text-[11px] font-bold text-[#ef4444] uppercase tracking-widest shrink-0">
        🎨 VE
      </span>

      <div className="h-4 w-px bg-[#2a2a2a]" />

      {/* Inspector toggle */}
      <button
        onClick={() => setIsInspecting(!isInspecting)}
        className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded transition-all ${
          isInspecting
            ? "bg-[#ef4444] text-white"
            : "bg-[#222] text-[#888] hover:text-white hover:bg-[#2a2a2a]"
        }`}
      >
        <span>{isInspecting ? "◉" : "○"}</span>
        {isInspecting ? "Inspecting…" : "Inspect"}
      </button>

      {/* Layers toggle */}
      <button
        onClick={() => setShowLayers(!showLayers)}
        className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded transition-all ${
          showLayers
            ? "bg-[#222] text-white border border-[#444]"
            : "bg-[#222] text-[#888] hover:text-white hover:bg-[#2a2a2a]"
        }`}
      >
        ≡ Layers
      </button>

      <div className="h-4 w-px bg-[#2a2a2a]" />

      {/* Responsive viewport */}
      <div className="flex items-center gap-1">
        {(
          [
            { label: "🖥", value: "base", title: "Desktop (full width)" },
            { label: "💻", value: "lg", title: "Laptop (1024px)" },
            { label: "📱", value: "md", title: "Tablet (768px)" },
            { label: "📲", value: "sm", title: "Mobile (640px)" },
          ] as const
        ).map((item) => (
          <button
            key={item.value}
            onClick={() => setActiveBreakpoint(item.value)}
            title={item.title}
            className={`text-[14px] px-2 py-0.5 rounded transition-all ${
              activeBreakpoint === item.value
                ? "bg-[#ef4444]/20 text-[#ef4444]"
                : "text-[#555] hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeBreakpoint !== "base" && (
        <span className="text-[10px] text-[#ef4444] font-mono">
          {VIEWPORT_WIDTHS[activeBreakpoint]}
        </span>
      )}

      <div className="ml-auto text-[10px] text-[#444]">
        Cmd+Shift+I to toggle
      </div>
    </div>
  );
}

/* ── Main shell ──────────────────────────────────────────────── */
export function VisualEditorShell() {
  const { isInspecting, showLayers, activeBreakpoint } = useVisualEditor();

  // Simulate responsive breakpoints by restricting body max-width
  useEffect(() => {
    const wrapper = document.getElementById("__next") || document.querySelector("main");
    if (!wrapper) return;

    if (activeBreakpoint === "base") {
      wrapper.style.maxWidth = "";
      wrapper.style.margin = "";
    } else {
      wrapper.style.maxWidth = VIEWPORT_WIDTHS[activeBreakpoint];
      wrapper.style.margin = "0 auto";
    }
  }, [activeBreakpoint]);

  // Push page down when toolbar is visible
  useEffect(() => {
    const body = document.body;
    body.style.paddingTop = isInspecting ? "40px" : "";
    return () => {
      body.style.paddingTop = "";
    };
  }, [isInspecting]);

  if (!isInspecting) return null;

  return (
    <>
      {/* Top toolbar */}
      <Toolbar />

      {/* Layers panel — left side */}
      {showLayers && (
        <div className="fixed left-0 top-10 bottom-0 z-[9996] w-56 bg-[#111] border-r border-[#2a2a2a] overflow-hidden">
          <LayersPanel />
        </div>
      )}

      {/* Inspector panel — right side */}
      <div
        className={`fixed right-0 top-10 bottom-0 z-[9996] w-72 bg-[#111] border-l border-[#2a2a2a] overflow-hidden flex flex-col`}
      >
        <InspectorPanel />
      </div>

      {/* Status badge */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9995] bg-[#111] border border-[#2a2a2a] text-[#ef4444] text-[11px] font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-xl select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
        Inspector Active — hover to highlight · click to select
      </div>
    </>
  );
}
