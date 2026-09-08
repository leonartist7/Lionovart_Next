"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";
import { useLanguage } from "@/contexts/LanguageContext";
import { FAQ_ITEMS_EN } from "@/lib/faq-copy";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function StickyCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isOpen = useNovaStore((s) => s.isOpen);
  const openNova = useNovaStore((s) => s.openNova);
  const { t, locale } = useLanguage();

  const quickQuestions = (locale === "en" ? FAQ_ITEMS_EN : t.faq.items).slice(0, 3);
  const moreLabel = locale === "en" ? "Something else?" : t.faq.assistant.cta;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isOpen) setPanelOpen(false);
  }, [isOpen]);

  if (isOpen || pathname?.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: EASE }}
          className="fixed bottom-5 right-4 z-[9990] flex flex-col items-end md:bottom-8 md:right-8"
        >
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                id="quick-answers-panel"
                role="dialog"
                aria-label="Quick answers"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: EASE }}
                className="mb-3 w-[min(338px,calc(100vw-2rem))] overflow-hidden rounded-[16px] border border-white/[0.12] bg-[#0a0a0a]/94 p-2 text-white backdrop-blur-lg"
              >
                <div className="flex flex-col">
                  {quickQuestions.map((item: { question: string; answer: string }, index: number) => {
                    const active = selectedQuestion === index;
                    return (
                      <div key={item.question} className="border-b border-white/[0.09] last:border-b-0">
                        <button
                          type="button"
                          onClick={() => setSelectedQuestion(active ? null : index)}
                          aria-expanded={active}
                          className="group flex min-h-[52px] w-full items-center gap-3 px-2.5 py-3 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold/50"
                        >
                          <span className="min-w-0 flex-1 font-clash text-[14px] font-medium leading-[1.28] tracking-[-0.01em] text-white/76 transition-colors group-hover:text-white">
                            {item.question}
                          </span>
                          <span aria-hidden className="shrink-0 text-[17px] font-light text-white/32">
                            {active ? "−" : "+"}
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {active && (
                            <motion.div
                              initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: prefersReducedMotion ? 0 : 0.16 }}
                              className="overflow-hidden"
                            >
                              <p className="ml-2.5 border-l border-brand-red/60 px-3 pb-3 font-body text-[12px] leading-[1.5] text-white/52">
                                {item.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => openNova("sticky", true)}
                  className="group mt-1 inline-flex min-h-10 items-center gap-2 px-2.5 font-body text-[12px] font-semibold text-brand-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold/50"
                >
                  <span>{moreLabel}</span>
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            aria-expanded={panelOpen}
            aria-controls="quick-answers-panel"
            aria-label={panelOpen ? "Close quick answers" : "Open quick answers"}
            className="relative flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full border border-white/[0.16] bg-black/80 backdrop-blur-lg transition-[transform,border-color] duration-200 hover:scale-[1.035] hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 md:h-14 md:w-14"
          >
            <Image
              src="/images/LOGO.svg"
              alt=""
              width={38}
              height={38}
              className="h-8 w-8 object-contain md:h-9 md:w-9"
              aria-hidden
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
