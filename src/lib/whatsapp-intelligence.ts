import "server-only";

import { GoogleGenAI } from "@google/genai";
import { LEAD_STAGES, type LeadStage, type WhatsAppIntelligence } from "@/lib/whatsapp-intelligence-shared";

type TranscriptEntry = { role: "user" | "agent"; text: string };

const ANALYSIS_SHAPE = `{
  "summary": "2-3 concise sentences",
  "stage": "new|qualifying|discovery|proposal|negotiating|won|lost|nurture",
  "intent": "plain-language primary intent",
  "sentiment": "positive|neutral|hesitant|negative",
  "urgency": "low|medium|high",
  "qualificationScore": 0,
  "opportunity": "best commercial or relationship opportunity",
  "objection": "main unresolved objection, or None detected",
  "nextBestAction": "one concrete action for Leonardo",
  "actionReason": "short explanation tied to evidence in the chat",
  "memory": ["stable fact worth remembering"],
  "tags": ["short-tag"],
  "suggestedReplies": [
    {"label":"Leonardo voice","text":"natural reply"},
    {"label":"Short","text":"short reply"},
    {"label":"Warm","text":"warm reply"}
  ]
}`;

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function stringList(value: unknown, limit: number) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, limit)
    : [];
}

function oneOf<T extends readonly string[]>(value: unknown, values: T, fallback: T[number]): T[number] {
  return typeof value === "string" && values.includes(value) ? (value as T[number]) : fallback;
}

function normalizeIntelligence(value: unknown): WhatsAppIntelligence | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const replies = Array.isArray(input.suggestedReplies)
    ? input.suggestedReplies.flatMap((reply) => {
        if (!reply || typeof reply !== "object") return [];
        const item = reply as Record<string, unknown>;
        if (typeof item.text !== "string" || !item.text.trim()) return [];
        return [{ label: text(item.label, "Suggested"), text: item.text.trim() }];
      }).slice(0, 3)
    : [];

  return {
    summary: text(input.summary, "Conversation analyzed."),
    stage: oneOf(input.stage, LEAD_STAGES, "new"),
    intent: text(input.intent, "Exploring LIONOVART"),
    sentiment: oneOf(input.sentiment, ["positive", "neutral", "hesitant", "negative"] as const, "neutral"),
    urgency: oneOf(input.urgency, ["low", "medium", "high"] as const, "medium"),
    qualificationScore: Math.max(0, Math.min(100, Math.round(Number(input.qualificationScore) || 0))),
    opportunity: text(input.opportunity, "Continue discovery and clarify the desired outcome."),
    objection: text(input.objection, "None detected"),
    nextBestAction: text(input.nextBestAction, "Ask one focused discovery question."),
    actionReason: text(input.actionReason, "More context is needed before recommending an offer."),
    memory: stringList(input.memory, 8),
    tags: stringList(input.tags, 6),
    suggestedReplies: replies,
  };
}

function fallbackIntelligence(transcript: TranscriptEntry[]): WhatsAppIntelligence {
  const userMessages = transcript.filter((entry) => entry.role === "user");
  const combined = userMessages.map((entry) => entry.text).join(" ").toLowerCase();
  const pricing = /price|cost|budget|expensive|cheap|quote/.test(combined);
  const urgent = /urgent|asap|this week|today|tomorrow|quickly/.test(combined);
  const buying = /book|call|start|ready|proposal|hire|move forward/.test(combined);
  const lastText = userMessages.at(-1)?.text || "Thanks for reaching out.";
  const stage: LeadStage = buying ? "discovery" : pricing ? "qualifying" : "new";
  const reply = pricing
    ? "Absolutely — I can point you in the right direction. Before I quote anything, what outcome matters most to you and what are you hoping to have ready first?"
    : `Thanks for sharing that. I want to make sure I understand the real goal behind it — what would a great result look like for you?`;

  return {
    summary: `The prospect’s latest message is: “${lastText.slice(0, 180)}”. More discovery is needed before matching them to the right LIONOVART offer.`,
    stage,
    intent: pricing ? "Understanding pricing and fit" : buying ? "Exploring next steps" : "Initial inquiry",
    sentiment: "neutral",
    urgency: urgent ? "high" : "medium",
    qualificationScore: Math.min(80, 25 + userMessages.length * 6 + (buying ? 20 : 0)),
    opportunity: "Clarify the desired outcome, deadline, and decision criteria before pitching.",
    objection: pricing ? "Price or budget sensitivity" : "None detected",
    nextBestAction: "Send one human discovery question that is easy to answer.",
    actionReason: "A focused question will create momentum and improve qualification without overwhelming the prospect.",
    memory: [],
    tags: [pricing ? "pricing" : "discovery", urgent ? "urgent" : "active"],
    suggestedReplies: [
      { label: "Leonardo voice", text: reply },
      { label: "Short", text: "Got it. What would the ideal result look like for you?" },
      { label: "Warm", text: "Thanks for sharing that with me. I’d love to understand the goal a little better — what would make this feel like a real win for you?" },
    ],
  };
}

