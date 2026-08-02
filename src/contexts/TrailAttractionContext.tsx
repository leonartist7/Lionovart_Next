"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export type TrailAttractionMode = "edge-merge" | "slingshot";

type TargetListener = (targets: HTMLElement[]) => void;

type TrailAttractionController = {
  mode: TrailAttractionMode;
  getTargets: () => HTMLElement[];
  registerTarget: (target: HTMLElement) => () => void;
  subscribeTargets: (listener: TargetListener) => () => void;
};

const TrailAttractionContext = createContext<TrailAttractionController | null>(null);

export function TrailAttractionProvider({
  children,
  mode = "edge-merge",
}: {
  children: ReactNode;
  mode?: TrailAttractionMode;
}) {
  const targetsRef = useRef(new Set<HTMLElement>());
  const listenersRef = useRef(new Set<TargetListener>());

  const notify = useCallback(() => {
    const targets = Array.from(targetsRef.current);
    listenersRef.current.forEach((listener) => listener(targets));
  }, []);

  const registerTarget = useCallback(
    (target: HTMLElement) => {
      targetsRef.current.add(target);
      notify();

      return () => {
        target.style.transform = "";
        target.style.willChange = "";
        targetsRef.current.delete(target);
        notify();
      };
    },
    [notify],
  );

  const getTargets = useCallback(() => Array.from(targetsRef.current), []);

  const subscribeTargets = useCallback((listener: TargetListener) => {
    listenersRef.current.add(listener);
    listener(Array.from(targetsRef.current));
    return () => listenersRef.current.delete(listener);
  }, []);

  const value = useMemo(
    () => ({ mode, getTargets, registerTarget, subscribeTargets }),
    [getTargets, mode, registerTarget, subscribeTargets],
  );

  return (
    <TrailAttractionContext.Provider value={value}>
      {children}
    </TrailAttractionContext.Provider>
  );
}

export function useTrailAttraction() {
  return useContext(TrailAttractionContext);
}
