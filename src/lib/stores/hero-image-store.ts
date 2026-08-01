"use client";

import { create } from "zustand";

export interface HeroMedia {
  id: string;
  desktop: string;
  mobile: string | null;
  type: "image" | "video";
}

export interface FocalPoint {
  x: number; // 0–100 %
  y: number; // 0–100 %
}

const LS_KEY = "hero-focal-points";

function loadPositions(): Record<string, FocalPoint> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, FocalPoint>) : {};
  } catch {
    return {};
  }
}

function savePositions(positions: Record<string, FocalPoint>) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(positions));
  } catch {
    // ignore quota errors
  }
}

/**
 * Cloudinary-hosted hero videos. Merged into the cycler alongside any
 * local images discovered by /api/hero-images. Lets us preview heavy
 * video backgrounds without committing large files to the repo.
 */
const CLOUDINARY_MEDIA: HeroMedia[] = [
  {
    id: "footage-02",
    desktop: "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto/v1779845599/Footage_02_chsoa3.mp4",
    mobile: null,
    type: "video",
  },
  {
    id: "footage-05",
    desktop: "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto/v1779845553/Footage_05_yalbaj.mp4",
    mobile: null,
    type: "video",
  },
  {
    id: "footage-07",
    desktop: "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto/v1779845634/Footage_07_o3rfbu.mp4",
    mobile: null,
    type: "video",
  },
];

interface HeroImageState {
  images: HeroMedia[];
  currentIndex: number;
  ready: boolean;

  /** focal point per image id */
  positions: Record<string, FocalPoint>;

  /** whether the drag-to-set focal point overlay is active */
  pickerActive: boolean;

  init: () => Promise<void>;
  next: () => void;
  prev: () => void;
  setPosition: (id: string, x: number, y: number) => void;
  togglePicker: () => void;
}

export const useHeroImageStore = create<HeroImageState>((set, get) => ({
  images: [],
  currentIndex: 0,
  ready: false,
  positions: {},
  pickerActive: false,

  init: async () => {
    if (get().ready) return;
    try {
      const res = await fetch("/api/hero-images");
      const { images } = (await res.json()) as { images: HeroMedia[] };
      const positions = loadPositions();
      set({ images: [...images, ...CLOUDINARY_MEDIA], positions, ready: true });
    } catch {
      set({ images: [...CLOUDINARY_MEDIA], ready: true });
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

  setPosition: (id, x, y) => {
    const next = { ...get().positions, [id]: { x, y } };
    set({ positions: next });
    savePositions(next);
  },

  togglePicker: () => set((s) => ({ pickerActive: !s.pickerActive })),
}));
