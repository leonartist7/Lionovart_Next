import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { listMessages, sendPortalMessage } from "@/lib/portal/messages";
import { roleAtLeast } from "@/lib/portal/types";

type Params = { params: Promise<{ workspace: string }> };

/** GET — the workspace's one message thread, oldest first. */
export async function GET(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace);
  if (access instanceof NextResponse) return access;

  const messages = await listMessages(access.workspace.id);
  return NextResponse.json({ messages });
}

/**
 * POST — sends a message. An agency reply is relayed to the client's WhatsApp
 * when the workspace has one connected; a client's message stays in the
 * portal, since that's already where the studio reads it.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace, "collaborator");
  if (access instanceof NextResponse) return access;

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = body.body?.trim();
  if (!text) {
    return NextResponse.json({ error: "A message can't be empty." }, { status: 400 });
  }

  const message = await sendPortalMessage(access.workspace.id, {
    authorUid: access.session.uid,
    authorName: access.session.name,
    body: text,
    isAgency: roleAtLeast(access.membership.role, "agency"),
    whatsappNumber: access.workspace.whatsappNumber,
  });

  return NextResponse.json({ message }, { status: 201 });
}
