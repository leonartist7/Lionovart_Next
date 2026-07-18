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
   * booking card shows a confirmed state instead of a schedule button. */
  bookingConfirmed?: boolean;
  bookingTimeLabel?: string;
}

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
    <div className="flex flex-col gap-4 w-full">
      {summaryMessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-[13px] text-white/70 leading-relaxed text-center px-2"
        >
          {summaryMessage}
        </motion.p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {/* WhatsApp card */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            boxShadow: shouldReduceMotion
              ? "0 0 0px rgba(37,211,102,0)"
              : ["0 0 0px rgba(37,211,102,0)", "0 0 26px rgba(37,211,102,0.45)", "0 0 0px rgba(37,211,102,0)"],
          }}
          transition={{
            default: shouldReduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 20, delay: 0 },
            boxShadow: shouldReduceMotion ? { duration: 0 } : { duration: 0.9, delay: 0.25, ease: "easeOut" },
          }}
          className="flex-1 flex flex-col rounded-2xl p-4 gap-3 bg-white/[0.04] border border-white/[0.08] border-l-[3px] border-l-[#25D366]"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#25D366]/10">
            <MessageSquare size={16} className="text-[#25D366]" strokeWidth={1.8} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-semibold text-white leading-tight">Continue on WhatsApp</p>
            <p className="text-[12px] text-white/50 leading-relaxed">Pick up the conversation with Leon instantly. Your context is already prepared.</p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackNovaEvent(NOVA_EVENT.HANDOFF_CARD_CLICKED, { kind: "whatsapp" })}
            className="mt-auto block text-center text-[12px] font-semibold text-white px-3 py-2 rounded-xl bg-[#25D366] hover:opacity-90 transition-opacity duration-150"
          >
            Open WhatsApp
          </a>
        </motion.div>

        {/* Booking card */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            boxShadow: shouldReduceMotion
              ? "0 0 0px rgba(229,25,42,0)"
              : ["0 0 0px rgba(229,25,42,0)", "0 0 26px rgba(229,25,42,0.4)", "0 0 0px rgba(229,25,42,0)"],
          }}
          transition={{
            default: shouldReduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 20, delay: 0.12 },
            boxShadow: shouldReduceMotion ? { duration: 0 } : { duration: 0.9, delay: 0.37, ease: "easeOut" },
          }}
          className={`flex-1 flex flex-col rounded-2xl p-4 gap-3 bg-white/[0.04] border border-white/[0.08] border-l-[3px] ${
            bookingConfirmed ? "border-l-emerald-400" : "border-l-brand-red"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              bookingConfirmed ? "bg-emerald-400/15" : "bg-brand-red/20"
            }`}
          >
            {bookingConfirmed ? (
              <CheckCircle2 size={16} className="text-emerald-400" strokeWidth={1.8} />
            ) : (
              <Calendar size={16} className="text-brand-red" strokeWidth={1.8} />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-semibold text-white leading-tight">
              {bookingConfirmed ? "You're booked" : "Book a Call with Leon"}
            </p>
            <p className="text-[12px] text-white/50 leading-relaxed">
              {bookingConfirmed
                ? bookingTimeLabel || "Your call with Leon is locked in."
                : "30 minutes. No pressure. Honest strategic advice from our founder."}
            </p>
          </div>
          {bookingConfirmed ? (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackNovaEvent(NOVA_EVENT.HANDOFF_CARD_CLICKED, { kind: "booking_confirmed" })}
              className="mt-auto block text-center text-[12px] font-semibold text-white px-3 py-2 rounded-xl bg-emerald-500/90 hover:opacity-90 transition-opacity duration-150"
            >
              View booking
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                trackNovaEvent(NOVA_EVENT.HANDOFF_CARD_CLICKED, { kind: "booking" });
                trackNovaEvent(NOVA_EVENT.BOOKING_EMBED_OPENED);
                setShowCalendly(true);
              }}
              className="mt-auto block w-full text-center text-[12px] font-semibold text-white px-3 py-2 rounded-xl bg-brand-red hover:opacity-90 transition-opacity duration-150"
            >
              Schedule Meeting
            </button>
          )}
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="text-[11px] text-white/30 text-center leading-relaxed"
      >
        Your info is saved. Leon will personally review this within 24 hours.
      </motion.p>

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
    </div>
  );
}
