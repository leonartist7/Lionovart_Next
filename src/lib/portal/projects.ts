import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import {
  roleAtLeast,
  type Milestone,
  type PortalRole,
  type Project,
  type ProjectKind,
} from "@/lib/portal/types";

/**
 * Project and milestone reads/writes.
 *
 * Server components read through here directly (matching the admin console's
 * pattern) and API routes call the same functions, so progress is derived in
 * exactly one place and can never disagree between a page and its API.
 */

export const PROJECT_KINDS: ProjectKind[] = ["brand", "web", "content", "marketing"];

export const PROJECT_KIND_LABELS: Record<ProjectKind, string> = {
  brand: "Brand",
  web: "Web",
  content: "Content",
  marketing: "Marketing",
};

export const PROJECT_STATUSES: Project["status"][] = [
  "planning",
  "active",
  "review",
  "delivered",
  "on_hold",
];

export const PROJECT_STATUS_LABELS: Record<Project["status"], string> = {
  planning: "Planning",
  active: "In progress",
  review: "In review",
  delivered: "Delivered",
  on_hold: "On hold",
};

export interface ProjectWithMilestones extends Project {
  milestones: Milestone[];
}

function projectsRef(workspaceId: string) {
  if (!adminDb) throw new Error("Firestore is not configured");
  return adminDb.collection("workspaces").doc(workspaceId).collection("projects");
}

function milestonesRef(workspaceId: string, projectId: string) {
  return projectsRef(workspaceId).doc(projectId).collection("milestones");
}

/**
 * Progress is always derived from milestones, never stored as an editable
 * number — a hand-maintained percentage goes stale and quietly lies to the
 * client about where their project actually is.
 */
export function deriveProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.status === "done").length;
  return Math.round((done / milestones.length) * 100);
}

/** The milestone the client should be looking at next, or null when all are done. */
export function nextMilestone(milestones: Milestone[]): Milestone | null {
  const ordered = [...milestones].sort((a, b) => a.order - b.order);
  return ordered.find((m) => m.status === "active") ?? ordered.find((m) => m.status === "pending") ?? null;
}

/**
 * Internal-visibility projects are filtered out here, server-side, for anyone
 * below `agency` — never rendered and then hidden with CSS.
 */
export async function listProjects(
  workspaceId: string,
  viewerRole: PortalRole,
): Promise<ProjectWithMilestones[]> {
  if (!adminDb) return [];

  const snap = await projectsRef(workspaceId).orderBy("createdAt", "desc").get();
  const canSeeInternal = roleAtLeast(viewerRole, "agency");

  const projects = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Project & { visibility?: string })
    .filter((p) => canSeeInternal || p.visibility !== "internal");

  return Promise.all(
    projects.map(async (project) => {
      const milestones = await listMilestones(workspaceId, project.id);
      return { ...project, milestones, progress: deriveProgress(milestones) };
    }),
  );
}

export async function getProject(
  workspaceId: string,
  projectId: string,
  viewerRole: PortalRole,
): Promise<ProjectWithMilestones | null> {
  if (!adminDb) return null;

  const doc = await projectsRef(workspaceId).doc(projectId).get();
  if (!doc.exists) return null;

  const project = { id: doc.id, ...doc.data() } as Project & { visibility?: string };
  if (project.visibility === "internal" && !roleAtLeast(viewerRole, "agency")) {
    return null;
  }

  const milestones = await listMilestones(workspaceId, projectId);
  return { ...project, milestones, progress: deriveProgress(milestones) };
}

export async function listMilestones(
  workspaceId: string,
  projectId: string,
): Promise<Milestone[]> {
  if (!adminDb) return [];
  const snap = await milestonesRef(workspaceId, projectId).orderBy("order").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Milestone);
}

export interface CreateProjectInput {
  name: string;
  kind: ProjectKind;
  status?: Project["status"];
  startAt?: string;
  dueAt?: string;
  visibility?: "client" | "internal";
}

export async function createProject(
  workspaceId: string,
  input: CreateProjectInput,
): Promise<Project> {
  const doc = {
    name: input.name,
    kind: input.kind,
    status: input.status ?? "planning",
    startAt: input.startAt ?? null,
    dueAt: input.dueAt ?? null,
    visibility: input.visibility ?? "client",
    progress: 0,
    createdAt: new Date().toISOString(),
  };
  const ref = await projectsRef(workspaceId).add(doc);
  return { id: ref.id, ...doc } as unknown as Project;
}

export async function updateProject(
  workspaceId: string,
  projectId: string,
  patch: Partial<CreateProjectInput>,
): Promise<void> {
  // Strip undefined so a partial patch never blanks a field it didn't mention.
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  );
  if (Object.keys(clean).length === 0) return;
  await projectsRef(workspaceId).doc(projectId).update(clean);
}

/** Deletes the project and its milestones — Firestore does not cascade. */
export async function deleteProject(workspaceId: string, projectId: string): Promise<void> {
  if (!adminDb) return;
  const milestones = await milestonesRef(workspaceId, projectId).get();
  const batch = adminDb.batch();
  milestones.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(projectsRef(workspaceId).doc(projectId));
  await batch.commit();
}

export interface CreateMilestoneInput {
  title: string;
  dueAt?: string;
  status?: Milestone["status"];
}

export async function createMilestone(
  workspaceId: string,
  projectId: string,
  input: CreateMilestoneInput,
): Promise<Milestone> {
  const existing = await listMilestones(workspaceId, projectId);
  const doc = {
    title: input.title,
    dueAt: input.dueAt ?? null,
    status: input.status ?? "pending",
    // Append to the end; fractional reordering lands with the board in Phase 3.
    order: existing.length > 0 ? Math.max(...existing.map((m) => m.order)) + 1 : 0,
  };
  const ref = await milestonesRef(workspaceId, projectId).add(doc);
  return { id: ref.id, ...doc } as unknown as Milestone;
}

export async function updateMilestone(
  workspaceId: string,
  projectId: string,
  milestoneId: string,
  patch: Partial<CreateMilestoneInput & { order: number }>,
): Promise<void> {
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  );
  if (Object.keys(clean).length === 0) return;
  await milestonesRef(workspaceId, projectId).doc(milestoneId).update(clean);
}

export async function deleteMilestone(
  workspaceId: string,
  projectId: string,
  milestoneId: string,
): Promise<void> {
  await milestonesRef(workspaceId, projectId).doc(milestoneId).delete();
}

/**
 * Badge colour by status. Red is the brand accent and stays scarce — it marks
 * work actually in flight, not every chip on the page.
 */
export function statusBadgeVariant(
  status: Project["status"],
): "default" | "neutral" | "success" | "warning" {
  switch (status) {
    case "active":
      return "default";
    case "review":
      return "warning";
    case "delivered":
      return "success";
    default:
      return "neutral";
  }
}
