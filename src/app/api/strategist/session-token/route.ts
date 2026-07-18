import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { rateLimitOk } from "@/lib/rate-limit";

const TOKEN_TTL_MS = 120_000;

/**
 * Mints a short-lived HMAC token the client appends to the WS URL
 * (`?t=<token>`) so server.js / ws-dev.js can authenticate the upgrade
 * before proxying to Gemini Live. Token: `${base64url(payload)}.${hmacSha256}`.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const secret = process.env.NOVA_WS_SECRET;
  if (!secret) {
    // Graceful degradation: no secret configured (e.g. local dev without it
    // set) — the WS proxy allows unauthenticated connections in this case.
    return NextResponse.json({ token: null });
  }

  const payload = {
    sid: crypto.randomUUID(),
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
    ip,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");

  return NextResponse.json({ token: `${payloadB64}.${sig}` });
}
