import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, getAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await getAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a] md:flex-row">
      <AdminSidebar email={session.email} />
      <main className="flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
