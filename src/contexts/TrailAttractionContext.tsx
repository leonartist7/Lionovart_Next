"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export type TrailAttractionMode = "magnetic-wrap" | "slingshot";

type TrailTargetListener = (target: HTMLElement | null) => void;

type TrailAttractionController = {
  mode: TrailAttractionMode;
  getTarget: () => HTMLElement | null;
  registerTarget: (target: HTMLElement | null) => () => void;
  subscribeTarget: (listener: TrailTargetListener) => () => void;
};

const TrailAttractionContext = createContext<TrailAttractionController | null>(
  null,
);

export function TrailAttractionProvider({
  children,
  mode = "magnetic-wrap",
}: {
  children: ReactNode;
  mode?: TrailAttractionMode;
}) {
  const targetRef = useRef<HTMLElement | null>(null);
  const listenersRef = useRef(new Set<TrailTargetListener>());

  const notify = useCallback((target: HTMLElement | null) => {
    targetRef.current = target;
    listenersRef.current.forEach((listener) => listener(target));
  }, []);

  const registerTarget = useCallback(
    (target: HTMLElement | null) => {
      notify(target);

      return () => {
        if (targetRef.current === target) notify(null);
      };
    },
    [notify],
  );

  const getTarget = useCallback(() => targetRef.current, []);

  const subscribeTarget = useCallback((listener: TrailTargetListener) => {
    listenersRef.current.add(listener);
    listener(targetRef.current);
    return () => listenersRef.current.delete(listener);
  }, []);

  const value = useMemo(
    () => ({ mode, getTarget, registerTarget, subscribeTarget }),
    [getTarget, mode, registerTarget, subscribeTarget],
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
