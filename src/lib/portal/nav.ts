import type { ProjectKind } from "@/lib/portal/types";
import {
  CalendarDays,
  FolderOpen,
  LayoutGrid,
  MessageCircle,
  Images,
  CheckCircle2,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * The portal's navigation, in one place.
 *
 * `ready` gates linking exactly as `src/lib/service-routes.ts` does for the
 * marketing site: a section that isn't built yet renders as a disabled item
 * rather than a link into a 404. Flip the flag when the phase lands.
 */
export interface PortalNavItem {
  id: string;
  /** Appended to /portal/[workspace]; empty string is the workspace root. */
  segment: string;
  label: string;
  /** Shorter label for the mobile tab bar, where space is tight. */
  shortLabel: string;
  icon: LucideIcon;
  ready: boolean;
  /** Shown in the mobile tab bar (max 5 fit comfortably). */
  primary: boolean;
}

export const PORTAL_NAV: PortalNavItem[] = [
  {
    id: "overview",
    segment: "",
    label: "Overview",
    shortLabel: "Overview",
    icon: LayoutGrid,
    ready: true,
    primary: true,
  },
  {
    id: "projects",
    segment: "projects",
    label: "Projects",
    shortLabel: "Work",
    icon: FolderOpen,
    ready: true,
    primary: true,
  },
  {
    id: "approvals",
    segment: "approvals",
    label: "Approvals",
    shortLabel: "Approve",
    icon: CheckCircle2,
    ready: false,
    primary: true,
  },
  {
    id: "assets",
    segment: "assets",
    label: "Files",
    shortLabel: "Files",
    icon: Images,
    ready: false,
    primary: true,
  },
  {
    id: "messages",
    segment: "messages",
    label: "Messages",
    shortLabel: "Chat",
    icon: MessageCircle,
    ready: false,
    primary: true,
  },
  {
    id: "calendar",
    segment: "calendar",
    label: "Calendar",
    shortLabel: "Calendar",
    icon: CalendarDays,
    ready: false,
    primary: false,
  },
  {
    id: "content",
    segment: "content",
    label: "Content",
    shortLabel: "Content",
    icon: Sparkles,
    ready: false,
    primary: false,
  },
  {
    id: "settings",
    segment: "settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: Settings,
    ready: true,
    primary: false,
  },
];

/**
 * Sections that only make sense for certain engagements.
 *
 * A brand-identity client has no use for a Content tab, and a permanently
 * empty section is worse than an absent one — it reads as something broken
 * rather than something irrelevant. Agency staff always see everything,
 * because they are the ones who set the engagement up.
 *
 * Only genuinely conditional sections belong here. Everything else is
 * relevant to every client and stays unconditional.
 */
const KIND_GATED: Partial<Record<string, ProjectKind[]>> = {
  content: ["content", "marketing"],
};

/**
 * Ids of the sections one engagement actually needs.
 *
 * Returns **ids, not items** — nav items carry an `icon`, which is a React
 * component, and functions cannot cross the server→client boundary. The server
 * decides which sections apply; the client resolves them back to items with
 * `navItemsFor`.
 */
export function visibleNavIds(
  projectKinds: readonly ProjectKind[],
  isAgency: boolean,
): string[] {
  return PORTAL_NAV.filter((item) => {
    if (isAgency) return true;
    const required = KIND_GATED[item.id];
    return !required || required.some((k) => projectKinds.includes(k));
  }).map((item) => item.id);
}

/** Client-side counterpart to `visibleNavIds`, preserving PORTAL_NAV's order. */
export function navItemsFor(ids: readonly string[]): PortalNavItem[] {
  return PORTAL_NAV.filter((item) => ids.includes(item.id));
}

export function navHref(workspaceSlug: string, segment: string): string {
  return segment ? `/portal/${workspaceSlug}/${segment}` : `/portal/${workspaceSlug}`;
}

/** True when `pathname` is inside this nav item's section. */
export function isNavActive(
  pathname: string,
  workspaceSlug: string,
  segment: string,
): boolean {
  const href = navHref(workspaceSlug, segment);
  if (!segment) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
