import "server-only";
import { listProjects, type ProjectWithMilestones } from "@/lib/portal/projects";
import type { PortalRole } from "@/lib/portal/types";

/**
 * Calendar items derived from project and milestone due dates.
 *
 * `post.scheduledFor` belongs here too per the page spec, but there is no
 * posts collection yet — Content hasn't been built. Nothing to query, so it's
 * left out rather than wired to a function that doesn't exist.
 */

export interface CalendarItem {
  id: string;
  date: string;
  title: string;
  kind: "project" | "milestone";
  projectId: string;
  projectName: string;
}

/**
 * Pure — no Firestore. Shared by the real page and the `/portal/demo/calendar`
 * preview so the two can never disagree, the same way `deriveProgress` is.
 */
export function deriveCalendarItems(projects: ProjectWithMilestones[]): CalendarItem[] {
  const items: CalendarItem[] = [];
  for (const project of projects) {
    if (project.dueAt) {
      items.push({
        id: `project-${project.id}`,
        date: project.dueAt,
        title: project.name,
        kind: "project",
        projectId: project.id,
        projectName: project.name,
      });
    }
    for (const milestone of project.milestones) {
      if (milestone.dueAt) {
        items.push({
          id: `milestone-${milestone.id}`,
          date: milestone.dueAt,
          title: milestone.title,
          kind: "milestone",
          projectId: project.id,
          projectName: project.name,
        });
      }
    }
  }
  return items.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

/** The one query behind both the mobile agenda and the desktop month grid. */
export async function listCalendarItems(
  workspaceId: string,
  viewerRole: PortalRole,
): Promise<CalendarItem[]> {
  const projects = await listProjects(workspaceId, viewerRole);
  return deriveCalendarItems(projects);
}

/** Local calendar day, e.g. "2026-09-13" — for grouping the agenda list. */
function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface CalendarDayGroup {
  day: string;
  items: CalendarItem[];
}

/** Groups already-sorted items by local calendar day. */
export function groupByDay(items: CalendarItem[]): CalendarDayGroup[] {
  const groups: CalendarDayGroup[] = [];
  for (const item of items) {
    const key = dayKey(item.date);
    const last = groups[groups.length - 1];
    if (last?.day === key) {
      last.items.push(item);
    } else {
      groups.push({ day: key, items: [item] });
    }
  }
  return groups;
}
