"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

/** Public asset — filename uses a space; encode for the URL. Rename to `menu-burger.lottie` and use `/images/menu-burger.lottie` if you prefer no spaces. */
const MENU_BURGER_LOTTIE_SRC = "/images/menu-burger.lottie";

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

  useEffect(() => {
    if (!dotLottie) {
      setLottieReady(false);
      return;
    }
    const onLoad = () => setLottieReady(true);
    dotLottie.addEventListener("load", onLoad);
    if (dotLottie.isLoaded) setLottieReady(true);
    return () => dotLottie.removeEventListener("load", onLoad);
  }, [dotLottie]);

  /** If the menu opens before the first frame loads, match the icon to the open state once. */
  useEffect(() => {
    if (!dotLottie?.isLoaded || !lottieReady || didSnapFrameOnReady.current) return;
    didSnapFrameOnReady.current = true;
    const tf = dotLottie.totalFrames;
    if (tf <= 0) return;
    dotLottie.setFrame(isOpen ? Math.max(0, tf - 1) : 0);
    dotLottie.pause();
  }, [dotLottie, lottieReady, isOpen]);

  const runPlaybackForNextState = useCallback(
    (willBeOpen: boolean) => {
      const d = dotLottie;
      if (!d?.isLoaded) return;
      d.setLoop(false);
      if (willBeOpen) {
        d.setMode("forward");
        d.setFrame(0);
        d.play();
      } else {
        d.setMode("reverse");
        d.play();
      }
    },
    [dotLottie]
  );

  useEffect(() => {
    if (!dotLottie?.isLoaded || !lottieReady) return;
    if (lastSyncedOpen.current === isOpen) return;
    if (!isOpen) {
      dotLottie.setMode("reverse");
      dotLottie.play();
    } else {
      dotLottie.setMode("forward");
      dotLottie.setFrame(0);
      dotLottie.play();
    }
    lastSyncedOpen.current = isOpen;
  }, [isOpen, dotLottie, lottieReady]);

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
