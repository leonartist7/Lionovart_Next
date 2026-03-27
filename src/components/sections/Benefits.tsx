"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const BENEFITS = [
  {
    icon: "⏱",
    title: "Free Time",
    description:
      "We handle your entire digital presence so you can focus on what you do best — running your business.",
  },
  {
    icon: "🏆",
    title: "Brand Success",
    description:
      "A premium brand identity that commands respect, builds trust, and consistently converts strangers into clients.",
  },
  {
    icon: "🤝",
    title: "Trusted Reputation",
    description:
      "Your brand will communicate authority and credibility before you ever say a word.",
  },
  {
    icon: "📈",
    title: "More Sales",
    description:
      "Strategic design and messaging that moves people through your funnel and turns attention into revenue.",
  },
];

export default function Benefits() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-bg-dark py-[80px] md:py-[180px]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-16 text-center text-[2rem] font-bold uppercase leading-none tracking-tight text-text-main sm:text-[2.5rem] md:text-[3.5rem]"
        >
          What Happens When You{" "}
          <span className="text-brand-red">Work With Us</span>
        </motion.h2>

        {/* 2×2 Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {BENEFITS.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: 0.1 + i * 0.1,
              }}
              className="group rounded-[20px] border border-[#f0c917]/15 bg-[#f0c917]/10 p-8 transition-all duration-300 hover:scale-[1.02] hover:border-[#f0c917]/30 hover:bg-[#f0c917]/15 md:p-10"
            >
              {/* Icon */}
              <div className="mb-5 text-4xl">{benefit.icon}</div>

              {/* Title */}
              <h3 className="mb-3 text-[22px] font-bold uppercase tracking-tight text-brand-gold md:text-[26px]">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-[15px] leading-[160%] text-text-muted md:text-[16px]">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
