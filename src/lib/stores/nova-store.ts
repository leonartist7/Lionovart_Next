"use client";

import { create } from "zustand";

export type NovaSource = "hero" | "orb" | "sticky" | "nav" | "offer" | "roi" | "audit" | "call";

export type NovaIntake = { email: string; phone: string; website: string };

interface NovaStore {
  isOpen: boolean;
  autoStart: boolean;
  source: NovaSource | null;
  intake: NovaIntake | null;
  openNova: (source: NovaSource, autoStart?: boolean, intake?: NovaIntake) => void;
  closeNova: () => void;
}

export const useNovaStore = create<NovaStore>((set) => ({
  isOpen: false,
  autoStart: false,
  source: null,
  intake: null,
  openNova: (source, autoStart = false, intake) => set({ isOpen: true, source, autoStart, intake: intake ?? null }),
  closeNova: () => set({ isOpen: false, source: null, autoStart: false, intake: null }),
}));
