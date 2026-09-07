import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Bridges portal messages to WhatsApp via Meta's Cloud API.
 *
 * `getWhatsAppProvider()` selects automatically: WHATSAPP_ACCESS_TOKEN +
 * WHATSAPP_PHONE_NUMBER_ID present → the live Cloud API driver; otherwise the
 * mock driver, which logs and reports success so the UI stays honest about
 * what actually happened rather than a stub-shaped hole (see
 * PORTAL_HANDOFF.md's adapter pattern).
 */

export type WhatsAppSendResult = { ok: true; id: string } | { ok: false; error: string };

export interface InboundMedia {
  bytes: Buffer;
  mimeType: string;
}

export interface WhatsAppProvider {
  sendText(to: string, body: string): Promise<WhatsAppSendResult>;
  sendImage(to: string, mediaUrl: string, caption?: string): Promise<WhatsAppSendResult>;
  /** Resolves an inbound webhook's media id to its bytes. Null when unavailable. */
  fetchInboundMedia(mediaId: string): Promise<InboundMedia | null>;
}

const GRAPH_VERSION = "v21.0";

class CloudApiProvider implements WhatsAppProvider {
  private async send(payload: Record<string, unknown>): Promise<WhatsAppSendResult> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!phoneNumberId || !token) {
      return { ok: false, error: "WhatsApp Cloud API is not configured." };
    }

    try {
      const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data?.error?.message ?? `WhatsApp API error ${res.status}` };
      }
      return { ok: true, id: data.messages?.[0]?.id ?? "" };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Network error" };
    }
  }

  sendText(to: string, body: string) {
    return this.send({ to, type: "text", text: { body } });
  }

  sendImage(to: string, mediaUrl: string, caption?: string) {
    return this.send({ to, type: "image", image: { link: mediaUrl, ...(caption ? { caption } : {}) } });
  }

  /**
   * Media arrives as an opaque id in the webhook payload, not a URL — it takes
   * two calls: resolve the id to a short-lived CDN URL, then fetch it, both
   * authenticated with the same bearer token.
   */
  async fetchInboundMedia(mediaId: string): Promise<InboundMedia | null> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!token) return null;

    try {
      const meta = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meta.ok) return null;
      const { url, mime_type: mimeType } = await meta.json();
      if (!url) return null;

      const file = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!file.ok) return null;
      const bytes = Buffer.from(await file.arrayBuffer());
      return { bytes, mimeType: mimeType ?? "application/octet-stream" };
    } catch {
      return null;
    }
  }
}

/** No Meta credentials required — logs instead of sending. */
class MockWhatsAppProvider implements WhatsAppProvider {
  async sendText(to: string, body: string): Promise<WhatsAppSendResult> {
    console.log(`[whatsapp:mock] → ${to}: ${body}`);
    return { ok: true, id: `mock-${Date.now()}` };
  }

  async sendImage(to: string, mediaUrl: string): Promise<WhatsAppSendResult> {
    console.log(`[whatsapp:mock] → ${to}: <image ${mediaUrl}>`);
    return { ok: true, id: `mock-${Date.now()}` };
  }

  async fetchInboundMedia(): Promise<InboundMedia | null> {
    return null; // no real Meta media to fetch without live credentials
  }
}

let cached: WhatsAppProvider | null = null;

export function getWhatsAppProvider(): WhatsAppProvider {
  if (!cached) {
    cached =
      process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
        ? new CloudApiProvider()
        : new MockWhatsAppProvider();
  }
  return cached;
}

/**
 * Verifies X-Hub-Signature-256 against the raw request body.
 *
 * Must run on the raw, unparsed body — hashing a `JSON.stringify` of the
 * parsed payload can differ from what Meta signed by even one byte of
 * whitespace, silently breaking verification for real senders while doing
 * nothing to stop a forged one crafted to survive re-serialization.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const provided = signatureHeader.replace(/^sha256=/, "");

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
