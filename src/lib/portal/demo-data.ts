import type { ProjectWithMilestones } from "@/lib/portal/projects";
import { deriveProgress } from "@/lib/portal/projects";
import type { AssetKind, Milestone } from "@/lib/portal/types";

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
