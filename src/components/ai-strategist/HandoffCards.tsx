"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageSquare, Calendar, X, CheckCircle2 } from "lucide-react";
import { trackNovaEvent, NOVA_EVENT } from "@/lib/nova-events";

interface HandoffCardsProps {
  whatsappUrl: string;
  bookingUrl: string;
  summaryMessage?: string;
  /** True once book_meeting already created a real Cal.com event — the
   * booking pill shows a confirmed state instead of a schedule button. */
  bookingConfirmed?: boolean;
  bookingTimeLabel?: string;
}

/** Two small pills (WhatsApp, book a call) — stay visible and clickable
 * until the user actually acts on one; they don't auto-dismiss like the
 * lead-capture field pill, since hiding them before they're used was the
 * exact bug this replaced. */
export default function HandoffCards({
  whatsappUrl,
  bookingUrl,
  summaryMessage,
  bookingConfirmed,
  bookingTimeLabel,
}: HandoffCardsProps) {
  const [showCalendly, setShowCalendly] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (bookingConfirmed) trackNovaEvent(NOVA_EVENT.BOOKING_COMPLETED, { via: "calcom" });
  }, [bookingConfirmed]);

  useEffect(() => {
    if (!showCalendly) return;
    const onMessage = (e: MessageEvent) => {
      if (
        typeof e.data === "object" &&
        e.data?.event === "calendly.event_scheduled"
      ) {
        trackNovaEvent(NOVA_EVENT.BOOKING_COMPLETED);
        setShowCalendly(false);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [showCalendly]);

  const embedUrl = (() => {
    try {
      const u = new URL(bookingUrl);
      u.searchParams.set("embed_type", "Inline");
      u.searchParams.set("hide_gdpr_banner", "1");
      return u.toString();
    } catch {
      return bookingUrl;
    }
  })();

  return (
    <>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 1 }}
        className="flex flex-col items-center gap-2"
      >
        {summaryMessage && (
          <p className="text-[11px] text-white/60 text-center max-w-[240px] leading-relaxed">
            {summaryMessage}
          </p>
        )}
        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackNovaEvent(NOVA_EVENT.HANDOFF_CARD_CLICKED, { kind: "whatsapp" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 text-[11px] font-semibold text-[#25D366] hover:bg-[#25D366]/25 transition-colors"
          >
            <MessageSquare size={12} strokeWidth={2} />
            WhatsApp
          </a>

          {bookingConfirmed ? (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackNovaEvent(NOVA_EVENT.HANDOFF_CARD_CLICKED, { kind: "booking_confirmed" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-400/25 transition-colors"
              title={bookingTimeLabel || "Your call with Leon is locked in."}
            >
              <CheckCircle2 size={12} strokeWidth={2} />
              Booked
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                trackNovaEvent(NOVA_EVENT.HANDOFF_CARD_CLICKED, { kind: "booking" });
                trackNovaEvent(NOVA_EVENT.BOOKING_EMBED_OPENED);
                setShowCalendly(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-[11px] font-semibold text-brand-gold hover:bg-brand-gold/25 transition-colors"
            >
              <Calendar size={12} strokeWidth={2} />
              Book a call
            </button>
          )}
        </div>
      </motion.div>

      {/* Inline Calendly modal */}
      <AnimatePresence>
        {showCalendly && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex flex-col bg-black/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCalendly(false); }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
              className="relative m-4 sm:m-8 flex-1 rounded-2xl overflow-hidden bg-white flex flex-col"
              style={{ maxHeight: "calc(100vh - 4rem)" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                <span className="text-sm font-semibold text-gray-800">Book a Strategy Call</span>
                <button
                  type="button"
                  onClick={() => setShowCalendly(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
              <iframe
                src={embedUrl}
                title="Book a call with Leon"
                className="flex-1 w-full border-none"
                allow="camera; microphone; fullscreen"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
