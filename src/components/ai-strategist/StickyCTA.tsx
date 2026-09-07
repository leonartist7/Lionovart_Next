"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";
import { useLanguage } from "@/contexts/LanguageContext";
import { FAQ_ITEMS_EN } from "@/lib/faq-copy";

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
  const ctaLabel = locale === "en" ? "None of these? Ask us" : t.faq.assistant.cta;

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
          transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 right-4 z-[9990] flex flex-col items-end md:bottom-8 md:right-8"
        >
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                id="quick-answers-panel"
                role="dialog"
                aria-label="Questions"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mb-3 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-[14px] border border-white/[0.12] bg-[#0b0b0b]/94 px-4 pb-3 pt-4 text-white backdrop-blur-lg md:px-[18px] md:pt-[18px]"
              >
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.10] pb-3.5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-brand-red">
                      Before we talk
                    </p>
                    <p className="mt-1.5 font-clash text-[18px] font-semibold leading-[1.12] tracking-[-0.015em] text-white/92">
                      Start with what’s on your mind.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-lg text-white/42 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60"
                    aria-label="Close questions"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-col">
                  {quickQuestions.map((item: { question: string; answer: string }, index: number) => {
                    const active = selectedQuestion === index;
                    return (
                      <div key={item.question} className="border-b border-white/[0.09]">
                        <button
                          type="button"
                          onClick={() => setSelectedQuestion(active ? null : index)}
                          aria-expanded={active}
                          className="group flex min-h-[48px] w-full items-center gap-3 py-2.5 text-left focus-visible:outline-none"
                        >
                          <span className="shrink-0 text-[9px] font-semibold tracking-[0.12em] text-brand-red/70">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0 flex-1 text-[13px] font-medium leading-[1.35] text-white/78 transition-colors group-hover:text-white">
                            {item.question}
                          </span>
                          <span aria-hidden className="text-[15px] font-light text-white/34">
                            {active ? "−" : "+"}
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {active && (
                            <motion.div
                              initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                              className="overflow-hidden"
                            >
                              <p className="pb-3 pl-[2.1rem] pr-5 text-[12px] leading-[1.5] text-white/48">
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
                  className="group mt-3 inline-flex min-h-10 items-center gap-2 text-left text-[12px] font-semibold text-brand-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60"
                >
                  <span>{ctaLabel}</span>
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-end gap-1.5">
            <motion.span
              animate={{ opacity: panelOpen ? 0 : 1, y: panelOpen ? 3 : 0 }}
              className="pointer-events-none pr-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55"
            >
              Questions?
            </motion.span>

            <button
              type="button"
              onClick={() => setPanelOpen((open) => !open)}
              aria-expanded={panelOpen}
              aria-controls="quick-answers-panel"
              aria-label={panelOpen ? "Close questions" : "Open questions"}
              className="relative flex h-13 w-13 items-center justify-center overflow-hidden rounded-full border border-white/[0.16] bg-black/78 backdrop-blur-lg transition-[transform,border-color] duration-200 hover:scale-[1.035] hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 md:h-14 md:w-14"
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
