import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DemoShell } from "@/components/portal/DemoShell";
import { KanbanBoard } from "@/components/portal/KanbanBoard";
import { demoProject, demoTasks, resolveDemoView } from "@/lib/portal/demo-data";

export const metadata: Metadata = {
  title: "Board · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const view = resolveDemoView((await searchParams).view);

  const project = demoProject(view, projectId);
  if (!project) notFound();

  const tasks = demoTasks(view, projectId);
  const path = `/portal/demo/projects/${projectId}/board`;

  return (
    <DemoShell view={view} path={path}>
      <div className="py-2 md:py-4">
        <Link
          href={`/portal/demo/projects/${projectId}${view === "studio" ? "?view=studio" : ""}`}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 -ml-1 inline-flex items-center gap-1 rounded-md py-1 text-sm transition-colors focus-visible:ring-3 focus-visible:outline-none"
        >
          <ChevronLeft size={15} aria-hidden="true" />
          {project.name}
        </Link>

        <h1 className="font-heading text-foreground mt-3 text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
          Board
        </h1>

        <div className="mt-7">
          <KanbanBoard
            workspaceSlug="demo"
            projectId={project.id}
            initialTasks={tasks}
            canEdit={view === "studio"}
            members={{}}
            demo
          />
        </div>
      </div>
    </DemoShell>
  );
}