export async function analyzeWhatsAppConversation({
  contactName,
  transcript,
  previous,
}: {
  contactName: string;
  transcript: TranscriptEntry[];
  previous?: WhatsAppIntelligence | null;
}): Promise<{ intelligence: WhatsAppIntelligence; provider: "gemini" | "local" }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || transcript.length === 0) {
    return { intelligence: fallbackIntelligence(transcript), provider: "local" };
  }

  const transcriptText = transcript
    .slice(-120)
    .map((entry) => `${entry.role === "user" ? contactName : "Leonardo"}: ${entry.text}`)
    .join("\n")
    .slice(0, 18_000);

  const prompt = `You are LIONOVART's private WhatsApp sales strategist. Analyze the full exchange for Leonardo, a sharp and warm creative founder. Be commercially useful, honest, and human.

Use FAST / CHEAP / EASY / WOW as an offer lens when relevant: look for a result that can feel faster, lower-friction, easier to understand, or notably more impressive. Never force all four and never make unsupported promises.

Leonardo's texting voice: concise, confident, warm, conversational, lightly informal, no corporate jargon, no fake urgency, no excessive punctuation, and never manipulative. Suggested replies must sound written specifically for this prospect. Do not invent facts.

CONTACT: ${contactName}
${previous ? `PREVIOUS MEMORY:\n${JSON.stringify(previous)}\n` : ""}
CONVERSATION:\n${transcriptText}

Return only valid JSON matching this exact shape:
${ANALYSIS_SHAPE}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });
    const parsed = normalizeIntelligence(JSON.parse(result.text || "{}"));
    if (parsed) return { intelligence: parsed, provider: "gemini" };
  } catch (error) {
    console.error("[whatsapp intelligence] Gemini analysis failed:", error);
  }

  return { intelligence: fallbackIntelligence(transcript), provider: "local" };
}

export async function rewriteWhatsAppMessage({
  roughIdea,
  contactName,
  transcript,
  intelligence,
}: {
  roughIdea: string;
  contactName: string;
  transcript: TranscriptEntry[];
  intelligence?: WhatsAppIntelligence | null;
}): Promise<{ text: string; provider: "gemini" | "local" }> {
  const cleanIdea = roughIdea.replace(/\s+/g, " ").trim();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { text: cleanIdea, provider: "local" };

  const recentContext = transcript.slice(-30).map((entry) => `${entry.role === "user" ? contactName : "Leonardo"}: ${entry.text}`).join("\n").slice(0, 9000);
  const prompt = `Rewrite Leonardo's rough WhatsApp idea into one ready-to-send message using the conversation context.

VOICE: concise, confident, warm, conversational, lightly informal. Keep his intent. No corporate jargon, fake urgency, manipulation, generic sales clichés, or excessive punctuation. Do not invent facts. Usually use 1-4 short sentences. Return only the final message.

CONTACT: ${contactName}
${intelligence ? `AWARENESS: ${JSON.stringify({ intent: intelligence.intent, stage: intelligence.stage, objection: intelligence.objection, nextBestAction: intelligence.nextBestAction })}` : ""}
RECENT CONVERSATION:
${recentContext}

ROUGH IDEA:
${cleanIdea}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const rewritten = result.text?.trim();
    if (rewritten) return { text: rewritten, provider: "gemini" };
  } catch (error) {
    console.error("[whatsapp intelligence] Voice rewrite failed:", error);
  }
  return { text: cleanIdea, provider: "local" };
}

export function parseStoredIntelligence(value: unknown): WhatsAppIntelligence | null {
  return normalizeIntelligence(value);
}
