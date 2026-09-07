"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Film, Image as ImageIcon, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/portal/format";
import type { Asset } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

const KIND_ICON = { image: ImageIcon, video: Film, doc: FileText, other: FileText } as const;

/**
 * One grid tile. Delete lives on the card rather than only in the viewer,
 * because "get rid of this" is a decision people make while scanning a list,
 * not only after opening a file.
 */
export function AssetCard({
  asset,
  thumbnailUrl,
  workspaceSlug,
  canDelete,
  demo = false,
}: {
  asset: Asset;
  thumbnailUrl: string | null;
  workspaceSlug: string;
  canDelete: boolean;
  demo?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const Icon = KIND_ICON[asset.kind];

  async function remove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (demo) {
      toast.add({ title: "Preview only", description: "Changes aren't saved." });
      return;
    }
    if (!window.confirm(`Delete "${asset.name}"? This can't be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/portal/${workspaceSlug}/assets/${asset.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return toast.add({ title: "Couldn't delete that file" });
    toast.add({ title: "File deleted", description: asset.name });
    router.refresh();
  }

  return (
    <Link
      href={demo ? `/portal/demo/assets/${asset.id}` : `/portal/${workspaceSlug}/assets/${asset.id}`}
      className="border-border bg-card hover:border-primary/40 group focus-visible:ring-primary/50 relative block overflow-hidden rounded-2xl border transition-[border-color,transform] duration-150 ease-out active:scale-[0.995] focus-visible:ring-3 focus-visible:outline-none"
    >
      <div className="bg-muted aspect-[4/3] w-full overflow-hidden">
        {thumbnailUrl ? (
          // Plain img: these are short-lived signed URLs, not something
          // next/image's remote-pattern allowlist should have to know about.
          <img src={thumbnailUrl} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="text-muted-foreground/50 grid size-full place-items-center">
            <Icon size={26} aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-foreground truncate text-sm font-medium">{asset.name}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          v{asset.currentVersion} · {formatDate(asset.createdAt)}
        </p>
      </div>

      {canDelete && (
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          aria-label={`Delete ${asset.name}`}
          className={cn(
            "bg-background/85 text-muted-foreground hover:text-destructive absolute top-2 right-2 grid size-8 place-items-center rounded-full backdrop-blur-sm",
            "transition-colors duration-150 disabled:opacity-50",
            "focus-visible:ring-destructive/40 focus-visible:ring-3 focus-visible:outline-none",
          )}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      )}
    </Link>
  );
}
