import { LRUCache } from "lru-cache";

// Scrape results cached 24h — avoids re-fetching the same URL repeatedly
export const scrapeCache = new LRUCache<string, Record<string, unknown>>({
  max: 500,
  ttl: 1000 * 60 * 60 * 24,
});

// Lookup results cached 1h
export const lookupCache = new LRUCache<string, Record<string, unknown>>({
  max: 200,
  ttl: 1000 * 60 * 60,
});

// GMB/Places enrichment results cached 24h — rating/review-count data doesn't
// change minute to minute, no reason to re-query per conversation.
export const enrichmentCache = new LRUCache<string, Record<string, unknown>>({
  max: 500,
  ttl: 1000 * 60 * 60 * 24,
});
