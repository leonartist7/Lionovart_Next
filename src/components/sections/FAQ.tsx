"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

export default function FAQ(props: any) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.faq.eyebrow;

  const faqItems = props.items || t.faq.items;

  const FAQS = faqItems.map((item: any, i: number) => ({
    id: item._key ?? `faq-${i + 1}`,
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section ref={ref} id="faq" className="bg-bg-brand-black py-[90px] lg:py-[180px]">
      <div className="mx-auto max-w-[1000px] px-4">
        {/* Header */}
        <div className="mb-16 md:mb-20 text-center md:text-left">
          <motion.p
            className="text-brand-red text-[13px] font-semibold uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            {eyebrow}
          </motion.p>
          <SplitTextReveal
            as="h2"
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[6rem] font-bold uppercase leading-none tracking-tight text-text-main"
            step={18}
            delay={120}
            from="center"
          >
            FAQ
          </SplitTextReveal>
        </div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mx-auto max-w-[800px]"
        >
          <Accordion className="flex flex-col gap-4">
            {FAQS.map((faq: { id: string; question: string; answer: string }) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="bg-[#000000] rounded-[20px] px-6 py-2 overflow-hidden shadow-[8px_8px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.03)] ring-1 ring-white/[0.02] data-[state=open]:ring-brand-red/30 transition-all duration-300"
                title={""}
              >
                <AccordionTrigger className="text-left text-[18px] md:text-[20px] font-bold text-text-main uppercase tracking-tight hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-text-muted pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
