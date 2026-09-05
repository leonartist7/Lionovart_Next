"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Menu } from "@base-ui/react/menu";
import { LogOut, MoreHorizontal } from "lucide-react";
import { PORTAL_NAV, isNavActive, navHref } from "@/lib/portal/nav";
import type { ThemeChoice } from "@/lib/portal/theme";
import { ThemeToggle } from "@/components/portal/ThemeToggle";
import { WorkspaceSwitcher, type WorkspaceOption } from "@/components/portal/WorkspaceSwitcher";
import { ToastProvider, Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export interface PortalShellProps {
  workspaceSlug: string;
  workspaceName: string;
  workspaces: WorkspaceOption[];
  userName: string;
  userEmail: string;
  theme: ThemeChoice;
  /** Design preview at /portal/demo — no real session, so no sign-out. */
  demo?: boolean;
  children: React.ReactNode;
}

/**
 * The portal's app frame: a rail on desktop, a translucent tab bar on mobile.
 *
 * Mobile is the primary target — most clients open this on a phone — so the
 * bottom bar sits inside the safe area and the content column reserves room for
 * it rather than scrolling underneath.
 */
export function PortalShell({
  workspaceSlug,
  workspaceName,
  workspaces,
  userName,
  userEmail,
  theme,
  demo = false,
  children,
}: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const primary = PORTAL_NAV.filter((item) => item.primary);

  async function signOut() {
    await fetch("/api/portal/session", { method: "DELETE" });
    router.replace("/portal/login");
  }

  return (
    <ToastProvider>
    <div className="flex min-h-dvh flex-col md:flex-row">
      {/* ── Desktop rail ─────────────────────────────────────────── */}
      <aside className="border-border bg-sidebar hidden w-[248px] shrink-0 flex-col border-r md:sticky md:top-0 md:flex md:h-dvh">
        <div className="px-5 pt-6 pb-5">
          <Link
            href="/portal"
            className="focus-visible:ring-primary/50 flex items-center gap-2.5 rounded-md focus-visible:ring-3 focus-visible:outline-none"
          >
            <span className="bg-primary size-2 rounded-full" />
            <span className="font-heading text-foreground text-xs font-semibold tracking-[0.28em] uppercase">
              Lionovart
            </span>
          </Link>
        </div>

        <div className="px-3 pb-4">
          <WorkspaceSwitcher
            current={{ slug: workspaceSlug, name: workspaceName }}
            workspaces={workspaces}
          />
        </div>

        <nav aria-label="Workspace" className="flex flex-1 flex-col gap-0.5 px-3">
          {PORTAL_NAV.map((item) => (
            <RailItem
              key={item.id}
              item={item}
              workspaceSlug={workspaceSlug}
              pathname={pathname}
            />
          ))}
        </nav>

        <div className="border-border space-y-3 border-t px-3 py-4">
          <div className="px-2">
            <ThemeToggle initial={theme} />
          </div>
          <div className="px-2">
            <p className="text-foreground truncate text-xs font-medium">{userName}</p>
            <p className="text-muted-foreground truncate text-[11px]">{userEmail}</p>
          </div>
          {!demo && (
            <button
              type="button"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors"
            >
              <LogOut size={13} aria-hidden="true" />
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile header ────────────────────────────────────────── */}
      <header className="portal-glass border-border sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 md:hidden">
        <WorkspaceSwitcher
          current={{ slug: workspaceSlug, name: workspaceName }}
          workspaces={workspaces}
          compact
        />
        {/* Only five sections fit in the tab bar, so everything else — and the
            theme control, which lives in Settings — is reachable from here. */}
        <MoreMenu workspaceSlug={workspaceSlug} onSignOut={signOut} demo={demo} />
      </header>

      {/* ── Content ──────────────────────────────────────────────── */}
      <main
        className="min-w-0 flex-1 px-4 pt-5 md:px-8 md:pt-8"
        // Clears the fixed tab bar plus the home indicator on iOS.
        style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto w-full max-w-5xl md:pb-10">{children}</div>
      </main>

      {/* ── Mobile tab bar ───────────────────────────────────────── */}
      <nav
        aria-label="Workspace"
        className="portal-glass border-border fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {primary.map((item) => (
          <TabItem
            key={item.id}
            item={item}
            workspaceSlug={workspaceSlug}
            pathname={pathname}
          />
        ))}
      </nav>

      <Toaster />
    </div>
    </ToastProvider>
  );
}

