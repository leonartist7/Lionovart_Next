"use client";

import { create } from "zustand";

interface HeroImageState {
  images: string[];
  currentIndex: number;
  ready: boolean;
  init: () => Promise<void>;
  next: () => void;
  prev: () => void;
}

export const useHeroImageStore = create<HeroImageState>((set, get) => ({
  images: [],
  currentIndex: 0,
  ready: false,

  init: async () => {
    if (get().ready) return;
    try {
      const res = await fetch("/api/hero-images");
      const { images } = await res.json();
      set({ images, ready: true });
    } catch {
      set({ ready: true });
    }
  },

  next: () => {
    const { images, currentIndex } = get();
    if (!images.length) return;
    set({ currentIndex: (currentIndex + 1) % images.length });
  },

  prev: () => {
    const { images, currentIndex } = get();
    if (!images.length) return;
    set({ currentIndex: (currentIndex - 1 + images.length) % images.length });
  },
}));
