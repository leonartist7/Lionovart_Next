import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface LeadBody {
  name?: string;
  contact?: string;
  contact_type?: "email" | "phone" | "whatsapp";
  project_summary?: string;
  language_detected?: string;
  urgency?: "low" | "medium" | "high";
  user_agent?: string;
  source?: string;
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

  const { name, contact, contact_type, project_summary, language_detected, urgency, user_agent, source } = body;

  if (!name || !contact) {
    return NextResponse.json({ error: "name and contact are required" }, { status: 400 });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    await adminDb.collection("leads").add({
      name,
      contact,
      contact_type: contact_type ?? "unknown",
      project_summary: project_summary ?? "",
      language: language_detected ?? "en",
      urgency: urgency ?? "medium",
      source: source ?? "ai_strategist",
      user_agent: user_agent ?? "unknown",
      ip,
      created_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ saved: true }, { status: 200 });
  } catch (err) {
    console.error("[lead route] Firestore write failed:", err);
    // Return 200 so the chat flow is not disrupted
    return NextResponse.json({ saved: false, error: "Write failed" }, { status: 200 });
  }
}
