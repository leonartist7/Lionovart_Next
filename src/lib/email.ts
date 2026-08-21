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

/** Short confirmation sent to hero-form leads (email-only, no conversation yet). */
export async function sendHeroLeadConfirmationEmail({ toEmail }: { toEmail: string }): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY unset — skipping hero lead confirmation email");
    return false;
  }

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <p style="font-size:15px;line-height:1.6;">Hi,</p>
      <p style="font-size:15px;line-height:1.6;">
        Thanks for reaching out to LIONOVART — your complimentary Brand &amp; Growth
        Blueprint is being prepared. Leon will review your details personally and
        follow up shortly.
      </p>
      <p style="font-size:15px;line-height:1.6;">
        Want to move faster? <a href="https://lionovart.com" style="color:#e5192a;">Talk to Nova now</a>
        for an instant walkthrough.
      </p>
      <p style="font-size:14px;color:#666;margin-top:32px;">— Nova, LIONOVART Strategic AI</p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: toEmail,
      subject: "Your LIONOVART Brand & Growth Blueprint is on its way",
      html: htmlBody,
    });
    return true;
  } catch (err) {
    console.error("[email] hero lead confirmation send failed:", err);
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
 * The Brand Score report — the deliverable that earns the email. This is the
 * first thing a prospect judges LIONOVART by, so it carries the full read:
 * every pillar, the biggest leak, the positioning they should own, and the
 * findings held back from the on-page teaser.
 */
export async function sendBrandReportEmail({
  toEmail,
  toName,
  businessName,
  siteUrl,
  overall,
  pillars,
  headline,
  biggestLeak,
  positioning,
  quickWins,
  fullFindings,
  portalUrl,
  bookingUrl,
}: {
  toEmail: string;
  toName?: string;
  businessName: string;
  siteUrl: string;
  overall: number;
  pillars: Array<{ label: string; score: number; verdict: string }>;
  headline: string;
  biggestLeak: { title: string; detail: string; cost: string };
  positioning?: string;
  quickWins: string[];
  fullFindings: string[];
  portalUrl: string;
  bookingUrl: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY unset — skipping brand report email");
    return false;
  }

  // Red below 50, amber to 74, green above — the same bands the on-page dial uses.
  const bandColor = (n: number) => (n < 50 ? "#e5192a" : n < 75 ? "#d98324" : "#1f9d55");

  const pillarRows = pillars
    .map(
      (p) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;">
          <div style="font-size:13px;font-weight:600;color:#1a1a1a;">${p.label}
            <span style="float:right;color:${bandColor(p.score)};">${p.score}</span>
          </div>
          <div style="height:5px;background:#eee;border-radius:3px;margin:6px 0 7px;">
            <div style="height:5px;width:${p.score}%;background:${bandColor(p.score)};border-radius:3px;"></div>
          </div>
          <div style="font-size:13px;line-height:1.6;color:#555;">${p.verdict}</div>
        </td>
      </tr>`,
    )
    .join("");

  const listItems = (items: string[]) =>
    items.map((i) => `<li style="margin-bottom:8px;line-height:1.6;">${i}</li>`).join("");

  const htmlBody = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
      <p style="font-size:11px;color:#e5192a;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">LIONOVART Brand Score</p>
      <h1 style="font-size:22px;margin:0 0 4px;">${businessName}</h1>
      <p style="font-size:13px;color:#888;margin:0 0 24px;">${siteUrl}</p>

      <div style="text-align:center;padding:24px;background:#fafafa;border-radius:12px;margin-bottom:24px;">
        <div style="font-size:52px;font-weight:700;line-height:1;color:${bandColor(overall)};">${overall}<span style="font-size:20px;color:#aaa;">/100</span></div>
        <p style="font-size:14px;line-height:1.6;color:#444;margin:14px 0 0;">${headline}</p>
      </div>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 4px;">The five pillars</h2>
      <table style="width:100%;border-collapse:collapse;">${pillarRows}</table>

      <div style="border-left:3px solid #e5192a;padding:14px 18px;margin:28px 0;background:#fff6f6;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#e5192a;margin:0 0 6px;">Your biggest leak</p>
        <p style="font-size:16px;font-weight:600;margin:0 0 8px;">${biggestLeak.title}</p>
        <p style="font-size:14px;line-height:1.7;color:#333;margin:0 0 10px;">${biggestLeak.detail}</p>
        <p style="font-size:13px;line-height:1.6;color:#777;margin:0;font-style:italic;">${biggestLeak.cost}</p>
      </div>

      ${
        positioning
          ? `<h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 8px;">The positioning you should own</h2>
             <p style="font-size:16px;line-height:1.6;color:#1a1a1a;margin:0 0 28px;">"${positioning}"</p>`
          : ""
      }

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 8px;">Fix these this week</h2>
      <ol style="font-size:14px;color:#333;padding-left:18px;margin:0 0 28px;">${listItems(quickWins)}</ol>

      ${
        fullFindings.length
          ? `<h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 8px;">The deeper read</h2>
             <ul style="font-size:14px;color:#333;padding-left:18px;margin:0 0 28px;">${listItems(fullFindings)}</ul>`
          : ""
      }

      <div style="text-align:center;padding:24px 0;border-top:1px solid #eee;">
        <a href="${portalUrl}" style="display:inline-block;background:#e5192a;color:#fff;text-decoration:none;padding:13px 26px;border-radius:999px;font-size:14px;font-weight:600;">View your live report →</a>
        <p style="font-size:13px;color:#777;margin:18px 0 0;line-height:1.6;">
          Want to talk it through? <a href="${bookingUrl}" style="color:#e5192a;">Book 20 minutes with Leon</a> — he'll have read this before you speak.
        </p>
      </div>

      <p style="font-size:13px;color:#888;margin-top:24px;">— Nova, LIONOVART Strategic AI</p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: toEmail,
      subject: `${businessName} scored ${overall}/100 — here's what's leaking`,
      html: htmlBody,
    });
    return true;
  } catch (err) {
    console.error("[email] brand report send failed:", err);
    return false;
  }
}
