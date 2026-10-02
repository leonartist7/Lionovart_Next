import "server-only";
import { Resend } from "resend";

const FROM = "LIONOVART <nova@nova.lionovart.com>";
const TALENT_INBOX = "leonartist.cs@gmail.com";

export type TalentApplication = {
  name: string;
  email: string;
  location: string;
  primaryDiscipline: string;
  collaboration: string[];
  workUrl: string;
  secondaryUrl?: string;
  cvUrl?: string;
  availability?: string;
  strength: string;
  project: string;
  why: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function link(url: string | undefined) {
  if (!url) return "—";
  const safe = escapeHtml(url);
  return `<a href="${safe}" style="color:#c1121f;word-break:break-all;">${safe}</a>`;
}

export async function sendTalentApplicationEmail(application: TalentApplication): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[careers] RESEND_API_KEY unset — skipping talent application email");
    return false;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const collaboration = application.collaboration.length
    ? application.collaboration.map(escapeHtml).join(", ")
    : "Not specified";

  const internalHtml = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#151515;">
      <p style="font-size:12px;color:#c1121f;font-weight:700;text-transform:uppercase;letter-spacing:.14em;">LIONOVART · Talent application</p>
      <h1 style="font-size:26px;line-height:1.2;margin:8px 0 4px;">${escapeHtml(application.name)}</h1>
      <p style="font-size:15px;color:#666;margin:0 0 26px;">${escapeHtml(application.primaryDiscipline)} · ${escapeHtml(application.location)}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:9px 0;color:#777;width:150px;">Email</td><td style="padding:9px 0;">${escapeHtml(application.email)}</td></tr>
        <tr><td style="padding:9px 0;color:#777;">Collaboration</td><td style="padding:9px 0;">${collaboration}</td></tr>
        <tr><td style="padding:9px 0;color:#777;">Work / profile</td><td style="padding:9px 0;">${link(application.workUrl)}</td></tr>
        <tr><td style="padding:9px 0;color:#777;">Second link</td><td style="padding:9px 0;">${link(application.secondaryUrl)}</td></tr>
        <tr><td style="padding:9px 0;color:#777;">CV</td><td style="padding:9px 0;">${link(application.cvUrl)}</td></tr>
        <tr><td style="padding:9px 0;color:#777;">Availability</td><td style="padding:9px 0;">${escapeHtml(application.availability || "Not specified")}</td></tr>
      </table>

      <div style="margin-top:28px;border-top:1px solid #e8e8e8;padding-top:24px;">
        <p style="font-size:12px;color:#777;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">What they are unusually good at</p>
        <p style="font-size:15px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(application.strength)}</p>

        <p style="font-size:12px;color:#777;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-top:24px;">One thing they made better</p>
        <p style="font-size:15px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(application.project)}</p>

        <p style="font-size:12px;color:#777;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-top:24px;">Why LIONOVART / what they want to build</p>
        <p style="font-size:15px;line-height:1.65;white-space:pre-wrap;">${escapeHtml(application.why)}</p>
      </div>
    </div>
  `;

  const internal = await resend.emails.send({
    from: FROM,
    to: TALENT_INBOX,
    subject: `Talent: ${application.name} — ${application.primaryDiscipline}`,
    html: internalHtml,
  });

  if (internal.error) {
    console.error("[careers] internal application email failed:", internal.error);
    return false;
  }

  const confirmation = await resend.emails.send({
    from: FROM,
    to: application.email,
    subject: "We received your LIONOVART talent application",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#151515;">
        <p style="font-size:12px;color:#c1121f;font-weight:700;text-transform:uppercase;letter-spacing:.14em;">LIONOVART</p>
        <h1 style="font-size:24px;line-height:1.25;margin:12px 0 18px;">Thanks, ${escapeHtml(application.name)}.</h1>
        <p style="font-size:15px;line-height:1.7;color:#444;">
          Your talent application is in. We review submissions against current and upcoming work. If there is a strong fit, we will contact you at this email address.
        </p>
        <p style="font-size:15px;line-height:1.7;color:#444;">
          In the meantime, keep making excellent things.
        </p>
        <p style="font-size:13px;color:#888;margin-top:30px;">— LIONOVART</p>
      </div>
    `,
  });

  if (confirmation.error) {
    console.warn("[careers] applicant confirmation email failed:", confirmation.error);
  }

  return true;
}
