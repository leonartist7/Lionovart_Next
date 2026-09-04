"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  PORTAL_THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  type ThemeChoice,
} from "@/lib/portal/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
];

/**
 * Three-way theme control.
 *
 * Writes the preference to a plain cookie and flips the attribute the whole
 * palette hangs off, so the change is instant and — because the `(app)` root
 * layout reads the same cookie during SSR — survives a reload with no flash.
 */
export function ThemeToggle({
  initial,
  className,
}: {
  initial: ThemeChoice;
  className?: string;
}) {
  const [choice, setChoice] = useState<ThemeChoice>(initial);
  const reduceMotion = useReducedMotion();
  // The rail and the Settings page can both render a toggle. A shared layoutId
  // would make the indicator fly between the two instances, so scope it.
  const pillId = useId();

  function select(next: ThemeChoice) {
    setChoice(next);
    document.documentElement.dataset.portalTheme = next;
    document.cookie = `${PORTAL_THEME_COOKIE}=${next};path=/;max-age=${THEME_COOKIE_MAX_AGE};samesite=lax`;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "border-border bg-muted/60 relative inline-flex rounded-full border p-0.5",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = choice === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            // Commit on pointer-down so the palette turns over the instant the
            // finger lands, rather than waiting for the click to resolve.
            onPointerDown={() => select(value)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                select(value);
              }
            }}
            className={cn(
              "relative z-10 grid size-8 place-items-center rounded-full",
              "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
              "transition-colors duration-150 ease-out",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`portal-theme-pill-${pillId}`}
                // Critically damped: a preference switch carries no momentum,
                // so it should settle without overshoot.
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", bounce: 0, duration: 0.32 }
                }
                className="bg-card border-border absolute inset-0 -z-10 rounded-full border shadow-sm"
              />
            )}
            <Icon size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
