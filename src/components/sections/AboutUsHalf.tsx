"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/LanguageContext";
import TrustedBadgesSection from "@/components/sections/TrustedBadgesSection";

gsap.registerPlugin(ScrollTrigger);

const CONTACT_PHONE   = "+1-587-897-4772";
const CONTACT_EMAIL   = "connect@lionovart.com";
const CONTACT_MEETING = "https://cal.com/lionovart";

const SIDE_IMAGE_URL =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&h=1200&fit=crop&q=80";

const RED_WORDS = new Set(["necessity."]);

const mobileHeadlineContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const mobileHeadlineWord = {
  hidden:  { y: "110%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

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
function ContactCardCluster({
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

/* ─── Main component ─────────────────────────────────────── */
export default function AboutUsHalf(props: any) {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const headlineTop = props.headlineTop || t.about.line1;
  const bodyText    = props.bodyText    || t.about.line2;
  const founderRole = props.founderRole || t.about.founderRole;

  const [contactOpen,   setContactOpen]   = useState(false);
  const [badgesTrigger, setBadgesTrigger] = useState(false);

  const desktopCardRef = useRef<HTMLDivElement>(null);
  const mobileCardRef  = useRef<HTMLDivElement>(null);
  const closeTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openContact  = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setContactOpen(true);
  };
  const closeContact = () => {
    closeTimer.current = setTimeout(() => setContactOpen(false), 180);
  };
  const toggleContact = () => setContactOpen((v) => !v);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const inDesktop = desktopCardRef.current?.contains(e.target as Node);
      const inMobile  = mobileCardRef.current?.contains(e.target as Node);
      if (!inDesktop && !inMobile) setContactOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const words = headlineTop.split(" ");

  /* ── GSAP — desktop pinned scroll sequence ─────────────── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const wordEls = gsap.utils.toArray<HTMLElement>(".about-word-inner");

        // TL1 — Pre-pin: badges + words animate as section scrolls into view
        gsap.timeline({
          scrollTrigger: {
            trigger: desktopRef.current,
            start: "top 60%",  // section 40% visible from bottom
            end: "top top",    // ends when pin starts
            scrub: 1.2,
            onEnter: () => setBadgesTrigger(true),
          },
        })
          .fromTo(".about-badges", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
          .fromTo(wordEls, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.08, ease: "power3.out" }, 0.05);

        // TL2 — Pinned: body, image, contact reveal once section is at top
        gsap.timeline({
          scrollTrigger: {
            trigger: desktopRef.current,
            start: "top top",
            end: "+=80%",   // 80vh pin budget
            pin: true,
            scrub: 1.5,
            pinSpacing: true,
          },
        })
          .fromTo(".about-body",    { opacity: 0, y: 20 },            { opacity: 1, y: 0,    duration: 0.5, ease: "power2.out" },    0)
          .fromTo(".about-image",   { opacity: 0, scale: 0.92, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "power2.out" }, 0.3)
          .fromTo(".about-contact", { opacity: 0, y: 24 },             { opacity: 1, y: 0,    duration: 0.5, ease: "back.out(1.4)" }, 0.9);
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section ref={sectionRef} className="relative bg-white">
      {/* White dome arch — bridges from dark section above */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 -translate-y-[calc(100%-4px)] left-0 right-0 w-full h-[58px] overflow-hidden z-[3]"
      >
        <svg
          viewBox="0 0 1440 58"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path d="M0,58 C360,0 1080,0 1440,58 L1440,58 L0,58 Z" fill="white" />
        </svg>
      </div>

      {/* ── DESKTOP: Pinned two-column magazine layout ──────── */}
      <div
        ref={desktopRef}
        className="hidden lg:block relative h-screen overflow-hidden"
      >
        {/* Trust badges — anchored below navbar */}
        <div className="about-badges absolute top-20 inset-x-0 z-10 opacity-0">
          <TrustedBadgesSection variant="light" externalTrigger={badgesTrigger} />
        </div>

        {/* Two-column grid: text left, portrait card right */}
        <div className="absolute inset-0 pt-52 pb-12 px-12 xl:px-24 grid grid-cols-[1fr_360px] xl:grid-cols-[1fr_420px] gap-10 xl:gap-16 items-stretch z-[1]">

          {/* LEFT COLUMN — headline, body, contact */}
          <div className="flex flex-col justify-center items-start text-left max-w-[640px]">
            <h2 className="font-display text-black leading-[1.1] tracking-tight text-[clamp(2.2rem,3.8vw,4.6rem)]">
              {words.map((word, i) => (
                <span
                  key={i}
                  className="inline-block overflow-hidden align-bottom mr-[0.22em] last:mr-0"
                >
                  <span
                    className={`about-word-inner inline-block${
                      RED_WORDS.has(word) ? " text-[#e5192a]" : ""
                    }`}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h2>

            <div className="w-16 h-px bg-black/15 my-7" aria-hidden="true" />

            <p className="about-body font-body text-[16px] xl:text-[17px] leading-[1.7] text-[#333] max-w-[520px] opacity-0">
              {bodyText}
            </p>

            <ContactCardCluster
              containerRef={desktopCardRef}
              className="about-contact mt-8 opacity-0"
              contactOpen={contactOpen}
              founderRole={founderRole}
              onOpen={openContact}
              onClose={closeContact}
              onToggle={toggleContact}
            />
          </div>

          {/* RIGHT COLUMN — compact portrait card, bottom-anchored */}
          <div className="flex justify-center items-end self-end pb-10 h-full">
            <div className="about-image relative w-full max-w-[360px] xl:max-w-[420px] aspect-[3/4] max-h-[60vh] rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
              <img
                src={SIDE_IMAGE_URL}
                alt="Founder"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE / TABLET: Stacked layout w/ word-stagger ── */}
      <div className="lg:hidden pt-10 pb-16 px-5">
        <TrustedBadgesSection variant="light" />

        <div className="mt-6 text-center">
          <motion.h2
            variants={mobileHeadlineContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="font-display text-black leading-[1.2] mb-6 text-[clamp(1.75rem,6vw,2.4rem)]"
          >
            {words.map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden align-bottom mr-[0.2em] last:mr-0"
              >
                <motion.span
                  variants={mobileHeadlineWord}
                  className={`inline-block${
                    RED_WORDS.has(word) ? " text-[#e5192a]" : ""
                  }`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-body text-[15px] md:text-[17px] leading-[1.7] text-[#333] max-w-[560px] mx-auto"
          >
            {bodyText}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-6 flex justify-center"
        >
          <ContactCardCluster
            containerRef={mobileCardRef}
            contactOpen={contactOpen}
            founderRole={founderRole}
            onOpen={openContact}
            onClose={closeContact}
            onToggle={toggleContact}
          />
        </motion.div>

        {/* Portrait image card — below content on mobile/tablet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mt-8 mx-auto w-full max-w-[360px] aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
        >
          <img
            src={SIDE_IMAGE_URL}
            alt="Founder"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
