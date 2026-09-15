import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { brandTemplate } from "@/lib/portal/brand";
import { generateBrandPlate } from "@/lib/portal/content-ai";

type Params = { params: Promise<{ workspace: string }> };

/**
 * POST — generate an on-brand background plate and file it as an asset.
 *
 * Agency only. What comes back is a plate, not a finished graphic: the type is
 * laid over it as real SVG afterwards. See `brand.ts` for why.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { workspace } = await params;
  const access = await requireWorkspace(req, workspace, "agency");
  if (access instanceof NextResponse) return access;

  let body: { subject?: unknown; template?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  if (!subject) {
    return NextResponse.json({ error: "Describe what the image should show." }, { status: 400 });
  }

  const template = brandTemplate(typeof body.template === "string" ? body.template : "");
  if (!template) {
    return NextResponse.json({ error: "Unknown template." }, { status: 400 });
  }

  const result = await generateBrandPlate(access.workspace.id, {
    subject,
    template,
    actorUid: access.session.uid,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.value, { status: 201 });
}