/** Secondary navigation for mobile, where the tab bar only holds five items. */
function MoreMenu({
  workspaceSlug,
  onSignOut,
  demo = false,
}: {
  workspaceSlug: string;
  onSignOut: () => void;
  demo?: boolean;
}) {
  const secondary = PORTAL_NAV.filter((item) => !item.primary);

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="More"
        className={cn(
          "text-muted-foreground hover:text-foreground grid size-9 place-items-center rounded-full",
          "transition-colors duration-150 active:opacity-60",
          "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
        )}
      >
        <MoreHorizontal size={19} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50">
          <Menu.Popup
            className={cn(
              "border-border bg-popover text-popover-foreground min-w-[200px] rounded-xl border p-1 shadow-lg",
              "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 ease-out",
              "data-closed:scale-95 data-closed:opacity-0 data-open:scale-100 data-open:opacity-100",
            )}
          >
            {secondary.map(({ id, segment, label, icon: Icon, ready }) =>
              ready ? (
                <Menu.Item
                  key={id}
                  className="data-highlighted:bg-muted rounded-lg outline-none"
                  render={
                    <Link
                      href={navHref(workspaceSlug, segment)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm"
                    >
                      <Icon size={16} aria-hidden="true" />
                      {label}
                    </Link>
                  }
                />
              ) : (
                <span
                  key={id}
                  aria-disabled
                  className="text-muted-foreground/50 flex items-center gap-2.5 px-3 py-2.5 text-sm"
                >
                  <Icon size={16} aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  <span className="text-[10px] tracking-wider uppercase">Soon</span>
                </span>
              ),
            )}
            {!demo && <div className="bg-border my-1 h-px" />}
            {!demo && <Menu.Item
              onClick={onSignOut}
              className="data-highlighted:bg-muted text-muted-foreground flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm outline-none"
            >
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </Menu.Item>}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function RailItem({
  item,
  workspaceSlug,
  pathname,
}: {
  item: (typeof PORTAL_NAV)[number];
  workspaceSlug: string;
  pathname: string;
}) {
  const { icon: Icon, label, segment, ready } = item;
  const active = ready && isNavActive(pathname, workspaceSlug, segment);

  const inner = (
    <>
      {active && (
        <span className="bg-primary absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full" />
      )}
      <Icon size={16} strokeWidth={2} aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {!ready && (
        <span className="text-muted-foreground/70 text-[10px] tracking-wider uppercase">
          Soon
        </span>
      )}
    </>
  );

  const base =
    "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors duration-150";

  if (!ready) {
    return (
      <span aria-disabled className={cn(base, "text-muted-foreground/50 cursor-default")}>
        {inner}
      </span>
    );
  }

  return (
    <Link
      href={navHref(workspaceSlug, segment)}
      aria-current={active ? "page" : undefined}
      className={cn(
        base,
        "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
        active
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
      )}
    >
      {inner}
    </Link>
  );
}

function TabItem({
  item,
  workspaceSlug,
  pathname,
}: {
  item: (typeof PORTAL_NAV)[number];
  workspaceSlug: string;
  pathname: string;
}) {
  const reduceMotion = useReducedMotion();
  const { icon: Icon, shortLabel, segment, ready } = item;
  const active = ready && isNavActive(pathname, workspaceSlug, segment);

  const inner = (
    <>
      {active && (
        <motion.span
          layoutId="portal-tab-indicator"
          transition={
            reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.34 }
          }
          className="bg-primary absolute top-0 h-0.5 w-8 rounded-full"
        />
      )}
      <Icon size={19} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
      <span className="text-[10px] leading-none font-medium tracking-tight">{shortLabel}</span>
    </>
  );

  // 56px tall — comfortably above the 44px minimum touch target.
  const base = "relative flex h-14 flex-col items-center justify-center gap-1.5";

  if (!ready) {
    // Not a link — there is nowhere to go yet. The tab bar has no room for a
    // visible "Soon", so say it for screen readers instead of presenting an
    // item that reads as navigable but does nothing.
    return (
      <span className={cn(base, "text-muted-foreground/40")}>
        {inner}
        <span className="sr-only">Coming soon</span>
      </span>
    );
  }

  return (
    <Link
      href={navHref(workspaceSlug, segment)}
      aria-current={active ? "page" : undefined}
      className={cn(
        base,
        "focus-visible:ring-primary/50 -outline-offset-2 focus-visible:ring-3 focus-visible:outline-none",
        "transition-colors duration-150 active:opacity-60",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {inner}
    </Link>
  );
}
