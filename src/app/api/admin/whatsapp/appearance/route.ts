import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDb } from "@/lib/firebase-admin";
import { isWhatsAppAppearance } from "@/lib/whatsapp-appearance";

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!adminDb) {
    return NextResponse.json({ error: "Firestore is not configured" }, { status: 503 });
  }

  const body: unknown = await req.json();
  if (!isWhatsAppAppearance(body)) {
    return NextResponse.json(
      { error: "Choose a valid style and six-digit hexadecimal colors." },
      { status: 400 },
    );
  }

  await adminDb.collection("console_settings").doc("whatsapp_appearance").set(
    {
      ...body,
      updated_at: FieldValue.serverTimestamp(),
      updated_by: session.email,
    },
    { merge: true },
  );

  return NextResponse.json({ appearance: body });
}
