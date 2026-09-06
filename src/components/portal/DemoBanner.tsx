import Link from "next/link";
import { Eye } from "lucide-react";
import type { DemoView } from "@/lib/portal/demo-data";
import { cn } from "@/lib/utils";

/**
 * Says plainly that this is sample data, and switches between the two views
 * that are otherwise impossible to compare — the client's, and the studio's.
 */
export function DemoBanner({ view, path }: { view: DemoView; path: string }) {
  return (
    <div className="border-border bg-muted/50 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed p-3">
      <p className="text-muted-foreground flex items-center gap-2 text-xs leading-relaxed">
        <Eye size={14} className="shrink-0" aria-hidden="true" />
        <span>
          <span className="text-foreground font-medium">Design preview.</span> Sample
          data — nothing is saved, and no account is needed.
        </span>
      </p>

      <div
        role="group"
        aria-label="Preview as"
        className="border-border bg-card flex shrink-0 rounded-full border p-0.5"
      >
        {(["client", "studio"] as const).map((v) => (
          <Link
            key={v}
            href={v === "client" ? path : `${path}?view=studio`}
            aria-current={view === v ? "true" : undefined}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150",
              "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
              view === v
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v === "client" ? "Client view" : "Studio view"}
          </Link>
        ))}
      </div>
    </div>
  );
}
