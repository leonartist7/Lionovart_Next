import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProjectCard } from "@/components/portal/ProjectCard";
import { AgencyOnly } from "@/components/portal/AgencyOnly";
import { ProjectFormDialog } from "@/components/portal/ProjectFormDialog";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { listProjects } from "@/lib/portal/projects";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage({
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

  return (
    <div className="py-2 md:py-4">
      <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
        Projects
      </h1>

      {projects.length === 0 ? (
        <div className="mt-8 max-w-xl">
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            No projects yet. When the studio starts work, each piece appears here with its
            own progress and plan.
          </p>
          <AgencyOnly>
            <div className="mt-6 max-w-sm">
              <ProjectFormDialog workspaceSlug={slug} />
            </div>
          </AgencyOnly>
        </div>
      ) : (
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} workspaceSlug={slug} />
          ))}
          <AgencyOnly>
            <ProjectFormDialog workspaceSlug={slug} />
          </AgencyOnly>
        </div>
      )}
    </div>
  );
}
