import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { signUpload } from "@/lib/portal/assets";

type Params = { params: Promise<{ workspace: string }> };

/**
 * POST — issues a signed PUT URL for a new asset or a new version of an
 * existing one. The mime allowlist and 25MB cap are enforced here, before any
 * URL is handed out — never trust the client's declared type once bytes land.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace, "collaborator");
  if (access instanceof NextResponse) return access;

  let body: { assetId?: string; name?: string; mime?: string; sizeBytes?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || !body.mime || typeof body.sizeBytes !== "number") {
    return NextResponse.json({ error: "name, mime and sizeBytes are required." }, { status: 400 });
  }

  const result = await signUpload(access.workspace.id, {
    assetId: body.assetId,
    name,
    mime: body.mime,
    sizeBytes: body.sizeBytes,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
