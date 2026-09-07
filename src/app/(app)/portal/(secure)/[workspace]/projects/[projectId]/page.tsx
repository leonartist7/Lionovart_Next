import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MilestoneRail } from "@/components/portal/MilestoneRail";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { roleAtLeast } from "@/lib/portal/types";
import {
  PROJECT_KIND_LABELS,
  PROJECT_STATUS_LABELS,
  getProject,
  statusBadgeVariant,
} from "@/lib/portal/projects";
import { formatDate } from "@/lib/portal/format";

type Params = { params: Promise<{ workspace: string; projectId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { workspace: slug, projectId } = await params;
  const cookieStore = await cookies();
  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) return { title: "Project" };

  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) return { title: "Project" };

  const project = await getProject(access.workspace.id, projectId, access.membership.role);
  return { title: project?.name ?? "Project" };
}

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: Params) {
  const { workspace: slug, projectId } = await params;
  const cookieStore = await cookies();

  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) notFound();

  // Returns null for an internal project when the caller isn't agency, so a
  // client guessing an id gets a 404 rather than a hidden-but-present page.
  const project = await getProject(access.workspace.id, projectId, access.membership.role);
  if (!project) notFound();

  const done = project.milestones.filter((m) => m.status === "done").length;
  // Decided on the server, so the editing markup is simply absent from a
  // client's response rather than rendered and hidden.
  const canEdit = roleAtLeast(access.membership.role, "agency");

  return (
    <div className="py-2 md:py-4">
      <Link
        href={`/portal/${slug}/projects`}
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
          {project.milestones.length > 0
            ? `${done} of ${project.milestones.length} milestones complete`
            : "No milestones yet"}
        </p>
      </section>

      <section aria-labelledby="project-plan" className="mt-8">
        <h2 id="project-plan" className="text-muted-foreground mb-4 text-sm font-medium">
          The plan
        </h2>
        <div className="border-border bg-card rounded-2xl border p-6">
          <MilestoneRail
            milestones={project.milestones}
            editable={canEdit}
            workspaceSlug={slug}
            projectId={project.id}
          />
        </div>
      </section>
    </div>
  );
}
