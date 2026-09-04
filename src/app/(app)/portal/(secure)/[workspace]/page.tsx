import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ProjectCard } from "@/components/portal/ProjectCard";
import { AgencyOnly } from "@/components/portal/AgencyOnly";
import { ProjectFormDialog } from "@/components/portal/ProjectFormDialog";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { deriveProgress, listProjects, nextMilestone } from "@/lib/portal/projects";
import { formatDate, relativeDate } from "@/lib/portal/format";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function WorkspaceOverviewPage({
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

  const projects = await listProjects(access.workspace.id, access.membership.role);
  const active = projects.filter((p) => p.status !== "delivered");

  // One number across the workspace, from every milestone rather than an
  // average of averages — a project with 12 milestones shouldn't count the same
  // as one with 2.
  const allMilestones = projects.flatMap((p) => p.milestones);
  const overall = deriveProgress(allMilestones);

  // The soonest thing the client should actually be looking at.
  const upcoming = active
    .map((p) => ({ project: p, milestone: nextMilestone(p.milestones) }))
    .filter((x): x is { project: (typeof active)[number]; milestone: NonNullable<ReturnType<typeof nextMilestone>> } =>
      Boolean(x.milestone),
    )
    .sort((a, b) => {
      const aDue = a.milestone.dueAt ? Date.parse(a.milestone.dueAt) : Infinity;
      const bDue = b.milestone.dueAt ? Date.parse(b.milestone.dueAt) : Infinity;
      return aDue - bDue;
    })
    .slice(0, 3);

  const firstName = session.name.split(" ")[0];

  return (
    <div className="py-2 md:py-4">
      <header>
        <p className="text-muted-foreground hidden text-[13px] font-medium tracking-[0.16em] uppercase md:block">
          {access.workspace.name}
        </p>
        <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em] md:mt-2 md:text-4xl">
          Welcome back, {firstName}.
        </h1>
      </header>

      {projects.length === 0 ? (
        <section className="border-border bg-card mt-8 max-w-xl rounded-2xl border p-6 md:p-8">
          <h2 className="font-heading text-foreground text-lg font-semibold">
            Nothing to review yet
          </h2>
          <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
            Once your first project is underway, this is where you&apos;ll see progress,
            anything waiting on your approval, and the latest activity from the studio.
          </p>
          <AgencyOnly>
            <div className="mt-6 max-w-sm">
              <ProjectFormDialog workspaceSlug={slug} />
            </div>
          </AgencyOnly>
        </section>
      ) : (
        <>
          {/* ── Overall progress ─────────────────────────────────── */}
          <section
            aria-labelledby="overview-progress"
            className="border-border bg-card mt-8 rounded-2xl border p-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="overview-progress" className="text-muted-foreground text-sm font-medium">
                Overall progress
              </h2>
              <span className="font-heading text-foreground text-2xl font-bold tabular-nums">
                {overall}%
              </span>
            </div>
            <Progress value={overall} className="mt-3" aria-label="Overall workspace progress" />
            <p className="text-muted-foreground mt-3 text-xs">
              {active.length} active {active.length === 1 ? "project" : "projects"} ·{" "}
              {allMilestones.filter((m) => m.status === "done").length} of{" "}
              {allMilestones.length} milestones complete
            </p>
          </section>

          {/* ── What's next ──────────────────────────────────────── */}
          {upcoming.length > 0 && (
            <section aria-labelledby="overview-next" className="mt-8">
              <h2 id="overview-next" className="text-muted-foreground mb-3 text-sm font-medium">
                Coming up
              </h2>
              <ul className="border-border bg-card divide-border divide-y overflow-hidden rounded-2xl border">
                {upcoming.map(({ project, milestone }) => (
                  <li key={milestone.id}>
                    <Link
                      href={`/portal/${slug}/projects/${project.id}`}
                      className="hover:bg-muted/60 focus-visible:ring-primary/50 flex items-center gap-3 p-4 transition-colors focus-visible:ring-3 focus-visible:outline-none focus-visible:-outline-offset-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">
                          {milestone.title}
                        </p>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {project.name}
                          {milestone.dueAt
                            ? ` · ${formatDate(milestone.dueAt)} (${relativeDate(milestone.dueAt)})`
                            : ""}
                        </p>
                      </div>
                      <ArrowRight
                        size={15}
                        className="text-muted-foreground shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Projects ─────────────────────────────────────────── */}
          <section aria-labelledby="overview-projects" className="mt-8">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 id="overview-projects" className="text-muted-foreground text-sm font-medium">
                Projects
              </h2>
              <Link
                href={`/portal/${slug}/projects`}
                className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
              >
                See all
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.slice(0, 4).map((project) => (
                <ProjectCard key={project.id} project={project} workspaceSlug={slug} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
