import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Tiny public config endpoint for client-side UI decisions that need to
 * read agent_config/live but can't go through /api/admin/* (unauthenticated
 * visitors, not the admin console). Currently just orb_engine — a harmless
 * enum, no auth needed. 60s in-memory cache, same TTL as the WS proxy's
 * config cache (nova-agent-config.js).
 */

const CACHE_TTL_MS = 60_000;
let cached: { orb_engine: string; cachedAt: number } | null = null;

export async function GET() {
  const now = Date.now();
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({ orb_engine: cached.orb_engine });
  }

  let orbEngine = "auto";
  if (adminDb) {
    try {
      const snap = await adminDb.collection("agent_config").doc("live").get();
      const data = snap.data();
      if (typeof data?.orb_engine === "string") orbEngine = data.orb_engine;
    } catch {
      // graceful degradation — default stays "auto"
    }
  }

  cached = { orb_engine: orbEngine, cachedAt: now };
  return NextResponse.json({ orb_engine: orbEngine });
}
