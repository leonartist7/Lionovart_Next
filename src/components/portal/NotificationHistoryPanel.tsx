import Link from "next/link";
import { Bell } from "lucide-react";
import type { DeliveryHistoryPage, DeliveryStatus } from "@/lib/portal/outbox-history";

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  sent: "Accepted by email provider",
  failed: "Send attempt failed",
  unconfigured: "Email service not configured",
  throttled: "Skipped (recent activity)",
  unknown: "Status unavailable",
};

export function NotificationHistoryPanel({
  href, demo, history, error, hasCursor,
}: {
  href: string;
  demo: boolean;
  history?: DeliveryHistoryPage;
  error?: boolean;
  hasCursor?: boolean;
}) {
  return (
    <section className="border-border bg-card rounded-2xl border p-5 md:p-7" aria-labelledby="outbox-history-heading">
      <div className="flex items-center gap-3">
        <Bell className="text-muted-foreground h-5 w-5" aria-hidden="true"/>
        <h2 id="outbox-history-heading" className="text-foreground text-lg font-semibold">Recent notification decisions</h2>
      </div>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
        Studio-only record of email attempts for file feedback. “Accepted” means the email provider accepted the request, not that the message reached an inbox. No messages are sent from this view.
      </p>
      {demo ? (
        <p className="text-muted-foreground mt-5 text-sm">Public demo: real recipient and delivery records are never loaded.</p>
      ) : error ? (
        <p className="text-muted-foreground mt-5 text-sm" role="alert">Notification history is unavailable. You can reload the latest entries without changing anything.</p>
      ) : history?.entries.length ? (
        <ol className="border-border mt-5 divide-y border-t" aria-label="Notification delivery history">
          {history.entries.map((item, index) => (
            <li key={`${item.createdAt ?? "unknown"}-${index}`} className="flex flex-wrap justify-between gap-x-6 gap-y-2 py-3.5">
              <div className="min-w-0">
                <p className="text-foreground text-sm font-medium">{item.activity}</p>
                <p className="text-muted-foreground mt-1 break-all text-xs">{item.recipient}</p>
              </div>
              <div className="min-w-0 text-left sm:text-right">
                <p className="text-foreground text-sm">{STATUS_LABELS[item.status]}</p>
                {item.createdAt ? (
                  <time dateTime={item.createdAt} className="text-muted-foreground mt-1 block text-xs">
                    {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(item.createdAt))} UTC
                  </time>
                ) : <p className="text-muted-foreground mt-1 text-xs">Time unavailable</p>}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted-foreground mt-5 text-sm">{hasCursor ? "No older notification decisions found." : "No file-feedback email decisions have been recorded in this workspace yet."}</p>
      )}
      {!demo && (
        <nav aria-label="Notification history pages" className="mt-4 flex flex-wrap items-center gap-5">
          {!error && history?.nextCursor && (
            <Link href={`${href}?outboxAfter=${encodeURIComponent(history.nextCursor)}`} className="text-foreground inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Older decisions</Link>
          )}
          {(hasCursor || error) && (
            <Link href={href} className="text-foreground inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Latest decisions</Link>
          )}
        </nav>
      )}
    </section>
  );
}
