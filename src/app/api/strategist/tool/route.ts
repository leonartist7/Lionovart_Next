import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { NOVA_KNOWLEDGE } from "@/lib/nova-knowledge";
import { scrapeWebsite } from "@/lib/scrape-website";

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
          memory: `[USER_MEMORY] Returning partner: ${data.name}. Last project: ${data.project_summary}. Business: ${data.business_type || "Unknown"}.`,
        });
      } catch (err) {
        console.error("fetch_user_memory error:", err);
        return NextResponse.json({ memory: "Error fetching memory." });
      }
    }

    case "save_lead_data": {
      if (!adminDb) return NextResponse.json({ saved: false });
      try {
        const {
          name: leadName,
          phone,
          email,
          website,
          project_summary,
          business_type,
          niche,
          current_marketing,
          painpoints,
          vision,
        } = args;
        const contact = phone || email || "unknown";

        // Upsert based on contact
        const snap = await adminDb
          .collection("leads")
          .where("contact", "==", contact)
          .limit(1)
          .get();
        const payload = {
          name: leadName,
          contact,
          phone: phone || "",
          email: email || "",
          website: website || "",
          project_summary: project_summary || "",
          business_type: business_type || "",
          niche: niche || "",
          current_marketing: current_marketing || "",
          painpoints: painpoints || "",
          vision: vision || "",
          updated_at: new Date().toISOString(),
        };

        if (snap.empty) {
          await adminDb
            .collection("leads")
            .add({ ...payload, created_at: new Date().toISOString() });
        } else {
          await snap.docs[0].ref.update(payload);
        }
        return NextResponse.json({ saved: true });
      } catch (err) {
        console.error("save_lead_data error:", err);
        return NextResponse.json({
          saved: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    case "generate_whatsapp_link": {
      const number = process.env.WHATSAPP_NUMBER || "15878974772";
      const leadName = args.name || "there";
      const summary = args.project_summary || "";
      const text = encodeURIComponent(
        `Hi Leon, I'm ${leadName}. ${summary} — I just spoke with Nova and I'd love to continue the conversation with you.`,
      );
      return NextResponse.json({ url: `https://wa.me/${number}?text=${text}` });
    }

    case "fetch_booking_link": {
      return NextResponse.json({
        url: process.env.BOOKING_URL || "https://calendar.app.google/YOUR_APPOINTMENT_SLUG",
      });
    }

    case "lookup_site_info": {
      const query: string = (args.query || "").toLowerCase().trim();
      if (!query) return NextResponse.json({ result: "" });

      // service:branding | service:web | ...
      if (query.startsWith("service:")) {
        const id = query.slice("service:".length);
        const svc = NOVA_KNOWLEDGE.services.find((s) => s.id === id || s.title.toLowerCase().includes(id));
        return NextResponse.json({
          result: svc
            ? `${svc.title} — ${svc.summary} Includes: ${svc.deliverables.join(", ")}.`
            : `No exact match for service "${id}". Available: ${NOVA_KNOWLEDGE.services.map((s) => s.id).join(", ")}.`,
        });
      }

      // niche:restaurant | niche:dentist | ...
      if (query.startsWith("niche:")) {
        const niche = query.slice("niche:".length).replace(/[^a-z]/g, "");
        const insights = NOVA_KNOWLEDGE.niche_insights;
        const match = Object.entries(insights).find(
          ([key]) => key === niche || niche.includes(key) || key.includes(niche),
        );
        return NextResponse.json({
          result: match
            ? match[1]
            : "No specific niche framing on file — speak generally about positioning, brand consistency, and the gap between quality of work and how it shows up online.",
        });
      }

      // faq:pricing | faq:timing | ...
      if (query.startsWith("faq:")) {
        const topic = query.slice("faq:".length);
        const match = NOVA_KNOWLEDGE.faq.find(
          (f) =>
            f.q.toLowerCase().includes(topic) ||
            topic.includes("price") && f.q.toLowerCase().includes("cost") ||
            topic.includes("cost") && f.q.toLowerCase().includes("cost") ||
            topic.includes("time") && f.q.toLowerCase().includes("long") ||
            topic.includes("freelancer") && f.q.toLowerCase().includes("freelancer") ||
            topic.includes("outsource") && f.q.toLowerCase().includes("overseas"),
        );
        return NextResponse.json({
          result: match ? match.a : NOVA_KNOWLEDGE.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n"),
        });
      }

      if (query === "philosophy") {
        return NextResponse.json({
          result: Object.values(NOVA_KNOWLEDGE.philosophy).join(" "),
        });
      }

      if (query === "value_bomb") {
        const idx = Math.floor(Math.random() * NOVA_KNOWLEDGE.value_bombs.length);
        return NextResponse.json({ result: NOVA_KNOWLEDGE.value_bombs[idx] });
      }

      if (query === "call_offer") {
        return NextResponse.json({ result: NOVA_KNOWLEDGE.call_offer.description });
      }

      return NextResponse.json({
        result: `No specific entry for "${query}". Try: service:<id>, niche:<keyword>, faq:<topic>, philosophy, value_bomb, call_offer.`,
      });
    }

    case "scrape_website": {
      const url: string = args.url;
      if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
      try {
        const result = await scrapeWebsite(url);
        return NextResponse.json(result);
      } catch (err) {
        console.error("scrape_website error:", err);
        return NextResponse.json({
          summary: `Couldn't read the site clearly from here — tell me about it in your own words.`,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    default:
      return NextResponse.json({ error: "Unknown tool" }, { status: 404 });
  }
}
