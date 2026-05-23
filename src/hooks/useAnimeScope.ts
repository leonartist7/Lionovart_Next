"use client";

import { useEffect, useRef } from "react";
import { createScope, type Scope } from "animejs";

type ScopeFn = (scope: Scope) => void | (() => void);

/**
 * React 19 wrapper around anime.js `createScope`.
 * All animations declared inside `fn` are tracked by the scope and reverted
 * automatically when the component unmounts (no leaks, no stale tweens).
 */
export function useAnimeScope(
  fn: ScopeFn,
  deps: React.DependencyList = []
): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const scope = createScope({ root: ref.current }).add((self) => {
      if (self) fn(self);
    });
    return () => {
      scope.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
