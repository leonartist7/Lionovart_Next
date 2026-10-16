import "server-only";
import { createHmac } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";
import { rateLimitOk } from "./rate-limit";

/** Shared issuance quota survives separate Vercel function instances. */
export async function reserveLiveToken(ip: string): Promise<"ok" | "limited" | "unavailable"> {
  if (!adminDb) {
    if (process.env.NODE_ENV === "production") return "unavailable";
    return rateLimitOk(`nova-live:${ip}`) ? "ok" : "limited";
  }
  const now = Date.now();
  const window = Math.floor(now / 600_000);
  const hash = createHmac("sha256", process.env.NOVA_WS_SECRET!).update(ip).digest("hex");
  const ref = adminDb.collection("nova_live_quota").doc(`${hash}_${window}`);
  try {
    return await adminDb.runTransaction(async transaction => {
      const existing = await transaction.get(ref);
      const count = Number(existing.data()?.count || 0);
      if (count >= 10) return "limited" as const;
      transaction.set(ref, { count: count + 1, expiresAt: Timestamp.fromMillis(now + 86_400_000) });
      return "ok" as const;
    });
  } catch {
    console.error("[nova-live] Shared quota store unavailable");
    return "unavailable";
  }
}
