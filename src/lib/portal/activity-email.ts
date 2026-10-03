/**
 * The "someone commented" email, rendered as pure functions.
 *
 * Deliberately free of `server-only` and every other import so it can be
 * exercised directly: this is the one place user-written text (a comment, a
 * filename, a person's name) is interpolated into HTML, and it has to be
 * escaped here or a comment becomes markup in someone else's inbox.
 */

export type ActivityKind = "pin" | "thread" | "reply";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Collapses to a single line and caps the length. For subjects and names — a
 * newline in an email header is how header injection starts, and a 4,000-char
 * filename is not a subject line.
 */
export function oneLine(value: string, max = 120): string {
  // eslint-disable-next-line no-control-regex
  const flat = value.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

const VERB: Record<ActivityKind, string> = {
  pin: "pinned a comment on",
  thread: "commented on",
  reply: "replied on",
};

export interface ActivityEmailInput {
  actorName: string;
  workspaceName: string;
  assetName: string;
  kind: ActivityKind;
  /** The comment text — escaped here, never trusted. */
  excerpt: string;
  /** Absolute link straight to the thread. Built server-side from a fixed origin. */
  url: string;
}

export function renderActivityEmail(input: ActivityEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const actor = oneLine(input.actorName, 60) || "Someone";
  const workspace = oneLine(input.workspaceName, 60);
  const asset = oneLine(input.assetName, 80);
  const excerpt = input.excerpt.trim().slice(0, 400);
  const verb = VERB[input.kind];

  const subject = oneLine(`${actor} ${verb} ${asset}`, 150);

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111111;">
      <p style="font-size:12px;color:#e5192a;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:20px;">LIONOVART</p>
      <h1 style="font-size:20px;line-height:1.35;margin:0 0 6px;">${escapeHtml(actor)} ${verb} ${escapeHtml(asset)}</h1>
      <p style="font-size:13px;color:#777;margin:0 0 20px;">${escapeHtml(workspace)}</p>
      <blockquote style="margin:0 0 28px;padding:0 0 0 14px;border-left:3px solid #e5192a;font-size:15px;line-height:1.65;color:#333;white-space:pre-wrap;">${escapeHtml(excerpt)}</blockquote>
      <p style="margin:0 0 28px;">
        <a href="${escapeHtml(input.url)}" style="display:inline-block;background:#e5192a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:9999px;font-size:14px;font-weight:600;">
          Open the conversation
        </a>
      </p>
      <p style="font-size:12px;line-height:1.6;color:#aaa;margin:0;word-break:break-all;">
        If the button doesn't work, paste this into your browser:<br>${escapeHtml(input.url)}
      </p>
    </div>
  `;

  const text = `${actor} ${verb} ${asset} (${workspace})\n\n${excerpt}\n\nOpen the conversation: ${input.url}\n`;

  return { subject, html, text };
}
