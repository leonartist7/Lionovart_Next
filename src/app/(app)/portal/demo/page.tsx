import type { Metadata } from "next";
import { DemoShell } from "@/components/portal/DemoShell";
import { WorkspaceOverview } from "@/components/portal/WorkspaceOverview";
import { DemoAddProject } from "@/components/portal/DemoAddProject";
import {
  DEMO_AGENCY,
  DEMO_CLIENT,
  DEMO_WORKSPACE,
  demoProjects,
  resolveDemoView,
} from "@/lib/portal/demo-data";

export const metadata: Metadata = {
  title: "Portal preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const view = resolveDemoView((await searchParams).view);
  const who = view === "studio" ? DEMO_AGENCY : DEMO_CLIENT;

  return (
    <DemoShell view={view} path="/portal/demo">
      <WorkspaceOverview
        workspaceName={DEMO_WORKSPACE.name}
        firstName={who.name.split(" ")[0]}
        workspaceSlug="demo"
        projects={demoProjects(view)}
        addProjectSlot={view === "studio" ? <DemoAddProject /> : undefined}
      />
    </DemoShell>
  );
}
