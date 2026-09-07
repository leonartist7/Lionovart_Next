import { AssetCard } from "@/components/portal/AssetCard";
import { UploadDialog } from "@/components/portal/UploadDialog";
import type { Asset } from "@/lib/portal/types";

export interface AssetListItem {
  asset: Asset;
  thumbnailUrl: string | null;
}

export function AssetGrid({
  items,
  workspaceSlug,
  canDelete,
  canUpload,
  demo = false,
}: {
  items: AssetListItem[];
  workspaceSlug: string;
  canDelete: boolean;
  canUpload: boolean;
  demo?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="mt-8 max-w-xl">
        <p className="text-muted-foreground text-[15px] leading-relaxed">
          No files yet. Deliverables and reference material will show up here as soon as
          they&apos;re uploaded.
        </p>
        {canUpload && (
          <div className="mt-6 max-w-sm">
            <UploadDialog workspaceSlug={workspaceSlug} demo={demo} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ asset, thumbnailUrl }) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          thumbnailUrl={thumbnailUrl}
          workspaceSlug={workspaceSlug}
          canDelete={canDelete}
          demo={demo}
        />
      ))}
      {canUpload && <UploadDialog workspaceSlug={workspaceSlug} demo={demo} />}
    </div>
  );
}
