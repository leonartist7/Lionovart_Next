"use client";

/**
 * ContactCard — extracted from <AboutUsHalf /> for reuse elsewhere.
 *
 * Avatar + expandable "Contact Leonardo" pill. Hover (desktop) or tap to
 * reveal email / phone / meeting link. The caller owns the open state so the
 * card can be coordinated with outside-click handling.
 *
 * Not currently mounted anywhere — kept here for future placement.
 */

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const CONTACT_PHONE   = "+1-587-897-4772";
const CONTACT_EMAIL   = "connect@lionovart.com";
const CONTACT_MEETING = "https://cal.com/lionovart";

/* ─── Shared contact card content ─────────────────────────── */
function ContactCardInner({
  contactOpen,
  founderRole,
}: {
  contactOpen: boolean;
  founderRole: string;
}) {
  return (
    <>
      <span className="absolute top-3 right-3 z-10 flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e5192a] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e5192a]" />
      </span>
      <AnimatePresence mode="wait">
        {!contactOpen ? (
          <motion.div
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="px-4 pt-[22px] pb-[22px] pr-8"
          >
            <p className="text-[14px] font-bold text-white leading-tight whitespace-nowrap">
              Contact Leonardo
            </p>
            <p className="text-[11px] text-white/45 mt-0.5 whitespace-nowrap">
              {founderRole}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-4 pt-4 pb-4 flex flex-col gap-3.5"
          >
            <a href={`mailto:${CONTACT_EMAIL}`} className="group block" onClick={(e) => e.stopPropagation()}>
              <p className="text-[9px] text-white/35 uppercase tracking-[0.15em] mb-0.5">Email</p>
              <p className="text-[13px] font-semibold text-white group-hover:text-white/60 transition-colors">
                {CONTACT_EMAIL}
              </p>
            </a>
            <a href={`tel:${CONTACT_PHONE}`} className="group block" onClick={(e) => e.stopPropagation()}>
              <p className="text-[9px] text-white/35 uppercase tracking-[0.15em] mb-0.5">Phone</p>
              <p className="text-[13px] font-semibold text-white group-hover:text-white/60 transition-colors">
                {CONTACT_PHONE}
              </p>
            </a>
            <a
              href={CONTACT_MEETING}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[9px] text-white/35 uppercase tracking-[0.15em] mb-0.5">Schedule a call</p>
              <p className="text-[13px] font-semibold text-white group-hover:text-white/60 transition-colors">
                Google Meet
              </p>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Contact card cluster (avatar + expandable button) ───── */
export function ContactCardCluster({
  containerRef,
  className,
  contactOpen,
  founderRole,
  onOpen,
  onClose,
  onToggle,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  contactOpen: boolean;
  founderRole: string;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}) {
  return (
    <div ref={containerRef} className={`flex items-end gap-3 ${className ?? ""}`}>
      <div className="relative w-[64px] h-[64px] shrink-0 rounded-[16px] overflow-hidden border border-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <Image
          src="https://res.cloudinary.com/dgio9uutc/image/upload/v1776064620/leonardo_icon_rkjxcx.webp"
          alt="Leonardo"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="relative h-[72px] w-[220px]">
        <motion.button
          type="button"
          initial={false}
          animate={{ height: contactOpen ? "auto" : 72 }}
          transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          onMouseEnter={onOpen}
          onMouseLeave={onClose}
          onClick={onToggle}
          className="absolute bottom-0 right-0 w-[220px] text-left rounded-[20px] border border-black/[0.10] shadow-[0_8px_40px_rgba(0,0,0,0.35)] cursor-pointer select-none overflow-hidden bg-black"
        >
          <ContactCardInner contactOpen={contactOpen} founderRole={founderRole} />
        </motion.button>
      </div>
    </div>
  );
}
