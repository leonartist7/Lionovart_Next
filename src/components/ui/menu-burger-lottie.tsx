"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_BURGER_LOTTIE_SRC = "/images/menu-burger.lottie";

/**
 * Frame where the 3 dots are flat/level (mid-bob). The timeline (171 frames)
 * runs: lines → dots → dots bob (idle) → lines. Opening plays 0→PAUSE_FRAME
 * and holds; closing resumes PAUSE_FRAME→end (finishes the bob, settles into
 * lines). No markers in the asset — tune this value visually.
 */
const PAUSE_FRAME = 70;

type MenuBurgerLottieProps = {
  isOpen: boolean;
  onToggle: () => void;
  "aria-label"?: string;
  className?: string;
};

export function MenuBurgerLottie({
  isOpen,
  onToggle,
  "aria-label": ariaLabel = "Toggle menu",
  className,
}: MenuBurgerLottieProps) {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
  const [lottieReady, setLottieReady] = useState(false);
  /** Keeps icon animation in sync when `isOpen` changes without using this button (e.g. nav link). */
  const lastSyncedOpen = useRef(isOpen);
  const didSnapFrameOnReady = useRef(false);
  /** True while playing the open segment (0 → PAUSE_FRAME) so the frame listener knows to halt. */
  const openingRef = useRef(false);
  /** True while playing the close segment (PAUSE_FRAME → end) so `complete` resets to lines. */
  const closingRef = useRef(false);

  useEffect(() => {
    if (!dotLottie) {
      // The animation instance can be removed after it has been ready.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLottieReady(false);
      return;
    }
    const onLoad = () => setLottieReady(true);
    dotLottie.addEventListener("load", onLoad);
    if (dotLottie.isLoaded) setLottieReady(true);
    return () => dotLottie.removeEventListener("load", onLoad);
  }, [dotLottie]);

  /** If the menu opens before the first frame loads, snap the icon to match once. */
  useEffect(() => {
    if (!dotLottie?.isLoaded || !lottieReady || didSnapFrameOnReady.current) return;
    didSnapFrameOnReady.current = true;
    dotLottie.setFrame(isOpen ? PAUSE_FRAME : 0);
    dotLottie.pause();
  }, [dotLottie, lottieReady, isOpen]);

  /** Halt at the flat-dots frame when opening; reset to lines when the close segment completes. */
  useEffect(() => {
    if (!dotLottie) return;
    const onFrame = ({ currentFrame }: { currentFrame: number }) => {
      if (openingRef.current && currentFrame >= PAUSE_FRAME) {
        openingRef.current = false;
        dotLottie.setFrame(PAUSE_FRAME);
        dotLottie.pause();
      }
    };
    const onComplete = () => {
      if (closingRef.current) {
        closingRef.current = false;
        dotLottie.setFrame(0); // clean horizontal lines
        dotLottie.pause();
      }
    };
    dotLottie.addEventListener("frame", onFrame);
    dotLottie.addEventListener("complete", onComplete);
    return () => {
      dotLottie.removeEventListener("frame", onFrame);
      dotLottie.removeEventListener("complete", onComplete);
    };
  }, [dotLottie]);

  const runPlaybackForNextState = useCallback(
    (willBeOpen: boolean) => {
      const d = dotLottie;
      if (!d?.isLoaded) return;
      d.setLoop(false);
      d.setMode("forward");
      if (willBeOpen) {
        // Open: lines → flat dots, then the frame listener pauses at PAUSE_FRAME.
        closingRef.current = false;
        openingRef.current = true;
        d.setFrame(0);
        d.play();
      } else {
        // Close: finish the bob from the held frame → back to lines.
        openingRef.current = false;
        closingRef.current = true;
        d.play();
      }
    },
    [dotLottie]
  );

  /** Sync when isOpen changes from outside this button (e.g. a nav link closes the menu). */
  useEffect(() => {
    if (!dotLottie?.isLoaded || !lottieReady) return;
    if (lastSyncedOpen.current === isOpen) return;
    runPlaybackForNextState(isOpen);
    lastSyncedOpen.current = isOpen;
  }, [isOpen, dotLottie, lottieReady, runPlaybackForNextState]);

  const handleClick = () => {
    const nextOpen = !isOpen;
    runPlaybackForNextState(nextOpen);
    lastSyncedOpen.current = nextOpen;
    onToggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-label={ariaLabel}
      className={cn(
        "relative z-[60] flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-lg",
        "transition-transform duration-150 active:scale-90",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
        className
      )}
    >
      <span className="relative flex h-7 w-7 items-center justify-center sm:h-8 sm:w-8">
        {!lottieReady && (
          <Menu className="absolute h-6 w-6 text-white" aria-hidden />
        )}
        <DotLottieReact
          src={MENU_BURGER_LOTTIE_SRC}
          loop={false}
          autoplay={false}
          dotLottieRefCallback={setDotLottie}
          className={cn(
            "h-7 w-7 sm:h-8 sm:w-8",
            !lottieReady && "opacity-0",
            lottieReady && "opacity-100"
          )}
          layout={{ fit: "contain", align: [0.5, 0.5] }}
          renderConfig={{ autoResize: true }}
        />
      </span>
    </button>
  );
}
