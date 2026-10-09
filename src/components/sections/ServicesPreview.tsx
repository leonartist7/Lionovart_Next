"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const storageKey = "lionovart:services-carousel-preview";
const changeEvent = "lionovart:services-preview-change";
const subscribe = (notify: () => void) => {
  window.addEventListener(changeEvent, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(changeEvent, notify);
    window.removeEventListener("storage", notify);
  };
};

/** Session-only A/B preview; the existing services remain the default. */
export function useServicesPreviewToggle() {
  const preview = useSyncExternalStore(subscribe, () => sessionStorage.getItem(storageKey) === "1", () => false);
  const togglePreview = () => {
    sessionStorage.setItem(storageKey, preview ? "0" : "1");
    window.dispatchEvent(new Event(changeEvent));
  };
  return { preview, togglePreview };
}

export const ServicesPreviewContext = createContext(false);
export const useServicesCarouselPreview = () => useContext(ServicesPreviewContext);
