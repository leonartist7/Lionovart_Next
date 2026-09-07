import "server-only";
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { getWhatsAppProvider } from "@/lib/portal/providers/whatsapp";
import type { PortalMessage, Workspace } from "@/lib/portal/types";

/**
 * The portal ⇄ WhatsApp bridge.
 *
 * A client's message already lands where the studio reads it — the portal —
 * so only an **agency reply** gets relayed out to WhatsApp, and only when the
 * workspace has a client number connected. This avoids the obvious bug of
 * echoing a client's own words back to their own phone. A client texting the
 * studio's WhatsApp number directly (bypassing the portal) arrives via the
 * inbound webhook and lands in the same thread.
 */

function messagesRef(workspaceId: string) {
  if (!adminDb) throw new Error("Firestore is not configured");
  return adminDb.collection("workspaces").doc(workspaceId).collection("messages");
}

/** No Storage emulator is wired up (see PORTAL_HANDOFF.md) — inbound media is skipped under it. */
function isEmulated(): boolean {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST);
}

function isStoragePath(value: string): boolean {
  return value.startsWith("portal/");
}

/**
 * `mediaUrl` on a message may be a storage path (inbound WhatsApp images we
 * downloaded ourselves) rather than a URL — resolved to a short-lived signed
 * read URL on every fetch, exactly like `assets.ts` does for thumbnails, so a
 * link handed out months ago never goes stale in a rendered page.
 */
async function resolveMediaUrl(value: string | undefined): Promise<string | undefined> {
  if (!value || !isStoragePath(value)) return value;
  if (!adminStorage) return undefined;
  const [url] = await adminStorage.bucket().file(value).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
  });
  return url;
}

export async function listMessages(workspaceId: string): Promise<PortalMessage[]> {
  if (!adminDb) return [];
  const snap = await messagesRef(workspaceId).orderBy("createdAt", "asc").get();
  const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PortalMessage);
  return Promise.all(
    messages.map(async (m) => (m.mediaUrl ? { ...m, mediaUrl: await resolveMediaUrl(m.mediaUrl) } : m)),
  );
}

export interface SendPortalMessageInput {
  authorUid: string;
  authorName: string;
  body: string;
  isAgency: boolean;
  /** The client's own WhatsApp number — absent means the bridge isn't set up yet. */
  whatsappNumber?: string;
}

export async function sendPortalMessage(
  workspaceId: string,
  input: SendPortalMessageInput,
): Promise<PortalMessage> {
  const now = new Date().toISOString();

  if (!input.isAgency || !input.whatsappNumber) {
    const doc: Omit<PortalMessage, "id"> = {
      channel: "portal",
      direction: input.isAgency ? "out" : "in",
      body: input.body,
      authorUid: input.authorUid,
      authorName: input.authorName,
      status: "sent",
      createdAt: now,
    };
    const ref = await messagesRef(workspaceId).add(doc);
    return { id: ref.id, ...doc };
  }

  const result = await getWhatsAppProvider().sendText(input.whatsappNumber, input.body);
  const doc: Omit<PortalMessage, "id"> = {
    channel: "whatsapp",
    direction: "out",
    body: input.body,
    authorUid: input.authorUid,
    authorName: input.authorName,
    status: result.ok ? "sent" : "failed",
    ...(result.ok ? { waMessageId: result.id } : { error: result.error }),
    createdAt: now,
  };
  const ref = await messagesRef(workspaceId).add(doc);
  return { id: ref.id, ...doc };
}

/** Maps an inbound webhook's `wa_id` back to the workspace it belongs to. */
export async function findWorkspaceByWhatsappNumber(waId: string): Promise<Workspace | null> {
  if (!adminDb) return null;
  const snap = await adminDb.collection("workspaces").where("whatsappNumber", "==", waId).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as Workspace;
}

/** Saves downloaded WhatsApp media into Storage and returns its path (not a URL — see `resolveMediaUrl`). */
export async function storeInboundMedia(
  workspaceId: string,
  waMessageId: string,
  bytes: Buffer,
  mimeType: string,
): Promise<string | null> {
  if (isEmulated() || !adminStorage) return null;
  const ext = mimeType.split("/")[1]?.split(";")[0] ?? "bin";
  const path = `portal/${workspaceId}/whatsapp/${waMessageId}.${ext}`;
  await adminStorage.bucket().file(path).save(bytes, { contentType: mimeType });
  return path;
}

export interface RecordInboundInput {
  body: string;
  waMessageId: string;
  mediaPath?: string | null;
}

/**
 * Records an inbound WhatsApp message. Keyed by `waMessageId` as the document
 * id so a webhook retry (Meta redelivers on anything but a fast 200) can
 * never create a duplicate row — `.create()` throws ALREADY_EXISTS the second
 * time, which is treated as "already recorded", not an error.
 */
export async function recordInboundWhatsapp(
  workspaceId: string,
  input: RecordInboundInput,
): Promise<PortalMessage | null> {
  const doc: Omit<PortalMessage, "id"> = {
    channel: "whatsapp",
    direction: "in",
    body: input.body,
    ...(input.mediaPath ? { mediaUrl: input.mediaPath } : {}),
    waMessageId: input.waMessageId,
    status: "delivered",
    createdAt: new Date().toISOString(),
  };

  const ref = messagesRef(workspaceId).doc(input.waMessageId);
  try {
    await ref.create(doc);
  } catch (err) {
    if ((err as { code?: number }).code === 6) return null; // ALREADY_EXISTS
    throw err;
  }
  return { id: ref.id, ...doc };
}
