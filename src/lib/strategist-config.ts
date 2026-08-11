/**
 * The system prompt and tool declarations now live in `@root/nova-brain` (a
 * plain CJS module) so they're reachable from server.js/ws-dev.js — neither
 * runs through a TS/bundler pipeline — and so the browser is never the one
 * building them. Re-exported here so existing imports (`@/lib/strategist-config`)
 * keep working unchanged. This file otherwise keeps the shared UI/session
 * types that never belonged in the prompt/tools module.
 */
export type NovaLocale = "en" | "es" | "fr" | "it" | "ko";
export { getSystemPrompt, STRATEGIST_TOOLS } from "@root/nova-brain";

/* ─── Types shared across modules ───────────────────────────── */

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
}

export interface HandoffData {
  whatsappUrl: string;
  bookingUrl: string;
  summaryMessage?: string;
  bookingConfirmed?: boolean;
  bookingTimeLabel?: string;
}

export type SessionState = "idle" | "listening" | "thinking" | "speaking" | "handoff";

export type LeadFieldKey = "name" | "phone" | "email" | "website" | "business_type";

export interface HistoryEntry {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export type StreamEventType =
  | "text"
  | "function_call"
  | "function_result"
  | "handoff"
  | "done"
  | "error";

export interface StreamEvent {
  type: StreamEventType;
  content?: string;
  name?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  whatsapp_url?: string;
  booking_url?: string;
  summary_message?: string;
  message?: string;
}
