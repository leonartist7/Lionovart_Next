"use client";

import { useSyncExternalStore } from "react";

export const dataConnection = () => (navigator as Navigator & {
  connection?: EventTarget & { saveData?: boolean };
}).connection;
const subscribe = (notify: () => void) => {
  const network = dataConnection();
  network?.addEventListener("change", notify);
  return () => network?.removeEventListener("change", notify);
};
const getSnapshot = () => !!dataConnection()?.saveData;
const getServerSnapshot = () => false;

/** Unsupported browsers keep the normal experience; this is an explicit preference. */
export function useSaveData() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
