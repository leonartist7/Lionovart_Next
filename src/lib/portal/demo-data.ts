import type { ProjectWithMilestones } from "@/lib/portal/projects";
import { deriveProgress } from "@/lib/portal/projects";
import type {
  AssetKind,
  Comment,
  Milestone,
  PortalMessage,
  Task,
  TaskColumn,
  Thread,
} from "@/lib/portal/types";

/**
 * Fixtures for the design preview at /portal/demo.
 *
 * Plain in-memory objects — the demo route never touches Firestore, never mints
 * a session, and cannot mutate anything. It exists so the front end can be
 * reviewed before the production database and auth are configured.
 *
 * Everything here is invented. No real client, project or date.
 */

const DEMO_SLUG = "demo";

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

function milestones(
  spec: [title: string, status: Milestone["status"], dueInDays: number][],
): Milestone[] {
  return spec.map(([title, status, dueInDays], i) => ({
    id: `m-${i}-${title.toLowerCase().replace(/\W+/g, "-")}`,
    title,
    status,
    order: i,
    dueAt: daysFromNow(dueInDays),
  }));
}

function project(
  id: string,
  name: string,
  kind: ProjectWithMilestones["kind"],
  status: ProjectWithMilestones["status"],
  ms: Milestone[],
  visibility: "client" | "internal" = "client",
  dueInDays = 30,
): ProjectWithMilestones {
  return {
    id,
    name,
    kind,
    status,
    visibility,
    milestones: ms,
    progress: deriveProgress(ms),
    dueAt: daysFromNow(dueInDays),
    createdAt: daysFromNow(-40),
  };
}

export const DEMO_WORKSPACE = {
  slug: DEMO_SLUG,
  name: "Northwind Coffee",
  clientCompany: "Northwind Coffee Co.",
};

export const DEMO_CLIENT = { name: "Dana Reyes", email: "dana@northwind.example" };
export const DEMO_AGENCY = { name: "Leon", email: "studio@lionovart.com" };

export const DEMO_PROJECTS: ProjectWithMilestones[] = [
  project(
    "brand-identity",
    "Brand Identity System",
    "brand",
    "active",
    milestones([
      ["Discovery & audit", "done", -21],
      ["Territory concepts", "done", -7],
      ["Refinement round", "active", 6],
      ["Guidelines & handover", "pending", 24],
    ]),
  ),
  project(
    "site-build",
    "Website Build",
    "web",
    "review",
    milestones([
      ["Sitemap & wireframes", "done", -14],
      ["Design system", "done", -3],
      ["Build & integration", "active", 12],
      ["QA & launch", "pending", 30],
    ]),
    "client",
    32,
  ),
  project(
    "launch-campaign",
    "Launch Campaign",
    "marketing",
    "planning",
    milestones([
      ["Channel strategy", "pending", 18],
      ["Asset production", "pending", 34],
      ["Go-live", "pending", 48],
    ]),
    "client",
    50,
  ),
  // Only ever visible in the studio view — proves the client/studio split.
  project(
    "internal-margin",
    "Scope & margin review",
    "brand",
    "on_hold",
    milestones([["Re-estimate phase 2", "pending", 9]]),
    "internal",
    12,
  ),
];

/** The client sees no internal work — same filter the real data layer applies. */
export function demoProjects(view: DemoView): ProjectWithMilestones[] {
  return view === "studio"
    ? DEMO_PROJECTS
    : DEMO_PROJECTS.filter((p) => p.visibility !== "internal");
}

export function demoProject(view: DemoView, id: string): ProjectWithMilestones | null {
  return demoProjects(view).find((p) => p.id === id) ?? null;
}

export type DemoView = "client" | "studio";

export function resolveDemoView(value: string | undefined): DemoView {
  return value === "studio" ? "studio" : "client";
}

/* ── Board ──────────────────────────────────────────────────────── */

function tasks(
  projectId: string,
  spec: [title: string, column: TaskColumn, visibility?: "client" | "internal"][],
): Task[] {
  return spec.map(([title, column, visibility = "client"], i) => ({
    id: `t-${projectId}-${i}`,
    title,
    column,
    // Spaced the same way a real move would leave headroom — not sequential
    // integers, so the demo can't be mistaken for the pre-fractional pattern.
    order: (i + 1) * 1000,
    visibility,
    createdAt: daysFromNow(-10),
    updatedAt: daysFromNow(-10),
  }));
}

