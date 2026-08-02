"use client";

import { createContext, useContext, type ReactNode } from "react";

export type LandingFlow = "standard" | "inverse";

const LandingFlowContext = createContext<LandingFlow>("standard");

export function LandingFlowProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: LandingFlow;
}) {
  return (
    <LandingFlowContext.Provider value={value}>
      {children}
    </LandingFlowContext.Provider>
  );
}

export function useLandingFlow() {
  return useContext(LandingFlowContext);
}

export function toLogicalProgress(flow: LandingFlow, rawProgress: number) {
  return flow === "inverse" ? 1 - rawProgress : rawProgress;
}
