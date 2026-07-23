"use client";

import { useCallback, useEffect } from "react";
import { useHeroImageStore } from "@/lib/stores/hero-image-store";

/**
 * Drag-to-set focal point overlay for the hero background.
 * Rendered inside HeroRevealWrapper when pickerActive === true.
 * Pointer capture ensures dragging outside the div still registers.
 */
export function HeroFocalPicker() {
  const { images, currentIndex, positions, setPosition, togglePicker } =
    useHeroImageStore();

  const current = images[currentIndex];
  const pos = current ? (positions[current.id] ?? { x: 50, y: 70 }) : { x: 50, y: 70 };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") togglePicker();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePicker]);

  const handlePointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      if (current) setPosition(current.id, x, y);
    },
    [current, setPosition]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointer(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return; // only while pressed
    handlePointer(e);
  };

  return (
    <div
      className="absolute inset-0 z-[10] cursor-crosshair select-none"
      style={{ pointerEvents: "auto" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      {/* Subtle grid overlay so the user has spatial reference */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "10% 10%",
        }}
      />

      {/* Focal point dot */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Outer ring */}
        <div className="w-8 h-8 rounded-full border-2 border-white/80 shadow-lg flex items-center justify-center">
          {/* Inner dot */}
          <div className="w-2 h-2 rounded-full bg-brand-red shadow" />
        </div>
        {/* Crosshair lines */}
        <div className="absolute left-1/2 top-0 w-px h-full -translate-x-1/2 bg-white/40 pointer-events-none" style={{ height: "200px", top: "-100px" }} />
        <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/40 pointer-events-none" style={{ width: "200px", left: "-100px" }} />
      </div>

      {/* HUD — top-left readout + instructions */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-xs font-mono flex items-center gap-3">
          <span className="text-white/50">focal</span>
          <span className="tabular-nums text-white">
            {pos.x}% <span className="text-white/40 mx-0.5">/</span> {pos.y}%
          </span>
          <span className="text-white/30">·</span>
          <span className="text-white/50">click or drag to reposition</span>
          <span className="text-white/30">·</span>
          <span className="text-white/50">Esc to close</span>
        </div>
      </div>

      {/* Close button — bottom-center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ pointerEvents: "auto" }}>
        <button
          onClick={(e) => { e.stopPropagation(); togglePicker(); }}
          className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-white text-xs font-semibold hover:bg-black/80 transition-colors"
        >
          Done — save position
        </button>
      </div>
    </div>
  );
}
