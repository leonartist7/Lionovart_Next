import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt, STRATEGIST_TOOLS } from "@/lib/strategist-config";
import type { HistoryEntry } from "@/lib/strategist-config";

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
  req: NextRequest
): Promise<{ result: unknown; handoffEvent?: string }> {
  switch (name) {
    case "detect_user_location": {
      try {
        const ip =
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          req.headers.get("x-real-ip") ??
          "unknown";
        if (ip === "unknown" || ip.startsWith("127.") || ip.startsWith("::1")) {
          return { result: { country: "CA", city: "Unknown", ip } };
        }
        const geo = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: { "User-Agent": "LIONOVART/1.0" },
        }).then((r) => r.json());
        return { result: { country: geo.country_code, city: geo.city, ip } };
      } catch {
        return { result: { country: "unknown" } };
      }
    }

    case "save_lead_data": {
      // Fire-and-forget — lead saved asynchronously, don't block the stream
      try {
        const origin = req.headers.get("origin") ?? req.nextUrl.origin;
        fetch(`${origin}/api/strategist/lead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...args,
            user_agent: req.headers.get("user-agent") ?? "unknown",
            source: "ai_strategist",
          }),
        }).catch(() => {}); // intentional fire-and-forget
      } catch {}
      return {
        result: {
          saved: true,
          language_detected: (args.language_detected as string | undefined) ?? "en",
        },
      };
    }

    case "generate_whatsapp_link": {
      const number = process.env.WHATSAPP_NUMBER ?? "15878974772";
      const name = (args.name as string | undefined) ?? "there";
      const summary = (args.project_summary as string | undefined) ?? "";
      const text = encodeURIComponent(
        `Hi Leon, I'm ${name}. ${summary} — I'd love to continue our conversation.`
      );
      return { result: { url: `https://wa.me/${number}?text=${text}` } };
    }

    case "fetch_booking_link": {
      return {
        result: { url: process.env.BOOKING_URL ?? "https://calendar.app.google/" },
      };
    }

    case "show_handoff_cards": {
      // This one returns a special SSE event the client acts on
      return {
        result: { shown: true },
        handoffEvent: sseEvent({
          type: "handoff",
          whatsapp_url: args.whatsapp_url,
          booking_url: args.booking_url,
          summary_message: args.summary_message ?? "",
        }),
      };
    }

    default:
      return { result: { error: `Unknown function: ${name}` } };
  }
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
