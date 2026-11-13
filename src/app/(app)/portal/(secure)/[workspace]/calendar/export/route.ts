import { NextRequest, NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/portal-auth";
import { listCalendarItems } from "@/lib/portal/calendar";
import { renderCalendarExport } from "@/lib/portal/calendar-export";
import { privatePortalResponse } from "@/lib/portal/private-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ workspace: string }> }) {
  try {
    const { workspace } = await context.params;
    // The role comes from verified membership, never a view query parameter.
    const access = await requireWorkspace(request, workspace);
    if (access instanceof NextResponse) return privatePortalResponse(access);
    const items = await listCalendarItems(access.workspace.id, access.membership.role);
    const result = renderCalendarExport(items, { workspaceId: access.workspace.id, workspaceName: access.workspace.name });
    return privatePortalResponse(new Response(result.content, { headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="lionovart-calendar.ics"',
      "X-Calendar-Exported": String(result.exported),
      "X-Calendar-Skipped": String(result.skipped),
    } }));
  } catch {
    return privatePortalResponse(Response.json({ error: "Calendar export is unavailable. Please try again." }, { status: 503 }));
  }
}
