"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";

export function CalendarExportButton({ href, demo = false }: { href: string; demo?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function download() {
    if (busy) return;
    setBusy(true); setMessage(""); setFailed(false);
    try {
      const response = await fetch(href, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 401 ? "Your session expired. Sign in again to export." : "The calendar could not be exported. Please try again.");
      if (!response.headers.get("content-type")?.startsWith("text/calendar")) throw new Error("The server did not return a calendar. Refresh and try again.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = demo ? "lionovart-demo-calendar.ics" : "lionovart-calendar.ics";
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      const count = Number(response.headers.get("X-Calendar-Exported") ?? 0);
      const skipped = Number(response.headers.get("X-Calendar-Skipped") ?? 0);
      setMessage(`${count} calendar item${count === 1 ? "" : "s"} exported.${skipped ? ` ${skipped} invalid or duplicate item(s) were omitted.` : ""} This is a snapshot, not automatic sync.`);
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Export failed."); }
    finally { setBusy(false); }
  }
  return (
    <div className="min-w-0 max-w-md">
      <button type="button" onClick={download} disabled={busy} aria-busy={busy}
        className="border-border bg-card text-foreground inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-60">
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
        {busy ? "Preparing calendar…" : demo ? "Export sample calendar" : "Export calendar"}
      </button>
      {message && <p role={failed ? "alert" : "status"} className="text-muted-foreground mt-2 text-sm leading-relaxed">{message}</p>}
    </div>
  );
}
