"use client";

import { create } from "zustand";

export type NovaSource = "hero" | "orb" | "sticky" | "nav" | "offer";

interface NovaStore {
  isOpen: boolean;
  autoStart: boolean;
  source: NovaSource | null;
  /** Brand Score the visitor ran before opening Nova. Only the id travels —
   * Nova fetches the actual findings server-side, so the briefing she opens on
   * can't be shaped by the page. */
  scanId: string | null;
  openNova: (source: NovaSource, autoStart?: boolean, scanId?: string | null) => void;
  closeNova: () => void;
}

export const useNovaStore = create<NovaStore>((set) => ({
  isOpen: false,
  autoStart: false,
  source: null,
  scanId: null,
  openNova: (source, autoStart = false, scanId = null) => set({ isOpen: true, source, autoStart, scanId }),
  closeNova: () => set({ isOpen: false, source: null, autoStart: false, scanId: null }),
}));
