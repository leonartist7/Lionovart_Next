import { NextRequest, NextResponse } from "next/server";
import { requireNovaConversation } from "@/lib/nova-session-auth";
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

  const denied = requireNovaConversation(req, conversation_id);
  if (denied) return denied;
  if (typeof name !== "string" || !args || typeof args !== "object" || Array.isArray(args)) {
    return NextResponse.json({ error: "invalid_tool_request" }, { status: 400 });
  }

  const { body: result, status } = await executeServerTool(name, args, {
    conversationId: conversation_id,
    distinctId: distinct_id,
    ip,
  });
  return NextResponse.json(result, status ? { status } : undefined);
}

export const runtime = "nodejs";
export const maxDuration = 60;
