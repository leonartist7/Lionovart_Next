"use client";

import { motion } from "framer-motion";
import { MessageSquare, Calendar } from "lucide-react";

interface HandoffCardsProps {
  whatsappUrl: string;
  bookingUrl: string;
  summaryMessage?: string;
}

const cards = [
  {
    id: "whatsapp",
    icon: MessageSquare,
    iconColor: "#25D366",
    accent: "#25D366",
    title: "Continue on WhatsApp",
    body: "Pick up the conversation with Leon instantly. Your context is already prepared.",
    cta: "Open WhatsApp",
    ctaStyle: { background: "#25D366" },
    ctaHoverStyle: "hover:opacity-90",
  },
  {
    id: "meeting",
    icon: Calendar,
    iconColor: "var(--color-brand-red)",
    accent: "var(--color-brand-red)",
    title: "Book a Call with Leon",
    body: "30 minutes. No pressure. Honest strategic advice from our founder.",
    cta: "Schedule Meeting",
    ctaStyle: { background: "var(--color-brand-red)" },
    ctaHoverStyle: "hover:opacity-90",
  },
] as const;

export default function HandoffCards({ whatsappUrl, bookingUrl, summaryMessage }: HandoffCardsProps) {
  const hrefs = { whatsapp: whatsappUrl, meeting: bookingUrl };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Optional summary message */}
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

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col rounded-2xl p-4 gap-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderLeft: `3px solid ${card.accent}`,
              }}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${card.accent}20` }}
              >
                <Icon size={16} style={{ color: card.iconColor }} strokeWidth={1.8} />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1">
                <p className="text-[13px] font-semibold text-white leading-tight">{card.title}</p>
                <p className="text-[12px] text-white/50 leading-relaxed">{card.body}</p>
              </div>

              {/* CTA */}
              <a
                href={hrefs[card.id]}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "mt-auto block text-center text-[12px] font-semibold text-white",
                  "px-3 py-2 rounded-xl transition-opacity duration-150",
                  card.ctaHoverStyle,
                ].join(" ")}
                style={card.ctaStyle}
              >
                {card.cta}
              </a>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="text-[11px] text-white/30 text-center leading-relaxed"
      >
        Your info is saved. Leon will personally review this within 24 hours.
      </motion.p>
    </div>
  );
}
