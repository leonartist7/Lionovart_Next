"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

// Static (non-translatable) data — IDs, numbers, media URLs
const SERVICES_STATIC = [
  { id: "branding",      number: "1", media: { url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&q=80", alt: "Branding & Identity" } },
  { id: "web",           number: "2", media: { url: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=900&q=80", alt: "Web & App Development" } },
  { id: "video",         number: "3", media: { url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=900&q=80", alt: "Video Production" } },
  { id: "social",        number: "4", media: { url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=900&q=80", alt: "Social Media & Content" } },
  { id: "print",         number: "5", media: { url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&q=80", alt: "Print & Physical Branding" } },
  { id: "smart-systems", number: "6", media: { url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80", alt: "Smart Systems & AI" } },
  { id: "growth",        number: "7", media: { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80", alt: "Growth Marketing" } },
];

export default function Services() {
  const { t } = useLanguage();
  const lenis = useLenis();

  // Merge static (id/number/media) with translated text (title/description/deliverables)
  const SERVICES = SERVICES_STATIC.map((s, i) => ({
    ...s,
    title: t.services.items[i]?.title ?? "",
    description: t.services.items[i]?.description ?? "",
    deliverables: (t.services.items[i]?.deliverables as readonly string[] | undefined) ?? [],
  }));

  const [activeId, setActiveId] = useState<string>(SERVICES_STATIC[0]?.id ?? "branding");

  return (
    <section
      id="services"
      className="relative bg-[#eceff3] pt-[60px] pb-[60px] md:pt-[80px] md:pb-[80px]"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-8">

        {/* ── Section Header ── */}
        <div className="mb-12 md:mb-20 flex flex-col items-center text-center">
          <motion.p
            className="text-brand-red text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {t.services.eyebrow}
          </motion.p>
          <motion.h2
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#111111] max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t.services.heading} <span className="text-brand-red">{t.services.headingAccent}</span>
          </motion.h2>
        </div>

        {/* ── The Premium Floating Glass Panel ── */}
        <motion.div
          className="relative rounded-[28px] bg-gradient-to-br from-[#e6e9ef] via-[#ffffff] to-[#d5d9e2]"
          style={{ padding: "1px" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >

          {/* Inner glass panel */}
          <div
            className="
              relative
              rounded-[27px]
              border border-white/70
              bg-[#f2f4f7]/95
              shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_2px_8px_rgba(255,255,255,0.4)]
              p-6 md:p-12 lg:p-16
            "
          >
            <div className="flex flex-col w-full">

              {/* ── ALL SERVICES: CLEAN HORIZONTAL ACCORDION ── */}
              <Accordion
                className="flex flex-col gap-6"
                defaultValue={activeId ? [activeId] : []}
                value={activeId ? [activeId] : []}
                onValueChange={(val: any) => setActiveId(Array.isArray(val) ? val[0] : val)}
              >
                {SERVICES.map((service, index) => {
                  const isActive = activeId === service.id;

                  return (
                    <AccordionItem
                      key={service.id}
                      value={service.id}
                      className={`group rounded-[24px] md:rounded-[32px] transition-all duration-400 ease-out border-none px-6 md:px-10
                        hover:bg-[#f2f4f7] hover:shadow-[8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)] hover:border hover:border-white/60
                        ${
                          isActive
                            ? "bg-[#f2f4f7] shadow-[8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)] border border-white/60"
                            : ""
                        }
                      `}
                    >
                      <AccordionTrigger
                        className="flex w-full items-center justify-between py-6 md:py-8 text-left hover:no-underline [&[data-state=open]>div>div>span]:text-[#e5192a]"
                        onClick={(e) => {
                          setActiveId(service.id);
                          const target = e.currentTarget.parentElement;
                          // Smooth scroll into view when opened
                          setTimeout(() => {
                            if (lenis && target) {
                              lenis.scrollTo(target, { offset: -120, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                            } else {
                              if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 300);
                        }}
                      >
                        <div className="flex items-center gap-5 md:gap-8 flex-1">
                          <span className="text-[#e5192a] font-black text-[16px] md:text-[20px] tracking-widest opacity-80 mt-1">
                            {service.number}
                          </span>
                          <span className="text-[#111] font-bold text-[22px] sm:text-[28px] md:text-[36px] uppercase tracking-tight transition-colors leading-none">
                            {service.title}
                          </span>
                        </div>

                      </AccordionTrigger>

                      <AccordionContent className="pb-8 md:pb-12 pt-2">
                        <div className="flex flex-col gap-6 w-full">
                          <p className="text-[#555] text-[15px] md:text-[18px] leading-[1.8] w-full text-left">
                            {service.description}
                          </p>
                          <ul className="flex flex-wrap gap-x-6 gap-y-3 justify-start">
                            {service.deliverables.map((item) => (
                              <li key={item} className="text-[12px] md:text-[13px] font-bold uppercase tracking-wider text-brand-red flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

            </div>
          </div>{/* /inner glass panel */}
        </motion.div>

      </div>
    </section>
  );
}
