import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { WorkspaceOverview } from "@/components/portal/WorkspaceOverview";
import { ProjectFormDialog } from "@/components/portal/ProjectFormDialog";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { listProjects } from "@/lib/portal/projects";
import { roleAtLeast } from "@/lib/portal/types";

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
  // Decided here, on the server, so the control is absent from a client's
  // response rather than rendered and hidden.
  const canAdd = roleAtLeast(access.membership.role, "agency");

  return (
    <WorkspaceOverview
      workspaceName={access.workspace.name}
      firstName={session.name.split(" ")[0]}
      workspaceSlug={slug}
      projects={projects}
      addProjectSlot={canAdd ? <ProjectFormDialog workspaceSlug={slug} /> : undefined}
    />
  );
}
