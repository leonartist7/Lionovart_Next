import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { KanbanBoard } from "@/components/portal/KanbanBoard";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { roleAtLeast } from "@/lib/portal/types";
import { getProject } from "@/lib/portal/projects";
import { listTasks } from "@/lib/portal/tasks";

type Params = { params: Promise<{ workspace: string; projectId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { workspace: slug, projectId } = await params;
  const cookieStore = await cookies();
  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) return { title: "Board" };

  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) return { title: "Board" };

  const project = await getProject(access.workspace.id, projectId, access.membership.role);
  return { title: project ? `${project.name} · Board` : "Board" };
}

export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: Params) {
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

  const canEdit = roleAtLeast(access.membership.role, "agency");
  const tasks = await listTasks(access.workspace.id, projectId, access.membership.role);

  return (
    <div className="py-2 md:py-4">
      <Link
        href={`/portal/${slug}/projects/${projectId}`}
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
          workspaceSlug={slug}
          projectId={project.id}
          initialTasks={tasks}
          canEdit={canEdit}
          members={access.workspace.members}
        />
      </div>
    </div>
  );
}
