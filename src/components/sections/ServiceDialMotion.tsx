'use client';

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue, type HTMLMotionProps } from 'framer-motion';
import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react';
import { dialOrbit, nearestDialStop } from './service-selection';

const DialContext = createContext<MotionValue<number> | null>(null);

/** One motion value drives cards, labels and reflected light; no render loop. */
export function ServiceDialMotion({ variant, reduced, children }: {
  variant: number; reduced: boolean; children: ReactNode;
}) {
  const position = useMotionValue(variant);
  useLayoutEffect(() => {
    if (reduced) {
      position.set(variant);
      return;
    }
    const animation = animate(position, nearestDialStop(position.get(), variant), {
      duration: .9, ease: [.22, 1, .36, 1],
    });
    return () => animation.stop();
  }, [position, variant, reduced]);
  return <DialContext.Provider value={position}>{children}</DialContext.Provider>;
}

export function ServiceOrbitCard({ index, className, position: selectedPosition, children }: {
  index: number; className: string; position: string; children: ReactNode;
}) {
  const position = useContext(DialContext)!;
  const x = useTransform(position, value => dialOrbit(index, value).x);
  const depth = useTransform(position, value => dialOrbit(index, value).depth);
  const opacity = useTransform(position, value => dialOrbit(index, value).opacity);
  return <motion.div className={className} data-orbit data-position={selectedPosition} data-exhibit-index={index}
    style={{ '--orbit-x': x, '--orbit-depth': depth, '--orbit-opacity': opacity } as HTMLMotionProps<'div'>['style']}>
    {children}
  </motion.div>;
}

export function ServiceDialOption({ index, label, selected, onSelect }: {
  index: number; label: string; selected: boolean; onSelect: () => void;
}) {
  const position = useContext(DialContext)!;
  const reduced = useReducedMotion();
  const x = useTransform(position, value => `${dialOrbit(index, value).x * 106.25}%`);
  const y = useTransform(position, value => dialOrbit(index, value).depth * -20);
  const z = useTransform(position, value => dialOrbit(index, value).depth * -85);
  const rotateX = useTransform(position, value => dialOrbit(index, value).depth * 8);
  const rotateY = useTransform(position, value => dialOrbit(index, value).x * -8);
  const opacity = useTransform(position, value => 1 - dialOrbit(index, value).depth * .32);
  return <motion.button type="button" data-dial-option aria-label={label} aria-pressed={selected}
    style={{ x, y, z, rotateX, rotateY, opacity }} onClick={onSelect}>
    <AnimatePresence initial={false}>
      <motion.span key={label} aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: reduced ? .12 : .8, ease: [.22, 1, .36, 1] }}>{label}</motion.span>
    </AnimatePresence>
  </motion.button>;
}

export function ServiceDialLight({ index, background, className }: {
  index: number; background: string; className: string;
}) {
  const position = useContext(DialContext)!;
  const reduced = useReducedMotion();
  const opacity = useTransform(position, value => Math.max(0, 1 - dialOrbit(index, value).depth));
  return <motion.div className={className} data-orbit-light style={{ opacity }} animate={{ backgroundColor: background }} transition={{ duration: reduced ? .12 : .8, ease: [.22, 1, .36, 1] }} />;
}
