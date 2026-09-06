"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";
import { useLanguage } from "@/contexts/LanguageContext";

export function StickyCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isOpen = useNovaStore((s) => s.isOpen);
  const openNova = useNovaStore((s) => s.openNova);
  const { t } = useLanguage();

  const quickQuestions = t.faq.items.slice(0, 4);

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
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="fixed bottom-5 right-4 z-[9990] flex flex-col items-end md:bottom-8 md:right-8"
        >
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                id="quick-answers-panel"
                role="dialog"
                aria-label="Quick answers"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="mb-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[20px] border border-white/[0.12] bg-[#101010]/95 p-4 text-white backdrop-blur-xl md:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-gold">
                      Quick answers
                    </p>
                    <h2 className="mt-1.5 text-[20px] font-semibold leading-tight tracking-tight">
                      What would you like to know?
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.10] text-lg text-white/65 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
                    aria-label="Close quick answers"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-4 flex flex-col border-t border-white/[0.09]">
                  {quickQuestions.map((item: { question: string; answer: string }, index: number) => {
                    const active = selectedQuestion === index;
                    return (
                      <div key={item.question} className="border-b border-white/[0.09]">
                        <button
                          type="button"
                          onClick={() => setSelectedQuestion(active ? null : index)}
                          aria-expanded={active}
                          className="flex min-h-12 w-full items-center justify-between gap-3 py-2.5 text-left text-[13px] font-medium leading-[1.35] text-white/88 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-brand-gold"
                        >
                          <span>{item.question}</span>
                          <span aria-hidden className="text-base font-light text-white/45">
                            {active ? "−" : "+"}
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {active && (
                            <motion.div
                              initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="pb-3 pr-5 text-[13px] leading-[1.5] text-white/58">
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
                  className="mt-4 flex min-h-11 w-full items-center justify-between rounded-full border border-brand-gold/30 bg-brand-gold/[0.08] px-4 text-left text-[13px] font-semibold text-white transition-colors hover:border-brand-gold/55 hover:bg-brand-gold/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
                >
                  <span>Still have a question? Ask NOVA</span>
                  <span aria-hidden>→</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-end gap-2">
            <motion.span
              animate={{ opacity: panelOpen ? 0 : 1, y: panelOpen ? 4 : 0 }}
              className="pointer-events-none rounded-full border border-white/[0.10] bg-black/65 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur-md"
            >
              Questions? Answers here
            </motion.span>

            <button
              type="button"
              onClick={() => setPanelOpen((open) => !open)}
              aria-expanded={panelOpen}
              aria-controls="quick-answers-panel"
              aria-label={panelOpen ? "Close quick answers" : "Open quick answers"}
              className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/[0.18] bg-black/80 backdrop-blur-xl transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70 md:h-[60px] md:w-[60px]"
            >
              <Image
                src="/images/LOGO.svg"
                alt=""
                width={42}
                height={42}
                className="h-9 w-9 object-contain md:h-10 md:w-10"
                aria-hidden
              />
              <span className="pointer-events-none absolute inset-0 rounded-full border border-brand-gold/15" aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
