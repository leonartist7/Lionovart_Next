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
      className="relative flex min-h-[125svh] items-center py-32 md:min-h-[135svh] md:py-48"
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-14">
        <div className="grid items-end gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="[text-shadow:0_3px_24px_rgba(0,0,0,0.92)]"
          >
            <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--ai-cyan)] md:text-[14px]">
              The capacity already inside your business
            </p>
            <h2
              className="mt-6 max-w-[12ch] font-normal leading-[0.97] tracking-[-0.045em] text-white"
              style={{ fontFamily: "var(--font-ai-display)", fontSize: "clamp(2.8rem, 5.4vw, 5.5rem)" }}
            >
              What would you do with the hours back?
            </h2>
            <p className="mt-7 max-w-[43ch] text-[18px] font-light leading-[1.68] text-white/80 md:text-[20px]">
              Use a conservative value for repetitive work. This is a planning lens—not a revenue promise—and it excludes faster response, recovered leads and customer retention.
            </p>
          </motion.div>

          <LiquidGlass className="p-6 sm:p-8 md:p-10">
            <div className="grid gap-9 sm:grid-cols-2">
              <label className="block">
                <span className="flex items-baseline justify-between gap-4 text-[17px] text-white/78">
                  Hours lost each week
                  <strong className="text-[22px] font-medium tabular-nums text-white">{hours}h</strong>
                </span>
                <input
                  aria-label="Hours lost each week"
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={hours}
                  onChange={(event) => setHours(Number(event.target.value))}
                  className="mt-5 h-2 w-full cursor-pointer accent-[var(--ai-cyan)]"
                />
              </label>
              <label className="block">
                <span className="flex items-baseline justify-between gap-4 text-[17px] text-white/78">
                  Blended hourly value
                  <strong className="text-[22px] font-medium tabular-nums text-white">{currency.format(hourValue)}</strong>
                </span>
                <input
                  aria-label="Blended hourly value"
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={hourValue}
                  onChange={(event) => setHourValue(Number(event.target.value))}
                  className="mt-5 h-2 w-full cursor-pointer accent-[var(--ai-cyan)]"
                />
              </label>
            </div>

            <div className="mt-10 grid gap-6 border-t border-white/12 pt-8 sm:grid-cols-2">
              <div>
                <p className="text-[13px] uppercase tracking-[0.16em] text-white/56">Annual time returned</p>
                <p className="mt-2 text-[clamp(2.3rem,5vw,4.2rem)] font-light leading-none tracking-[-0.055em] text-white">
                  {result.yearlyHours.toLocaleString()}h
                </p>
              </div>
              <div>
                <p className="text-[13px] uppercase tracking-[0.16em] text-white/56">Potential capacity value</p>
                <p className="mt-2 text-[clamp(2.3rem,5vw,4.2rem)] font-light leading-none tracking-[-0.055em] text-[var(--ai-cyan)]">
                  {currency.format(result.capacity)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openNova("roi", true)}
              className="mt-9 min-h-12 rounded-full bg-brand-red px-7 py-3.5 text-[17px] font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Find the first hours to recover
            </button>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
}
