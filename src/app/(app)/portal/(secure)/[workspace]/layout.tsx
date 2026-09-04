import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  listWorkspacesForSession,
} from "@/lib/portal-auth";
import { PORTAL_THEME_COOKIE, resolveThemeChoice } from "@/lib/portal/theme";

export const dynamic = "force-dynamic";

/**
 * Resolves the workspace from its slug and wraps everything below in the app
 * frame. A slug the caller isn't a member of is a 404, never a 403 — the
 * portal should not confirm that another client's workspace exists.
 */
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const cookieStore = await cookies();

  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const workspaces = await listWorkspacesForSession(session);
  const current = workspaces.find((w) => w.slug === slug);
  if (!current) notFound();

  const theme = resolveThemeChoice(cookieStore.get(PORTAL_THEME_COOKIE)?.value);

  return (
    <PortalShell
      workspaceSlug={current.slug}
      workspaceName={current.name}
      workspaces={workspaces.map((w) => ({ slug: w.slug, name: w.name }))}
      userName={session.name}
      userEmail={session.email}
      theme={theme}
    >
      {children}
    </PortalShell>
  );
}
