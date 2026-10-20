// Delivery budgets are hard gates. Timing remains advisory across CI hosts.
export const budgets = Object.freeze({ totalTransferBytes: 3_000_000, imageTransferBytes: 900_000, videoTransferBytes: 0 });
export function assessSummary(summary) {
  const failures = [], warnings = [];
  if (!summary?.runs?.length || !summary?.summaries?.length) return { failures: ['Missing Lighthouse runs or medians'], warnings };
  for (const run of summary.runs) {
    if (run.runtimeError) failures.push(`${run.url}: Lighthouse runtime error`);
    if (Number.isFinite(run.cls) && run.cls > 0.1) warnings.push(`${run.url}: single-run CLS=${run.cls} exceeds 0.1`);
  }
  for (const group of summary.summaries) {
    if (!Number.isInteger(group.validRuns) || group.validRuns < 3) failures.push(`${group.url}: at least three valid runs required`);
    for (const [metric, ceiling] of Object.entries(budgets)) {
      const value = group.median?.[metric];
      if (!Number.isFinite(value) || value < 0 || value > ceiling) failures.push(`${group.url}: ${metric}=${value}, ceiling=${ceiling}`);
    }
    for (const [metric, ceiling] of Object.entries({ lcpMs: 6500, tbtMs: 1300, cls: 0.1 })) {
      const value = group.median?.[metric];
      if (!Number.isFinite(value) || value > ceiling) warnings.push(`${group.url}: advisory ${metric}=${value}, target<=${ceiling}`);
    }
  }
  return { failures, warnings };
}
