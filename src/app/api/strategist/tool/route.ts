import { NextRequest, NextResponse } from "next/server";
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

  const { body: result, status } = await executeServerTool(name, args, {
    conversationId: conversation_id,
    distinctId: distinct_id,
    ip,
  });
  return NextResponse.json(result, status ? { status } : undefined);
}
