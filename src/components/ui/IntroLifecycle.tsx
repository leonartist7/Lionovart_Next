"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

const IntroContext = createContext({ released: true, release: () => {} });

/** Outside the marketing layout, motion never waits for a splash that isn't mounted. */
export const useIntroLifecycle = () => useContext(IntroContext);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [released, setReleased] = useState(false);
  const release = useCallback(() => setReleased(true), []);
  const value = useMemo(() => ({ released, release }), [released, release]);
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}
