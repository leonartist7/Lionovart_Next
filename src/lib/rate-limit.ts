import { LRUCache } from "lru-cache";

// Token bucket per IP — 30 requests per 60s
const CAPACITY = 30;
const REFILL_RATE = 30 / 60; // tokens per second

// Bucket TTL only needs to outlive a full refill cycle (60s at this rate) —
// 10 minutes gives generous margin for bursty legitimate traffic while
// still bounding memory instead of growing for the life of the instance.
const buckets = new LRUCache<string, { tokens: number; lastRefill: number }>({
  max: 5000,
  ttl: 1000 * 60 * 10,
});

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

// Brand scans run a live page fetch plus a Gemini Pro call — orders of
// magnitude more expensive than a tool call, so they get their own, far
// tighter bucket rather than sharing the 30/min one above.
const scanCounts = new LRUCache<string, number>({ max: 5000, ttl: 1000 * 60 * 60 });

export function scanRateLimitOk(ip: string, max = 5): boolean {
  const next = (scanCounts.get(ip) ?? 0) + 1;
  scanCounts.set(ip, next);
  return next <= max;
}
