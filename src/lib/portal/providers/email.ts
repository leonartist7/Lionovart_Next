import "server-only";
import { Resend } from "resend";

/**
 * Outbound portal mail, behind one interface.
 *
 * `getPortalMailer()` selects automatically, exactly like the WhatsApp
 * adapter: RESEND_API_KEY present → the live Resend driver; otherwise the mock
 * driver, which logs and says plainly that nothing was sent. It deliberately
 * does NOT report success — the notification outbox records "unconfigured"
 * rather than pretending someone was told.
 */

export interface PortalMail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type MailResult = { ok: true } | { ok: false; unconfigured: boolean; error: string };

export interface PortalMailer {
  send(mail: PortalMail): Promise<MailResult>;
}

/** Same verified domain the invite and Nova mail already send from. */
const DEFAULT_FROM = "LIONOVART <nova@nova.lionovart.com>";

class ResendMailer implements PortalMailer {
  private client = new Resend(process.env.RESEND_API_KEY);

  async send(mail: PortalMail): Promise<MailResult> {
    try {
      // Resend 6 returns `{ data, error }` rather than throwing on an API
      // rejection — checking only for a throw would report every rejected
      // send (bad address, unverified domain) as delivered.
      const { error } = await this.client.emails.send({
        from: process.env.PORTAL_MAIL_FROM || DEFAULT_FROM,
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
      if (error) return { ok: false, unconfigured: false, error: error.message };
      return { ok: true };
    } catch (err) {
      return { ok: false, unconfigured: false, error: err instanceof Error ? err.message : "Network error" };
    }
  }
}

class MockMailer implements PortalMailer {
  async send(mail: PortalMail): Promise<MailResult> {
    // Recipient and subject only — a comment's text has no business in a log.
    console.warn(`[portal-mail] RESEND_API_KEY unset — not sent: "${mail.subject}" → ${mail.to}`);
    return { ok: false, unconfigured: true, error: "Email isn't configured." };
  }
}

export function getPortalMailer(): PortalMailer {
  return process.env.RESEND_API_KEY ? new ResendMailer() : new MockMailer();
}
