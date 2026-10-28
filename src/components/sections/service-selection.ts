/** Latest intent wins, even if an earlier poster decode finishes after it. */
export function createSelectionGate<T>({ prepare, commit, fail, delay = 80 }: {
  prepare: (value: T) => Promise<unknown>;
  commit: (value: T) => void;
  fail: (value: T) => void;
  delay?: number;
}) {
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    request(value: T) {
      const ticket = ++generation;
      clearTimeout(timer);
      timer = setTimeout(() => {
        void prepare(value).then(() => {
          if (ticket === generation) commit(value);
        }, () => {
          if (ticket === generation) fail(value);
        });
      }, delay);
    },
    cancel() { generation++; clearTimeout(timer); },
  };
}

/** The nearest equivalent stop keeps 0↔2 moves to one third of a turn. */
export function nearestDialStop(current: number, selected: number, count = 3) {
  return selected + Math.round((current - selected) / count) * count;
}

/** Elliptical orbit; at rest the card positions exactly match the authored handoffs. */
export function dialOrbit(index: number, position: number) {
  const angle = (index - position) * Math.PI * 2 / 3;
  const depth = (1 - Math.cos(angle)) / 1.5;
  return { x: Math.sin(angle) / Math.sin(Math.PI * 2 / 3), depth, opacity: 1 - .52 * depth };
}
