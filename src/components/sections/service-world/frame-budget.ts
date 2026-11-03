/** Only consecutive animation frames belong in a frame-time budget; demand-render idle gaps do not. */
export class FrameBudget {
  private samples: number[] = [];
  private warmup = 0;
  private slow = 0;
  downgraded = false;

  record(interval: number | null) {
    if (interval === null || !Number.isFinite(interval) || interval <= 0) return;
    this.samples.push(interval);
    if (this.samples.length > 180) this.samples.shift();
    if (++this.warmup <= 90) return;
    this.slow = interval > 29 ? this.slow + 1 : Math.max(0, this.slow - 1);
    if (this.slow > 100) this.downgraded = true;
  }

  summary() {
    const sorted = [...this.samples].sort((a, b) => a - b);
    const percentile = (p: number) => sorted.length ? sorted[Math.ceil(sorted.length * p) - 1] : null;
    return { samples: sorted.length, p50: percentile(.5), p95: percentile(.95) };
  }
}
