import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PortalSignIn } from "@/components/portal/PortalSignIn";
import { PORTAL_SESSION_COOKIE, getPortalSession } from "@/lib/portal-auth";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function PortalLoginPage() {
  const cookieStore = await cookies();
  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (session) redirect("/portal");

  return (
    <PortalSignIn
      heading="Welcome back"
      subheading="Sign in to your LIONOVART workspace."
    />
  );
}
