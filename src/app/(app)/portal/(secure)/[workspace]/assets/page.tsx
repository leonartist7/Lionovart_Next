import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AssetGrid, type AssetListItem } from "@/components/portal/AssetGrid";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { listAssetsWithVersions, signReadUrl } from "@/lib/portal/assets";
import { roleAtLeast } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Files" };
export const dynamic = "force-dynamic";

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const cookieStore = await cookies();

  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) notFound();

  const assets = await listAssetsWithVersions(access.workspace.id);
  const items: AssetListItem[] = await Promise.all(
    assets.map(async (a) => ({
      asset: a,
      thumbnailUrl: a.kind === "image" && a.version ? await signReadUrl(a.version.storagePath) : null,
    })),
  );

  const canUpload = roleAtLeast(access.membership.role, "collaborator");
  // Decided on the server — the delete affordance is simply absent from a
  // client's response, never rendered and hidden.
  const canDelete = roleAtLeast(access.membership.role, "agency");

  return (
    <div className="py-2 md:py-4">
      <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
        Files
      </h1>
      <AssetGrid items={items} workspaceSlug={slug} canDelete={canDelete} canUpload={canUpload} />
    </div>
  );
}
