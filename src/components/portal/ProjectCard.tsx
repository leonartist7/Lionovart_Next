import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PROJECT_KIND_LABELS,
  PROJECT_STATUS_LABELS,
  nextMilestone,
  statusBadgeVariant,
  type ProjectWithMilestones,
} from "@/lib/portal/projects";
import { formatDate } from "@/lib/portal/format";

export function ProjectCard({
  project,
  workspaceSlug,
}: {
  project: ProjectWithMilestones;
  workspaceSlug: string;
}) {
  const next = nextMilestone(project.milestones);
  const done = project.milestones.filter((m) => m.status === "done").length;

  return (
    <Link
      href={`/portal/${workspaceSlug}/projects/${project.id}`}
      className="border-border bg-card hover:border-primary/40 group focus-visible:ring-primary/50 block rounded-2xl border p-5 transition-[border-color,transform] duration-150 ease-out active:scale-[0.995] focus-visible:ring-3 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-foreground truncate text-base font-semibold">
            {project.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="neutral">{PROJECT_KIND_LABELS[project.kind]}</Badge>
            <Badge variant={statusBadgeVariant(project.status)}>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
            {project.visibility === "internal" && <Badge variant="warning">Internal</Badge>}
          </div>
        </div>
        <ArrowRight
          size={16}
          className="text-muted-foreground group-hover:text-foreground mt-1 shrink-0 transition-colors"
          aria-hidden="true"
        />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="text-muted-foreground text-xs">
            {project.milestones.length > 0
              ? `${done} of ${project.milestones.length} milestones`
              : "No milestones yet"}
          </span>
          <span className="text-foreground text-sm font-medium tabular-nums">
            {project.progress}%
          </span>
        </div>
        <Progress value={project.progress} aria-label={`${project.name} progress`} />
      </div>

      {(next || project.dueAt) && (
        <p className="text-muted-foreground mt-3 truncate text-xs">
          {next ? `Next: ${next.title}` : "All milestones complete"}
          {project.dueAt ? ` · due ${formatDate(project.dueAt)}` : ""}
        </p>
      )}
    </Link>
  );
}
