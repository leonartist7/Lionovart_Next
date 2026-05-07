// Token bucket per IP — 30 requests per 60s
const CAPACITY = 30;
const REFILL_RATE = 30 / 60; // tokens per second

const buckets = new Map<string, { tokens: number; lastRefill: number }>();

export function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip) ?? { tokens: CAPACITY, lastRefill: now };
  const elapsed = (now - b.lastRefill) / 1000;
  b.tokens = Math.min(CAPACITY, b.tokens + elapsed * REFILL_RATE);
  b.lastRefill = now;
  if (b.tokens < 1) {
    buckets.set(ip, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
}
