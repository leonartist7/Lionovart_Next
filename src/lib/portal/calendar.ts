import "server-only";
import { listPosts, postSummary } from "@/lib/portal/posts";
import { listProjects, type ProjectWithMilestones } from "@/lib/portal/projects";
import type { PortalRole } from "@/lib/portal/types";

/**
 * Calendar items derived from project and milestone due dates, plus scheduled
 * content once Content exists to schedule any.
 */

export interface CalendarItem {
  id: string;
  date: string;
  title: string;
  kind: "project" | "milestone" | "post";
  /** Absent for a post — content isn't attached to a project. */
  projectId?: string;
  projectName?: string;
  /** Present only for a scheduled post. */
  postId?: string;
}

/**
 * Where an entry goes when it's tapped. A scheduled post belongs to Content,
 * not to a project — without this, a post entry linked at
 * `/projects/undefined`.
 */
export function calendarHref(item: CalendarItem, workspaceSlug: string): string {
  return item.kind === "post"
    ? `/portal/${workspaceSlug}/content/${item.postId}`
    : `/portal/${workspaceSlug}/projects/${item.projectId}`;
}

/**
 * Pure — no Firestore. Shared by the real page and the `/portal/demo/calendar`
 * preview so the two can never disagree, the same way `deriveProgress` is.
 */
export function deriveCalendarItems(
  projects: ProjectWithMilestones[],
  posts: readonly CalendarPost[] = [],
): CalendarItem[] {
  const items: CalendarItem[] = [];
  for (const post of posts) {
    if (!post.scheduledFor) continue;
    items.push({
      id: `post-${post.id}`,
      date: post.scheduledFor,
      title: post.title,
      kind: "post",
      postId: post.id,
    });
  }
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

/** A scheduled post, reduced to what the calendar needs. */
export interface CalendarPost {
  id: string;
  title: string;
  scheduledFor?: string;
}

/**
 * The one query behind both the mobile agenda and the desktop month grid.
 *
 * `listPosts` applies the same role filter Content does, so a client's
 * calendar can't show a draft that isn't visible to them on the Content page.
 */
export async function listCalendarItems(
  workspaceId: string,
  viewerRole: PortalRole,
): Promise<CalendarItem[]> {
  const [projects, posts] = await Promise.all([
    listProjects(workspaceId, viewerRole),
    listPosts(workspaceId, viewerRole),
  ]);
  return deriveCalendarItems(
    projects,
    posts.map((p) => ({ id: p.id, title: postSummary(p), scheduledFor: p.scheduledFor })),
  );
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
