/**
 * Portal domain types.
 *
 * Mirrors the Firestore layout documented in the client-portal plan. Everything
 * client-facing lives under `workspaces/{wsId}/…` so nothing collides with the
 * pre-existing Nova collections (`leads`, `conversations`, `dossiers`,
 * `agent_config`, `versions`).
 */

/* ── Roles & membership ─────────────────────────────────────────── */

/** Ordered least → most privileged. `agency` is LIONOVART staff. */
export const PORTAL_ROLES = [
  "viewer",
  "collaborator",
  "approver",
  "client_owner",
  "agency",
] as const;

export type PortalRole = (typeof PORTAL_ROLES)[number];

/** True when `role` is at least as privileged as `minimum`. */
export function roleAtLeast(role: PortalRole, minimum: PortalRole): boolean {
  return PORTAL_ROLES.indexOf(role) >= PORTAL_ROLES.indexOf(minimum);
}

export interface Membership {
  role: PortalRole;
  email: string;
  name: string;
  addedAt: string;
}

/* ── Core documents ─────────────────────────────────────────────── */

export interface PortalUser {
  uid: string;
  email: string;
  name: string;
  photoUrl?: string;
  createdAt: string;
  lastSeenAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  clientCompany?: string;
  logoUrl?: string;
  status: "active" | "paused" | "archived";
  createdAt: string;
  /** Links back to the existing Nova `leads` collection when the client came through the funnel. */
  leadId?: string;
  /** Denormalized so a membership check never needs a second read. */
  members: Record<string, Membership>;
  /** Mirrors `Object.keys(members)` — enables an array-contains query for "my workspaces". */
  memberUids: string[];
  /** E.164, used by the WhatsApp bridge to route inbound messages to this workspace. */
  whatsappNumber?: string;
}

export type ProjectKind = "brand" | "web" | "content" | "marketing";

export interface Project {
  id: string;
  name: string;
  kind: ProjectKind;
  status: "planning" | "active" | "review" | "delivered" | "on_hold";
  startAt?: string;
  dueAt?: string;
  /** 0–100, derived from milestones — never stored as an editable number. */
  progress: number;
  coverUrl?: string;
  /** `internal` projects are filtered out server-side for every non-agency member. */
  visibility: "client" | "internal";
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueAt?: string;
  status: "pending" | "active" | "done";
  order: number;
}

export const TASK_COLUMNS = [
  "backlog",
  "in_progress",
  "review",
  "approved",
  "done",
] as const;

export type TaskColumn = (typeof TASK_COLUMNS)[number];

export interface Task {
  id: string;
  title: string;
  description?: string;
  column: TaskColumn;
  /** Fractional index — a move rewrites one document, never the whole column. */
  order: number;
  assigneeUid?: string;
  dueAt?: string;
  /** `internal` tasks are hidden from every non-agency member. */
  visibility: "client" | "internal";
  createdAt: string;
  updatedAt: string;
}

/* ── Assets ─────────────────────────────────────────────────────── */

export type AssetKind = "image" | "video" | "doc" | "other";

export interface Asset {
  id: string;
  name: string;
  mime: string;
  kind: AssetKind;
  projectId?: string;
  currentVersion: number;
  uploadedBy: string;
  createdAt: string;
  tags: string[];
}

export interface AssetVersion {
  /** Version number, 1-based. Also the document id. */
  n: number;
  storagePath: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  uploadedBy: string;
  createdAt: string;
  note?: string;
}

/* ── Threads, comments, annotation pins ─────────────────────────── */

/**
 * A pin's position, normalized 0–1 against the *rendered image box* — never
 * viewport pixels. A pin dropped on a phone therefore lands in the identical
 * spot on a 27" monitor, at any container width.
 */
export interface AnnotationPin {
  x: number;
  y: number;
}

export type ThreadTarget = "asset" | "task" | "post" | "project";

export interface Thread {
  id: string;
  targetType: ThreadTarget;
  targetId: string;
  /** Pins belong to one asset version — v2 does not inherit v1's feedback. */
  versionId?: number;
  /** Present only for image annotations. A pin *is* a thread. */
  pin?: AnnotationPin;
  status: "open" | "resolved";
  createdBy: string;
  createdAt: string;
  lastMessageAt: string;
  participants: string[];
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface Comment {
  id: string;
  body: string;
  authorUid: string;
  authorName: string;
  createdAt: string;
  attachments?: string[];
}

/* ── Approvals ──────────────────────────────────────────────────── */

export interface Approval {
  id: string;
  targetType: "asset" | "post" | "milestone";
  targetId: string;
  versionId?: number;
  state: "pending" | "approved" | "changes_requested";
  requestedBy: string;
  requestedAt: string;
  decidedBy?: string;
  decidedAt?: string;
  note?: string;
}

/* ── Social content ─────────────────────────────────────────────── */

export const PLATFORMS = ["instagram", "facebook", "linkedin", "x"] as const;
export type Platform = (typeof PLATFORMS)[number];

export type PostState =
  | "idea"
  | "draft"
  | "in_review"
  | "approved"
  | "scheduled"
  | "published"
  | "rejected";

export interface PublishResult {
  status: "pending" | "published" | "failed";
  externalId?: string;
  url?: string;
  error?: string;
  at?: string;
}

export interface Post {
  id: string;
  platforms: Platform[];
  caption: string;
  hashtags: string[];
  assetIds: string[];
  scheduledFor?: string;
  timezone?: string;
  state: PostState;
  publishResults?: Partial<Record<Platform, PublishResult>>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Messages (WhatsApp bridge) ─────────────────────────────────── */

export interface PortalMessage {
  id: string;
  channel: "portal" | "whatsapp";
  direction: "in" | "out";
  body: string;
  mediaUrl?: string;
  authorUid?: string;
  authorName?: string;
  waMessageId?: string;
  status: "queued" | "sent" | "delivered" | "read" | "failed";
  error?: string;
  createdAt: string;
}

/* ── Activity feed / notification source ────────────────────────── */

export interface PortalEvent {
  id: string;
  type:
    | "comment_added"
    | "thread_resolved"
    | "approval_requested"
    | "approval_decided"
    | "asset_uploaded"
    | "task_moved"
    | "milestone_completed"
    | "post_state_changed"
    | "message_received";
  actorUid: string;
  actorName: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: string;
  readBy: string[];
}

/* ── Invites ────────────────────────────────────────────────────── */

export interface Invite {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: PortalRole;
  /** Only the SHA-256 hash is stored — the raw token exists solely in the email. */
  tokenHash: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  acceptedAt?: string;
  acceptedBy?: string;
}
