"use client";

import { motion } from "framer-motion";

const ITEMS = Array(20).fill("LIONOVART®");
const TRACK = [...ITEMS, ...ITEMS]; // duplicate for seamless loop

export default function StickyFooterMarquee() {
  return (
    <div className="sticky bottom-0 z-0 w-full overflow-hidden bg-brand-red py-6 pointer-events-none">
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={{ x: ["-50%", "0%"] }}
        transition={{ duration: 800, ease: "linear", repeat: Infinity }}
      >
        {TRACK.map((text, i) => (
          <span
            key={i}
            className="px-6 text-[3.5rem] sm:text-[6rem] md:text-[9rem] font-bold uppercase font-clash text-white select-none"
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
