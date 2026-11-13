import "server-only";
import { adminDb } from "@/lib/firebase-admin";

/**
 * Read-only, server-side projection of the notification dispatch outbox.
 * This does not confirm mailbox delivery and never exposes provider errors,
 * raw recipient addresses, message bodies, subjects or authorization data.
 * Authorization is enforced by the Studio workspace page before invocation.
 */
export type DeliveryStatus = "sent" | "failed" | "unconfigured" | "throttled" | "unknown";
export interface DeliveryHistoryEntry {
  recipient: string;
  activity: "New file comment" | "File reply" | "Pinned file comment" | "File activity";
  status: DeliveryStatus;
  createdAt: string | null;
}
export interface DeliveryHistoryPage {
  entries: DeliveryHistoryEntry[];
  nextCursor?: string;
}
export const OUTBOX_PAGE_SIZE = 10;
export class InvalidOutboxCursor extends Error {}

function maskRecipient(value: unknown): string {
  if (typeof value !== "string" || value.length > 254) return "Recipient hidden";
  const email = value.trim().toLowerCase();
  const split = email.lastIndexOf("@");
  if (split < 1 || split === email.length - 1) return "Recipient hidden";
  const local = email.slice(0, split);
  const domain = email.slice(split + 1);
  if (!/^[a-z0-9.-]+$/.test(domain) || local.length > 64) return "Recipient hidden";
  return `${local[0]}***@${domain}`;
}

/** Explicit allowlist: never render free-form error, subject, or content. */
export function projectDeliveryHistory(value: unknown): DeliveryHistoryEntry {
  const data = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const status: DeliveryStatus =
    data.status === "sent" || data.status === "failed" ||
    data.status === "unconfigured" || data.status === "throttled"
      ? data.status : "unknown";
  const activity: DeliveryHistoryEntry["activity"] =
    data.kind === "pin" ? "Pinned file comment" :
    data.kind === "reply" ? "File reply" :
    data.kind === "thread" ? "New file comment" : "File activity";
  const date = typeof data.createdAt === "string" ? new Date(data.createdAt) : null;
  return {
    recipient: maskRecipient(data.recipientEmail),
    activity,
    status,
    createdAt: date && Number.isFinite(date.valueOf()) ? date.toISOString() : null,
  };
}

/**
 * Firestore snapshot cursor preserves ties where several recipients share
 * the same createdAt timestamp. The cursor is a same-workspace document ID,
 * never a credential or a cross-workspace reference.
 */
export async function listNotificationHistory(
  workspaceId: string,
  cursor?: string,
): Promise<DeliveryHistoryPage> {
  if (!adminDb) throw new Error("Workspace storage is unavailable");
  const collection = adminDb.collection("workspaces").doc(workspaceId).collection("notifications");
  let query = collection.orderBy("createdAt", "desc");
  if (cursor !== undefined) {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(cursor)) throw new InvalidOutboxCursor("Invalid history cursor");
    const anchor = await collection.doc(cursor).get();
    if (!anchor.exists) throw new InvalidOutboxCursor("History cursor no longer exists");
    query = query.startAfter(anchor);
  }
  const snapshot = await query.limit(OUTBOX_PAGE_SIZE + 1).get();
  const page = snapshot.docs.slice(0, OUTBOX_PAGE_SIZE);
  return {
    entries: page.map(doc => projectDeliveryHistory(doc.data())),
    ...(snapshot.docs.length > OUTBOX_PAGE_SIZE && page.length > 0
      ? { nextCursor: page[page.length - 1].id }
      : {}),
  };
}
