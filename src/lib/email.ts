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
 * first thing a prospect judges LIONOVART by, so it carries every finding we
 * actually measured across all six dimensions, plus the live AI-visibility
 * result and the real competitor set.
 *
 * What it deliberately does NOT do is tease withheld data. The call is sold at
 * the end by naming the judgement calls a report can't make — specific
 * questions about their business, not blurred text.
 */
export async function sendBrandReportEmail({
  toEmail,
  businessName,
  siteUrl,
  overall,
  headline,
  dimensions,
  biggestLeak,
  aeo,
  competitors,
  ownRating,
  ownReviewCount,
  positioning,
  quickWins,
  callAgenda,
  portalUrl,
  bookingUrl,
}: {
  toEmail: string;
  businessName: string;
  siteUrl: string;
  overall: number;
  headline: string;
  dimensions: Array<{ label: string; score: number; headline: string; findings: string[] }>;
  biggestLeak: { title: string; detail: string; cost: string };
  aeo?: { query?: string; mentioned?: boolean; namedInstead: string[]; verdict: string };
  competitors?: Array<{ name: string; rating: number | null; reviewCount: number | null }>;
  ownRating?: number | null;
  ownReviewCount?: number | null;
  positioning?: string;
  quickWins: string[];
  callAgenda: Array<{ title: string; teaser: string }>;
  portalUrl: string;
  bookingUrl: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY unset — skipping brand report email");
    return false;
  }

  // Red below 50, amber to 74, green above — the same bands the on-page dial uses.
  const band = (n: number) => (n < 50 ? "#e5192a" : n < 75 ? "#d98324" : "#1f9d55");

  const dimensionBlocks = dimensions
    .map(
      (d) => `
      <div style="margin-bottom:26px;">
        <div style="font-size:15px;font-weight:700;color:#1a1a1a;">${d.label}
          <span style="float:right;color:${band(d.score)};">${d.score}</span>
        </div>
        <div style="height:5px;background:#eee;border-radius:3px;margin:8px 0 10px;">
          <div style="height:5px;width:${d.score}%;background:${band(d.score)};border-radius:3px;"></div>
        </div>
        <div style="font-size:14px;line-height:1.65;color:#444;margin-bottom:8px;">${d.headline}</div>
        ${
          d.findings.length
            ? `<ul style="font-size:13px;line-height:1.7;color:#555;padding-left:18px;margin:0;">${d.findings
                .map((f) => `<li style="margin-bottom:6px;">${f}</li>`)
                .join("")}</ul>`
            : ""
        }
      </div>`,
    )
    .join("");

  const competitorRows = (competitors ?? [])
    .map(
      (c) => `
      <tr>
        <td style="padding:9px 12px;border-bottom:1px solid #eee;font-size:13px;color:#555;">${c.name}</td>
        <td style="padding:9px 12px;border-bottom:1px solid #eee;font-size:13px;color:#888;text-align:right;white-space:nowrap;">${c.rating ?? "—"}★</td>
        <td style="padding:9px 12px;border-bottom:1px solid #eee;font-size:13px;color:#888;text-align:right;white-space:nowrap;">${c.reviewCount ?? 0} reviews</td>
      </tr>`,
    )
    .join("");

  const agendaBlocks = callAgenda
    .map(
      (a) => `
      <div style="border-left:2px solid #f0a0a8;padding-left:14px;margin-bottom:16px;">
        <p style="font-size:14px;font-weight:600;color:#1a1a1a;margin:0 0 3px;">${a.title}</p>
        <p style="font-size:13px;line-height:1.6;color:#777;margin:0;">${a.teaser}</p>
      </div>`,
    )
    .join("");

  const htmlBody = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:620px;margin:0 auto;color:#1a1a1a;">
      <p style="font-size:11px;color:#e5192a;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">LIONOVART Brand Score</p>
      <h1 style="font-size:24px;margin:0 0 4px;">${businessName}</h1>
      <p style="font-size:13px;color:#888;margin:0 0 24px;">${siteUrl}</p>

      <div style="text-align:center;padding:26px;background:#fafafa;border-radius:12px;margin-bottom:28px;">
        <div style="font-size:56px;font-weight:700;line-height:1;color:${band(overall)};">${overall}<span style="font-size:20px;color:#aaa;">/100</span></div>
        <p style="font-size:14px;line-height:1.65;color:#444;margin:14px 0 0;">${headline}</p>
      </div>

      ${
        aeo?.verdict
          ? `<div style="border:1px solid #e5e5e5;border-radius:12px;padding:18px;margin-bottom:28px;background:#fcfcfc;">
               <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin:0 0 8px;">The AI visibility test</p>
               ${aeo.query ? `<p style="font-size:14px;color:#888;font-style:italic;margin:0 0 8px;">"${aeo.query}"</p>` : ""}
               <p style="font-size:18px;font-weight:700;margin:0 0 8px;color:${aeo.mentioned ? "#1f9d55" : "#e5192a"};">${aeo.mentioned ? "You were named." : "You weren't named."}</p>
               <p style="font-size:14px;line-height:1.7;color:#444;margin:0;">${aeo.verdict}</p>
               <p style="font-size:12px;color:#aaa;margin:10px 0 0;">One query, one engine, one moment — run it yourself and see.</p>
             </div>`
          : ""
      }

      <div style="border-left:3px solid #e5192a;padding:14px 18px;margin-bottom:28px;background:#fff6f6;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#e5192a;margin:0 0 6px;">Your biggest leak</p>
        <p style="font-size:17px;font-weight:600;margin:0 0 8px;">${biggestLeak.title}</p>
        <p style="font-size:14px;line-height:1.7;color:#333;margin:0 0 10px;">${biggestLeak.detail}</p>
        <p style="font-size:13px;line-height:1.6;color:#777;margin:0;font-style:italic;">${biggestLeak.cost}</p>
      </div>

      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin:0 0 16px;">Everything we measured</h2>
      ${dimensionBlocks}

      ${
        competitorRows
          ? `<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin:28px 0 12px;">Who you're measured against</h2>
             <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
               <tr style="background:#fff6f6;">
                 <td style="padding:9px 12px;border-bottom:1px solid #eee;font-size:13px;font-weight:700;color:#1a1a1a;">${businessName}</td>
                 <td style="padding:9px 12px;border-bottom:1px solid #eee;font-size:13px;color:#555;text-align:right;white-space:nowrap;">${ownRating ?? "—"}★</td>
                 <td style="padding:9px 12px;border-bottom:1px solid #eee;font-size:13px;color:#555;text-align:right;white-space:nowrap;">${ownReviewCount ?? 0} reviews</td>
               </tr>
               ${competitorRows}
             </table>
             <p style="font-size:12px;color:#aaa;margin:8px 0 0;">Pulled live from Google Business Profile data for your category and area.</p>`
          : ""
      }

      ${
        positioning
          ? `<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin:32px 0 8px;">The positioning you should own</h2>
             <p style="font-size:17px;line-height:1.6;color:#1a1a1a;margin:0 0 28px;">"${positioning}"</p>`
          : ""
      }

      ${
        quickWins.length
          ? `<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.1em;color:#888;margin:28px 0 8px;">Fix these this week</h2>
             <ol style="font-size:14px;line-height:1.7;color:#333;padding-left:18px;margin:0 0 28px;">${quickWins
               .map((w) => `<li style="margin-bottom:8px;">${w}</li>`)
               .join("")}</ol>`
          : ""
      }

      <div style="border-top:1px solid #eee;padding-top:26px;margin-top:8px;">
        <h2 style="font-size:19px;margin:0 0 8px;">What this report can't decide for you</h2>
        <p style="font-size:14px;line-height:1.7;color:#666;margin:0 0 20px;">
          Everything above is measurement. The questions below are judgement — they depend on your margins,
          your appetite and where you want to be in two years. That's what the twenty minutes is for.
        </p>
        ${agendaBlocks}
        <div style="text-align:center;padding:18px 0 4px;">
          <a href="${bookingUrl}" style="display:inline-block;background:#e5192a;color:#fff;text-decoration:none;padding:13px 28px;border-radius:999px;font-size:14px;font-weight:600;">Book the 20 minutes →</a>
          <p style="font-size:13px;color:#888;margin:16px 0 0;">
            Or <a href="${portalUrl}" style="color:#e5192a;">open your live report</a> — it stays up to date at that link.
          </p>
        </div>
      </div>

      <p style="font-size:13px;color:#888;margin-top:28px;">— Nova, LIONOVART Strategic AI</p>
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
