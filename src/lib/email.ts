import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Nova by LIONOVART <nova@nova.lionovart.com>";
const LEON_EMAIL = "leonartist.cs@gmail.com";

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
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY unset — skipping summary email");
    return;
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
    await resend.emails.send({
      from: FROM,
      to: toEmail,
      cc: LEON_EMAIL,
      subject: `Your LIONOVART strategy session summary`,
      html: htmlBody,
    });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}
