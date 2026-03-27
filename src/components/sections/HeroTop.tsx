"use client";

import { motion } from "framer-motion";

const AVATARS = [
  { flag: "🇺🇸", bg: "bg-[#1a1a2e]" },
  { flag: "🇬🇧", bg: "bg-[#1a2e1a]" },
  { flag: "🇨🇦", bg: "bg-[#2e1a1a]" },
  { flag: "🇦🇺", bg: "bg-[#1a2e2e]" },
  { flag: "🇩🇪", bg: "bg-[#2e2e1a]" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HeroTop() {
  return (
    <section className="relative flex min-h-[50vh] flex-col items-center justify-center px-4 pt-24 md:min-h-[60vh] md:px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-8 text-center"
      >
        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="max-w-[900px] text-[2.2rem] font-medium uppercase leading-none tracking-tight text-text-main sm:text-[2.5rem] md:text-[3rem]"
        >
          We build premium brands{" "}
          <span className="text-text-muted">that demand attention</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="max-w-[600px] text-[16px] leading-[160%] text-text-muted md:text-[20px] md:leading-[132%]"
        >
          Award-winning creative agency delivering world-class branding, web
          design, and video production for ambitious businesses.
        </motion.p>

        {/* Avatar Row + Globe */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4"
        >
          {/* Overlapping Avatars */}
          <div className="flex -space-x-3">
            {AVATARS.map((avatar, i) => (
              <div
                key={i}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-bg-dark text-lg ${avatar.bg} md:h-12 md:w-12`}
              >
                {avatar.flag}
              </div>
            ))}
          </div>

          {/* Globe */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border-dark bg-white/5 text-xl backdrop-blur-sm md:h-12 md:w-12">
            🌍
          </div>

          {/* Label */}
          <span className="text-sm font-medium text-text-muted">
            Serving clients globally
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
