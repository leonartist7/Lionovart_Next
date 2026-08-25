"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

type FeatureKey =
  | "speed"
  | "flexibility"
  | "quality"
  | "scalability"
  | "efficiency"
  | "print"
  | "support";

// Row order matches t.comparison.columns
const FEATURE_KEYS: FeatureKey[] = [
  "speed",
  "flexibility",
  "quality",
  "scalability",
  "efficiency",
  "print",
  "support",
];

// Boolean fields stay static, only text is translated. One entry per competitor column.
const COMPARISON_BOOLEANS: Record<FeatureKey, boolean>[] = [
  { speed: false, flexibility: true,  quality: true,  scalability: false, efficiency: false, print: false, support: true  },
  { speed: false, flexibility: false, quality: true,  scalability: false, efficiency: false, print: true,  support: true  },
  { speed: false, flexibility: true,  quality: false, scalability: false, efficiency: false, print: false, support: true  },
  { speed: true,  flexibility: false, quality: false, scalability: true,  efficiency: true,  print: false, support: false },
];

const CELL_TEXT = "text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] leading-[1.35]";
const ICON = "w-4 h-4 lg:w-5 lg:h-5 shrink-0";

export default function Comparison(props: any) {
  const { t } = useLanguage();

  const competitors: { title: string; description?: string; cells?: string[] }[] =
    props.competitors || t.comparison.competitors;

  return (
    <section className="bg-bg-surface-light py-[100px] md:py-[140px] px-4 md:px-8">
      <div className="max-w-[1200px] lg:max-w-[1400px] mx-auto">
        <motion.div
          className="rounded-[24px] overflow-hidden bg-bg-surface-light shadow-[8px_8px_24px_rgba(0,0,0,0.12),-8px_-8px_24px_rgba(255,255,255,0.9)] border border-black/5"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full overflow-x-auto">
            <div className="w-full min-w-[900px] lg:min-w-[1120px] grid grid-cols-[minmax(0,0.9fr)_repeat(5,minmax(0,1fr))] bg-white">

              {/* Header Row: alternatives across the top */}
              <div className="col-span-6 grid grid-cols-subgrid">
                <div className="bg-[#000000] text-white px-4 py-5 lg:px-6 lg:py-7 flex items-center">
                  <span className="text-[14px] sm:text-[16px] md:text-[18px] lg:text-[22px] font-black uppercase tracking-tighter">
                    {t.comparison.featuresLabel}
                  </span>
                </div>

                <div className="bg-brand-red px-2 py-5 lg:py-7 flex items-center justify-center">
                  <Image
                    src="/images/LOGO.svg"
                    alt="Lionovart logo"
                    width={480}
                    height={77}
                    className="h-auto w-[clamp(5rem,10vw,10rem)] max-w-full object-contain filter drop-shadow-md brightness-150"
                  />
                </div>

                {competitors.map((c) => (
                  <div
                    key={c.title}
                    className="bg-[#000000] text-white px-3 py-5 lg:px-4 lg:py-7 flex items-center justify-center text-center border-l border-white/10"
                  >
                    <span className="text-[13px] sm:text-[15px] md:text-[16px] lg:text-[20px] font-black uppercase tracking-tighter leading-[1.2]">
                      {c.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Feature Rows: what you need, down the left */}
              {t.comparison.columns.map((label, rowIdx) => {
                const key = FEATURE_KEYS[rowIdx];
                const zebra = rowIdx % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white";

                return (
                  <div key={label} className="col-span-6 grid grid-cols-subgrid">
                    <div className={`${zebra} px-4 py-4 lg:px-6 lg:py-5 flex items-center border-t border-black/5`}>
                      <h3 className="text-[14px] sm:text-[16px] md:text-[17px] lg:text-[19px] font-bold text-[#111111]">
                        {label}
                      </h3>
                    </div>

                    <div className="bg-brand-red text-white px-3 py-4 lg:px-4 lg:py-5 flex items-center gap-2 lg:gap-2.5">
                      <CheckCircle className={ICON} strokeWidth={1.75} />
                      <span className={`${CELL_TEXT} font-semibold`}>
                        {t.comparison.lionovart[rowIdx]}
                      </span>
                    </div>

                    {competitors.map((c, i) => {
                      const isTrue = COMPARISON_BOOLEANS[i]?.[key];

                      return (
                        <div
                          key={c.title}
                          className={`${zebra} px-3 py-4 lg:px-4 lg:py-5 flex items-center gap-2 lg:gap-2.5 border-t border-l border-black/5`}
                        >
                          {isTrue ? (
                            <CheckCircle className={`${ICON} text-[#111]`} strokeWidth={1.75} />
                          ) : (
                            <XCircle className={`${ICON} text-[#C4C4C4]`} strokeWidth={1.75} />
                          )}
                          <span className={`${CELL_TEXT} ${isTrue ? "text-[#333]" : "text-[#888]"}`}>
                            {c.cells?.[rowIdx]}
                          </span>
                        </div>
                      );
                    })}
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
