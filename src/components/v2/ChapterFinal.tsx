"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { getWhatsAppUrl } from "@/lib/contact";
import MagneticCTA from "@/components/v2/MagneticCTA";
import V2Silk from "@/components/v2/V2Silk";

/* ─── Chapter 10 — Final CTA (dark) ──────────────────────────────────
   Centered manifesto close. Story line ends at the brand mark.
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ChapterFinal() {
  const reduceMotion = useReducedMotion();

  const lineReveal = {
    hidden: { y: "100%" },
    visible: {
      y: "0%",
      transition: reduceMotion ? { duration: 0 } : { duration: 1.1, ease: EASE },
    },
  };

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-[#0d0d0d]">
      {/* Backdrop: silk + ember plate + scrim + red glow */}
      <div aria-hidden className="absolute inset-0">
        <V2Silk className="absolute inset-0" />
        <div className="absolute inset-0">
          <Image
            src="/images/hero_img/1341.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-70"
          />
        </div>
        <div className="absolute inset-0 bg-[#0d0d0d]/55" />
        <div
          className="absolute -left-[10%] bottom-[-20%] h-[60vh] w-[60vw]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(229,25,42,0.14) 0%, rgba(74,13,20,0.08) 40%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[900px] flex-col items-center px-6 py-28 text-center md:px-12 md:py-40">
        {/* Story line descends from top center and terminates at the mark */}
        <div className="mb-8 flex flex-col items-center">
          <motion.div
            aria-hidden
            className="w-px origin-top bg-gradient-to-b from-transparent to-[#e5192a]"
            style={{ height: "clamp(48px, 8vh, 96px)" }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 1.1, ease: EASE }
            }
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.8, delay: 0.15, ease: EASE }
            }
            className="mt-4"
          >
            <Image
              src="/images/LOGO.svg"
              alt="LIONOVART"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </motion.div>
        </div>

        <motion.div
          className="overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2
            variants={lineReveal}
            className="v2-serif text-[clamp(2.4rem,5.5vw,4.5rem)] font-medium leading-[1.05] text-[#f2ede3]"
          >
            Ready to build something unforgettable?
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.9, delay: 0.15, ease: EASE }
          }
          className="mt-10 flex w-full flex-wrap items-center justify-center gap-4"
        >
          <MagneticCTA className="w-full sm:w-auto">
            <a
              href={getWhatsAppUrl(
                "Hello Leon, I'd like to start a project with LIONOVART.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="v2-display block w-full rounded-full bg-[#e5192a] px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#c9101f] active:scale-[0.98] sm:w-auto"
            >
              Start Your Project
            </a>
          </MagneticCTA>
          <MagneticCTA className="w-full sm:w-auto">
            <a
              href="#audit"
              className="v2-display block w-full rounded-full border border-white/25 px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:border-white/70 active:scale-[0.98] sm:w-auto"
            >
              Get My Free Audit
            </a>
          </MagneticCTA>
        </motion.div>
      </div>
    </section>
  );
}
