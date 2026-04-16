import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, args } = body;

  switch (name) {
    case "fetch_user_memory": {
      if (!adminDb) return NextResponse.json({ memory: "No past memory (Firebase not configured)." });
      const contact = args.contact;
      try {
        const snap = await adminDb.collection("leads").where("contact", "==", contact).limit(1).get();
        if (snap.empty) {
          return NextResponse.json({ memory: "This is a new user." });
        }
        const data = snap.docs[0].data();
        return NextResponse.json({
          memory: `Returning user: ${data.name}. Past summary: ${data.project_summary}. Business type: ${data.business_type || "Unknown"}`
        });
      } catch (err) {
        console.error("fetch_user_memory error:", err);
        return NextResponse.json({ memory: "Error fetching memory." });
      }
    }
    case "save_lead_data": {
      if (!adminDb) return NextResponse.json({ saved: false });
      try {
        const { name, phone, email, project_summary, business_type } = args;
        const contact = phone || email || "unknown";
        
        // Upsert based on contact
        const snap = await adminDb.collection("leads").where("contact", "==", contact).limit(1).get();
        const payload = {
          name,
          contact,
          phone: phone || "",
          email: email || "",
          project_summary: project_summary || "",
          business_type: business_type || "",
          updated_at: new Date().toISOString()
        };

        if (snap.empty) {
          await adminDb.collection("leads").add({ ...payload, created_at: new Date().toISOString() });
        } else {
          await snap.docs[0].ref.update(payload);
        }
        return NextResponse.json({ saved: true });
      } catch (err) {
        console.error("save_lead_data error:", err);
        return NextResponse.json({ saved: false, error: err instanceof Error ? err.message : String(err) });
      }
    }
    case "generate_whatsapp_link": {
      const number = process.env.WHATSAPP_NUMBER || "15878974772";
      const leadName = args.name || "there";
      const summary = args.project_summary || "";
      const text = encodeURIComponent(`Hi Leon, I'm ${leadName}. ${summary} — I'd love to continue our conversation.`);
      return NextResponse.json({ url: `https://wa.me/${number}?text=${text}` });
    }
    case "fetch_booking_link": {
      return NextResponse.json({ url: process.env.BOOKING_URL || "https://calendar.app.google/YOUR_APPOINTMENT_SLUG" });
    }
    default:
      return NextResponse.json({ error: "Unknown tool" }, { status: 404 });
  }
}
