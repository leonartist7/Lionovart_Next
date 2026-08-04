"use client";

import { motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLandingFlow } from "@/contexts/LandingFlowContext";

// Boolean fields stay static â€” only text is translated
const COMPARISON_BOOLEANS = [
  { speed: false, flexibility: true,  quality: true,  scalability: false, efficiency: false, support: true  },
  { speed: false, flexibility: false, quality: true,  scalability: false, efficiency: false, support: true  },
  { speed: false, flexibility: true,  quality: false, scalability: false, efficiency: false, support: true  },
  { speed: true,  flexibility: false, quality: false, scalability: true,  efficiency: true, support: false },
];

export default function Comparison(props: any) {
  const flow = useLandingFlow();
  const { t } = useLanguage();


  const COMPARISON_DATA = (props.competitors || t.comparison.competitors).map((c: any, i: number) => ({
    title: c.title,
    description: (c as { title: string; description?: string }).description ?? "",
    ...COMPARISON_BOOLEANS[i],
  }));

  type ComparisonRow = {
    title: string;
    description: string;
    speed: boolean;
    flexibility: boolean;
    quality: boolean;
    scalability: boolean;
    efficiency: boolean;
    support: boolean;
  };

  return (
    <section className="bg-bg-surface-light py-[100px] md:py-[140px] px-4 md:px-8">
      <div className={`max-w-[1200px] lg:max-w-[1400px] mx-auto ${flow === "inverse" ? "flex flex-col-reverse" : ""}`}>
heading block        <motion.div
          className="rounded-[24px] overflow-hidden bg-bg-surface-light shadow-[8px_8px_24px_rgba(0,0,0,0.12),-8px_-8px_24px_rgba(255,255,255,0.9)] border border-black/5"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full overflow-x-auto">
            <div className="w-full min-w-[560px] lg:min-w-[1000px] grid grid-cols-[minmax(0,1fr)_repeat(6,max-content)] bg-white divide-y divide-black/5">

              {/* Header Row */}
              <div className="col-span-7 grid grid-cols-subgrid bg-[#000000] text-white rounded-t-[24px]">
                <div className="p-2 md:p-4 lg:p-6 flex items-center justify-center">
                  <img
                    src="https://res.cloudinary.com/dgio9uutc/image/upload/v1775553451//images/LOGO.svg"
                    alt="Lionovart logo"
                    className="h-auto w-[clamp(7.5rem,16vw,15rem)] max-w-full object-contain filter drop-shadow-md brightness-150"
                  />
                </div>
                {t.comparison.columns.map((label) => (
                  <div key={label} className="px-[2px] py-2 sm:py-2 md:py-3 lg:py-4 flex items-center justify-center text-[12px] sm:text-[14px] md:text-[15px] lg:text-[18px] font-semibold tracking-wide text-center">
                    {label}
                  </div>
                ))}
              </div>

              {/* LIONOVART Highlight Row */}
              <div className="col-span-8 grid grid-cols-subgrid bg-brand-red text-white">
                <div className="px-3 py-3 md:px-5 lg:p-6 flex flex-col justify-center border-r border-white/20">
                  <span className="text-[15px] sm:text-[18px] md:text-[22px] lg:text-[32px] font-black uppercase tracking-tighter text-white">
                    LIONOVART
                  </span>
                </div>
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="p-0.5 sm:p-1 lg:p-1.5 flex items-center justify-center border-r border-white/20 last:border-r-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" strokeWidth={1.5} />
                  </div>
                ))}
              </div>

              {/* Competitor Rows */}
              {COMPARISON_DATA.map((row: ComparisonRow, idx: number) => {
                const fields = [
                  row.speed,
                  row.flexibility,
                  row.quality,
                  row.scalability,
                  row.efficiency,
                  row.support
                ];

                return (
                  <div key={idx} className="col-span-8 grid grid-cols-subgrid bg-[#FAFAFA] hover:bg-white transition-colors duration-300">
                    <div className="px-3 py-4 md:px-5 lg:p-6 flex flex-col justify-center border-r border-black/5">
                      <h3 className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[24px] font-bold text-[#111111]">
                        {row.title}
                      </h3>
                      {row.description && (
                        <p className="hidden xl:block text-[14px] text-[#666] leading-[1.5] mt-1.5 max-w-[95%]">
                          {row.description}
                        </p>
                      )}
                    </div>

                    {fields.map((isTrue, i) => (
                      <div key={i} className="p-0.5 sm:p-1 lg:p-1.5 flex items-center justify-center border-r border-black/5 last:border-r-0">
                        {isTrue ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#111]" strokeWidth={1.5} />
                        ) : (
                          <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-[#999]" strokeWidth={1.5} />
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
