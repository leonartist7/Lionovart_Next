import type { Metadata } from "next";
import { DemoShell } from "@/components/portal/DemoShell";
import { ConnectionsHub } from "@/components/portal/ConnectionsHub";
import { resolveDemoView } from "@/lib/portal/demo-data";

export const metadata: Metadata = { title: "Connections · preview", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DemoConnectionsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const view = resolveDemoView((await searchParams).view);
  return <DemoShell view={view} path="/portal/demo/connections">
    <ConnectionsHub workspaceSlug="demo" links={[]} canManage={view === "studio"} demoView={view}/>
  </DemoShell>;
}
