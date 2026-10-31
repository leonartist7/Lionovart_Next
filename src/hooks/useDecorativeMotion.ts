'use client';

import { useSyncExternalStore } from 'react';
import { useHydratedReducedMotion } from './useHydratedReducedMotion';
import { useSaveData } from './useSaveData';

const subscribe = (notify: () => void) => {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
};
const getHidden = () => document.hidden;
const getServerHidden = () => true;

/** Decorative motion has no idle work outside its visible chapter. */
export function useDecorativeMotion(active: boolean) {
  const reduced = useHydratedReducedMotion();
  const saveData = useSaveData();
  const hidden = useSyncExternalStore(subscribe, getHidden, getServerHidden);
  const available = !reduced && !saveData;
  return { available, running: active && available && !hidden };
}
