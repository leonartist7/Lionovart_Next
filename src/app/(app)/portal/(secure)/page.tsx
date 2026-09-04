import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  listWorkspacesForSession,
} from "@/lib/portal-auth";

export const metadata: Metadata = { title: "Your workspaces" };
export const dynamic = "force-dynamic";

/**
 * Workspace picker. Most clients have exactly one, so this redirects straight
 * through rather than making them tap past a list of one.
 */
export default async function PortalIndexPage() {
  const cookieStore = await cookies();
  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const workspaces = await listWorkspacesForSession(session);

  if (workspaces.length === 1) redirect(`/portal/${workspaces[0].slug}`);

  if (workspaces.length === 0) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <h1 className="font-heading text-foreground text-2xl leading-tight font-bold tracking-[-0.02em]">
            No workspace yet
          </h1>
          <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
            You&apos;re signed in as {session.email}, but there&apos;s no workspace
            attached to this account. If you were expecting one, check that you
            used the address the invitation was sent to.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-14 md:py-20">
      <h1 className="font-heading text-foreground text-3xl leading-[1.1] font-bold tracking-[-0.02em]">
        Your workspaces
      </h1>
      <p className="text-muted-foreground mt-3 text-[15px]">Pick one to continue.</p>

      <ul className="mt-9 space-y-2.5">
        {workspaces.map((ws) => (
          <li key={ws.id}>
            <Link
              href={`/portal/${ws.slug}`}
              className="border-border bg-card hover:border-primary/40 group flex items-center gap-4 rounded-2xl border p-5 transition-[border-color,transform] duration-150 ease-out active:scale-[0.99] focus-visible:ring-3 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate font-medium">{ws.name}</p>
                {ws.clientCompany && (
                  <p className="text-muted-foreground truncate text-sm">{ws.clientCompany}</p>
                )}
              </div>
              <ArrowRight
                size={17}
                className="text-muted-foreground group-hover:text-foreground shrink-0 transition-colors"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
