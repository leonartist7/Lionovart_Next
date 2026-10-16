import "server-only";
import { NextResponse } from "next/server";
import { verifyToken } from "@root/ws-auth";
import { validConversationId } from "./nova-live-policy";

export interface NovaSessionClaim {
  cid: string;
  startedAt: number;
  locale: string;
  draft: boolean;
}

export function readNovaSession(request: Request) {
  const secret = process.env.NOVA_WS_SECRET;
  const bearer = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  return secret ? verifyToken<NovaSessionClaim>(bearer, secret) : null;
}

export function requireNovaConversation(request: Request, conversationId: unknown) {
  if (!process.env.NOVA_WS_SECRET) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const claim = readNovaSession(request);
  if (!validConversationId(conversationId) || !claim || claim.cid !== conversationId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
