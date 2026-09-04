import "server-only";
import { Resend } from "resend";

let resend: Resend | null = null;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}
const FROM = "Nova by LIONOVART <nova@nova.lionovart.com>";
/** Client-portal mail is from the studio, not from Nova — same verified domain. */
const PORTAL_FROM = "LIONOVART <nova@nova.lionovart.com>";
const LEON_EMAIL = "leonartist.cs@gmail.com";

/** Returns true only if Resend was actually configured and called — callers
 * (e.g. the send_follow_up_email tool) use this to report status honestly
 * rather than assuming success whenever nothing threw. */
export async function sendSessionSummaryEmail({
  toEmail,
  toName,
  summary,
  conversationId,
}: {
  toEmail: string;
  toName: string;
  summary: string;
  conversationId: string | null;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY unset — skipping summary email");
    return false;
  }

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <p style="font-size:15px;line-height:1.6;">Hi ${toName},</p>
      <p style="font-size:15px;line-height:1.6;">
        Here's a quick summary of your conversation with Nova:
      </p>
      <blockquote style="border-left:3px solid #e5192a;padding:12px 16px;margin:20px 0;background:#fafafa;font-size:14px;line-height:1.7;color:#333;">
        ${summary.replace(/\n/g, "<br>")}
      </blockquote>
      <p style="font-size:15px;line-height:1.6;">
        Leon will review this personally and reach out within 24 hours.
        If you want to move faster, <a href="https://lionovart.com" style="color:#e5192a;">book a call directly</a>.
      </p>
      <p style="font-size:14px;color:#666;margin-top:32px;">— Nova, LIONOVART Strategic AI</p>
      ${conversationId ? `<p style="font-size:11px;color:#aaa;">Ref: ${conversationId}</p>` : ""}
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: toEmail,
      cc: LEON_EMAIL,
      subject: `Your LIONOVART strategy session summary`,
      html: htmlBody,
    });
    return true;
  } catch (err) {
    console.error("[email] send failed:", err);
    return false;
  }
}

/** The rich, Leon-facing lead briefing — replaces the thin 4-line summary in his inbox. */
export async function sendDossierEmail({
  leadName,
  qualificationScore,
  businessSnapshot,
  painsRanked,
  recommendedNextAction,
  draftFollowUp,
  leadUrl,
}: {
  leadName: string;
  qualificationScore: number;
  businessSnapshot: string;
  painsRanked: string[];
  recommendedNextAction: string;
  draftFollowUp: string;
  leadUrl: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY unset — skipping dossier email");
    return;
  }

  const painsList = painsRanked.map((p) => `<li style="margin-bottom:4px;">${p}</li>`).join("");

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
      <p style="font-size:13px;color:#e5192a;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">New Lead Dossier</p>
      <h2 style="font-size:20px;margin:4px 0 16px;">${leadName} — score ${qualificationScore}/100</h2>
      <p style="font-size:14px;line-height:1.6;color:#333;">${businessSnapshot}</p>
      <p style="font-size:13px;font-weight:600;margin-top:20px;margin-bottom:6px;">Pains, ranked</p>
      <ol style="font-size:14px;line-height:1.6;color:#333;padding-left:18px;">${painsList}</ol>
      <p style="font-size:13px;font-weight:600;margin-top:20px;margin-bottom:6px;">Recommended next action</p>
      <p style="font-size:14px;line-height:1.6;color:#333;">${recommendedNextAction}</p>
      <blockquote style="border-left:3px solid #e5192a;padding:12px 16px;margin:20px 0;background:#fafafa;font-size:13px;line-height:1.6;color:#555;">
        Draft follow-up: ${draftFollowUp}
      </blockquote>
      <p style="font-size:14px;margin-top:24px;"><a href="${leadUrl}" style="color:#e5192a;">Open full dossier in the Console →</a></p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: LEON_EMAIL,
      subject: `Lead dossier: ${leadName} (${qualificationScore}/100)`,
      html: htmlBody,
    });
  } catch (err) {
    console.error("[email] dossier send failed:", err);
  }
}

/**
 * The client-portal invitation. Returns true only when Resend was actually
 * configured and the send succeeded — the caller surfaces the raw join link to
 * the studio when it didn't, so an unconfigured mailer never strands a client.
 */
export async function sendPortalInviteEmail({
  toEmail,
  workspaceName,
  joinUrl,
  expiresAt,
}: {
  toEmail: string;
  workspaceName: string;
  joinUrl: string;
  expiresAt: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY unset — skipping portal invite");
    return false;
  }

  const expires = new Date(expiresAt).toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111111;">
      <p style="font-size:12px;color:#e5192a;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:20px;">LIONOVART</p>
      <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px;">Your workspace is ready</h1>
      <p style="font-size:15px;line-height:1.65;color:#333;margin:0 0 24px;">
        You've been given access to <strong>${workspaceName}</strong> — where you'll
        follow progress, review work, leave feedback directly on designs, and talk to us.
      </p>
      <p style="margin:0 0 28px;">
        <a href="${joinUrl}" style="display:inline-block;background:#e5192a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:9999px;font-size:14px;font-weight:600;">
          Open your workspace
        </a>
      </p>
      <p style="font-size:13px;line-height:1.6;color:#777;margin:0 0 8px;">
        This link is for you alone and expires on ${expires}.
      </p>
      <p style="font-size:12px;line-height:1.6;color:#aaa;margin:0;word-break:break-all;">
        If the button doesn't work, paste this into your browser:<br>${joinUrl}
      </p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: PORTAL_FROM,
      to: toEmail,
      subject: `Your ${workspaceName} workspace is ready`,
      html: htmlBody,
    });
    return true;
  } catch (err) {
    console.error("[email] portal invite send failed:", err);
    return false;
  }
}
