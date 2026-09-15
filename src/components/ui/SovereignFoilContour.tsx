"use client";

import { memo } from "react";

export const SovereignFoilContour = memo(function SovereignFoilContour() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px] md:rounded-[24px]"
    >
      <div
        className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,248,196,0.9),inset_0_-1px_0_rgba(113,73,0,0.5)]"
        style={{
          background:
            "linear-gradient(135deg, #765000 0%, #c99808 18%, #f0c917 34%, #fff1a6 48%, #b37e00 68%, #f0c917 84%, #8d6100 100%)",
        }}
      />

      <div className="absolute inset-[clamp(4px,0.6vw,6px)] rounded-[16px] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(112,74,0,0.12)] md:rounded-[18px]" />
    </div>
  );
});

