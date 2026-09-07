import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ChatThread } from "@/components/portal/ChatThread";
import {
  PORTAL_SESSION_COOKIE,
  getPortalSession,
  getWorkspaceAccessBySlug,
} from "@/lib/portal-auth";
import { listMessages } from "@/lib/portal/messages";
import { roleAtLeast } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const cookieStore = await cookies();

  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const access = await getWorkspaceAccessBySlug(session, slug);
  if (!access) notFound();

  const messages = await listMessages(access.workspace.id);

  return (
    <div className="py-2 md:py-4">
      <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
        Messages
      </h1>

      <div className="mt-7">
        <ChatThread
          workspaceSlug={slug}
          initialMessages={messages}
          currentUid={session.uid}
          canSend={roleAtLeast(access.membership.role, "collaborator")}
          whatsappConnected={Boolean(access.workspace.whatsappNumber)}
        />
      </div>
    </div>
  );
}
