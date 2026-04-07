"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

const COMPARISON_DATA = [
  {
    title: "In-house team",
    description: "Hiring takes time, replacements are slow, and ongoing salaries make in-house design costly, especially when needs fluctuate.",
    platform: false,
    speed: false,
    quality: true,
    support: true,
    cost: false,
  },
  {
    title: "Freelancers",
    description: "Hit or miss. Sourcing and managing talent for every project keeps you chasing consistency, not building your brand.",
    platform: false,
    speed: false,
    quality: true,
    support: true,
    cost: false,
  },
  {
    title: "Agencies",
    description: "Strategic partners, but high-cost retainers, rigid scopes, and slow timelines make them a poor fit for everyday creative needs.",
    platform: false,
    speed: false,
    quality: true,
    support: true,
    cost: false,
  },
  {
    title: "DIY tools",
    description: "Quick to use — but the output is off-brand, inconsistent, and still needs heavy manual effort to finish.",
    platform: true,
    speed: true,
    quality: false,
    support: false,
    cost: false,
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
            <div className="min-w-[900px] grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] bg-white divide-y divide-black/5">
              
              {/* Header Row */}
              <div className="col-span-6 grid grid-cols-subgrid bg-[#111111] text-white rounded-t-[24px]">
                <div className="p-6 md:p-8 flex items-center">
                  <span className="text-[24px] md:text-[32px] font-black uppercase text-brand-gold tracking-tighter">
                    LIONOVART<span className="text-brand-red">.</span>
                  </span>
                </div>
                {["Platform", "Speed", "Quality", "Support", "Cost"].map((label) => (
                  <div key={label} className="p-6 flex items-center justify-center text-[13px] md:text-[15px] font-medium tracking-wide">
                    {label}
                  </div>
                ))}
              </div>

              {/* LIONOVART Highlight Row */}
              <div className="col-span-6 grid grid-cols-subgrid bg-brand-red text-white">
                <div className="p-6 md:p-8 flex items-center border-r border-white/20">
                  <span className="text-[22px] md:text-[28px] font-black uppercase tracking-tighter text-white">
                    LIONOVART
                  </span>
                </div>
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className="p-6 flex items-center justify-center border-r border-white/20 last:border-r-0">
                    <CheckCircle className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
                  </div>
                ))}
              </div>

              {/* Competitor Rows */}
              {COMPARISON_DATA.map((row, idx) => (
                <div key={idx} className="col-span-6 grid grid-cols-subgrid bg-[#FAFAFA] hover:bg-white transition-colors duration-300">
                  <div className="p-6 md:p-8 flex flex-col justify-center border-r border-black/5">
                    <h3 className="text-[18px] md:text-[22px] font-bold text-[#111111] mb-2">
                      {row.title}
                    </h3>
                    <p className="text-[13px] md:text-[14px] text-[#555] leading-[160%]">
                      {row.description}
                    </p>
                  </div>
                  
                  <div className="p-6 flex items-center justify-center border-r border-black/5">
                    {row.platform ? (
                      <CheckCircle className="w-6 h-6 text-[#111]" strokeWidth={1.5} />
                    ) : (
                      <XCircle className="w-6 h-6 text-[#999]" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="p-6 flex items-center justify-center border-r border-black/5">
                    {row.speed ? (
                      <CheckCircle className="w-6 h-6 text-[#111]" strokeWidth={1.5} />
                    ) : (
                      <XCircle className="w-6 h-6 text-[#999]" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="p-6 flex items-center justify-center border-r border-black/5">
                    {row.quality ? (
                      <CheckCircle className="w-6 h-6 text-[#111]" strokeWidth={1.5} />
                    ) : (
                      <XCircle className="w-6 h-6 text-[#999]" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="p-6 flex items-center justify-center border-r border-black/5">
                    {row.support ? (
                      <CheckCircle className="w-6 h-6 text-[#111]" strokeWidth={1.5} />
                    ) : (
                      <XCircle className="w-6 h-6 text-[#999]" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="p-6 flex items-center justify-center">
                    {row.cost ? (
                      <CheckCircle className="w-6 h-6 text-[#111]" strokeWidth={1.5} />
                    ) : (
                      <XCircle className="w-6 h-6 text-[#999]" strokeWidth={1.5} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
