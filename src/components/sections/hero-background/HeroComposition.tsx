"use client";
import { createContext, useContext, useMemo, useState, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { DEFAULT_COMPOSITION, type Composition } from "./config";

const Context = createContext<{ composition: Composition; setComposition: Dispatch<SetStateAction<Composition>> } | null>(null);
export function HeroCompositionProvider({ children }: { children: ReactNode }) {
  const [composition, setComposition] = useState(DEFAULT_COMPOSITION);
  const value = useMemo(() => ({ composition, setComposition }), [composition]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useHeroComposition() {
  const context = useContext(Context);
  if (!context) throw new Error("Hero composition requires its provider.");
  return context;
}
