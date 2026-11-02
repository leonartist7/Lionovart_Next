/** RFC 5545 snapshot export. No network, credentials, or database access. */
export interface ExportCalendarItem {
  id: string;
  date: string;
  title: string;
  kind: "project" | "milestone" | "post";
  projectId?: string;
  projectName?: string;
  postId?: string;
}

export function escapeCalendarText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;").replace(/,/g, "\\,")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

/** Fold at 75 UTF-8 octets, including the continuation space. */
export function foldCalendarLine(value: string): string {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let line = "";
  let bytes = 0;
  for (const character of value) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) { lines.push(line); line = " "; bytes = 1; }
    line += character;
    bytes += size;
  }
  lines.push(line);
  return lines.join("\r\n");
}

function validDay(day: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day.startsWith("0000")) return false;
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day;
}

function stamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Dates stay all-day; timestamps require an explicit offset (never server local time). */
function startLines(value: string): string[] | null {
  if (validDay(value)) {
    const end = new Date(`${value}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    if (end.getUTCFullYear() > 9999) return null;
    return [`DTSTART;VALUE=DATE:${value.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replace(/-/g, "")}`];
  }
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !validDay(match[1]) || +match[2] > 23 || +match[3] > 59 || +(match[4] || 0) > 59) return null;
  if (match[5] !== "Z" && (+match[5].slice(1, 3) > 23 || +match[5].slice(4) > 59)) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) return null;
  return [`DTSTART:${stamp(date)}`];
}

export function renderCalendarExport(
  items: readonly ExportCalendarItem[],
  options: { workspaceId: string; workspaceName: string; generatedAt?: Date },
): { content: string; exported: number; skipped: number } {
  const now = options.generatedAt ?? new Date();
  if (!Number.isFinite(now.getTime())) throw new Error("Invalid export timestamp");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//LIONOVART//Portal Calendar//EN",
    "CALSCALE:GREGORIAN", `X-WR-CALNAME:${escapeCalendarText(options.workspaceName)}`];
  const seen = new Set<string>();
  let exported = 0;
  let skipped = 0;
  for (const item of items) {
    const dates = startLines(item.date);
    const uid = [options.workspaceId, item.kind, item.projectId ?? "", item.id]
      .map(encodeURIComponent).join("/") + "@portal.lionovart.com";
    if (!dates || !item.id || seen.has(uid)) { skipped++; continue; }
    seen.add(uid);
    const description = [item.projectName, "LIONOVART calendar snapshot. Changes do not sync automatically."]
      .filter(Boolean).join("\n");
    lines.push("BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${stamp(now)}`, ...dates,
      `SUMMARY:${escapeCalendarText(item.title || "Untitled item")}`,
      `DESCRIPTION:${escapeCalendarText(description)}`, "CLASS:PRIVATE", "TRANSP:TRANSPARENT", "END:VEVENT");
    exported++;
  }
  lines.push("END:VCALENDAR");
  return { content: lines.map(foldCalendarLine).join("\r\n") + "\r\n", exported, skipped };
}
