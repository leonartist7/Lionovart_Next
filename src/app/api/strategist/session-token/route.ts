import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { mintToken } from "@root/ws-auth";
import { rateLimitOk } from "@/lib/rate-limit";

const WS_TOKEN_TTL_MS = 120_000;
// 50 min — covers the 45 min session cap (useStrategistSession.ts SESSION_LIMIT_MS)
// plus headroom for the reconnect flow to keep using the same tool token.
const TOOL_TOKEN_TTL_MS = 50 * 60 * 1000;

/**
 * Mints two short-lived HMAC tokens off the same NOVA_WS_SECRET:
 *  - `token`: appended to the WS URL (`?t=<token>`) so server.js / ws-dev.js
 *    can authenticate the upgrade before proxying to Gemini Live.
 *  - `toolToken`: sent as `Authorization: Bearer <toolToken>` on every
 *    /api/strategist/tool call, bound to this conversationId so a token
 *    minted for one session can't be replayed against another.
 * Both: `${base64url(payload)}.${hmacSha256}`.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let conversationId: string | undefined;
  try {
    ({ conversationId } = await req.json());
  } catch {
    // Body is optional — the WS token doesn't need it.
  }

  const secret = process.env.NOVA_WS_SECRET;
  if (!secret) {
    // Graceful degradation: no secret configured (e.g. local dev without it
    // set) — the WS proxy and the tool route both allow unauthenticated
    // requests in this case (see server.js and api/strategist/tool/route.ts).
    return NextResponse.json({ token: null, toolToken: null });
  }

  const token = mintToken({ sid: crypto.randomUUID(), ip }, secret, WS_TOKEN_TTL_MS);
  const toolToken = conversationId ? mintToken({ cid: conversationId }, secret, TOOL_TOKEN_TTL_MS) : null;

  return NextResponse.json({ token, toolToken });
}
