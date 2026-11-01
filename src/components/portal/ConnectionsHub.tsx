import Link from "next/link";
import { ArrowUpRight, CalendarDays, FolderOpen, Mail, ShieldCheck } from "lucide-react";
import { CalendarExportButton } from "./CalendarExportButton";
import { ResourceLinksPanel } from "./ResourceLinksPanel";
import type { ResourceLink } from "@/lib/portal/resource-links";

export function ConnectionsHub({ workspaceSlug, links, canManage, demoView, readiness, resourceError }: {
  workspaceSlug: string;
  links: ResourceLink[];
  canManage: boolean;
  demoView?: "studio" | "client";
  readiness?: { email: boolean; storage: boolean; emulated: boolean };
  resourceError?: string;
}) {
  const base = `/portal/${encodeURIComponent(workspaceSlug)}`;
  const suffix = demoView ? `?view=${demoView}` : "";
  return (
    <div className="py-2 md:py-4">
      <p className="text-muted-foreground mb-3 text-xs font-medium tracking-[0.16em] uppercase">Your connected workspace</p>
      <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">Connections</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">The right files, dates, and tools. Together, without another crowded dashboard.</p>
      <div className="mt-8 space-y-5">
        <section className="border-border bg-card grid gap-6 rounded-2xl border p-5 md:grid-cols-[1fr_auto] md:items-center md:p-7" aria-labelledby="calendar-connection-heading">
          <div className="min-w-0">
            <CalendarDays className="text-muted-foreground mb-4 h-5 w-5" aria-hidden="true"/>
            <h2 id="calendar-connection-heading" className="text-foreground text-lg font-semibold">Your deadlines, in your calendar</h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">Export projects, milestones, and scheduled content as an .ics file to import into a calendar app. Only items you can see in this workspace are included.</p>
            <p className="text-muted-foreground mt-2 text-sm">One-time export. No live sync, account access, or invitations.</p>
          </div>
          <CalendarExportButton href={`${base}/calendar/export${suffix}`} demo={Boolean(demoView)}/>
        </section>
        {resourceError ? <section className="border-border bg-card rounded-2xl border p-5" role="alert"><h2 className="text-foreground font-semibold">Project resources unavailable</h2><p className="text-muted-foreground mt-2 text-sm">{resourceError}</p><a href={`${base}/connections${suffix}`} className="mt-3 inline-flex min-h-11 items-center text-sm underline">Reload resources</a></section> :
          <ResourceLinksPanel initialLinks={links} canManage={canManage} endpoint={demoView ? undefined : `${base}/connections/resources`} demo={Boolean(demoView)}/>}
        <Link href={`${base}/assets${suffix}`} className="border-border bg-card flex min-h-20 items-center gap-4 rounded-2xl border p-5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4">
          <FolderOpen className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true"/>
          <div className="min-w-0 flex-1"><span className="text-foreground block text-sm font-semibold">Workspace files</span><span className="text-muted-foreground mt-1 block text-sm">Uploaded files, versions, and feedback stay in the existing Files section.</span></div>
          <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true"/>
        </Link>
        {canManage && <section className="border-border rounded-2xl border p-5 md:p-7" aria-labelledby="provider-readiness-heading">
          <div className="flex items-center gap-3"><ShieldCheck className="text-muted-foreground h-5 w-5" aria-hidden="true"/><h2 id="provider-readiness-heading" className="text-foreground text-lg font-semibold">Studio connection readiness</h2></div>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{demoView ? "Public preview: no production configuration is inspected or displayed." : "Configuration presence is not proof of a successful connection. No messages or provider API calls are sent by this page."}</p>
          <dl className="mt-5 space-y-5">
            <div><dt className="text-foreground flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4" aria-hidden="true"/>Email notifications · Resend</dt><dd className="text-muted-foreground mt-1 text-sm">{demoView ? "Not checked in preview." : readiness?.email ? "Server configuration present. Sender verification and delivery have not been tested here." : "Setup required. Portal email is not configured in this environment."}</dd></div>
            <div><dt className="text-foreground text-sm font-medium">File storage · Firebase</dt><dd className="text-muted-foreground mt-1 text-sm">{demoView ? "Not checked in preview." : readiness?.emulated ? "Emulator environment. Live file uploads are not verified." : readiness?.storage ? "Server configuration present. Bucket permissions and upload delivery still require verification." : "Setup required. File storage is not configured in this environment."}</dd></div>
          </dl>
          <p className="text-muted-foreground border-border mt-6 border-t pt-4 text-sm leading-relaxed">Google account sync, billing, and automatic publishing are not connected by this update. Each needs its own permission flow and end-to-end verification before activation.</p>
        </section>}
      </div>
    </div>
  );
}
