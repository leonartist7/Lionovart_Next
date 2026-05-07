import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { NOVA_KNOWLEDGE } from "@/lib/nova-knowledge";
import { scrapeWebsite } from "@/lib/scrape-website";
import { env } from "@/lib/env";
import { trackNovaServerEvent, hashUrl } from "@/lib/nova-events-server";
import { notifyLeadCaptured } from "@/lib/notify";
import { scrapeCache } from "@/lib/cache";
import { rateLimitOk } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, args, conversation_id, distinct_id } = body;
  const analyticsId: string = distinct_id || conversation_id || "anonymous";

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

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
          handoff_offered,
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
          conversation_id: conversation_id ?? null,
          updated_at: new Date().toISOString(),
        };

        if (snap.empty) {
          await adminDb
            .collection("leads")
            .add({ ...payload, created_at: new Date().toISOString() });
        } else {
          await snap.docs[0].ref.update(payload);
        }

        if (handoff_offered) {
          void notifyLeadCaptured(
            { name: leadName, phone, email, niche, vision },
            conversation_id ?? null,
          );
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
      const number = env.WHATSAPP_NUMBER;
      const leadName = args.name || "there";
      const summary = args.project_summary || "";
      const text = encodeURIComponent(
        `Hi Leon, I'm ${leadName}. ${summary} — I just spoke with Nova and I'd love to continue the conversation with you.`,
      );
      return NextResponse.json({ url: `https://wa.me/${number}?text=${text}` });
    }

    case "fetch_booking_link": {
      return NextResponse.json({ url: env.BOOKING_URL });
    }

    case "lookup_site_info": {
      const kind: string = (args.kind || "").toString().trim();
      const key: string = (args.key || "").toString().toLowerCase().trim();

      switch (kind) {
        case "service": {
          const svc = NOVA_KNOWLEDGE.services.find(
            (s) => s.id === key || s.title.toLowerCase().includes(key),
          );
          return NextResponse.json({
            result: svc
              ? `${svc.title} — ${svc.summary} Includes: ${svc.deliverables.join(", ")}.`
              : `Available services: ${NOVA_KNOWLEDGE.services.map((s) => s.id).join(", ")}.`,
          });
        }
        case "niche": {
          const insights = NOVA_KNOWLEDGE.niche_insights as Record<string, string>;
          const match = Object.entries(insights).find(
            ([k]) => k !== "default" && (k === key || key.includes(k) || k.includes(key)),
          );
          return NextResponse.json({
            result: match ? match[1] : (insights.default ?? "Focus on positioning, brand consistency, and closing the gap between quality of work and how it shows up online."),
          });
        }
        case "faq": {
          const match = NOVA_KNOWLEDGE.faq.find(
            (f) =>
              f.q.toLowerCase().includes(key) ||
              (key.includes("price") && f.q.toLowerCase().includes("cost")) ||
              (key.includes("time") && f.q.toLowerCase().includes("long")) ||
              (key.includes("freelancer") && f.q.toLowerCase().includes("freelancer")) ||
              (key.includes("outsource") && f.q.toLowerCase().includes("overseas")),
          );
          return NextResponse.json({
            result: match ? match.a : NOVA_KNOWLEDGE.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n"),
          });
        }
        case "philosophy":
          return NextResponse.json({ result: Object.values(NOVA_KNOWLEDGE.philosophy).join(" ") });
        case "value_bomb": {
          const idx = Math.floor(Math.random() * NOVA_KNOWLEDGE.value_bombs.length);
          return NextResponse.json({ result: NOVA_KNOWLEDGE.value_bombs[idx] });
        }
        case "call_offer":
          return NextResponse.json({ result: NOVA_KNOWLEDGE.call_offer.description });
        default:
          return NextResponse.json({ result: `Unknown kind "${kind}". Use: service, niche, faq, philosophy, value_bomb, call_offer.` });
      }
    }

    case "scrape_website": {
      const url: string = args.url;
      if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
      const urlHash = hashUrl(url);

      const cached = scrapeCache.get(urlHash);
      if (cached) {
        void trackNovaServerEvent("nova.scrape_succeeded", analyticsId, { url_hash: urlHash, cached: true, conversation_id });
        return NextResponse.json(cached);
      }

      const scrapeStart = Date.now();
      void trackNovaServerEvent("nova.scrape_fired", analyticsId, { url_hash: urlHash, conversation_id });
      try {
        const result = await scrapeWebsite(url);
        const durationMs = Date.now() - scrapeStart;
        scrapeCache.set(urlHash, result as unknown as Record<string, unknown>);
        void trackNovaServerEvent("nova.scrape_succeeded", analyticsId, {
          url_hash: urlHash,
          duration_ms: durationMs,
          services_detected_count: result.services_detected?.length ?? 0,
          conversation_id,
        });
        return NextResponse.json(result);
      } catch (err) {
        console.error("scrape_website error:", err);
        void trackNovaServerEvent("nova.scrape_failed", analyticsId, {
          url_hash: urlHash,
          reason: err instanceof Error ? err.message : String(err),
          conversation_id,
        });
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
