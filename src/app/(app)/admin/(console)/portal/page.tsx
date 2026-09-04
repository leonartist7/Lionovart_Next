import { FolderOpen } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  PortalWorkspaces,
  type AdminInvite,
  type AdminWorkspace,
} from "@/components/admin/PortalWorkspaces";
import type { Invite, Workspace } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

export default async function AdminPortalPage() {
  if (!adminDb) {
    return (
      <EmptyState
        icon={FolderOpen}
        label="Firestore isn't configured"
        hint="Set FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY to manage client workspaces."
      />
    );
  }

  const [wsSnap, invSnap] = await Promise.all([
    adminDb.collection("workspaces").orderBy("createdAt", "desc").get(),
    adminDb.collection("invites").get(),
  ]);

  const workspaces: AdminWorkspace[] = wsSnap.docs.map((d) => {
    const data = d.data() as Workspace;
    return {
      id: d.id,
      name: data.name,
      slug: data.slug,
      clientCompany: data.clientCompany ?? null,
      memberCount: data.memberUids?.length ?? 0,
      createdAt: data.createdAt,
    };
  });

  // tokenHash never leaves the server — it is the only secret an invite holds.
  const invites: AdminInvite[] = invSnap.docs.map((d) => {
    const data = d.data() as Invite;
    return {
      id: d.id,
      workspaceId: data.workspaceId,
      email: data.email,
      role: data.role,
      expiresAt: data.expiresAt,
      acceptedAt: data.acceptedAt,
    };
  });

  return <PortalWorkspaces workspaces={workspaces} invites={invites} />;
}