// Only "site-build" has a board fixture — the demo proves the surface works,
// it doesn't need every project wired up.
const DEMO_TASKS: Record<string, Task[]> = {
  "site-build": tasks("site-build", [
    ["Sitemap outline", "done"],
    ["Homepage wireframe", "done"],
    ["Component library", "in_progress"],
    ["Contact form build", "in_progress"],
    ["Cross-browser QA", "review"],
    ["Staging review", "approved"],
    // Only ever visible in the studio view — proves the client/studio split.
    ["Analytics wiring — pending budget sign-off", "backlog", "internal"],
  ]),
};

/** The client sees no internal tasks — same filter the real data layer applies. */
export function demoTasks(view: DemoView, projectId: string): Task[] {
  const all = DEMO_TASKS[projectId] ?? [];
  return view === "studio" ? all : all.filter((t) => t.visibility !== "internal");
}

/* ── Files ──────────────────────────────────────────────────────── */

export interface DemoAssetVersion {
  n: number;
  /** picsum.photos placeholder, or "" for a type with no real preview. */
  url: string;
  sizeBytes: number;
  createdAt: string;
  note?: string;
}

export interface DemoAsset {
  id: string;
  name: string;
  mime: string;
  kind: AssetKind;
  currentVersion: number;
  createdAt: string;
  versions: DemoAssetVersion[];
}

function demoImage(seed: string): string {
  return `https://picsum.photos/seed/${seed}/1200/900`;
}

export const DEMO_ASSETS: DemoAsset[] = [
  {
    id: "logo-mark",
    name: "Logo mark — round 3.png",
    mime: "image/png",
    kind: "image",
    currentVersion: 2,
    createdAt: daysFromNow(-6),
    versions: [
      {
        n: 1,
        url: demoImage("northwind-logo-v1"),
        sizeBytes: 812_000,
        createdAt: daysFromNow(-9),
        note: "First pass on the mark.",
      },
      {
        n: 2,
        url: demoImage("northwind-logo-v2"),
        sizeBytes: 940_000,
        createdAt: daysFromNow(-6),
        note: "Tightened the leaf angle, warmed the brown.",
      },
    ],
  },
  {
    id: "hero-photo",
    name: "Homepage hero.jpg",
    mime: "image/jpeg",
    kind: "image",
    currentVersion: 1,
    createdAt: daysFromNow(-3),
    versions: [
      { n: 1, url: demoImage("northwind-hero"), sizeBytes: 2_400_000, createdAt: daysFromNow(-3) },
    ],
  },
  {
    id: "brand-guidelines",
    name: "Brand guidelines draft.pdf",
    mime: "application/pdf",
    kind: "doc",
    currentVersion: 1,
    createdAt: daysFromNow(-1),
    versions: [{ n: 1, url: "", sizeBytes: 4_100_000, createdAt: daysFromNow(-1) }],
  },
];

export function demoAssets(): DemoAsset[] {
  return DEMO_ASSETS;
}

export function demoAsset(id: string): DemoAsset | null {
  return DEMO_ASSETS.find((a) => a.id === id) ?? null;
}

/* ── Messages ───────────────────────────────────────────────────── */

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString();
}

export const DEMO_MESSAGES: PortalMessage[] = [
  {
    id: "msg-1",
    channel: "portal",
    direction: "in",
    body: "Hi! Loved the second logo round — could we try the mark a touch bigger relative to the wordmark?",
    authorUid: "demo-client",
    authorName: DEMO_CLIENT.name,
    status: "sent",
    createdAt: minutesAgo(180),
  },
  {
    id: "msg-2",
    channel: "whatsapp",
    direction: "out",
    body: "Good catch — sizing it up now, back to you within the hour.",
    authorUid: "demo-agency",
    authorName: DEMO_AGENCY.name,
    status: "sent",
    createdAt: minutesAgo(165),
  },
  {
    id: "msg-3",
    channel: "whatsapp",
    direction: "in",
    body: "One more thing — here's a shot of our storefront sign for reference.",
    mediaUrl: demoImage("northwind-storefront"),
    status: "delivered",
    createdAt: minutesAgo(40),
  },
];

