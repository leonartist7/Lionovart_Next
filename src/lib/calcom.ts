import "server-only";
import { env } from "@/lib/env";

/**
 * Thin Cal.com API v2 client — availability + booking creation only.
 * No-ops gracefully (returns `available: false` / `booked: false`) when
 * CALCOM_API_KEY/CALCOM_EVENT_TYPE_ID aren't set, same pattern as every
 * other optional integration in this repo (enrich_business, Resend, etc.).
 *
 * Endpoint contracts (verified against Cal.com's public docs — the two
 * endpoints use DIFFERENT `cal-api-version` header values, easy to get
 * wrong):
 *   GET  /v2/slots    — cal-api-version: 2024-09-04
 *                        ?eventTypeId=&start=YYYY-MM-DD&end=YYYY-MM-DD&timeZone=
 *                        → { status, data: { "YYYY-MM-DD": [{ start: ISOString }] } }
 *   POST /v2/bookings — cal-api-version: 2024-08-13
 *                        body: { eventTypeId, start (ISO UTC), attendee: {name,email,timeZone}, metadata? }
 *                        → { status, data: { id, uid, start, end, status, ... } }
 */

const CALCOM_BASE = "https://api.cal.com/v2";

export interface CalcomSlot {
  start: string; // ISO 8601
}

export interface AvailabilityResult {
  available: boolean;
  slots: CalcomSlot[];
  reason?: "not_configured" | "api_error";
}

export interface BookingResult {
  booked: boolean;
  uid?: string;
  start?: string;
  manageUrl?: string;
  reason?: "not_configured" | "api_error";
  error?: string;
}

function isConfigured(): boolean {
  return Boolean(env.CALCOM_API_KEY && env.CALCOM_EVENT_TYPE_ID);
}

/** Next 7 days of availability, capped to the 3 earliest slots — a "spoken-friendly" list. */
export async function getAvailability(timeZone?: string): Promise<AvailabilityResult> {
  if (!isConfigured()) return { available: false, slots: [], reason: "not_configured" };

  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    eventTypeId: env.CALCOM_EVENT_TYPE_ID!,
    start: fmt(start),
    end: fmt(end),
  });
  if (timeZone) params.set("timeZone", timeZone);

  try {
    const res = await fetch(`${CALCOM_BASE}/slots?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${env.CALCOM_API_KEY}`,
        "cal-api-version": "2024-09-04",
      },
    });
    if (!res.ok) return { available: false, slots: [], reason: "api_error" };
    const json = await res.json();
    const byDate = (json?.data ?? {}) as Record<string, CalcomSlot[]>;
    const allSlots = Object.values(byDate).flat();
    return { available: allSlots.length > 0, slots: allSlots.slice(0, 3) };
  } catch (err) {
    console.error("[calcom] getAvailability failed:", err);
    return { available: false, slots: [], reason: "api_error" };
  }
}

export async function createBooking(args: {
  start: string;
  name: string;
  email: string;
  timeZone?: string;
  phone?: string;
  notes?: string;
}): Promise<BookingResult> {
  if (!isConfigured()) return { booked: false, reason: "not_configured" };

  try {
    const res = await fetch(`${CALCOM_BASE}/bookings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CALCOM_API_KEY}`,
        "cal-api-version": "2024-08-13",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventTypeId: Number(env.CALCOM_EVENT_TYPE_ID),
        start: args.start,
        attendee: {
          name: args.name,
          email: args.email,
          timeZone: args.timeZone || "UTC",
        },
        metadata: {
          ...(args.phone ? { phone: args.phone } : {}),
          ...(args.notes ? { notes: args.notes.slice(0, 500) } : {}),
        },
      }),
    });
    const json = await res.json();
    if (!res.ok || json?.status !== "success") {
      return { booked: false, reason: "api_error", error: json?.error?.message || `HTTP ${res.status}` };
    }
    const uid: string | undefined = json.data?.uid;
    return {
      booked: true,
      uid,
      start: json.data?.start,
      // Cal.com's stable public booking-confirmation page pattern — not an
      // explicit field in the create-booking response schema.
      manageUrl: uid ? `https://cal.com/booking/${uid}` : undefined,
    };
  } catch (err) {
    console.error("[calcom] createBooking failed:", err);
    return { booked: false, reason: "api_error", error: err instanceof Error ? err.message : String(err) };
  }
}
