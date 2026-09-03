"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";
import { LiquidGlass } from "./LiquidGlass";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * The light relief chapter. It is arithmetic on the visitor's own inputs and
 * is framed as a planning lens on purpose — it must never read as a projected
 * return, and it deliberately excludes the softer upside so the number stays
 * defensible.
 */
export default function AiRoi() {
  const ref = useRef<HTMLElement>(null);
  const [hours, setHours] = useState(10);
  const [hourValue, setHourValue] = useState(55);
  const reduce = useReducedMotion();
  const openNova = useNovaStore((state) => state.openNova);
  const result = useMemo(
    () => ({ yearlyHours: hours * 52, capacity: hours * hourValue * 52 }),
    [hourValue, hours],
  );

  return (
    <section
      id="results"
      ref={ref}
      data-ai-snap
      data-art-directed="light"
      className="relative isolate flex min-h-[125svh] scroll-mt-28 items-center overflow-hidden bg-[#f4f1ea] py-32 text-[#111111] md:min-h-[135svh] md:py-48"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(55% 45% at 84% 14%, rgba(229,25,42,0.075), transparent 72%), radial-gradient(42% 36% at 10% 88%, rgba(240,201,23,0.12), transparent 74%)",
        }}
      />
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-14">
        <div className="grid items-end gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-black/55 md:text-[14px]">
              A planning lens — not a forecast
            </p>
            <h2
              className="mt-6 max-w-[14ch] font-semibold leading-[1.02] tracking-[-0.02em] text-[#111111]"
              style={{ fontSize: "clamp(2.4rem, 4.6vw, 4.6rem)" }}
            >
              What is the repetitive hour actually costing you?
            </h2>
            <p className="mt-7 max-w-[43ch] text-[18px] font-normal leading-[1.68] text-black/68 md:text-[20px]">
              Use numbers you would defend to your accountant. This is arithmetic, not a
              promise—and it is deliberately conservative. It doesn&rsquo;t count the calls
              you&rsquo;re missing, the leads going cold on day three, or the customers who
              quietly don&rsquo;t come back.
            </p>
          </motion.div>

          <LiquidGlass tone="light" className="p-6 sm:p-8 md:p-10">
            <div className="grid gap-9 sm:grid-cols-2">
              <label className="block">
                <span className="flex items-baseline justify-between gap-4 text-[17px] text-black/68">
                  Hours lost each week
                  <strong className="text-[22px] font-semibold tabular-nums text-black">{hours}h</strong>
                </span>
                <input
                  aria-label="Hours lost each week"
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={hours}
                  onChange={(event) => setHours(Number(event.target.value))}
                  className="mt-5 h-2 w-full cursor-pointer accent-brand-red"
                />
              </label>
              <label className="block">
                <span className="flex items-baseline justify-between gap-4 text-[17px] text-black/68">
                  Blended hourly value
                  <strong className="text-[22px] font-semibold tabular-nums text-black">{currency.format(hourValue)}</strong>
                </span>
                <input
                  aria-label="Blended hourly value"
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={hourValue}
                  onChange={(event) => setHourValue(Number(event.target.value))}
                  className="mt-5 h-2 w-full cursor-pointer accent-brand-red"
                />
              </label>
            </div>

            <div className="mt-10 grid gap-6 border-t border-black/12 pt-8 sm:grid-cols-2">
              <div>
                <p className="text-[13px] uppercase tracking-[0.16em] text-black/52">Hours a year</p>
                <p className="mt-2 text-[clamp(2.3rem,5vw,4.2rem)] font-light leading-none tracking-[-0.03em] text-black">
                  {result.yearlyHours.toLocaleString()}h
                </p>
              </div>
              <div>
                <p className="text-[13px] uppercase tracking-[0.16em] text-black/52">What those hours are worth</p>
                <p className="mt-2 text-[clamp(2.3rem,5vw,4.2rem)] font-light leading-none tracking-[-0.03em] text-brand-red">
                  {currency.format(result.capacity)}
                </p>
              </div>
            </div>

            <p className="mt-9 max-w-[46ch] text-[17px] leading-[1.6] text-black/68">
              The audit is what turns this into a real number.
            </p>
            <button
              type="button"
              onClick={() => openNova("roi", true)}
              className="mt-5 min-h-12 rounded-full bg-brand-red px-7 py-3.5 text-[17px] font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Find out which hours are recoverable
            </button>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
}
