"use client";

/**
 * Stats + a real human face, between the web hero and the build showcase. People
 * buy from people — so this beat pairs three credibility stats with a large warm
 * client portrait and a results quote, in an editorial split (not a centered
 * 3-up). Reframes a website from "pretty page" to a platform that does the work.
 * Light theme; flows into the BuildShowcase video on the same white ground.
 */

import { motion, useReducedMotion } from "framer-motion";

const STATS: { value: string; label: string }[] = [
  { value: "75%", label: "judge your business by its design alone — before a single word." },
  { value: "+70%", label: "more direct bookings after a rebuilt, conversion-first site." },
  { value: "24/7", label: "lead capture + qualification on autopilot — not just chatbots." },
];

const reveal = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as const },
});

export default function OutcomeBand() {
  const reduce = useReducedMotion();
  const mp = (i: number) => (reduce ? {} : reveal(i));

  return (
    <section className="bg-white px-6 py-24 md:py-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-16 lg:gap-24">

        {/* LEFT — heading, lead, stacked stats */}
        <div>
          <motion.p {...mp(0)} className="mb-5 text-[11px] uppercase tracking-[0.3em] text-[#999]">
            More than a pretty page
          </motion.p>
          <motion.h2
            {...mp(0)}
            className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-[#111]"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.6rem)" }}
          >
            We build platforms<br />
            that <span className="text-brand-red">do the work.</span>
          </motion.h2>
          <motion.p {...mp(1)} className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-[#555] md:text-[17px]">
            Not a brochure that sits there. A platform that earns trust on sight and keeps generating
            and qualifying leads around the clock.
          </motion.p>

          <div className="mt-12 space-y-7 md:mt-14">
            {STATS.map((s, i) => (
              <motion.div key={s.value} {...mp(i + 1)} className="flex items-baseline gap-5 border-t border-black/10 pt-5">
                <span
                  className="shrink-0 font-clash font-semibold leading-none tracking-tight text-brand-red"
                  style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}
                >
                  {s.value}
                </span>
                <span className="max-w-[40ch] text-[15px] leading-snug text-[#333] md:text-[16px]">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT — one big human face + a real results quote */}
        <motion.figure
          {...mp(1)}
          className="relative overflow-hidden rounded-[28px] shadow-[0_50px_120px_-50px_rgba(0,0,0,0.45)]"
        >
          <img
            src="/images/Testimonials/Canada/Marc-Cardealer-M.jpg"
            alt="Marc, owner of Northline Motors"
            className="aspect-[4/5] w-full object-cover"
          />
          {/* Bottom scrim + quote */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-7 md:p-9">
            <blockquote className="font-clash text-[17px] font-medium leading-snug text-white md:text-[20px]">
              &ldquo;Sold more cars off the new site in one quarter than I did all of last year
              online.&rdquo;
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-white/70">
              <span className="h-px w-6 bg-brand-red" />
              Marc &middot; Northline Motors
            </figcaption>
          </div>
        </motion.figure>
      </div>
    </section>
  );
}
