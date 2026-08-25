"use client";

/**
 * Lightweight, first-visit brand reveal.
 *
 * The loader deliberately uses only CSS opacity/transform animations. There is
 * no counter, SVG path animation, blur, gradient, canvas, or animation library
 * running while the page prepares behind it.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";

const SESSION_KEY = "lionovart_splash_seen";
const SPLASH_COMPLETE_EVENT = "lionovart:splash-complete";
const REVEAL_DURATION_MS = 840;
const EXIT_DURATION_MS = 150;

export default function SplashScreen() {
  // Render the overlay in the server HTML so page content can never flash first.
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const completedRef = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenis = useLenis() as any;

  const signalSplashComplete = useCallback(() => {
    document.documentElement.dataset.splashComplete = "true";
    window.dispatchEvent(new Event(SPLASH_COMPLETE_EVENT));
  }, []);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    sessionStorage.setItem(SESSION_KEY, "1");
    document.body.style.overflow = "";
    if (lenis?.start) lenis.start();
    setVisible(false);
    signalSplashComplete();
  }, [lenis, signalSplashComplete]);

  const dismiss = useCallback(() => {
    if (visible !== true || exiting) return;
    if (reducedMotion) {
      finish();
      return;
    }
    setExiting(true);
    window.setTimeout(finish, EXIT_DURATION_MS + 80);
  }, [exiting, finish, reducedMotion, visible]);

  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (seen) {
      const readyFrame = window.requestAnimationFrame(() => {
        setVisible(false);
        signalSplashComplete();
      });
      return () => window.cancelAnimationFrame(readyFrame);
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousOverflow = document.body.style.overflow;
    const visibleFrame = window.requestAnimationFrame(() => {
      setReducedMotion(reducedMotion);
      setVisible(true);
    });

    document.body.style.overflow = "hidden";
    if (lenis?.stop) lenis.stop();

    const exitTimer = window.setTimeout(() => {
      if (reducedMotion) {
        finish();
      } else {
        setExiting(true);
      }
    }, reducedMotion ? 450 : REVEAL_DURATION_MS);

    // Fallback only: the normal path completes on the overlay's transitionend.
    const safetyTimer = window.setTimeout(
      finish,
      (reducedMotion ? 450 : REVEAL_DURATION_MS + EXIT_DURATION_MS) + 500,
    );

    return () => {
      window.cancelAnimationFrame(visibleFrame);
      window.clearTimeout(exitTimer);
      window.clearTimeout(safetyTimer);
      document.body.style.overflow = previousOverflow;
      if (lenis?.start) lenis.start();
    };
  }, [finish, lenis, signalSplashComplete]);

  if (!visible) return null;

  return (
    <div
      className={`splash-screen${exiting ? " splash-screen--exit" : ""}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        background: "#e5192a",
        opacity: exiting ? 0 : 1,
        transition: "opacity 150ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onClick={dismiss}
      onTransitionEnd={(event) => {
        if (
          exiting &&
          event.target === event.currentTarget &&
          event.propertyName === "opacity"
        ) {
          finish();
        }
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes lionovart-splash-logo-reveal {
          from {
            opacity: 0;
            transform: translate3d(0, 14px, 0) scale(0.965);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes lionovart-splash-tagline-reveal {
          from {
            opacity: 0;
            transform: translate3d(0, 7px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
      <div
        className="splash-lockup"
        style={{
          display: "flex",
          width: "min(76vw, 480px)",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(1rem, 2.4vw, 1.35rem)",
          textAlign: "center",
        }}
      >
        <img
          className="splash-logo"
          src="/images/LOGO.svg"
          width="480"
          height="77"
          alt=""
          fetchPriority="high"
          decoding="sync"
          draggable="false"
          style={{
            opacity: 0,
            transform: "translate3d(0, 14px, 0) scale(0.965)",
            willChange: "opacity, transform",
            animation:
              "lionovart-splash-logo-reveal 600ms cubic-bezier(0.22, 1, 0.36, 1) 110ms forwards",
          }}
        />
        <p
          className="splash-tagline"
          style={{
            opacity: 0,
            transform: "translate3d(0, 7px, 0)",
            willChange: "opacity, transform",
            animation:
              "lionovart-splash-tagline-reveal 220ms cubic-bezier(0.22, 1, 0.36, 1) 600ms forwards",
          }}
        >
          The art of innovation
        </p>
      </div>
    </div>
  );
}
