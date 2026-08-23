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
const REVEAL_DURATION_MS = 1300;
const EXIT_DURATION_MS = 280;

export default function SplashScreen() {
  // Render the overlay in the server HTML so page content can never flash first.\n  const [visible, setVisible] = useState(true);
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
      <div className="splash-lockup">
        <img
          className="splash-logo"
          src="/images/LOGO.svg"
          width="480"
          height="77"
          alt=""
          fetchPriority="high"
          decoding="sync"
          draggable="false"
        />
        <p className="splash-tagline">The art of innovation</p>
      </div>
    </div>
  );
}
