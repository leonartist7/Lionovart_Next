"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

const IntroContext = createContext({ released: true, revealing: false, release: () => {}, revealHero: () => {} });

/** Outside the marketing layout, motion never waits for a splash that isn't mounted. */
export const useIntroLifecycle = () => useContext(IntroContext);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [released, setReleased] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const revealHero = useCallback(() => setRevealing(true), []);
  const release = useCallback(() => { setRevealing(false); setReleased(true); }, []);
  const value = useMemo(() => ({ released, revealing, release, revealHero }), [released, revealing, release, revealHero]);
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}
