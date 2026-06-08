"use client";

import { create } from "zustand";

export type NovaSource = "hero" | "orb" | "sticky" | "nav" | "offer";

interface NovaStore {
  isOpen: boolean;
  autoStart: boolean;
  source: NovaSource | null;
  openNova: (source: NovaSource, autoStart?: boolean) => void;
  closeNova: () => void;
}

export const useNovaStore = create<NovaStore>((set) => ({
  isOpen: false,
  autoStart: false,
  source: null,
  openNova: (source, autoStart = false) => set({ isOpen: true, source, autoStart }),
  closeNova: () => set({ isOpen: false, source: null, autoStart: false }),
}));
