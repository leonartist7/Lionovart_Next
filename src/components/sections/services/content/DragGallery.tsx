"use client";

/**
 * White "studio wall" for /services/content-studio. A draggable media wall:
 * an oversized grid of work tiles the visitor pans around like a lightbox
 * table. Museum-white ground mid-page breaks the dark tunnel and lets the
 * media carry the color. Touch + mouse drag via framer-motion.
 *
 * Tiles are picsum placeholders (repo convention) until real work lands.
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// 18 tiles, 6 columns x 3 rows. Mixed heights give the wall an editorial rhythm.
const COLS = 6;
const TILE_W = 280;
const GAP = 20;
const HEIGHTS = [350, 410, 320, 380, 340, 430];

const TILES = Array.from({ length: 18 }, (_, i) => ({
  id: `wall-${i}`,
  src: `https://picsum.photos/seed/lion-wall-${i}/560/${HEIGHTS[i % HEIGHTS.length]}`,
  h: HEIGHTS[i % HEIGHTS.length],
}));

export default function DragGallery() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  // Wall size: columns of stacked tiles. Height approximated from tallest column.
  const wallW = COLS * (TILE_W + GAP) + GAP;
  const rows = Math.ceil(TILES.length / COLS);
  const wallH = rows * (Math.max(...HEIGHTS) + GAP) + GAP;

  useEffect(() => {
    const measure = () => {
      const el = viewportRef.current;
      if (!el) return;
      setBounds({
        x: Math.max(0, wallW - el.clientWidth),
        y: Math.max(0, wallH - el.clientHeight),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [wallW, wallH]);

  return (
    <section className="bg-bg-off-white py-24 md:py-32">
      <div className="mx-auto mb-12 max-w-[1400px] px-6 md:mb-16 md:px-10">
        <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-black/45">The wall</p>
        <h2
          className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-[#111]"
          style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
        >
          Have a look <span className="text-brand-red">around.</span>
        </h2>
        <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-black/55">
          Films, reels, posts, and frames from the studio. Grab the wall and drag.
        </p>
      </div>

      <div
        ref={viewportRef}
        className="relative mx-auto h-[70vh] max-w-[1400px] overflow-hidden rounded-[24px] md:rounded-[32px] border border-black/[0.07] bg-white shadow-[inset_0_2px_24px_rgba(0,0,0,0.05)]"
      >
        <motion.div
          drag
          dragConstraints={{ left: -bounds.x, right: 0, top: -bounds.y, bottom: 0 }}
          dragElastic={0.08}
          dragMomentum
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
          className={`absolute left-0 top-0 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{ width: wallW, height: wallH, padding: GAP }}
        >
          <div className="flex gap-5">
            {Array.from({ length: COLS }, (_, c) => (
              <div key={c} className="flex w-[280px] shrink-0 flex-col gap-5">
                {TILES.filter((_, i) => i % COLS === c).map((t) => (
                  <div
                    key={t.id}
                    className="overflow-hidden rounded-xl bg-black/5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]"
                    style={{ height: t.h }}
                  >
                    <img
                      src={t.src}
                      alt=""
                      draggable={false}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Drag hint */}
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
          Drag to explore
        </div>
      </div>
    </section>
  );
}
