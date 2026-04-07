"use client";

import { motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

const COMPARISON_DATA = [
  {
    title: "In-house team",
    description: "In-house teams don't always have the skill mix or bandwidth to handle every request that the business needs.",
    speed: false,
    flexibility: true,
    quality: true,
    scalability: false,
    efficiency: false,
    aiAndStrategy: false,
    support: true,
  },
  {
    title: "Creative agencies",
    description: "Traditional agencies can be slow, costly, and built around rigid processes that make it difficult to adapt.",
    speed: false,
    flexibility: false,
    quality: true,
    scalability: false,
    efficiency: false,
    aiAndStrategy: false,
    support: true,
  },
  {
    title: "Freelancers",
    description: "Freelancers can be unreliable and hard to scale, leading to inconsistent work and questionable quality.",
    speed: false,
    flexibility: true,
    quality: false,
    scalability: false,
    efficiency: false,
    aiAndStrategy: false,
    support: true,
  },
  {
    title: "AI tools only",
    description: "AI tools can increase speed and efficiency, but without human judgment and brand context, they fall short on quality and strategy.",
    speed: true,
    flexibility: false,
    quality: false,
    scalability: true,
    efficiency: true,
    aiAndStrategy: false,
    support: false,
  }
];

export default function Comparison() {
  return (
    <section className="bg-[#F5F0EB] py-[100px] md:py-[140px] px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12 md:mb-20 flex flex-col items-center text-center">
          <motion.p
            className="text-brand-red text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            The Better Way
          </motion.p>
          <motion.h2
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#111111] max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Why <span className="text-brand-red">Lionovart</span>?
          </motion.h2>
        </div>

        <motion.div
          className="rounded-[24px] overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-black/5"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full overflow-x-auto">
            <div className="w-full min-w-[500px] lg:min-w-[1000px] grid grid-cols-[1.2fr_repeat(7,1fr)] lg:grid-cols-[1.8fr_repeat(7,1fr)] bg-white divide-y divide-black/5">
              
              {/* Header Row */}
              <div className="col-span-8 grid grid-cols-subgrid bg-[#111111] text-white rounded-t-[24px]">
                <div className="p-3 lg:p-8 flex items-center justify-center lg:justify-start">
                  <img 
                    src="https://i.imgur.com/2PGbCnR.png" 
                    alt="Lionovart logo" 
                    className="max-h-[28px] lg:max-h-[48px] w-auto object-contain filter drop-shadow-md brightness-150" 
                  />
                </div>
                {["Speed", "Flexibility", "Quality", "Scalability", "Efficiency", "Digital & Printing", "Support"].map((label) => (
                  <div key={label} className="p-2 lg:p-4 flex items-center justify-center text-[9px] sm:text-[10px] lg:text-[14px] font-medium tracking-wide text-center">
                    {label}
                  </div>
                ))}
              </div>

              {/* LIONOVART Highlight Row */}
              <div className="col-span-8 grid grid-cols-subgrid bg-brand-red text-white">
                <div className="p-3 lg:p-8 flex flex-col justify-center border-r border-white/20">
                  <span className="text-[13px] sm:text-[16px] lg:text-[28px] font-black uppercase tracking-tighter text-white">
                    LIONOVART
                  </span>
                  <p className="hidden lg:block text-[13px] text-white/80 leading-[160%] mt-2">
                    All your creative and printing needs with world-class creative talent backed by smart systems built to strengthen every project.
                  </p>
                </div>
                {[1, 2, 3, 4, 5, 6, 7].map((idx) => (
                  <div key={idx} className="p-3 lg:p-6 flex items-center justify-center border-r border-white/20 last:border-r-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" strokeWidth={1.5} />
                  </div>
                ))}
              </div>

              {/* Competitor Rows */}
              {COMPARISON_DATA.map((row, idx) => {
                const fields = [
                  row.speed,
                  row.flexibility,
                  row.quality,
                  row.scalability,
                  row.efficiency,
                  row.aiAndStrategy,
                  row.support
                ];

                return (
                  <div key={idx} className="col-span-8 grid grid-cols-subgrid bg-[#FAFAFA] hover:bg-white transition-colors duration-300">
                    <div className="p-3 lg:p-8 flex flex-col justify-center border-r border-black/5">
                      <h3 className="text-[12px] sm:text-[14px] lg:text-[22px] font-bold text-[#111111] lg:mb-2">
                        {row.title}
                      </h3>
                      <p className="hidden lg:block text-[14px] text-[#555] leading-[160%]">
                        {row.description}
                      </p>
                    </div>
                    
                    {fields.map((isTrue, i) => (
                      <div key={i} className="p-2 sm:p-3 lg:p-6 flex items-center justify-center border-r border-black/5 last:border-r-0">
                        {isTrue ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#111]" strokeWidth={1.5} />
                        ) : (
                          <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#999]" strokeWidth={1.5} />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
