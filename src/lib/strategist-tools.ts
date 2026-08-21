import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { NOVA_KNOWLEDGE } from "@/lib/nova-knowledge";
import { scrapeWebsite } from "@/lib/scrape-website";
import { env } from "@/lib/env";
import { trackNovaServerEvent, hashUrl } from "@/lib/nova-events-server";
import { notifyLeadCaptured, notifyOwner } from "@/lib/notify";
import { toBriefing, type BrandScoreResult } from "@/lib/brand-score";
import { scrapeCache, enrichmentCache } from "@/lib/cache";
import { loadSkill } from "@/lib/nova-skills";
import { FieldValue } from "firebase-admin/firestore";
import { getAvailability, createBooking } from "@/lib/calcom";
import { sendSessionSummaryEmail } from "@/lib/email";
import { AGENT_CONFIG_DEFAULTS } from "@/lib/agent-config-schema";

/**
 * Single tool executor shared by the voice WS proxy path (tool/route.ts) and
 * the text-chat fallback (chat/route.ts). Add a new server tool by adding one
 * entry to `handlers` below.
 */

export interface ToolContext {
  conversationId?: string | null;
  distinctId?: string | null;
  ip?: string;
}

export interface ToolResult {
  body: Record<string, unknown>;
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolArgs = Record<string, any>;
type ToolHandler = (args: ToolArgs, ctx: ToolContext) => Promise<ToolResult> | ToolResult;

// booking_mode read, 60s cache — same TTL/pattern as nova-agent-config.js's
// live-config cache, avoids a Firestore read on every scheduling tool call.
let bookingModeCache: { mode: "calcom" | "link"; cachedAt: number } | null = null;
async function getBookingMode(): Promise<"calcom" | "link"> {
  const now = Date.now();
  if (bookingModeCache && now - bookingModeCache.cachedAt < 60_000) return bookingModeCache.mode;
  let mode: "calcom" | "link" = AGENT_CONFIG_DEFAULTS.booking_mode;
  if (adminDb) {
    try {
      const snap = await adminDb.collection("agent_config").doc("live").get();
      const val = snap.data()?.booking_mode;
      if (val === "calcom" || val === "link") mode = val;
    } catch {
      // falls back to default
    }
  }
  bookingModeCache = { mode, cachedAt: now };
  return mode;
}

/** "Tuesday, July 21 at 2:00 PM" — Nova reads this aloud verbatim, never does the date math herself. */
function formatSlotLabel(iso: string, timeZone?: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: timeZone || undefined,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Upserts booking/consent fields onto a lead matched by contact (email or phone). */
async function updateLeadByContact(contact: string, fields: Record<string, unknown>) {
  if (!adminDb || !contact) return;
  try {
    const snap = await adminDb.collection("leads").where("contact", "==", contact).limit(1).get();
    if (!snap.empty) await snap.docs[0].ref.update({ ...fields, updated_at: new Date().toISOString() });
  } catch (err) {
    console.error("updateLeadByContact error:", err);
  }
}

const handlers: Record<string, ToolHandler> = {
  // Deliberately shallow: `contact` is caller-supplied and unverified — a
  // visitor can simply say someone else's email. Returning that lead's
  // business snapshot, pains, or vision would hand a stranger's private
  // discovery notes to whoever types their contact info. First name only,
  // no dossier read. Full recall is a follow-up item gated behind a signed
  // per-lead link (proof of possession), not a typed string.
  async fetch_user_memory(args) {
    if (!adminDb) return { body: { memory: "No past memory (Firebase not configured)." } };
    const contact = args.contact;
    try {
      const snap = await adminDb.collection("leads").where("contact", "==", contact).limit(1).get();
      if (snap.empty) {
        return { body: { memory: "This is a new user." } };
      }
      const data = snap.docs[0].data();
      const firstName = (data.name || "").toString().trim().split(/\s+/)[0] || "there";
      return {
        body: {
          memory: `[USER_MEMORY] Returning visitor, first name: ${firstName}. Greet them warmly by name. Do not reference past projects, pains, or business details — this match is on contact info alone and isn't verified identity.`,
        },
      };
    } catch (err) {
      console.error("fetch_user_memory error:", err);
      return { body: { memory: "Error fetching memory." } };
    }
  },

  // The pre-warm. A visitor who ran a Brand Score before opening Nova has
  // already told us their site, their sector and their weakest pillar — so the
  // call opens on the finding rather than on "what do you do?".
  async fetch_brand_scan(args) {
    if (!adminDb) return { body: { found: false } };
    const scanId = (args.scan_id || "").toString().trim();
    if (!scanId) return { body: { found: false } };
    try {
      const snap = await adminDb.collection("brand_scans").doc(scanId).get();
      if (!snap.exists) return { body: { found: false } };
      const scan = snap.data() as BrandScoreResult;
      return {
        body: {
          found: true,
          briefing: `[BRAND_SCAN] ${toBriefing(scan)}\n\nOpen by naming the single most useful thing you saw — specifically, as an observation about their site, not as a score readout. Never recite the pillar numbers unless they ask. They have not told you any of this out loud, so do not imply they did.`,
        },
      };
    } catch (err) {
      console.error("fetch_brand_scan error:", err);
      return { body: { found: false } };
    }
  },

  async save_lead_data(args, ctx) {
    if (!adminDb) return { body: { saved: false } };
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
        conversation_id: ctx.conversationId ?? null,
        updated_at: new Date().toISOString(),
      };

      if (snap.empty) {
        await adminDb.collection("leads").add({ ...payload, created_at: new Date().toISOString() });
      } else {
        await snap.docs[0].ref.update(payload);
      }

      if (handoff_offered) {
        void notifyLeadCaptured(
          { name: leadName, phone, email, niche, vision },
          ctx.conversationId ?? null,
        );
      }

      return { body: { saved: true } };
    } catch (err) {
      console.error("save_lead_data error:", err);
      return {
        body: { saved: false, error: err instanceof Error ? err.message : String(err) },
      };
    }
  },

