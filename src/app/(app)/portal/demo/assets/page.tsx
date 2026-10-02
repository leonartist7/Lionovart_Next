import type { Metadata } from "next";
import { DemoShell } from "@/components/portal/DemoShell";
import { AssetGrid, type AssetListItem } from "@/components/portal/AssetGrid";
import { demoAssets, demoThreads, resolveDemoView } from "@/lib/portal/demo-data";

export const metadata: Metadata = {
  title: "Files · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoAssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const view = resolveDemoView((await searchParams).view);

  const items: AssetListItem[] = demoAssets().map((a) => ({
    asset: {
      id: a.id,
      name: a.name,
      mime: a.mime,
      kind: a.kind,
      currentVersion: a.currentVersion,
      uploadedBy: "demo",
      createdAt: a.createdAt,
      tags: [],
    },
    thumbnailUrl:
      a.kind === "image" ? (a.versions.find((v) => v.n === a.currentVersion)?.url ?? null) : null,
    // Same rule as the live page: unresolved, and not a pin on a superseded version.
    openThreads: demoThreads(a.id).filter(
      (t) => t.status !== "resolved" && (!t.pin || t.versionId === a.currentVersion),
    ).length,
  }));

  return (
    <DemoShell view={view} path="/portal/demo/assets">
      <div className="py-2 md:py-4">
        <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
          Files
        </h1>
        <AssetGrid
          items={items}
          workspaceSlug="demo"
          canDelete={view === "studio"}
          canUpload
          demo
        />
      </div>
    </DemoShell>
  );
}
