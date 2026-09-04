import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { createInvite } from "@/lib/portal/invites";
import { sendPortalInviteEmail } from "@/lib/email";
import { PORTAL_ROLES, type Invite, type PortalRole } from "@/lib/portal/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** GET /api/portal/invites?workspaceId=… — pending invites for a workspace. */
export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!adminDb) {
    return NextResponse.json({ error: "Firestore not configured" }, { status: 503 });
  }

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  const snap = await adminDb
    .collection("invites")
    .where("workspaceId", "==", workspaceId)
    .get();

  // Never return tokenHash — it is the only secret this document holds.
  const invites = snap.docs.map((d) => {
    const { tokenHash: _tokenHash, ...rest } = d.data() as Invite;
    return { ...rest, id: d.id };
  });

  return NextResponse.json({ invites });
}

/** POST — create an invite and email the link. Agency-only. */
export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!adminDb) {
    return NextResponse.json({ error: "Firestore not configured" }, { status: 503 });
  }

  let body: { workspaceId?: string; email?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const workspaceId = body.workspaceId?.trim();
  const email = body.email?.trim().toLowerCase();
  const role = (body.role ?? "client_owner") as PortalRole;

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!PORTAL_ROLES.includes(role) || role === "agency") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const wsSnap = await adminDb.collection("workspaces").doc(workspaceId).get();
  if (!wsSnap.exists) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  }
  const workspaceName = (wsSnap.data()?.name as string) ?? "your workspace";

  const { invite, token } = await createInvite({
    workspaceId,
    workspaceName,
    email,
    role,
    createdBy: session.email,
  });

  const origin = req.nextUrl.origin;
  const joinUrl = `${origin}/portal/join?token=${encodeURIComponent(token)}`;

  const emailed = await sendPortalInviteEmail({
    toEmail: email,
    workspaceName,
    joinUrl,
    expiresAt: invite.expiresAt,
  });

  const { tokenHash: _tokenHash, ...safeInvite } = invite;
  return NextResponse.json(
    {
      invite: safeInvite,
      emailed,
      // Returned so Leon can copy the link himself when Resend isn't
      // configured (local dev) or the send failed — the invite is still valid.
      joinUrl: emailed ? undefined : joinUrl,
    },
    { status: 201 },
  );
}
