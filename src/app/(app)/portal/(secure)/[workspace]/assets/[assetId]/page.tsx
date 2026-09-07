import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AssetViewer } from "@/components/portal/AssetViewer";
import { VersionList } from "@/components/portal/VersionList";
import { UploadDialog } from "@/components/portal/UploadDialog";
import { DeleteAssetButton } from "@/components/portal/DeleteAssetButton";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { getAsset, listVersions, signReadUrl } from "@/lib/portal/assets";
import { roleAtLeast } from "@/lib/portal/types";
import { formatBytes, formatDate } from "@/lib/portal/format";

type Params = {
  params: Promise<{ workspace: string; assetId: string }>;
  searchParams: Promise<{ v?: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { workspace: slug, assetId } = await params;
  const cookieStore = await cookies();
  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) return { title: "File" };

  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) return { title: "File" };

  const asset = await getAsset(access.workspace.id, assetId);
  return { title: asset?.name ?? "File" };
}

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({ params, searchParams }: Params) {
  const { workspace: slug, assetId } = await params;
  const { v } = await searchParams;
  const cookieStore = await cookies();

  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) notFound();

  const asset = await getAsset(access.workspace.id, assetId);
  if (!asset) notFound();

  const versions = await listVersions(access.workspace.id, assetId);
  const requestedVersion = v ? Number(v) : asset.currentVersion;
  const active = versions.find((ver) => ver.n === requestedVersion) ?? versions[0];
  if (!active) notFound();

  const [viewUrl, versionItems] = await Promise.all([
    signReadUrl(active.storagePath),
    Promise.all(
      versions.map(async (ver) => ({ ...ver, downloadUrl: await signReadUrl(ver.storagePath) })),
    ),
  ]);

  const canUpload = roleAtLeast(access.membership.role, "collaborator");
  // Decided on the server — absent from a client's response, not hidden with CSS.
  const canDelete = roleAtLeast(access.membership.role, "agency");
  const basePath = `/portal/${slug}/assets/${assetId}`;

  return (
    <div className="py-2 md:py-4">
      <Link
        href={`/portal/${slug}/assets`}
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
        {(canUpload || canDelete) && (
          <div className="flex shrink-0 gap-2">
            {canUpload && <UploadDialog workspaceSlug={slug} assetId={assetId} />}
            {canDelete && (
              <DeleteAssetButton workspaceSlug={slug} assetId={assetId} name={asset.name} />
            )}
          </div>
        )}
      </header>

      <section className="mt-7">
        <AssetViewer kind={asset.kind} url={viewUrl} name={asset.name} />
      </section>

      {versions.length > 1 && (
        <section aria-labelledby="asset-versions" className="mt-8">
          <h2 id="asset-versions" className="text-muted-foreground mb-3 text-sm font-medium">
            Versions
          </h2>
          <VersionList
            versions={versionItems}
            currentVersion={asset.currentVersion}
            activeVersion={active.n}
            basePath={basePath}
          />
        </section>
      )}
    </div>
  );
}
