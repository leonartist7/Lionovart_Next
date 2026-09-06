import { cookies } from "next/headers";
import { PortalShell } from "@/components/portal/PortalShell";
import { DemoBanner } from "@/components/portal/DemoBanner";
import { DEMO_AGENCY, DEMO_CLIENT, DEMO_WORKSPACE, type DemoView } from "@/lib/portal/demo-data";
import { PORTAL_THEME_COOKIE, resolveThemeChoice } from "@/lib/portal/theme";
import { visibleNavIds } from "@/lib/portal/nav";
import { demoProjects } from "@/lib/portal/demo-data";

/**
 * Wraps a demo page in the real app frame.
 *
 * A component rather than a layout because the client/studio switch lives in
 * the query string, and Next.js only passes `searchParams` to pages.
 */
export async function DemoShell({
  view,
  path,
  children,
}: {
  view: DemoView;
  /** Path the view switcher links back to, without the query string. */
  path: string;
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = resolveThemeChoice(cookieStore.get(PORTAL_THEME_COOKIE)?.value);
  const who = view === "studio" ? DEMO_AGENCY : DEMO_CLIENT;
  const navIds = visibleNavIds(
    [...new Set(demoProjects(view).map((p) => p.kind))],
    view === "studio",
  );

  return (
    <PortalShell
      workspaceSlug="demo"
      workspaceName={DEMO_WORKSPACE.name}
      workspaces={[{ slug: "demo", name: DEMO_WORKSPACE.name }]}
      userName={who.name}
      userEmail={who.email}
      theme={theme}
      navIds={navIds}
      demo
    >
      <DemoBanner view={view} path={path} />
      {children}
    </PortalShell>
  );
}
