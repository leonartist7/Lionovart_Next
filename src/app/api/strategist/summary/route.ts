import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { adminDb } from "@/lib/firebase-admin";
import { sendSessionSummaryEmail } from "@/lib/email";
import { rateLimitOk } from "@/lib/rate-limit";

interface SummaryRequest {
  conversation_id: string;
  email: string;
  name: string;
}

export async function POST(req: NextRequest) {
  let body: SummaryRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { conversation_id, email, name } = body;
  if (!conversation_id || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch transcript from Firestore
  let transcriptText = "";
  if (adminDb) {
    try {
      const doc = await adminDb.collection("conversations").doc(conversation_id).get();
      if (doc.exists) {
        const data = doc.data();
        const entries: Array<{ role: string; text: string }> = data?.transcript ?? [];
        transcriptText = entries
          .map((e) => `${e.role === "user" ? "User" : "Nova"}: ${e.text}`)
          .join("\n");
      }
    } catch (err) {
      console.error("[summary] Firestore fetch failed:", err);
    }
  }

  if (!transcriptText) {
    return NextResponse.json({ error: "No transcript found" }, { status: 404 });
  }

  // Generate summary with Gemini Flash
  const apiKey = process.env.GEMINI_API_KEY;
  let summary = "";
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Distill this NOVA strategy session into exactly 4 lines — no more, no less. Format:
1. Who they are (name, business, niche)
2. What they're building or trying to achieve
3. Their main blocker or pain point
4. The next step offered (call, WhatsApp, etc.)

Tone: warm, confident, human. No bullet points. No headers. Just 4 plain lines.

Transcript:
${transcriptText.slice(0, 8000)}`,
              },
            ],
          },
        ],
      });
      summary = result.text ?? "";
    } catch (err) {
      console.error("[summary] Gemini failed:", err);
    }
  }

  if (!summary) {
    summary = "Your strategy session has been saved. Leon will review the full transcript and reach out personally within 24 hours.";
  }

  await sendSessionSummaryEmail({ toEmail: email, toName: name || "there", summary, conversationId: conversation_id });

  return NextResponse.json({ ok: true });
}
