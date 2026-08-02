"use client";

/**
 * PerfHud — dev-only on-page performance debugger.
 *
 * Renders ONLY when `process.env.NODE_ENV !== "production"` so the entire
 * component is dead-code-eliminated from production bundles.
 *
 * Shows live FPS, max frame-time in the last second, and the count of
 * active GSAP ScrollTriggers. Three live toggles let you A/B suspects
 * without reloading:
 *
 *   • no-bdblur  → adds body.no-bdblur, which neutralizes every
 *                  backdrop-filter / backdrop-blur on the page.
 *   • no-scrubs  → calls ScrollTrigger.disable() to disable ALL triggers.
 *                  Use the "↻" button (or hard-reload) to restore them
 *                  cleanly — there is no granular per-trigger restore.
 *   • no-herobg  → adds body.no-herobg, which hides the hero background
 *                  div (the css-background-image layer in HeroRevealWrapper).
 *
 * Read FPS + max-frame-ms while scrolling. The toggle whose flip causes
 * FPS to jump and max-frame-ms to drop is the root cause.
 */

import { useEffect, useRef, useState } from "react";

const IS_DEV = process.env.NODE_ENV !== "production";

const STORAGE_KEY = "lionovart_perfhud_state_v1";

type PerfState = {
  noBdblur: boolean;
  noHeroBg: boolean;
  noScrubs: boolean;
};

const defaultState: PerfState = {
  noBdblur: false,
  noHeroBg: false,
  noScrubs: false,
};

function loadState(): PerfState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function saveState(s: PerfState) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export default function PerfHud() {
  // Hard early-out for prod; the entire body of this component never
  // executes in a production build because IS_DEV is false at build time.
  if (!IS_DEV) return null;
  return <PerfHudInner />;
}

function PerfHudInner() {
  const [collapsed, setCollapsed] = useState(false);
  const [state, setState] = useState<PerfState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  // Live readouts (updated 4×/sec to avoid React thrash)
  const [fps, setFps] = useState(0);
  const [maxMs, setMaxMs] = useState(0);
  const [stCount, setStCount] = useState(0);

  // RAF + sampling refs (no state updates from RAF — that would defeat the point)
  const lastTimeRef = useRef<number>(0);
  const frameTimesRef = useRef<number[]>([]); // ms per frame, ring of ~120
  const rafRef = useRef<number>(0);

  /* ── Restore toggles from session on mount ─────────────────────────── */
  useEffect(() => {
    const s = loadState();
    // Session storage is deliberately read only after client hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(s);
    setHydrated(true);
  }, []);

  /* ── Apply / unapply toggles whenever state changes ────────────────── */
  useEffect(() => {
    if (!hydrated) return;

    document.body.classList.toggle("no-bdblur", state.noBdblur);
    document.body.classList.toggle("no-herobg", state.noHeroBg);

    if (state.noScrubs) {
      // Lazy-import GSAP only on demand. Disables ALL ScrollTriggers.
      // ScrollTrigger.enable() restores them.
      import("gsap/ScrollTrigger").then(({ default: ST }) => {
        try {
          ST.disable(false, false);
        } catch {
          /* ignore */
        }
      });
    } else {
      import("gsap/ScrollTrigger").then(({ default: ST }) => {
        try {
          ST.enable();
        } catch {
          /* ignore */
        }
      });
    }

    saveState(state);
  }, [state, hydrated]);

  /* ── FPS / frame-time sampling loop ────────────────────────────────── */
  useEffect(() => {
    let alive = true;

    const tick = (now: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = now;
        if (alive) rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;
      const arr = frameTimesRef.current;
      arr.push(dt);
      if (arr.length > 120) arr.shift();
      if (alive) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Sample readouts at 4Hz — does NOT count against the page's RAF budget
    const sampleId = window.setInterval(() => {
      const arr = frameTimesRef.current;
      if (arr.length === 0) return;
      // Take only the latest ~60 frames for a "last-second" readout
      const recent = arr.slice(-60);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const max = recent.reduce((a, b) => (b > a ? b : a), 0);
      setFps(Math.round(1000 / avg));
      setMaxMs(Math.round(max));

      // ScrollTrigger count — best-effort, no error if GSAP isn't loaded
      import("gsap/ScrollTrigger")
        .then(({ default: ST }) => {
          try {
            setStCount(ST.getAll().length);
          } catch {
            /* ignore */
          }
        })
        .catch(() => {});
    }, 250);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      window.clearInterval(sampleId);
    };
  }, []);

  if (!hydrated) return null;

  const fpsColor = fps >= 50 ? "#7ee787" : fps >= 30 ? "#f0c917" : "#ff6b6b";
  const maxColor = maxMs <= 20 ? "#7ee787" : maxMs <= 40 ? "#f0c917" : "#ff6b6b";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        zIndex: 99999,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        lineHeight: 1.3,
        color: "white",
        background: "rgba(0,0,0,0.78)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        padding: collapsed ? "4px 8px" : "8px 10px",
        userSelect: "none",
        pointerEvents: "auto",
        boxShadow: "0 8px 24px -8px rgba(0,0,0,0.5)",
        minWidth: collapsed ? "auto" : 220,
      }}
    >
      {/* Header — readouts + collapse */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span>
          <span style={{ opacity: 0.55 }}>fps </span>
          <span style={{ color: fpsColor, fontWeight: 700 }}>{fps || "—"}</span>
        </span>
        <span>
          <span style={{ opacity: 0.55 }}>max </span>
          <span style={{ color: maxColor, fontWeight: 700 }}>{maxMs || "—"}</span>
          <span style={{ opacity: 0.45 }}>ms</span>
        </span>
        <span>
          <span style={{ opacity: 0.55 }}>ST </span>
          <span style={{ fontWeight: 700 }}>{stCount}</span>
        </span>
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand HUD" : "Collapse HUD"}
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
            borderRadius: 4,
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 11,
            padding: 0,
          }}
        >
          {collapsed ? "+" : "−"}
        </button>
      </div>

      {/* Toggles */}
      {!collapsed && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
          <Toggle
            label="no backdrop-blur"
            on={state.noBdblur}
            onChange={(v) => setState((s) => ({ ...s, noBdblur: v }))}
          />
          <Toggle
            label="no ScrollTriggers"
            warn={state.noScrubs ? "↻ reload to fully restore" : undefined}
            on={state.noScrubs}
            onChange={(v) => setState((s) => ({ ...s, noScrubs: v }))}
          />
          <Toggle
            label="no hero bg image"
            on={state.noHeroBg}
            onChange={(v) => setState((s) => ({ ...s, noHeroBg: v }))}
          />
          <button
            onClick={() => {
              setState(defaultState);
              window.location.reload();
            }}
            style={{
              marginTop: 4,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              borderRadius: 4,
              padding: "3px 6px",
              fontSize: 10,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            reset + reload
          </button>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
  warn,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
  warn?: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        opacity: on ? 1 : 0.85,
      }}
    >
      <span
        style={{
          width: 22,
          height: 12,
          borderRadius: 999,
          background: on ? "#7ee787" : "rgba(255,255,255,0.18)",
          position: "relative",
          transition: "background 120ms",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 1,
            left: on ? 11 : 1,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "white",
            transition: "left 120ms",
          }}
        />
      </span>
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
        tabIndex={-1}
      />
      <span>{label}</span>
      {warn && (
        <span style={{ marginLeft: "auto", color: "#f0c917", fontSize: 9 }}>
          {warn}
        </span>
      )}
    </label>
  );
}
