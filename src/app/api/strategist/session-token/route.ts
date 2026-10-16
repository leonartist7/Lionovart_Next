import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { GoogleGenAI, Modality } from "@google/genai";
import { getAgentConfig, buildLiveConfig } from "@root/nova-agent-config";
import { mintToken } from "@root/ws-auth";
import { requireAdmin } from "@/lib/admin-auth";
import { readNovaSession } from "@/lib/nova-session-auth";
import { reserveLiveToken } from "@/lib/nova-live-quota";
import { isSameOriginRequest, liveTokenPolicy, NOVA_SESSION_MS, NOVA_TOOL_GRACE_MS, validLocale } from "@/lib/nova-live-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const headers = { "Cache-Control": "no-store, private", "Pragma": "no-cache" };
function failure(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers });
}

/** Vercel brokers a constrained credential; audio never passes through a function. */
export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) return failure("forbidden_origin", 403);
  const apiKey = process.env.GEMINI_API_KEY;
  const secret = process.env.NOVA_WS_SECRET;
  if (!apiKey || !secret || secret.length < 32) return failure("voice_not_configured", 503);

  let body;
  try { body = await req.json(); } catch { return failure("invalid_request", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return failure("invalid_request", 400);
  const { locale = "en", draft = false, resumptionHandle } = body;
  if (!validLocale(locale) || typeof draft !== "boolean" ||
      (resumptionHandle !== undefined && (typeof resumptionHandle !== "string" || resumptionHandle.length > 8192))) {
    return failure("invalid_request", 400);
  }

  const prior = readNovaSession(req);
  const isResume = !!resumptionHandle || !!req.headers.get("authorization");
  if (isResume && (!prior || prior.cid !== body.conversationId || prior.locale !== locale || prior.draft !== draft)) {
    return failure("unauthorized_resume", 401);
  }
  if (draft) {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return failure("unauthorized_draft", 401);
  }
  const now = Date.now();
  const startedAt = isResume ? prior!.startedAt : now;
  let policy;
  try { policy = liveTokenPolicy(now, startedAt); } catch { return failure("session_expired", 410); }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const quota = await reserveLiveToken(ip);
  if (quota !== "ok") return failure(quota === "limited" ? "rate_limited" : "quota_unavailable", quota === "limited" ? 429 : 503);

  const conversationId = isResume ? prior!.cid : randomUUID();
  try {
    const agent = await getAgentConfig(draft ? "draft" : "live");
    const { model, config, resolvedVoice } = buildLiveConfig({
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      sessionResumption: resumptionHandle ? { handle: resumptionHandle } : {},
    }, agent, locale, conversationId);
    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha", timeout: 20_000 } });
    const credential = await ai.authTokens.create({ config: {
      ...policy,
      liveConnectConstraints: { model, config },
      // Omitted lockAdditionalFields locks the entire server-built configuration.
    } });
    if (!credential.name?.startsWith("auth_tokens/")) throw new Error("invalid_credential");
    const toolToken = mintToken({ cid: conversationId, startedAt, locale, draft }, secret,
      startedAt + NOVA_SESSION_MS + NOVA_TOOL_GRACE_MS - Date.now());
    return NextResponse.json({
      transport: "gemini-direct", token: credential.name, toolToken, model,
      conversationId, startedAt, expiresAt: startedAt + NOVA_SESSION_MS, voice: resolvedVoice,
    }, { headers });
  } catch {
    // SDK errors may contain request details. Never serialize them or credentials.
    console.error("[nova-live] Live credential issuance failed");
    return failure("voice_provider_unavailable", 502);
  }
}
