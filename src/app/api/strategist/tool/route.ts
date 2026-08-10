import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type ToolTokenPayload } from "@root/ws-auth";
import { executeServerTool } from "@/lib/strategist-tools";
import { rateLimitOk } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, args, conversation_id, distinct_id } = body;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const secret = process.env.NOVA_WS_SECRET;
  if (secret) {
    const bearer = req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
    const payload = verifyToken<ToolTokenPayload>(bearer, secret);
    if (!payload || payload.cid !== conversation_id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    // Fail closed in production if the secret was never configured — an
    // unset secret must not silently leave this endpoint wide open.
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  // Dev with no secret configured: allow, matching the WS proxy's graceful
  // degradation (session-token route returns toolToken: null in this case).

  const { body: result, status } = await executeServerTool(name, args, {
    conversationId: conversation_id,
    distinctId: distinct_id,
    ip,
  });
  return NextResponse.json(result, status ? { status } : undefined);
}
