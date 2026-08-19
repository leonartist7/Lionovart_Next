"use client";

import type { CSSProperties } from "react";
import styles from "./NovaGradientButton.module.css";

const LAYERS = [
  ["0s", "25s"], ["0.15s", "15.9s"], ["0.53s", "26.4s"], ["0.45s", "17.8s"],
  ["1.6s", "19.2s"], ["1.6s", "29.2s"], ["1.6s", "20.2s"],
] as const;

export function NovaGradientButton({ label = "Talk to Nova", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <div className={styles.wrapper}>
      <div aria-hidden className={styles.light} />
      {LAYERS.map(([delay, duration], index) => (
        <div
          key={index}
          aria-hidden
          className={styles.layer}
          data-layer={index}
          style={{ animationDelay: delay, animationDuration: duration } as CSSProperties}
        />
      ))}
      <button type="button" className={styles.button} onClick={onClick} aria-label={label}>{label}</button>
      <div aria-hidden className={styles.textOverlay}>{label}</div>
    </div>
  );
}
