"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

type FAQItem = {
  _key?: string;
  question: string;
  answer: string;
};

type FAQProps = {
  eyebrow?: string;
  items?: FAQItem[];
};

export default function FAQ(props: FAQProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();
  const { t } = useLanguage();

  const faqItems = props.items || t.faq.items;

  const FAQS = faqItems.map((item: FAQItem, i: number) => ({
    id: item._key ?? `faq-${i + 1}`,
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section ref={ref} id="faq" className="bg-bg-brand-black pb-14 pt-8 sm:pb-16 sm:pt-10 lg:pb-24 lg:pt-14">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-start lg:gap-x-20 lg:px-8">
        {/* Header */}
        <div className="relative z-40 order-1 lg:col-start-2 lg:row-start-1 lg:justify-self-end lg:text-right">
          <SplitTextReveal
            as="h2"
            className="text-[clamp(5rem,13vw,10rem)] font-bold uppercase leading-[0.8] tracking-[-0.045em] text-text-main"
            step={18}
            delay={120}
            from="center"
          >
            FAQ
          </SplitTextReveal>
        </div>

        {/* Accordion */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
          animate={prefersReducedMotion || isInView ? { opacity: 1, y: 0 } : {}}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="relative z-40 order-2 w-full lg:col-start-1 lg:row-start-1"
        >
          <Accordion className="flex flex-col gap-4">
            {FAQS.map((faq: { id: string; question: string; answer: string }) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="overflow-hidden rounded-[20px] bg-bg-brand-black px-6 py-2 shadow-[8px_8px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.03)] ring-1 ring-white/[0.02] data-[state=open]:ring-brand-red/30 transition-all duration-300"
              >
                <AccordionTrigger className="text-left text-[17px] font-semibold leading-[1.2] text-text-main normal-case tracking-tight hover:no-underline py-4 pr-2 sm:text-[18px] lg:py-5 lg:text-[19px]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-[60ch] pb-5 pr-12 text-[15px] leading-[1.55] text-text-muted sm:text-base lg:pb-6">
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