  generate_whatsapp_link(args) {
    const number = env.WHATSAPP_NUMBER;
    const leadName = args.name || "there";
    const summary = args.project_summary || "";
    const text = encodeURIComponent(
      `Hi Leon, I'm ${leadName}. ${summary} — I just spoke with Nova and I'd love to continue the conversation with you.`,
    );
    return { body: { url: `https://wa.me/${number}?text=${text}` } };
  },

  fetch_booking_link() {
    return { body: { url: env.BOOKING_URL } };
  },

  lookup_site_info(args) {
    const kind: string = (args.kind || "").toString().trim();
    const key: string = (args.key || "").toString().toLowerCase().trim();

    switch (kind) {
      case "service": {
        const svc = NOVA_KNOWLEDGE.services.find(
          (s) => s.id === key || s.title.toLowerCase().includes(key),
        );
        return {
          body: {
            result: svc
              ? `${svc.title} — ${svc.summary} Includes: ${svc.deliverables.join(", ")}.`
              : `Available services: ${NOVA_KNOWLEDGE.services.map((s) => s.id).join(", ")}.`,
          },
        };
      }
      case "niche": {
        const insights = NOVA_KNOWLEDGE.niche_insights as Record<string, string>;
        const match = Object.entries(insights).find(
          ([k]) => k !== "default" && (k === key || key.includes(k) || k.includes(key)),
        );
        return {
          body: {
            result: match ? match[1] : (insights.default ?? "Focus on positioning, brand consistency, and closing the gap between quality of work and how it shows up online."),
          },
        };
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
        return {
          body: {
            result: match ? match.a : NOVA_KNOWLEDGE.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n"),
          },
        };
      }
      case "philosophy":
        return { body: { result: Object.values(NOVA_KNOWLEDGE.philosophy).join(" ") } };
      case "value_bomb": {
        const idx = Math.floor(Math.random() * NOVA_KNOWLEDGE.value_bombs.length);
        return { body: { result: NOVA_KNOWLEDGE.value_bombs[idx] } };
      }
      case "call_offer":
        return { body: { result: NOVA_KNOWLEDGE.call_offer.description } };
      default:
        return { body: { result: `Unknown kind "${kind}". Use: service, niche, faq, philosophy, value_bomb, call_offer.` } };
    }
  },

  async scrape_website(args, ctx) {
    const url: string = args.url;
    if (!url) return { body: { error: "Missing url" }, status: 400 };
    const analyticsId = ctx.distinctId || ctx.conversationId || "anonymous";
    const urlHash = hashUrl(url);

    const cached = scrapeCache.get(urlHash);
    if (cached) {
      void trackNovaServerEvent("nova.scrape_succeeded", analyticsId, {
        url_hash: urlHash,
        cached: true,
        conversation_id: ctx.conversationId,
      });
      return { body: cached };
    }

    const scrapeStart = Date.now();
    void trackNovaServerEvent("nova.scrape_fired", analyticsId, { url_hash: urlHash, conversation_id: ctx.conversationId });
    try {
      const result = await scrapeWebsite(url);
      const durationMs = Date.now() - scrapeStart;
      scrapeCache.set(urlHash, result as unknown as Record<string, unknown>);
      void trackNovaServerEvent("nova.scrape_succeeded", analyticsId, {
        url_hash: urlHash,
        duration_ms: durationMs,
        services_detected_count: result.services_detected?.length ?? 0,
        conversation_id: ctx.conversationId,
      });
      return { body: result as unknown as Record<string, unknown> };
    } catch (err) {
      console.error("scrape_website error:", err);
      void trackNovaServerEvent("nova.scrape_failed", analyticsId, {
        url_hash: urlHash,
        reason: err instanceof Error ? err.message : String(err),
        conversation_id: ctx.conversationId,
      });
      return {
        body: {
          summary: `Couldn't read the site clearly from here — tell me about it in your own words.`,
          error: err instanceof Error ? err.message : String(err),
        },
      };
    }
  },

