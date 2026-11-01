import { deriveCalendarItems } from "@/lib/portal/calendar";
import { demoProjects, resolveDemoView, DEMO_WORKSPACE } from "@/lib/portal/demo-data";
import { renderCalendarExport } from "@/lib/portal/calendar-export";
import { privatePortalResponse } from "@/lib/portal/private-response";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const view = resolveDemoView(new URL(request.url).searchParams.get("view") ?? undefined);
  // Sample data only; this public route must never query a real workspace.
  const result = renderCalendarExport(deriveCalendarItems(demoProjects(view)), {
    workspaceId: `demo-${view}`, workspaceName: `${DEMO_WORKSPACE.name} (sample data)`,
  });
  return privatePortalResponse(new Response(result.content, { headers: {
    "Content-Type": "text/calendar; charset=utf-8",
    "Content-Disposition": 'attachment; filename="lionovart-demo-calendar.ics"',
    "X-Calendar-Exported": String(result.exported), "X-Calendar-Skipped": String(result.skipped),
  } }));
}
