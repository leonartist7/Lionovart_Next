import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DemoShell } from "@/components/portal/DemoShell";
import { AssetCollaboration } from "@/components/portal/AssetCollaboration";
import { VersionList } from "@/components/portal/VersionList";
import { UploadDialog } from "@/components/portal/UploadDialog";
import { demoAsset, demoThreads, resolveDemoView } from "@/lib/portal/demo-data";
import { formatBytes, formatDate } from "@/lib/portal/format";

export const metadata: Metadata = {
  title: "File · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoAssetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ assetId: string }>;
  searchParams: Promise<{ view?: string; v?: string }>;
}) {
  const { assetId } = await params;
  const sp = await searchParams;
  const view = resolveDemoView(sp.view);

  const asset = demoAsset(assetId);
  if (!asset) notFound();

  const requestedVersion = sp.v ? Number(sp.v) : asset.currentVersion;
  const active = asset.versions.find((v) => v.n === requestedVersion) ?? asset.versions[0];
  const path = `/portal/demo/assets/${assetId}`;

  return (
    <DemoShell view={view} path={path}>
      <div className="py-2 md:py-4">
        <Link
          href={view === "studio" ? "/portal/demo/assets?view=studio" : "/portal/demo/assets"}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 -ml-1 inline-flex items-center gap-1 rounded-md py-1 text-sm transition-colors focus-visible:ring-3 focus-visible:outline-none"
        >
          <ChevronLeft size={15} aria-hidden="true" />
          Files
        </Link>

        <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-foreground min-w-0 truncate text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
              {asset.name}
            </h1>
            <p className="text-muted-foreground mt-2 text-xs">
              v{active.n} · {formatBytes(active.sizeBytes)} · uploaded {formatDate(active.createdAt)}
            </p>
          </div>
          {view === "studio" && <UploadDialog workspaceSlug="demo" assetId={assetId} demo />}
        </header>

        <AssetCollaboration
          workspaceSlug="demo"
          assetId={assetId}
          assetName={asset.name}
          assetKind={asset.kind}
          viewUrl={active.url}
          activeVersion={active.n}
          initialThreads={demoThreads(assetId)}
          initialCursor=""
          currentUid={view === "studio" ? "demo-agency" : "demo-client"}
          isAgency={view === "studio"}
          canComment
          demo
        />

        {asset.versions.length > 1 && (
          <section aria-labelledby="asset-versions" className="mt-8">
            <h2 id="asset-versions" className="text-muted-foreground mb-3 text-sm font-medium">
              Versions
            </h2>
            <VersionList
              versions={asset.versions.map((v) => ({
                n: v.n,
                storagePath: "",
                sizeBytes: v.sizeBytes,
                uploadedBy: "demo",
                createdAt: v.createdAt,
                note: v.note,
                downloadUrl: v.url,
              }))}
              currentVersion={asset.currentVersion}
              activeVersion={active.n}
              basePath={path}
            />
          </section>
        )}
      </div>
    </DemoShell>
  );
}
