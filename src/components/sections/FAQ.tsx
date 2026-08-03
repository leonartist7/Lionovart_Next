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
import { useLandingFlow } from "@/contexts/LandingFlowContext";

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
  const flow = useLandingFlow();
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
    <section ref={ref} id="faq" className="bg-bg-brand-black py-14 sm:py-16 lg:py-24">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-start lg:gap-x-20 lg:px-8">
        {/* Header */}
        <div
          className={`relative z-40 order-1 lg:row-start-1 ${
            flow === "inverse"
              ? "lg:col-start-1 lg:order-2 lg:text-left"
              : "lg:col-start-2 lg:justify-self-end lg:text-right"
          }`}
        >
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
          className={`relative z-40 order-2 w-full lg:row-start-1 ${
            flow === "inverse"
              ? "lg:col-start-2 lg:order-1"
              : "lg:col-start-1"
          }`}
        >
          <Accordion className={`flex flex-col ${flow === "inverse" ? "flex-col-reverse" : ""}`}>
            {FAQS.map((faq: { id: string; question: string; answer: string }) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="overflow-hidden border-b border-white/10 first:border-t data-[state=open]:border-brand-red/45 transition-colors duration-300"
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
