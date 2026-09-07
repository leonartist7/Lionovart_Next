"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNovaStore } from "@/lib/stores/nova-store";
import { FAQ_ITEMS_EN } from "@/lib/faq-copy";

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
  const { t, locale } = useLanguage();
  const openNova = useNovaStore((s) => s.openNova);

  const faqItems = props.items || (locale === "en" ? FAQ_ITEMS_EN : t.faq.items);
  const handoff =
    locale === "en"
      ? {
          eyebrow: "Still figuring it out?",
          heading: "You don’t need the perfect question.",
          body: "Tell us what’s on your mind. We’ll help you find the right next move.",
          cta: "Ask us",
        }
      : {
          eyebrow: t.faq.assistant.eyebrow,
          heading: t.faq.assistant.heading,
          body: t.faq.assistant.body,
          cta: t.faq.assistant.cta,
        };

  const faqs = faqItems.map((item: FAQItem, index: number) => ({
    id: item._key ?? `faq-${index + 1}`,
    number: String(index + 1).padStart(2, "0"),
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section id="faq" className="bg-bg-brand-black pb-10 pt-4 sm:pb-12 sm:pt-5 lg:pb-14 lg:pt-6">
      <div className="mx-auto max-w-[1040px] px-5 sm:px-6 lg:px-8">
        <div className="mb-3 border-b border-white/[0.11] pb-4 sm:mb-4 sm:pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-brand-red sm:text-[11px]">
            A few things worth knowing
          </p>
          <p className="mt-2 max-w-[62ch] font-body text-[14px] leading-[1.5] text-white/48 sm:text-[15px]">
            No perfect brief required. Just a clear conversation about where you are and what needs to move.
          </p>
        </div>

        <Accordion className="border-b border-white/[0.11]">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border-t border-white/[0.11] bg-transparent transition-colors duration-200 data-[state=open]:border-white/[0.18]"
            >
              <AccordionTrigger className="min-h-[54px] rounded-none py-3.5 pr-0 text-left normal-case hover:no-underline focus-visible:border-transparent focus-visible:ring-0 sm:min-h-[58px] sm:py-4">
                <span className="flex min-w-0 items-baseline gap-3.5 sm:gap-5">
                  <span className="shrink-0 font-body text-[10px] font-semibold tracking-[0.14em] text-brand-red/75 sm:text-[11px]">
                    {faq.number}
                  </span>
                  <span className="font-clash text-[16px] font-semibold leading-[1.2] tracking-[-0.015em] text-white/88 transition-colors duration-200 group-hover/accordion-trigger:text-white sm:text-[18px] lg:text-[19px]">
                    {faq.question}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-[2.35rem] pr-8 pt-0 font-body text-[14px] leading-[1.55] text-white/52 sm:pb-5 sm:pl-[3.45rem] sm:pr-14 sm:text-[15px]">
                <p className="max-w-[66ch]">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pt-7">
          <div className="max-w-[560px]">
            <p className="font-clash text-[18px] font-semibold leading-tight tracking-[-0.015em] text-white/90 sm:text-[20px]">
              {handoff.heading}
            </p>
            <p className="mt-1.5 font-body text-[13px] leading-[1.5] text-white/45 sm:text-[14px]">
              {handoff.body}
            </p>
          </div>

          <button
            type="button"
            onClick={() => openNova("offer", true)}
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start font-body text-[13px] font-semibold text-brand-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 sm:self-auto"
          >
            <span>{handoff.cta}</span>
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
