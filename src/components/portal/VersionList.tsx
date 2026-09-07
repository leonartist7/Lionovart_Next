import Link from "next/link";
import { Download } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/portal/format";
import type { AssetVersion } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

export interface VersionListItem extends AssetVersion {
  downloadUrl: string;
}

/**
 * "v3 of 3" with a way back — old feedback (Phase 4) stays legible against the
 * frame it was written on, so switching versions has to stay easy.
 */
export function VersionList({
  versions,
  currentVersion,
  activeVersion,
  basePath,
}: {
  versions: VersionListItem[];
  currentVersion: number;
  activeVersion: number;
  /** e.g. `/portal/acme/assets/abc123` — `?v=n` is appended for older versions. */
  basePath: string;
}) {
  return (
    <ul className="border-border bg-card divide-border divide-y overflow-hidden rounded-2xl border">
      {versions.map((v) => {
        const isActive = v.n === activeVersion;
        const href = v.n === currentVersion ? basePath : `${basePath}?v=${v.n}`;
        return (
          <li key={v.n} className={cn("flex items-center gap-3 p-4", isActive && "bg-muted/50")}>
            <Link
              href={href}
              className="focus-visible:ring-primary/50 min-w-0 flex-1 rounded-md focus-visible:ring-3 focus-visible:outline-none"
            >
              <p className="text-foreground text-sm font-medium">
                v{v.n}
                {v.n === currentVersion ? " · latest" : ""}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {formatDate(v.createdAt)} · {formatBytes(v.sizeBytes)}
              </p>
              {v.note && <p className="text-muted-foreground mt-1 text-xs italic">{v.note}</p>}
            </Link>
            <a
              href={v.downloadUrl}
              download
              aria-label={`Download version ${v.n}`}
              className={cn(
                "text-muted-foreground hover:text-foreground hover:bg-muted grid size-9 shrink-0 place-items-center rounded-lg",
                "transition-colors duration-150",
                "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
              )}
            >
              <Download size={15} aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
