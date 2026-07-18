import "server-only";
import { Resend } from "resend";

let resend: Resend | null = null;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}
const FROM = "Nova by LIONOVART <nova@nova.lionovart.com>";
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
    await resend.emails.send({
      from: FROM,
      to: LEON_EMAIL,
      subject: `Lead dossier: ${leadName} (${qualificationScore}/100)`,
      html: htmlBody,
    });
  } catch (err) {
    console.error("[email] dossier send failed:", err);
  }
}
