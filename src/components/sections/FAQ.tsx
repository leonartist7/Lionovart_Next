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
import AssistantCard from "@/components/sections/faq/AssistantCard";

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
    <section
      ref={ref}
      id="faq"
      className="bg-bg-brand-black py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 sm:px-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-16 lg:px-8">
        {/* Header */}
        <div className="relative z-40 order-1 lg:col-start-1 lg:row-start-1">
          <SplitTextReveal
            as="h2"
            className="text-[clamp(4.5rem,11vw,8.5rem)] font-bold uppercase leading-[0.8] tracking-[-0.045em] text-text-main"
            step={18}
            delay={120}
            from="center"
          >
            FAQ
          </SplitTextReveal>
        </div>

        {/* Accordion — intentionally flat/editorial: no raised cards or neumorphic shadows. */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          animate={prefersReducedMotion || isInView ? { opacity: 1, y: 0 } : {}}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="relative z-40 order-2 w-full lg:col-start-1 lg:row-start-2 lg:self-start"
        >
          <Accordion className="border-t border-white/[0.10]">
            {FAQS.map((faq: { id: string; question: string; answer: string }) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-b border-white/[0.10] bg-transparent px-0 transition-colors duration-200 data-[state=open]:border-brand-red/35"
              >
                <AccordionTrigger className="min-h-14 py-3.5 pr-2 text-left text-[16px] font-semibold leading-[1.25] tracking-tight text-text-main normal-case hover:no-underline sm:min-h-[58px] sm:text-[17px] lg:text-[18px]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-[62ch] pb-4 pr-10 text-[14px] leading-[1.55] text-text-muted sm:text-[15px] lg:pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Nova promo — restrained surface, aligned with the FAQ rather than floating above it. */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          animate={prefersReducedMotion || isInView ? { opacity: 1, y: 0 } : {}}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="relative z-40 order-3 w-full lg:col-start-2 lg:row-start-1 lg:row-span-2"
        >
          <AssistantCard />
        </motion.div>
      </div>
    </section>
  );
}
