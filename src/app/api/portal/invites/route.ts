import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { createInvite } from "@/lib/portal/invites";
import { sendPortalInviteEmail } from "@/lib/email";
import type { Invite } from "@/lib/portal/types";
import { isSameOriginWrite, readResourceBody } from "@/lib/portal/resource-links";
import { privatePortalResponse } from "@/lib/portal/private-response";
import { resolveInviteOrigin, validateInviteRequest, validateInviteWorkspaceId } from "@/lib/portal/invite-request";

const reply = (body: unknown, status: number) => privatePortalResponse(NextResponse.json(body, { status }));

/** GET /api/portal/invites?workspaceId=… — existing agency-only invitation history. */
export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return privatePortalResponse(session);
  if (!adminDb) return reply({ error: "Firestore not configured" }, 503);
  let workspaceId: string;
  try { workspaceId = validateInviteWorkspaceId(req.nextUrl.searchParams.get("workspaceId")); }
  catch { return reply({ error: "Invalid workspaceId" }, 400); }
  try {
    const snap = await adminDb.collection("invites").where("workspaceId", "==", workspaceId).get();
    // Never return tokenHash — it is the only secret this document holds.
    const invites = snap.docs.map((d) => {
      const { tokenHash: _tokenHash, ...rest } = d.data() as Invite;
      return { ...rest, id: d.id };
    });
    return reply({ invites }, 200);
  } catch {
    return reply({ error: "Invitation history is unavailable. Try again later." }, 503);
  }
}

/** POST — create an invite and email the link. Existing agency authorization is unchanged. */
export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return privatePortalResponse(session);
  if (!isSameOriginWrite(req)) return reply({ error: "Refresh the portal before inviting someone." }, 403);
  if (!adminDb) return reply({ error: "Firestore not configured" }, 503);

  let input: ReturnType<typeof validateInviteRequest>;
  try { input = validateInviteRequest(await readResourceBody(req)); }
  catch { return reply({ error: "Send a JSON invitation with a valid workspace, email and client role (maximum 8 KiB)." }, 400); }

  let origin: string;
  try {
    origin = resolveInviteOrigin({
      PORTAL_BASE: process.env.PORTAL_BASE, VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_ENV: process.env.VERCEL_ENV, NODE_ENV: process.env.NODE_ENV,
    });
  }
  catch {
    // Resolve before creating an invite, so missing configuration cannot leave an orphan.
    return reply({ error: "Invitation links are not configured for this environment. Contact the Studio administrator." }, 503);
  }

  try {
    const wsSnap = await adminDb.collection("workspaces").doc(input.workspaceId).get();
    if (!wsSnap.exists) return reply({ error: "Workspace not found." }, 404);
    const name = wsSnap.data()?.name;
    const workspaceName = typeof name === "string" && name.trim() ? name : "your workspace";
    const { invite, token } = await createInvite({ ...input, workspaceName, createdBy: session.email });
    const joinUrl = `${origin}/portal/join?token=${encodeURIComponent(token)}`;

    let emailed = false;
    try {
      emailed = await sendPortalInviteEmail({
        toEmail: input.email, workspaceName, joinUrl, expiresAt: invite.expiresAt,
      });
    } catch {
      // Preserve the existing copy-link fallback. Never log the token or provider payload.
    }
    const { tokenHash: _tokenHash, ...safeInvite } = invite;
    return reply({ invite: safeInvite, emailed, joinUrl: emailed ? undefined : joinUrl }, 201);
  } catch {
    // A storage timeout may happen after a write. Do not suggest blindly resending.
    return reply({ error: "Invitation creation could not be confirmed. Check invitation history before trying again." }, 503);
  }
}