  show_handoff_cards() {
    return { body: { shown: true } };
  },

  load_skill(args) {
    return { body: loadSkill((args.skill_id || "").toString()) };
  },

  async check_availability(args) {
    const mode = await getBookingMode();
    if (mode !== "calcom") return { body: { available: false } };

    const timezone: string | undefined = args.timezone;
    const result = await getAvailability(timezone);
    if (!result.available) return { body: { available: false } };

    const slots = result.slots.map((s) => ({
      start: s.start,
      label: formatSlotLabel(s.start, timezone),
    }));
    return { body: { available: true, slots } };
  },

  async book_meeting(args, ctx) {
    const mode = await getBookingMode();
    if (mode !== "calcom") return { body: { booked: false } };

    const { start, name: leadName, email, phone, notes, timezone } = args;
    if (!start || !leadName || !email) {
      return { body: { booked: false, error: "Missing start, name, or email" }, status: 400 };
    }

    const result = await createBooking({ start, name: leadName, email, phone, notes, timeZone: timezone });
    if (result.booked) {
      void updateLeadByContact(email || phone || "", {
        booking: { uid: result.uid, start: result.start, confirmed: true },
        conversation_id: ctx.conversationId ?? null,
      });
      void notifyOwner({
        kind: "meeting_booked",
        leadName,
        email,
        whenLabel: formatSlotLabel(result.start!, timezone),
      });
    }
    return {
      body: result.booked
        ? { booked: true, start: result.start, manage_url: result.manageUrl, label: formatSlotLabel(result.start!, timezone) }
        : { booked: false },
    };
  },

  async send_follow_up_email(args, ctx) {
    const { email, name: leadName, summary } = args;
    if (!email || !leadName || !summary) return { body: { sent: false }, status: 400 };

    try {
      const sent = await sendSessionSummaryEmail({ toEmail: email, toName: leadName, summary, conversationId: ctx.conversationId ?? null });
      if (sent) void updateLeadByContact(email, { email_consent: true });
      return { body: { sent } };
    } catch (err) {
      console.error("send_follow_up_email error:", err);
      return { body: { sent: false } };
    }
  },

  // Silently flagged by the objections skill the moment Nova recognizes
  // which objection she's handling — precise, one tool call, no fragile
  // transcript text-matching. Powers the Console's objection-learning screen.
  async flag_objection(args, ctx) {
    const type = (args.type || "").toString();
    if (!adminDb || !ctx.conversationId) return { body: { flagged: false } };
    try {
      await adminDb
        .collection("conversations")
        .doc(ctx.conversationId)
        .set({ objection_flags: FieldValue.arrayUnion(type) }, { merge: true });
      return { body: { flagged: true } };
    } catch (err) {
      console.error("flag_objection error:", err);
      return { body: { flagged: false } };
    }
  },

  // GMB/Places lookup — public business data only (rating, review count,
  // category, hours). Cached 24h. No-ops gracefully with no API key, same
  // pattern as every other optional integration in this repo.
  async enrich_business(args) {
    const name: string = (args.name || "").toString().trim();
    if (!name) return { body: { error: "Missing name" }, status: 400 };
    const city: string = (args.city || "").toString().trim();

    const apiKey = env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) return { body: { available: false } };

    const cacheKey = `${name.toLowerCase()}|${city.toLowerCase()}`;
    const cached = enrichmentCache.get(cacheKey);
    if (cached) return { body: cached };

    try {
      const textQuery = city ? `${name}, ${city}` : name;
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.formattedAddress,places.currentOpeningHours.openNow",
        },
        body: JSON.stringify({ textQuery, maxResultCount: 1 }),
      });
      const data = await res.json();
      const place = data.places?.[0];
      if (!place) {
        const result = { available: true, found: false };
        enrichmentCache.set(cacheKey, result);
        return { body: result };
      }
      const result = {
        available: true,
        found: true,
        rating: place.rating ?? null,
        review_count: place.userRatingCount ?? null,
        category: place.primaryTypeDisplayName?.text ?? null,
        address: place.formattedAddress ?? null,
        open_now: place.currentOpeningHours?.openNow ?? null,
      };
      enrichmentCache.set(cacheKey, result);
      return { body: result };
    } catch (err) {
      console.error("enrich_business error:", err);
      return { body: { available: true, found: false, error: err instanceof Error ? err.message : String(err) } };
    }
  },
};

export async function executeServerTool(
  name: string,
  args: ToolArgs,
  ctx: ToolContext = {},
): Promise<ToolResult> {
  const handler = handlers[name];
  if (!handler) return { body: { error: "Unknown tool" }, status: 404 };
  return handler(args ?? {}, ctx);
}
