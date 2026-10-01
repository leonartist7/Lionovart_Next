"use client";

import { useEffect, useRef } from "react";
import { animate } from "framer-motion";
import styles from "./ClientResults.module.css";

type Props = {
  value: number;
  locale: string;
  divisor?: number;
  decimals?: number;
  prefix?: string;
  unit?: string;
  suffix?: string;
};

export default function CountUpResult({
  value,
  locale,
  divisor = 1,
  decimals = 0,
  prefix = "",
  unit = "",
  suffix = "",
}: Props) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const completedRef = useRef(false);
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const finalDisplay = formatter.format(value / divisor);
  const spokenValue = new Intl.NumberFormat(locale, {
    maximumFractionDigits: decimals,
  }).format(value);

  useEffect(() => {
    const root = rootRef.current;
    const number = numberRef.current;
    if (!root || !number) return;

    const format = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const final = format.format(value / divisor);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let controls: ReturnType<typeof animate> | undefined;

    const finish = () => {
      controls?.stop();
      number.textContent = final;
      root.dataset.countState = "complete";
      completedRef.current = true;
    };

    // SSR and the initial hydrated render contain the final value. Reduced
    // motion and no-JS visitors never have to wait for meaningful content.
    if (completedRef.current || preference.matches || !("IntersectionObserver" in window)) {
      finish();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        number.textContent = format.format(0);
        root.dataset.countState = "counting";
        controls = animate(0, value / divisor, {
          duration: 1.6,
          ease: [0.23, 1, 0.32, 1],
          onUpdate: (current) => {
            // Avoid repeatedly painting the same rounded number.
            const next = format.format(current);
            if (number.textContent !== next) number.textContent = next;
          },
          onComplete: finish,
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(root);

    const onPreferenceChange = () => {
      if (!preference.matches) return;
      observer.disconnect();
      finish();
    };
    preference.addEventListener("change", onPreferenceChange);

    return () => {
      observer.disconnect();
      controls?.stop();
      preference.removeEventListener("change", onPreferenceChange);
    };
  }, [value, locale, divisor, decimals]);

  return (
    <span ref={rootRef} className={styles.counter} data-count-target={value}>
      <span className="sr-only">{prefix}{spokenValue}{suffix}</span>
      <span aria-hidden="true" className={styles.visualNumber}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <span className={styles.numberSlot}>
          {/* Reserve the final number's dimensions while the visible copy counts. */}
          <span className={styles.numberSizer}>{finalDisplay}</span>
          <span ref={numberRef} className={styles.numberLive}>{finalDisplay}</span>
        </span>
        {unit && <span>{unit}</span>}
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </span>
    </span>
  );
}
