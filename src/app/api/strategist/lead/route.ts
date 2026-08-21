import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { notifyLeadCaptured } from "@/lib/notify";
import { sendHeroLeadConfirmationEmail } from "@/lib/email";

interface LeadBody {
  name?: string;
  contact?: string;
  contact_type?: "email" | "phone" | "whatsapp";
  project_summary?: string;
  language_detected?: string;
  urgency?: "low" | "medium" | "high";
  user_agent?: string;
  source?: string;
  conversation_id?: string;
}

export async function POST(req: NextRequest) {
  // If Firebase Admin is not configured, accept silently (don't break the flow)
  if (!adminDb) {
    return NextResponse.json({ saved: false, reason: "Firebase not configured" }, { status: 200 });
  }

  let body: LeadBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, contact, contact_type, project_summary, language_detected, urgency, user_agent, source, conversation_id } = body;

  if (!name || !contact) {
    return NextResponse.json({ error: "name and contact are required" }, { status: 400 });
  }

  try {
    const now = new Date().toISOString();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const docRef = await adminDb.collection("leads").add({
      name,
      contact,
      contact_type: contact_type ?? "unknown",
      project_summary: project_summary ?? "",
      language: language_detected ?? "en",
      urgency: urgency ?? "medium",
      source: source ?? "ai_strategist",
      user_agent: user_agent ?? "unknown",
      conversation_id: conversation_id ?? null,
      ip,
      // ISO strings, not serverTimestamp: Firestore orders by value TYPE
      // before value, so a Timestamp here would sort into a separate block
      // from every other write path (Nova's save_lead_data, brand-score
      // claim), splitting the Console's list in two. Console leads list also
      // orders by updated_at, and Firestore drops docs missing the field
      // entirely from that query — so every write path must set it.
      created_at: now,
      updated_at: now,
    });

    void notifyLeadCaptured(
      {
        name,
        email: contact_type === "email" ? contact : undefined,
        phone: contact_type !== "email" ? contact : undefined,
      },
      conversation_id ?? null,
    );
    if (contact_type === "email") {
      void sendHeroLeadConfirmationEmail({ toEmail: contact });
    }

    return NextResponse.json({ saved: true, id: docRef.id }, { status: 200 });
  } catch (err) {
    console.error("[lead route] Firestore write failed:", err);
    // Return 200 so the chat flow is not disrupted
    return NextResponse.json({ saved: false, error: "Write failed" }, { status: 200 });
  }
}
