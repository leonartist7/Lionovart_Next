import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { isSameOriginWrite, readResourceBody, validateResourceLink } from "@/lib/portal/resource-links";
import { addResourceLink, removeResourceLink, updateResourceLink, ResourceLinkConflict } from "@/lib/portal/resource-links-store";
import { privatePortalResponse } from "@/lib/portal/private-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ workspace: string }> };
const reply = (body: unknown, status: number) => privatePortalResponse(Response.json(body, { status }));

async function mutate(request: NextRequest, context: Context, action: "add" | "remove" | "update") {
  if (!isSameOriginWrite(request)) return reply({ error: "Refresh the portal before making changes." }, 403);
  try {
    const { workspace } = await context.params;
    const access = await requireWorkspace(request, workspace, "agency");
    if (access instanceof NextResponse) return privatePortalResponse(access);
    let body: unknown;
    try { body = await readResourceBody(request); }
    catch (error) { return reply({ error: error instanceof Error ? error.message : "Invalid request." }, 400); }
    if (action === "remove") {
      const id = body && typeof body === "object" ? (body as Record<string, unknown>).id : undefined;
      if (typeof id !== "string" || !/^[a-f0-9]{64}$/.test(id)) return reply({ error: "Invalid resource identifier." }, 400);
      await removeResourceLink(access.workspace.id, access.session.uid, id);
      return reply({ ok: true }, 200);
    }
    if (action === "update") {
      const value = body && typeof body === "object" ? body as Record<string, unknown> : {};
      const id = value.id;
      if (typeof id !== "string" || !/^[a-f0-9]{64}$/.test(id)) return reply({ error: "Invalid resource identifier." }, 400);
      let expected: ReturnType<typeof validateResourceLink>;
      let resource: ReturnType<typeof validateResourceLink>;
      try {
        expected = validateResourceLink(value.expected);
        resource = validateResourceLink(value.resource);
      } catch (error) {
        return reply({ error: error instanceof Error ? error.message : "Invalid resource." }, 400);
      }
      const link = await updateResourceLink(access.workspace.id, access.session.uid, id, expected, resource, value.confirmShare === true);
      return reply({ link }, 200);
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
export async function POST(request: NextRequest, context: Context) { return mutate(request, context, "add"); }
export async function PATCH(request: NextRequest, context: Context) { return mutate(request, context, "update"); }
export async function DELETE(request: NextRequest, context: Context) { return mutate(request, context, "remove"); }
