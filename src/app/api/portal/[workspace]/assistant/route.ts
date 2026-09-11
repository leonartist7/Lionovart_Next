import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requireWorkspace } from "@/lib/portal-auth";
import {
  PORTAL_ASSISTANT_SYSTEM_PROMPT,
  PORTAL_ASSISTANT_TOOLS,
  executePortalAssistantTool,
} from "@/lib/portal/assistant-tools";

type Params = { params: Promise<{ workspace: string }> };

interface HistoryEntry {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * POST — a read-only, tool-using assistant scoped to one workspace. Mirrors
 * `/api/strategist/chat`'s Gemini function-calling loop; see that route for
 * the pattern this copies.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  let body: { message?: string; history?: HistoryEntry[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The assistant isn't configured yet." }, { status: 500 });
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });
  const ctx = { workspaceId: access.workspace.id, viewerRole: access.membership.role };

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (s: string) => controller.enqueue(new TextEncoder().encode(s));

      try {
        const chat = ai.chats.create({
          model,
          config: { systemInstruction: PORTAL_ASSISTANT_SYSTEM_PROMPT, tools: PORTAL_ASSISTANT_TOOLS },
          history: body.history ?? [],
        });

        let response = await chat.sendMessage({ message });

        let safetyCounter = 0;
        while (safetyCounter++ < 5) {
          const calls = response.functionCalls;
          if (!calls || calls.length === 0) break;

          const results: Array<{ name: string; response: unknown }> = [];
          for (const call of calls) {
            const name = call.name ?? "";
            const args = (call.args ?? {}) as Record<string, unknown>;
            enqueue(sseEvent({ type: "function_call", name }));
            const result = await executePortalAssistantTool(name, args, ctx);
            results.push({ name, response: result });
          }

          response = await chat.sendMessage({
            message: results.map((r) => ({
              functionResponse: { name: r.name, response: r.response },
            })) as Parameters<typeof chat.sendMessage>[0]["message"],
          });
        }

        const text = response.text ?? "";
        if (text) {
          const words = text.split(" ");
          for (let i = 0; i < words.length; i++) {
            enqueue(sseEvent({ type: "text", content: i === 0 ? words[i] : " " + words[i] }));
            await new Promise((r) => setTimeout(r, 18));
          }
        }
        enqueue(sseEvent({ type: "done" }));
      } catch (err) {
        enqueue(sseEvent({ type: "error", message: err instanceof Error ? err.message : "Unknown error" }));
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
