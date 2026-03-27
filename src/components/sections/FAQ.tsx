"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQS = [
  {
    id: "faq-1",
    question: "How long does a typical project take?",
    answer: "A standard brand identity and website sprint takes between 4 to 6 weeks depending on the complexity of the requirements and how fast we receive feedback.",
  },
  {
    id: "faq-2",
    question: "Do you offer ongoing support after launch?",
    answer: "Yes, we offer retainer packages for ongoing design, development, and marketing support to ensure your brand continues to scale post-launch.",
  },
  {
    id: "faq-3",
    question: "What platforms do you build websites on?",
    answer: "We specialize in custom Next.js applications for total control over performance and design. We also build on Webflow and Shopify depending on your specific needs.",
  },
  {
    id: "faq-4",
    question: "How does the payment structure work?",
    answer: "We typically work on a 50% upfront deposit to secure your spot in our schedule, with the remaining 50% due upon project completion and handover.",
  },
  {
    id: "faq-5",
    question: "Can you help with copywriting and content?",
    answer: "Absolutely. We have an in-house team of copywriters and content strategists to ensure your messaging aligns perfectly with your new visual identity.",
  },
];

export default function FAQ() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="faq" className="bg-bg-brand-black py-[90px] lg:py-[180px]">
      <div className="mx-auto max-w-[1000px] px-4">
        {/* Header */}
        <div className="mb-16 md:mb-20 text-center">
          <motion.p
            className="text-brand-red text-[13px] font-semibold uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
          >
            Got Questions?
          </motion.p>
          <motion.h2
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] font-bold uppercase leading-none tracking-tight text-text-main"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Frequently Asked <span className="text-brand-red">Questions</span>
          </motion.h2>
        </div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mx-auto max-w-[800px]"
        >
          <Accordion className="flex flex-col gap-4">
            {FAQS.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="border border-border-dark bg-[#111111] rounded-[20px] px-6 py-2 overflow-hidden data-[state=open]:border-brand-red/30 transition-colors"
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