/** The demo composer never sends — everyone sees the same fixed conversation. */
export function demoMessages(): PortalMessage[] {
  return DEMO_MESSAGES;
}

/* ── Approvals ──────────────────────────────────────────────────── */

export interface DemoApproval {
  id: string;
  targetType: "asset" | "post" | "milestone";
  targetLabel: string;
  contextLabel?: string;
  requestedAt: string;
  state: "pending" | "approved" | "changes_requested";
}

export const DEMO_APPROVALS: DemoApproval[] = [
  {
    id: "approval-logo-v2",
    targetType: "asset",
    targetLabel: "Logo mark — round 3.png",
    contextLabel: "Version 2",
    requestedAt: daysFromNow(-1),
    state: "pending",
  },
  {
    id: "approval-refinement",
    targetType: "milestone",
    targetLabel: "Refinement round",
    contextLabel: "Brand Identity System",
    requestedAt: daysFromNow(-2),
    state: "pending",
  },
];

/** Everyone sees the same fixed queue — the demo never mutates a decision. */
export function demoApprovals(): DemoApproval[] {
  return DEMO_APPROVALS.filter((a) => a.state === "pending");
}

/* ── Collaboration threads & pins ───────────────────────────────── */

/**
 * Structurally the same shape `listThreads` returns, declared locally so this
 * fixture file never imports the `server-only` data layer.
 */
export type DemoThread = Thread & { comments: Comment[] };

const DEMO_CLIENT_UID = "demo-client";
const DEMO_AGENCY_UID = "demo-agency";

function demoThread(
  id: string,
  assetId: string,
  spec: {
    pin?: { x: number; y: number };
    versionId?: number;
    resolved?: boolean;
    ageDays: number;
    comments: [author: "client" | "agency", body: string][];
  },
): DemoThread {
  const at = daysFromNow(spec.ageDays);
  const comments = spec.comments.map(([who, body], i) => ({
    id: `${id}-c${i}`,
    body,
    authorUid: who === "client" ? DEMO_CLIENT_UID : DEMO_AGENCY_UID,
    authorName: who === "client" ? DEMO_CLIENT.name : DEMO_AGENCY.name,
    createdAt: daysFromNow(spec.ageDays + i * 0.02),
  }));
  const last = comments[comments.length - 1].createdAt;
  return {
    id,
    targetType: "asset",
    targetId: assetId,
    ...(spec.pin ? { pin: spec.pin, versionId: spec.versionId ?? 1 } : {}),
    status: spec.resolved ? "resolved" : "open",
    createdBy: comments[0].authorUid,
    createdAt: at,
    lastMessageAt: last,
    updatedAt: last,
    participants: [...new Set(comments.map((c) => c.authorUid))],
    comments,
  };
}

export const DEMO_THREADS: DemoThread[] = [
  demoThread("thread-leaf", "logo-mark", {
    pin: { x: 0.42, y: 0.31 },
    versionId: 2,
    ageDays: -2,
    comments: [
      ["client", "The leaf still reads as a feather at small sizes. Can the spine be heavier?"],
      ["agency", "Agreed — thickening the spine and shortening the tip for the next round."],
    ],
  }),
  demoThread("thread-wordmark", "logo-mark", {
    pin: { x: 0.68, y: 0.74 },
    versionId: 2,
    ageDays: -1,
    comments: [["client", "Wordmark sits low against the mark. Half a step up?"]],
  }),
  demoThread("thread-brown", "logo-mark", {
    pin: { x: 0.2, y: 0.6 },
    versionId: 2,
    resolved: true,
    ageDays: -3,
    comments: [
      ["client", "This brown is colder than the packaging."],
      ["agency", "Warmed it two steps — that's the version you're looking at."],
    ],
  }),
  demoThread("thread-general", "logo-mark", {
    ageDays: -4,
    comments: [["agency", "Version 2 is ready for a decision whenever you have five minutes."]],
  }),
];

export function demoThreads(assetId: string): DemoThread[] {
  return DEMO_THREADS.filter((t) => t.targetId === assetId);
}
