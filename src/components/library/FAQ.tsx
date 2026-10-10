"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { FAQ_ITEMS_EN } from "@/lib/faq-copy";

type FAQItem = {
  _key?: string;
  question: string;
  answer: string;
};

type FAQProps = {
  items?: FAQItem[];
};

/**
 * The questions are the visual. No cards, labels, helper copy, numbering or
 * secondary CTA competing with the cinematic chapter transition above it.
 */
export default function FAQ(props: FAQProps) {
  const { t, locale } = useLanguage();
  const faqItems = props.items || (locale === "en" ? FAQ_ITEMS_EN : t.faq.items);

  const faqs = faqItems.map((item: FAQItem, index: number) => ({
    id: item._key ?? `faq-${index + 1}`,
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section id="faq" className="bg-bg-brand-black pb-10 pt-0 sm:pb-12 lg:pb-14">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <Accordion className="border-t border-white/[0.12]">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="group/faq border-b border-white/[0.12] bg-transparent transition-colors duration-200 data-open:border-white/[0.22]"
            >
              <AccordionTrigger className="min-h-[68px] rounded-none py-[18px] pr-0 text-left normal-case hover:no-underline focus-visible:border-transparent focus-visible:ring-0 sm:min-h-[76px] sm:py-5 lg:min-h-[82px] lg:py-[22px] **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-white/35 sm:**:data-[slot=accordion-trigger-icon]:size-6">
                <span className="max-w-[980px] pr-5 font-clash text-[clamp(1.2rem,2.3vw,2rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-white/76 transition-[color,transform] duration-200 group-hover/accordion-trigger:translate-x-1 group-hover/accordion-trigger:text-white">
                  {faq.question}
                </span>
              </AccordionTrigger>

              <AccordionContent className="pb-5 pr-7 sm:pb-6 sm:pr-12 lg:grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:pb-7">
                <div className="border-l border-brand-red/65 pl-4 sm:pl-5 lg:col-start-2 lg:pl-6">
                  <p className="max-w-[62ch] font-body text-[14px] leading-[1.58] text-white/58 sm:text-[15px] lg:text-[16px]">
                    {faq.answer}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
