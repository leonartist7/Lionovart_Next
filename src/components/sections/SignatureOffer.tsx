"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/contact";
import { useNovaStore } from "@/lib/stores/nova-store";
import { ShineBorder } from "@/components/ui/shine-border";
import VideoBackdrop from "@/components/ui/VideoBackdrop";

// TEMP placeholder — reusing ClosingCTA's footage clip until real "happy team" footage is ready.
const OFFER_CARD_CLIP =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto:eco/v1779845599/Footage_02_chsoa3.mp4";

const INCLUDED = [
  { title: "Brand Identity & Strategy", note: "Logo, system, voice — authority on sight." },
  { title: "Website & Apps", note: "Fast, conversion-built, made to book calls." },
  { title: "Content Studio", note: "Brand films, reels, social — run end to end." },
  { title: "AI & Automation", note: "24/7 agents and systems that win back your time." },
  { title: "Growth & Marketing", note: "The strategy that turns visibility into revenue." },
];

export default function SignatureOffer() {
  const openNova = useNovaStore((s) => s.openNova);

  return (
    <section
      id="offer"
      className="relative bg-bg-surface-light text-[#141414] py-20 md:py-28 lg:py-32 px-4 md:px-8"
    >
      <div className="mx-auto max-w-[1100px]">
        {/* Eyebrow + outcome heading */}
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-clash text-[2.2rem] sm:text-[3rem] md:text-[4rem] font-bold uppercase leading-[0.95] tracking-[-0.02em] max-w-[20ch] mx-auto" style={{ wordSpacing: "0.2em" }}>
            Your entire brand &amp; growth team
            <br />
            <span className="text-brand-red">One Partnership</span>
          </h2>
          <p className="font-body text-[15px] md:text-[18px] leading-[1.6] text-[#5a5550] mt-6 max-w-[58ch] mx-auto">
            Stop juggling freelancers and agencies. We become your full creative
            and digital department — built and run for you — so you show up
            everywhere and grow faster, without managing any of it.
          </p>
        </motion.div>

        {/* Offer card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <ShineBorder
            color={["#e5192a", "#f0c917", "#e5192a"]}
            borderWidth={5.5}
            duration={14}
            className="w-full min-w-0 p-0 block rounded-[24px] md:rounded-[32px] bg-[#0c0c0c] text-white overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.5)]"
          >
          <div className="grid md:grid-cols-[1.2fr_1fr]">
            {/* What's included */}
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10">
              <p className="text-brand-red text-[11px] font-bold uppercase tracking-[0.24em] mb-6">
                Everything, handled
              </p>
              <ul className="flex flex-col gap-5">
                {INCLUDED.map((it) => (
                  <li key={it.title} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-brand-red/15 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-brand-red" strokeWidth={3} />
                    </span>
                    <span>
                      <span className="block font-clash font-bold text-[16px] md:text-[18px] leading-tight">
                        {it.title}
                      </span>
                      <span className="block text-white/55 text-[13px] md:text-[14px] mt-0.5">
                        {it.note}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Outcome + CTA */}
            <div className="relative overflow-hidden p-8 md:p-12 flex flex-col justify-center">
              <VideoBackdrop src={OFFER_CARD_CLIP} overlayClassName="bg-black/70" />
              <div className="relative z-10">
                <p className="font-clash text-[1.5rem] md:text-[1.9rem] font-bold leading-[1.15]">
                  More visibility. More clients.{" "}
                  <span className="text-brand-red">Less you have to manage.</span>
                </p>
                <p className="font-body text-[14px] md:text-[15px] leading-[1.6] text-white/60 mt-4">
                  One team. One standard. One call away.
                </p>

                <div className="flex flex-col gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => openNova("offer", true)}
                    className="w-full rounded-full bg-brand-red text-white font-bold uppercase tracking-[0.08em] text-[14px] py-4 px-6 hover:brightness-110 transition"
                  >
                    Get your free brand audit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        getWhatsAppUrl(
                          "Hi Leon — I'd like to talk about the brand & growth partnership."
                        ),
                        "_blank"
                      )
                    }
                    className="w-full rounded-full border border-[#25D366] text-[#25D366] font-bold uppercase tracking-[0.08em] text-[14px] py-4 px-6 hover:bg-[#25D366]/10 transition"
                  >
                    Talk to us on WhatsApp
                  </button>
                </div>

                <p className="text-white/40 text-[12px] mt-5 text-center">
                  Free audit · No pressure · 20–30 min to see if we&apos;re the right fit
                </p>
              </div>
            </div>
          </div>
          </ShineBorder>
        </motion.div>

        {/* Closing line */}
        <p className="text-center text-[12px] md:text-[13px] font-bold uppercase tracking-[0.2em] text-[#5a5550] mt-8">
          One team. One standard. One call away.
        </p>
      </div>
    </section>
  );
}
