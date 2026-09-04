import type { Metadata } from "next";
import Link from "next/link";
import { PortalSignIn } from "@/components/portal/PortalSignIn";
import { describeInviteError, findInviteByToken } from "@/lib/portal/invites";

export const metadata: Metadata = { title: "Accept your invitation" };
export const dynamic = "force-dynamic";

/**
 * The invite landing page. Resolving the token server-side means the client is
 * greeted by name of their workspace before being asked to sign in, and an
 * expired or spent link says exactly that instead of failing at the last step.
 */
export default async function PortalJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) return <InviteProblem message="This link is missing its invitation code." />;

  const lookup = await findInviteByToken(token);
  if (!lookup.ok) {
    return (
      <InviteProblem
        message={describeInviteError(lookup.reason)}
        showSignIn={lookup.reason === "already_accepted"}
      />
    );
  }

  return (
    <PortalSignIn
      inviteToken={token}
      expectedEmail={lookup.invite.email}
      heading={`Join ${lookup.invite.workspaceName}`}
      subheading={`You've been invited as ${lookup.invite.email}. Sign in with that address to open your workspace.`}
    />
  );
}

function InviteProblem({
  message,
  showSignIn = false,
}: {
  message: string;
  showSignIn?: boolean;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2.5">
          <span className="bg-primary size-2 rounded-full" />
          <span className="font-heading text-foreground text-xs font-semibold tracking-[0.28em] uppercase">
            Lionovart
          </span>
        </div>
        <h1 className="font-heading text-foreground text-3xl leading-[1.1] font-bold tracking-[-0.02em]">
          Invitation problem
        </h1>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">{message}</p>
        {showSignIn && (
          <Link
            href="/portal/login"
            className="bg-primary text-primary-foreground mt-8 inline-flex rounded-xl px-5 py-3 text-sm font-semibold transition-transform duration-150 ease-out active:scale-[0.985]"
          >
            Go to sign in
          </Link>
        )}
      </div>
    </main>
  );
}
