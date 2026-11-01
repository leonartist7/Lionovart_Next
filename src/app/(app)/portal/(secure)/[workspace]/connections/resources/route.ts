import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { isSameOriginWrite, readResourceBody, validateResourceLink } from "@/lib/portal/resource-links";
import { addResourceLink, removeResourceLink, ResourceLinkConflict } from "@/lib/portal/resource-links-store";
import { privatePortalResponse } from "@/lib/portal/private-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ workspace: string }> };
const reply = (body: unknown, status: number) => privatePortalResponse(Response.json(body, { status }));

async function mutate(request: NextRequest, context: Context, remove: boolean) {
  if (!isSameOriginWrite(request)) return reply({ error: "Refresh the portal before making changes." }, 403);
  try {
    const { workspace } = await context.params;
    const access = await requireWorkspace(request, workspace, "agency");
    if (access instanceof NextResponse) return privatePortalResponse(access);
    let body: unknown;
    try { body = await readResourceBody(request); }
    catch (error) { return reply({ error: error instanceof Error ? error.message : "Invalid request." }, 400); }
    if (remove) {
      const id = body && typeof body === "object" ? (body as Record<string, unknown>).id : undefined;
      if (typeof id !== "string" || !/^[a-f0-9]{64}$/.test(id)) return reply({ error: "Invalid resource identifier." }, 400);
      await removeResourceLink(access.workspace.id, access.session.uid, id);
      return reply({ ok: true }, 200);
    }
    let input;
    try { input = validateResourceLink(body); }
    catch (error) { return reply({ error: error instanceof Error ? error.message : "Invalid resource." }, 400); }
    const link = await addResourceLink(access.workspace.id, access.session.uid, input);
    return reply({ link }, 201);
  } catch (error) {
    if (error instanceof ResourceLinkConflict) return reply({ error: error.message }, 409);
    return reply({ error: "Resources are unavailable. Your change was not confirmed; refresh before retrying." }, 503);
  }
}
export async function POST(request: NextRequest, context: Context) { return mutate(request, context, false); }
export async function DELETE(request: NextRequest, context: Context) { return mutate(request, context, true); }
