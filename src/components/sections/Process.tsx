"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const STEPS = [
  {
    num: "01",
    title: "Discovery & Strategy",
    description: "We learn your business, your audience, and your standards. We ask the questions most agencies skip — because the best creative work starts with clarity, not assumptions.",
  },
  {
    num: "02",
    title: "Creative Concepts",
    description: "We develop two to three creative directions and refine with you until the visual language feels unmistakably yours. No surprises. No wasted revisions.",
  },
  {
    num: "03",
    title: "Build & Refine",
    description: "We bring the concepts to life — websites, video, social, print — all built to the same standard and reviewed with you at every stage.",
  },
  {
    num: "04",
    title: "Launch & Scale",
    description: "Your brand goes live. We don't just hand over the keys — we set up the systems, track the results, and stay available for what comes next. For ongoing partnerships, this is where growth begins.",
  },
];

export default function Process() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="process" className="bg-bg-brand-black py-[90px] lg:py-[180px]">
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Header */}
        <div className="mb-16 md:mb-24 text-center">
          <motion.p
            className="text-brand-red text-[13px] font-semibold uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            Our Approach
          </motion.p>
          <motion.h2
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] font-bold uppercase leading-none tracking-tight text-text-main"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            How We <span className="text-brand-red">Work</span>
          </motion.h2>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Vertical Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-border-dark -translate-x-1/2" />

          <div className="space-y-12 md:space-y-0 relative">
            {STEPS.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <div key={step.num} className="relative flex flex-col md:flex-row items-center w-full">
                  
                  {/* Timeline Dot (Desktop) */}
                  <motion.div
                    className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-red items-center justify-center z-10 border-4 border-bg-brand-black"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.2 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </motion.div>

                  {/* Content Box */}
                  <motion.div
                    className={`w-full md:w-1/2 flex ${isEven ? 'md:pr-16 md:justify-end' : 'md:pl-16 md:justify-start md:ml-auto'}`}
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: "easeOut" }}
                  >
                    <div className="bg-[#161616] border border-border-dark p-8 md:p-10 rounded-[20px] w-full max-w-[500px] hover:bg-white/5 transition-colors duration-300">
                      <span className="text-brand-red text-[40px] font-bold leading-none mb-4 block font-clash">
                        {step.num}
                      </span>
                      <h3 className="text-text-main text-[22px] md:text-[26px] font-bold uppercase tracking-tight mb-3">
                        {step.title}
                      </h3>
                      <p className="text-text-muted text-[15px] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
