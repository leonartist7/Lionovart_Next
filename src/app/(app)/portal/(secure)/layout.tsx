import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PORTAL_SESSION_COOKIE, getPortalSession } from "@/lib/portal-auth";

/**
 * The authentication boundary for every signed-in portal route.
 *
 * The check lives here rather than in `proxy.ts` because verifying a Firebase
 * session cookie needs firebase-admin and Node crypto, neither of which runs on
 * the edge. Every `/api/portal/*` route re-checks independently — this layout
 * guards navigation, not data.
 */
export default async function SecurePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  return <>{children}</>;
}
