import { cookies } from "next/headers";
import { PORTAL_SESSION_COOKIE, getPortalSession } from "@/lib/portal-auth";

/**
 * Renders children only for LIONOVART staff.
 *
 * Deliberately a **server** component: the gate runs before the response is
 * serialised, so a client's browser never receives the edit controls at all —
 * not hidden with CSS, not present in the RSC payload, simply absent. A client
 * reading page source finds nothing to poke at.
 */
export async function AgencyOnly({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session?.isAgency) return null;
  return <>{children}</>;
}
