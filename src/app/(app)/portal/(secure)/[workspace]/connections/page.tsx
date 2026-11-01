import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ConnectionsHub } from "@/components/portal/ConnectionsHub";
import { PORTAL_SESSION_COOKIE, getPortalSession, getWorkspaceAccessBySlug } from "@/lib/portal-auth";
import { adminStorage } from "@/lib/firebase-admin";
import { listResourceLinks } from "@/lib/portal/resource-links-store";
import type { ResourceLink } from "@/lib/portal/resource-links";

export const metadata: Metadata = { title: "Connections", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ConnectionsPage({ params }: { params: Promise<{ workspace: string }> }) {
  const { workspace: slug } = await params;
  const cookieStore = await cookies();
  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");
  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) notFound();
  const canManage = access.membership.role === "agency";
  let links: ResourceLink[] = [];
  let resourceError: string | undefined;
  try { links = await listResourceLinks(access.workspace.id, canManage); }
  catch { resourceError = "Workspace storage could not be reached. No resources have been changed."; }
  // Clients receive neither credential values nor provider configuration state.
  const readiness = canManage ? {
    email: Boolean(process.env.RESEND_API_KEY), storage: Boolean(adminStorage),
    emulated: Boolean(process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST),
  } : undefined;
  return <ConnectionsHub workspaceSlug={slug} links={links} canManage={canManage} readiness={readiness} resourceError={resourceError}/>;
}
