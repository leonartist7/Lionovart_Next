import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DemoShell } from "@/components/portal/DemoShell";
import { MilestoneRail } from "@/components/portal/MilestoneRail";
import { demoProject, resolveDemoView } from "@/lib/portal/demo-data";
import {
  PROJECT_KIND_LABELS,
  PROJECT_STATUS_LABELS,
  statusBadgeVariant,
} from "@/lib/portal/projects";
import { formatDate } from "@/lib/portal/format";

export const metadata: Metadata = {
  title: "Project · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { projectId } = await params;
  const view = resolveDemoView((await searchParams).view);

  // Mirrors the live behaviour: an internal project is simply not there for the
  // client view, so a guessed URL 404s rather than showing a hidden page.
  const project = demoProject(view, projectId);
  if (!project) notFound();

  const done = project.milestones.filter((m) => m.status === "done").length;
  const path = `/portal/demo/projects/${projectId}`;

  return (
    <DemoShell view={view} path={path}>
      <div className="py-2 md:py-4">
        <Link
          href={view === "studio" ? "/portal/demo/projects?view=studio" : "/portal/demo/projects"}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 -ml-1 inline-flex items-center gap-1 rounded-md py-1 text-sm transition-colors focus-visible:ring-3 focus-visible:outline-none"
        >
          <ChevronLeft size={15} aria-hidden="true" />
          Projects
        </Link>

        <header className="mt-3">
          <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
            {project.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Badge variant="neutral">{PROJECT_KIND_LABELS[project.kind]}</Badge>
            <Badge variant={statusBadgeVariant(project.status)}>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
            {project.visibility === "internal" && <Badge variant="warning">Internal</Badge>}
            {project.dueAt && (
              <span className="text-muted-foreground ml-1 text-xs">
                Due {formatDate(project.dueAt)}
              </span>
            )}
          </div>
        </header>

        <section
          aria-labelledby="project-progress"
          className="border-border bg-card mt-7 rounded-2xl border p-6"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="project-progress" className="text-muted-foreground text-sm font-medium">
              Progress
            </h2>
            <span className="font-heading text-foreground text-2xl font-bold tabular-nums">
              {project.progress}%
            </span>
          </div>
          <Progress value={project.progress} className="mt-3" aria-label="Project progress" />
          <p className="text-muted-foreground mt-3 text-xs">
            {done} of {project.milestones.length} milestones complete
          </p>
        </section>

        <section aria-labelledby="project-plan" className="mt-8">
          <h2 id="project-plan" className="text-muted-foreground mb-4 text-sm font-medium">
            The plan
          </h2>
          <div className="border-border bg-card rounded-2xl border p-6">
            <MilestoneRail
              milestones={project.milestones}
              editable={view === "studio"}
              workspaceSlug="demo"
              projectId={project.id}
              demo
            />
          </div>
        </section>
      </div>
    </DemoShell>
  );
}
