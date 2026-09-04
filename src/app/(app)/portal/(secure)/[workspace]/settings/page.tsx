import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/portal/ThemeToggle";
import { SignOutButton } from "@/components/portal/SignOutButton";
import { PORTAL_SESSION_COOKIE, getPortalSession } from "@/lib/portal-auth";
import { PORTAL_THEME_COOKIE, resolveThemeChoice } from "@/lib/portal/theme";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function WorkspaceSettingsPage() {
  const cookieStore = await cookies();
  const session = await getPortalSession(cookieStore.get(PORTAL_SESSION_COOKIE)?.value);
  if (!session) redirect("/portal/login");

  const theme = resolveThemeChoice(cookieStore.get(PORTAL_THEME_COOKIE)?.value);

  return (
    <div className="py-2 md:py-4">
      <h1 className="font-heading text-foreground text-3xl leading-[1.05] font-bold tracking-[-0.025em]">
        Settings
      </h1>

      <section className="border-border bg-card mt-8 rounded-2xl border">
        <Row
          label="Signed in as"
          description={session.email}
          control={
            session.isAgency ? (
              <span className="border-border text-muted-foreground rounded-full border px-2.5 py-1 text-[11px] tracking-wider uppercase">
                Studio
              </span>
            ) : null
          }
        />
        <Row
          label="Appearance"
          description="Follows your device when set to System."
          control={<ThemeToggle initial={theme} />}
          bordered
        />
        <Row label="Session" description="Sign out on this device." control={<SignOutButton />} bordered />
      </section>
    </div>
  );
}

function Row({
  label,
  description,
  control,
  bordered = false,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 p-5 md:p-6 ${
        bordered ? "border-border border-t" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground mt-0.5 truncate text-sm">{description}</p>
      </div>
      {control}
    </div>
  );
}
