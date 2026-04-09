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
    answer: "We build fully custom websites and applications for total control over performance and design. We also work on Webflow and Shopify depending on your specific needs and goals.",
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
  {
    id: "faq-6",
    question: "Do you work with clients in other languages?",
    answer: "Yes. Our team works across 9 languages and has delivered projects on 4 continents. Whether you need assets in French, Spanish, Portuguese, Arabic, or others, we handle it in-house. No external translators, no briefing a third party.",
  },
  {
    id: "faq-7",
    question: "Why not just hire a freelancer?",
    answer: "Freelancers are great for single tasks. But brand, web, video, content, and automation each require a different specialist — and coordinating them costs you time, consistency, and often more money than you expect. We bring every discipline under one roof so nothing gets lost in translation.",
  },
  {
    id: "faq-8",
    question: "How do we get started?",
    answer: "Send us a message on WhatsApp or fill in the form on this page. We'll set up a short discovery call — usually 20 to 30 minutes — to understand your goals, timeline, and budget. From there we put together a scope and you decide if it's the right fit. No pressure.",
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
                className="bg-[#181818] rounded-[20px] px-6 py-2 overflow-hidden shadow-[8px_8px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.03)] ring-1 ring-white/[0.02] data-[state=open]:ring-brand-red/30 transition-all duration-300"
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
