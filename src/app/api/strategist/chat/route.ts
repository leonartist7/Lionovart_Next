import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt, STRATEGIST_TOOLS } from "@/lib/strategist-config";
import type { HistoryEntry } from "@/lib/strategist-config";
import { executeServerTool } from "@/lib/strategist-tools";

/* ─── Types ──────────────────────────────────────────────────── */
interface ChatRequest {
  message: string;
  history: HistoryEntry[];
}

/* ─── SSE helper ─────────────────────────────────────────────── */
function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/* ─── Function execution ─────────────────────────────────────── */
async function executeFn(
  name: string,
  args: Record<string, unknown>,
  req: NextRequest,
): Promise<{ result: unknown; handoffEvent?: string }> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { body } = await executeServerTool(name, args, { ip });

  if (name === "show_handoff_cards") {
    return {
      result: body,
      handoffEvent: sseEvent({
        type: "handoff",
        whatsapp_url: args.whatsapp_url,
        booking_url: args.booking_url,
        summary_message: args.summary_message ?? "",
      }),
    };
  }

  return { result: body };
}

/* ─── Route Handler ──────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, history = [] } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });

  /* Build the SSE stream */
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (s: string) => controller.enqueue(new TextEncoder().encode(s));

      try {
        const chat = ai.chats.create({
          model,
          config: {
            systemInstruction: getSystemPrompt("en"),
            tools: STRATEGIST_TOOLS,
          },
          history,
        });

        /* Non-streaming send for reliable function call handling */
        let response = await chat.sendMessage({ message });

        /* Process function calls in a loop until no more */
        let safetyCounter = 0;
        while (safetyCounter++ < 5) {
          const fnCalls = response.functionCalls;
          if (!fnCalls || fnCalls.length === 0) break;

          const fnResponses: Array<{ name: string; response: unknown }> = [];

          for (const fnCall of fnCalls) {
            const fnName = fnCall.name ?? "";
            const fnArgs = (fnCall.args ?? {}) as Record<string, unknown>;

            enqueue(sseEvent({ type: "function_call", name: fnName, args: fnArgs }));

            const { result, handoffEvent } = await executeFn(fnName, fnArgs, req);

            if (handoffEvent) enqueue(handoffEvent);

            enqueue(sseEvent({ type: "function_result", name: fnName, result }));
            fnResponses.push({ name: fnName, response: result });
          }

          /* Send function responses back to the model */
          response = await chat.sendMessage({
            message: fnResponses.map((r) => ({
              functionResponse: { name: r.name, response: r.response },
            })) as Parameters<typeof chat.sendMessage>[0]["message"],
          });
        }

        /* Stream the final text response word-by-word for perceived streaming */
        const text = response.text ?? "";
        if (text) {
          const words = text.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = i === 0 ? words[i] : " " + words[i];
            enqueue(sseEvent({ type: "text", content: chunk }));
            // Small delay for natural streaming feel
            await new Promise((r) => setTimeout(r, 18));
          }
        }

        enqueue(sseEvent({ type: "done" }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        enqueue(sseEvent({ type: "error", message: msg }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
