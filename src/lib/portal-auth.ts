import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { isAllowlistedEmail } from "@/lib/admin-auth";
import {
  roleAtLeast,
  type Membership,
  type PortalRole,
  type Workspace,
} from "@/lib/portal/types";

export const PORTAL_SESSION_COOKIE = "lv_portal_session";

/** Matches the admin console's session lifetime. */
export const PORTAL_SESSION_TTL_MS = 5 * 24 * 60 * 60 * 1000;

export interface PortalSession {
  uid: string;
  email: string;
  name: string;
  /** True for LIONOVART staff (the admin email allowlist) — implicit `agency` on every workspace. */
  isAgency: boolean;
}

/**
 * Verifies a portal session cookie.
 *
 * Deliberately mirrors `getAdminSession` in `@/lib/admin-auth`, but membership
 * is Firestore-backed rather than an env allowlist — clients are data, not
 * configuration.
 */
export async function getPortalSession(
  cookieValue: string | undefined | null,
): Promise<PortalSession | null> {
  if (!adminAuth || !cookieValue) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookieValue, true);
    const email = decoded.email;
    if (!email) return null;
    return {
      uid: decoded.uid,
      email,
      name: (decoded.name as string | undefined) ?? email.split("@")[0],
      isAgency: isAllowlistedEmail(email),
    };
  } catch {
    return null;
  }
}

/**
 * Use at the top of every /api/portal/* route that isn't workspace-scoped:
 *   const session = await requirePortal(req);
 *   if (session instanceof NextResponse) return session;
 */
export async function requirePortal(
  req: NextRequest,
): Promise<PortalSession | NextResponse> {
  const session = await getPortalSession(
    req.cookies.get(PORTAL_SESSION_COOKIE)?.value,
  );
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export interface WorkspaceAccess {
  session: PortalSession;
  workspace: Workspace;
  membership: Membership;
}

/**
 * Resolves a workspace and the caller's role in it, or null when the caller
 * isn't a member. Agency staff get implicit `agency` access to every workspace
 * so Leon never has to add himself to a client's member list.
 */
export async function getWorkspaceAccess(
  session: PortalSession,
  workspaceId: string,
): Promise<WorkspaceAccess | null> {
  if (!adminDb) return null;

  const snap = await adminDb.collection("workspaces").doc(workspaceId).get();
  if (!snap.exists) return null;

  const workspace = { id: snap.id, ...snap.data() } as Workspace;

  const membership: Membership | undefined = session.isAgency
    ? {
        role: "agency",
        email: session.email,
        name: session.name,
        addedAt: workspace.createdAt,
      }
    : workspace.members?.[session.uid];

  if (!membership) return null;
  return { session, workspace, membership };
}

/**
 * Use at the top of every workspace-scoped /api/portal/* route:
 *   const access = await requireMembership(req, workspaceId, "collaborator");
 *   if (access instanceof NextResponse) return access;
 *
 * 401 when unauthenticated, 404 when the workspace is unknown *or* the caller
 * isn't a member (never leak a workspace's existence), 403 when the caller is a
 * member but the role is too low.
 */
export async function requireMembership(
  req: NextRequest,
  workspaceId: string,
  minimumRole: PortalRole = "viewer",
): Promise<WorkspaceAccess | NextResponse> {
  const session = await requirePortal(req);
  if (session instanceof NextResponse) return session;

  const access = await getWorkspaceAccess(session, workspaceId);
  if (!access) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!roleAtLeast(access.membership.role, minimumRole)) {
    return NextResponse.json(
      { error: "You don't have permission to do that." },
      { status: 403 },
    );
  }
  return access;
}

/** Every workspace the signed-in user can open, newest first. */
export async function listWorkspacesForSession(
  session: PortalSession,
): Promise<Workspace[]> {
  if (!adminDb) return [];

  const col = adminDb.collection("workspaces");
  // Agency staff see everything; clients see only what they're a member of.
  const query = session.isAgency
    ? col.orderBy("createdAt", "desc")
    : col
        .where("memberUids", "array-contains", session.uid)
        .orderBy("createdAt", "desc");

  const snap = await query.get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Workspace);
}
