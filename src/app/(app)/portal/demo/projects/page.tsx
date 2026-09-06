import type { Metadata } from "next";
import { DemoShell } from "@/components/portal/DemoShell";
import { ProjectCard } from "@/components/portal/ProjectCard";
import { DemoAddProject } from "@/components/portal/DemoAddProject";
import { demoProjects, resolveDemoView } from "@/lib/portal/demo-data";

export const metadata: Metadata = {
  title: "Projects · preview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const view = resolveDemoView((await searchParams).view);
  const projects = demoProjects(view);

  return (
    <DemoShell view={view} path="/portal/demo/projects">
      <div className="py-2 md:py-4">
        <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
          Projects
        </h1>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} workspaceSlug="demo" />
          ))}
          {view === "studio" && <DemoAddProject />}
        </div>
      </div>
    </DemoShell>
  );
}
